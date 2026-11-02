/* GSL-Votes: call-number block at the bottom of every page, page tools
   (call number, jump menu, copy link, share) and a Top button.
   Add a page to GV_PAGES and every page's list and next/previous update.
   Reads the one shared shelf list in the Hive library (hive-shelves.js),
   so a call number from any Hive repo works in this page's search. */
var GV_PAGES = [
  { callNumber: "GV 100.01", slug: "index", name: "Rep. Jason Kyle (HD-8) and the Great Salt Lake: every vote, 2023–2026" }
];
var GV_SHELF_NAMES = { "100": "Utah House", "200": "Utah Senate" };
(function () {
  var LIST_URL = "https://weber-county-hive.github.io/-weber-county-hive-index/hive-shelves.js";
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var list = GV_PAGES.slice().sort(function (a, b) { return a.callNumber.localeCompare(b.callNumber, undefined, { numeric: true }); });
  var file = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  var i = list.findIndex(function (p) { return p.slug === file; }); if (i < 0) i = 0;
  var me = list[i], prev = list[i - 1], next = list[i + 1];
  var shelfOf = function (p) { return p.callNumber.split(" ")[1].split(".")[0]; };
  function ready(fn) {
    if (window.HIVE_SHELVES) return fn();
    var s = document.createElement("script"); s.src = LIST_URL + "?v=1"; s.onload = fn; s.onerror = fn; document.head.appendChild(s);
  }
  var box = document.getElementById("gv-shelf");
  if (box) {
    var link = function (p, dir) {
      if (!p) return dir === "prev"
        ? '<a class="gv-nav-btn" href="https://weber-county-hive.github.io/-weber-county-hive-index/index.html">← <b>HL 000.00</b> The Hive library (every repo)</a>'
        : '<span class="gv-nav-btn gv-off">End of shelf →</span>';
      return '<a class="gv-nav-btn" href="' + p.slug + '.html">' + (dir === "prev" ? "← " : "") + "<b>" + p.callNumber + "</b> " + esc(p.name) + (dir === "next" ? " →" : "") + "</a>";
    };
    var rows = "";
    Object.keys(GV_SHELF_NAMES).forEach(function (no) {
      var items = list.filter(function (p) { return shelfOf(p) === no; });
      if (!items.length) return;
      rows += '<li class="gv-shelf-head">GV ' + no + " · " + GV_SHELF_NAMES[no] + "</li>";
      items.forEach(function (p) {
        rows += "<li" + (p === me ? ' class="gv-here"' : "") + '><a href="' + p.slug + '.html"><span class="gv-cn">' + p.callNumber + "</span> " + esc(p.name) + (p === me ? " <em>(you are here)</em>" : "") + "</a></li>";
      });
    });
    box.innerHTML =
      '<div class="gv-cn-big">Call number <b>' + me.callNumber + "</b> · Shelf GV " + shelfOf(me) + " · " + GV_SHELF_NAMES[shelfOf(me)] + "</div>" +
      '<div class="gv-nav">' + link(prev, "prev") + link(next, "next") + "</div>" +
      '<details class="gv-list"><summary>See every page on this shelf, by call number</summary><ol>' + rows + "</ol></details>" +
      '<form class="gv-find" id="gv-find" role="search"><label for="gv-q">Look up a call number, name or topic</label>' +
      '<div><input id="gv-q" type="search" placeholder="e.g. GV 100.01, FD 200.03 or HB 76"><button type="submit">Search</button></div></form>' +
      '<div class="gv-search" id="gv-find-out">Names, bills and topics search the votes on this page.</div>';
    ready(function () {
      if (!window.HIVE_SHELVES) return;
      document.getElementById("gv-find-out").innerHTML = "Names, bills and topics search the votes on this page. Call numbers from every shelf work here: " +
        window.HIVE_SHELVES.map(function (s) { return '<a href="' + s.url + '"><b>' + s.prefix + "</b> = " + esc(s.name) + "</a>"; }).join(" · ") + ".";
    });
    document.getElementById("gv-find").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = document.getElementById("gv-q").value;
      var m = String(v).trim().toUpperCase().match(/^([A-Z]{1,5})\s*(\d{3}(?:\.\d{1,2})?)$/);
      if (m && m[1] === "GV") {
        var hit = list.filter(function (p) { return p.callNumber.indexOf(m[1] + " " + m[2]) === 0; })[0];
        if (hit) { location.href = hit.slug + ".html"; return; }
        document.getElementById("gv-find-out").innerHTML = "No GSL-Votes page has call number <b>" + esc(m[1] + " " + m[2]) + "</b>.";
        return;
      }
      if (m) {
        var sh = (window.HIVE_SHELVES || []).filter(function (s) { return s.prefix === m[1]; })[0];
        if (sh) { location.href = sh.url + "?q=" + encodeURIComponent(m[1] + " " + m[2]); return; }
        document.getElementById("gv-find-out").innerHTML = "Call number <b>" + esc(m[1] + " " + m[2]) + "</b>: that shelf doesn't have call numbers yet. Try a name or topic instead.";
        return;
      }
      var q = document.getElementById("fq");
      if (q) { q.value = v; q.dispatchEvent(new Event("input")); document.getElementById("explore").scrollIntoView({ behavior: "smooth" }); }
    });
  }
  /* Page tools under the Where/Who box */
  var ww = document.querySelector(".gv-ww");
  if (ww) {
    var heads = [].slice.call(document.querySelectorAll("main h2")).filter(function (h) { return h.textContent.trim(); });
    var used = {};
    var jl = heads.map(function (h) {
      if (!h.id) {
        var id = "s-" + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
        while (used[id] || document.getElementById(id)) id += "-x";
        h.id = id;
      }
      used[h.id] = 1;
      return '<li><a href="#' + h.id + '">' + esc(h.textContent.trim()) + "</a></li>";
    }).join("");
    var url = location.href.split("#")[0].split("?")[0];
    var tools = document.createElement("div");
    tools.className = "gv-tools";
    tools.innerHTML =
      '<a class="gv-tool gv-cnchip" href="#gv-shelf" title="Jump to the call number and search">Call number <b>' + me.callNumber + "</b> ↓</a>" +
      (jl ? '<details class="gv-jump"><summary>Jump to a section</summary><ol>' + jl + "</ol></details>" : "") +
      '<button type="button" class="gv-tool" id="gv-copy">Copy link</button>' +
      '<a class="gv-tool" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '">Share on Facebook</a>';
    ww.parentNode.insertBefore(tools, ww.nextSibling);
    var cb = document.getElementById("gv-copy");
    cb.addEventListener("click", function () {
      var done = function () { cb.textContent = "Link copied ✓"; setTimeout(function () { cb.textContent = "Copy link"; }, 2500); };
      try { navigator.clipboard.writeText(url).then(done, function () { window.prompt("Copy this link:", url); }); }
      catch (e) { window.prompt("Copy this link:", url); }
    });
    tools.querySelectorAll(".gv-jump a").forEach(function (a) { a.addEventListener("click", function () { tools.querySelector(".gv-jump").open = false; }); });
  }
  var top = document.createElement("a");
  top.href = "#"; top.className = "gv-totop"; top.textContent = "↑ Top"; top.setAttribute("aria-label", "Back to top of page");
  top.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.body.appendChild(top);
  var showTop = function () { top.style.display = window.scrollY > 900 ? "block" : "none"; };
  window.addEventListener("scroll", showTop, { passive: true }); showTop();
})();
