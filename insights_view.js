/* =========================================================================
   insights_view.js — morningmate "Insights 뷰" 위젯 대시보드
   위젯: 週別タスク推移 / ステータス別 / 投稿TOP5 / コメントTOP5 /
         週平均リクエスト・処理 / Tasks by assignee / Tasks per week
   ========================================================================= */
(function () {
  "use strict";

  function TL(k, fb) { var t = window.MM_TR && window.MM_TR(k); return (t && t !== k) ? t : fb; }

  var WEEKLY = [
    { w: "06/01", up: 14, down: 4 }, { w: "05/25", up: 8, down: 5 }, { w: "05/18", up: 8, down: 6 },
    { w: "05/11", up: 10, down: 8 }, { w: "05/04", up: 23, down: 9 }, { w: "04/27", up: 40, down: 25 },
    { w: "04/20", up: 7, down: 6 }, { w: "04/13", up: 29, down: 10 }, { w: "04/06", up: 8, down: 6 },
    { w: "03/30", up: 6, down: 5 }, { w: "03/23", up: 6, down: 4 }, { w: "03/16", up: 3, down: 2 },
    { w: "03/09", up: 26, down: 9 }, { w: "03/02", up: 9, down: 4 }
  ];
  var STATUS = [
    { label: "Complete", color: "#5B4BE0", bg: "#ECEAFB", count: 115, pct: 52 },
    { label: "Pending", color: "#00B5F1", bg: "#E1F5FD", count: 53, pct: 24 },
    { label: "Progress", color: "#19B43A", bg: "#E3F6E7", count: 32, pct: 14 },
    { label: "Feedback", color: "#FD7900", bg: "#FFEEDC", count: 9, pct: 4 },
    { label: "Hold", color: "#888888", bg: "#EEEEEE", count: 8, pct: 3 }
  ];
  var POST_TOP = [
    { rank: 1, name: "Soyun Noh", role: "Team Lead", color: "#F2A65A" },
    { rank: 2, name: "SANO HARUKA", color: "#9DC8FF" },
    { rank: 3, name: "WOOJUNG KIM", color: "#A8E6C0" },
    { rank: 4, name: "Tomo", color: "#C7C7CF" },
    { rank: 5, name: null }
  ];
  var COMMENT_TOP = [
    { rank: 1, name: "SANO HARUKA", color: "#9DC8FF" },
    { rank: 2, name: "Soyun Noh", role: "Team Lead", color: "#F2A65A" },
    { rank: 3, name: null }, { rank: 4, name: null }, { rank: 5, name: null }
  ];
  var ASSIGNEE = [
    { name: "Soyun ...", segs: [{ c: "#00B5F1", v: 6 }, { c: "#19B43A", v: 6 }, { c: "#FD7900", v: 2 }, { c: "#6A5BE8", v: 22 }, { c: "#3A3A46", v: 1 }] },
    { name: "Hyejo ...", segs: [{ c: "#19B43A", v: 2 }] },
    { name: "June L...", segs: [] },
    { name: "장아람", segs: [] }
  ];
  var WEEKS = [
    { w: "Week22", v: 5 }, { w: "Week21", v: 3 }, { w: "Week20", v: 1 }, { w: "Week19", v: 4 },
    { w: "Week18", v: 0 }, { w: "Week17", v: 3 }, { w: "Week16", v: 0 }, { w: "Week15", v: 8 },
    { w: "Week14", v: 1 }, { w: "Week13", v: 2 }, { w: "Week12", v: 0 }, { w: "Week11", v: 0 }
  ];

  var PENCIL = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"><path d="M5 19h4L19.5 8.5a2.1 2.1 0 00-3-3L6 16l-1 3z"/><path d="M14 7l3 3"/><path d="M4.5 21h7" stroke-width="2"/></svg>';
  var LAYERS = '<svg width="40" height="36" viewBox="0 0 28 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"><path d="M11 3.5l8.5 4.5-8.5 4.5L2.5 8 11 3.5z"/><path d="M2.5 13l8.5 4.5L19.5 13"/><circle cx="22.5" cy="7" r="4.6" fill="#2BA7E0" stroke="none"/><path d="M20.4 7l1.5 1.5L24.6 5.7" stroke="#fff" stroke-width="1.7"/></svg>';

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function card(title, body, cls) {
    var rev = (window.MM_MOTION && window.MM_MOTION.enabled) ? " mm-reveal" : "";
    return '<div class="iw ' + (cls || "") + rev + '" data-rgrp="insights"><div class="iw-h"><span>' + esc(title) + '</span><span class="dots">⋮</span></div>' + body + '</div>';
  }
  function chips(duration) {
    return '<div class="iw-chips"><span class="ch dur"><b>' + esc(TL('pc.insights.duration', 'Duration')) + '</b><i>' + esc(duration) + '</i></span>' +
      '<span class="ch act">Assignee 4</span><span class="ch">Status 5</span><span class="ch">Priority 5</span></div>';
  }

  function chartWidget() {
    var MAX = 50, HALF = 132;
    var bars = WEEKLY.map(function (d) {
      var uh = Math.round(d.up / MAX * HALF), dh = Math.round(d.down / MAX * HALF);
      return '<div class="bg"><div class="bt"><span class="b up" style="height:' + uh + 'px" title="요청 ' + d.up + '건 (' + d.w + ')"></span></div>' +
        '<div class="bb"><span class="b dn" style="height:' + dh + 'px" title="처리 ' + d.down + '건 (' + d.w + ')"></span></div><div class="bx">' + esc(d.w) + '</div></div>';
    }).join("");
    var yax = [50, 40, 30, 20, 10, 0, 10, 20, 30, 40, 50].map(function (n) { return '<div>' + n + '</div>'; }).join("");
    var grid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function () { return '<div class="gl"></div>'; }).join("");
    var body = '<div class="chart"><div class="yax">' + yax + '</div><div class="plot"><div class="grid">' + grid + '</div><div class="baseline"></div><div class="bars">' + bars + '</div></div></div>';
    return card(TL('pc.insights.weeklyTrend', "週別タスク推移"), body, "full");
  }

  function statusWidget() {
    var tabs = '<div class="iw-tabs"><span class="on">' + esc(TL('pc.insights.duration', 'Duration')) + '</span><span>' + esc(TL('pc.insights.all', 'All')) + '</span><span>Status 0</span><span>Priority 5</span></div>';
    var rows = STATUS.map(function (s) {
      return '<div class="st-row"><span class="hex" style="background:' + s.color + '"></span>' +
        '<span class="lab" style="background:' + s.bg + ';color:' + s.color + '">' + esc(TL('status.' + s.label.toLowerCase(), s.label)) + '</span>' +
        '<span class="cnt">' + s.count + '</span><span class="pct">' + s.pct + '%</span></div>';
    }).join("");
    return card(TL('pc.insights.byStatus', "ステータス別タスク状況"), tabs + '<div class="st-list">' + rows + '</div>');
  }

  function rankWidget(title, data) {
    var feat = data[0];
    var left = '<div class="top-feat"><div class="medal">🥇</div><div class="favatar" style="background:' + feat.color + (window.MM_AV && feat.name ? ' url(' + MM_AV.photo(feat.name) + ') center/cover no-repeat' : '') + '"></div>' +
      '<div class="fname">' + esc(feat.name) + '</div>' + (feat.role ? '<div class="frole">' + esc(feat.role) + '</div>' : '') + '</div>';
    var rankColor = { 2: "#FF7A3D", 3: "#3D7BFF" };
    var list = data.slice(1).map(function (t) {
      var rc = rankColor[t.rank] || "#C7C7CF";
      if (!t.name) return '<div class="top-row"><span class="rnk" style="background:' + rc + '">' + t.rank + '</span><span class="empty">' + esc(TL('pc.insights.noResults', 'No results found')) + '</span></div>';
      return '<div class="top-row"><span class="rnk" style="background:' + rc + '">' + t.rank + '</span><span class="tava" style="background:' + t.color + (window.MM_AV && t.name ? ' url(' + MM_AV.photo(t.name) + ') center/cover no-repeat' : '') + '"></span>' +
        '<span class="tinfo"><span class="tname">' + esc(t.name) + '</span>' + (t.role ? '<span class="trole">' + esc(t.role) + '</span>' : '') + '</span></div>';
    }).join("");
    return card(title, '<div class="top-grid">' + left + '<div class="top-list">' + list + '</div></div>');
  }

  function avgWidget() {
    var body = '<div class="avg-cards">' +
      '<div class="avg-card blue"><div class="avg-t">' + esc(TL('pc.insights.requestedTasks', 'Number of requested tasks')) + '</div><div class="avg-ic">' + PENCIL + '</div><div class="avg-n">14.14</div></div>' +
      '<div class="avg-card purple"><div class="avg-t">' + esc(TL('pc.insights.processedTasks', 'Number of processed tasks')) + '</div><div class="avg-ic">' + LAYERS + '</div><div class="avg-n">7.5</div></div>' +
      '</div>';
    return card(TL('pc.insights.weeklyAvg', "週平均リクエスト/処理件数"), body);
  }

  function assigneeWidget() {
    var MAX = 40, H = 180;
    var bars = ASSIGNEE.map(function (a) {
      var segs = a.segs.map(function (s) { return '<div class="ab-seg" style="height:' + (s.v / MAX * H) + 'px;background:' + s.c + '"></div>'; }).join("");
      return '<div class="ab-col"><div class="ab-stack">' + segs + '</div></div>';
    }).join("");
    var xrow = ASSIGNEE.map(function (a) { return '<div>' + esc(a.name) + '</div>'; }).join("");
    var yax = [40, 20, 0].map(function (n) { return '<div>' + n + '</div>'; }).join("");
    var body = chips("2026-01-01 ~ 2026-06-04") +
      '<div class="abwrap"><div class="ab-yax">' + yax + '</div><div class="ab-main"><div class="ab-plot">' + bars + '</div><div class="ab-xrow">' + xrow + '</div></div></div>';
    return card(TL('pc.insights.byAssignee', "Tasks by assignee"), body, "full");
  }

  function weekLineWidget() {
    var MAX = 10, N = WEEKS.length, W = 1080, H = 210, padL = 16, padR = 16, padT = 24, padB = 4;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var co = WEEKS.map(function (p, i) {
      return { x: padL + (i / (N - 1)) * plotW, y: padT + (1 - p.v / MAX) * plotH, v: p.v };
    });
    var gl = [0, 5, 10].map(function (g) { var y = padT + (1 - g / MAX) * plotH; return '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="#EFEFEF"/>'; }).join("");
    var poly = co.map(function (c) { return c.x.toFixed(1) + ',' + c.y.toFixed(1); }).join(' ');
    var dots = co.map(function (c) { return '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="4" fill="#fff" stroke="#29B6F0" stroke-width="2"/>'; }).join("");
    var labs = co.map(function (c) {
      return '<g><rect x="' + (c.x - 13).toFixed(1) + '" y="' + (c.y - 27).toFixed(1) + '" width="26" height="18" rx="9" fill="#fff" stroke="#E6E6EC"/>' +
        '<text x="' + c.x.toFixed(1) + '" y="' + (c.y - 14).toFixed(1) + '" text-anchor="middle" font-size="11" fill="#29B6F0">' + c.v + '</text></g>';
    }).join("");
    var svg = '<svg class="lc-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + gl +
      '<polyline points="' + poly + '" fill="none" stroke="#29B6F0" stroke-width="2"/>' + dots + labs + '</svg>';
    var xrow = WEEKS.map(function (p) { return '<div>' + esc(p.w) + '</div>'; }).join("");
    var yax = [10, 5, 0].map(function (n) { return '<div>' + n + '</div>'; }).join("");
    var body = chips("2026-01-01 ~ 2026-06-04") +
      '<div class="lcwrap"><div class="lc-yax">' + yax + '</div><div class="lc-main">' + svg + '<div class="lc-xrow">' + xrow + '</div></div></div>';
    return card(TL('pc.insights.perWeek', "Tasks per week"), body, "full");
  }

  function render() {
    var host = document.getElementById("insights-content");
    if (!host) return false;
    host.innerHTML =
      chartWidget() +
      '<div class="iw-row">' + statusWidget() + rankWidget(TL('pc.insights.postTop', "投稿TOP 5"), POST_TOP) + '</div>' +
      '<div class="iw-row">' + rankWidget(TL('pc.insights.commentTop', "コメントTOP 5"), COMMENT_TOP) + avgWidget() + '</div>' +
      assigneeWidget() +
      weekLineWidget();
    if (!document.getElementById("ins-istyle")) {
      var st = document.createElement("style"); st.id = "ins-istyle";
      st.textContent = ".iw-tabs span,.st-row{cursor:pointer;}.chart .b,.ab-seg{cursor:pointer;}.chart .b{transition:filter .12s;}.chart .b:hover{filter:brightness(1.12);}.st-row{transition:background .15s;border-radius:6px;}.st-row:hover{background:#FAFAFB;}";
      document.head.appendChild(st);
    }
    return true;
  }

  function MM() { return window.MM_MOTION; }
  // 위젯 1개 내부의 차트/숫자 애니메이션
  function animateWidget(el) {
    if (!MM() || !MM().enabled) return;
    el.querySelectorAll(".chart .b.up").forEach(function (b, i) { b.animate([{ transform: "scaleY(0)", transformOrigin: "bottom" }, { transform: "scaleY(1)", transformOrigin: "bottom" }], { duration: 600, delay: i * 22, easing: "cubic-bezier(.3,1,.4,1)" }); });
    el.querySelectorAll(".chart .b.dn").forEach(function (b, i) { b.animate([{ transform: "scaleY(0)", transformOrigin: "top" }, { transform: "scaleY(1)", transformOrigin: "top" }], { duration: 600, delay: i * 22, easing: "cubic-bezier(.3,1,.4,1)" }); });
    el.querySelectorAll(".ab-seg").forEach(function (b, i) { b.animate([{ transform: "scaleY(0)", transformOrigin: "bottom" }, { transform: "scaleY(1)", transformOrigin: "bottom" }], { duration: 600, delay: i * 40, easing: "ease-out" }); });
    el.querySelectorAll(".lc-svg polyline").forEach(function (pl) {
      try { var len = pl.getTotalLength(); pl.style.strokeDasharray = len; pl.style.strokeDashoffset = len; pl.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1100, easing: "ease-out", fill: "forwards" }); } catch (e) {}
    });
    el.querySelectorAll(".avg-n").forEach(function (e2) { var v = parseFloat(e2.textContent); MM().countUp(e2, v, "", 900); });
    el.querySelectorAll(".st-row .cnt").forEach(function (e2) { var v = parseInt(e2.textContent, 10); if (!isNaN(v)) MM().countUp(e2, v, "", 800); });
  }
  function insReveal(el) { if (MM()) MM().insRevealAnim(el); animateWidget(el); }
  function kick() { if (MM() && MM().revealRegister) { MM().revealRegister("insights", insReveal); MM().revealKick(); } }

  function wire() {
    if (window.__INS_WIRED) return; window.__INS_WIRED = true;
    document.addEventListener("click", function (e) {
      var tab = e.target.closest("#insights-content .iw-tabs span");
      if (tab) { var g = tab.parentNode; g.querySelectorAll("span").forEach(function (s) { s.classList.remove("on"); }); tab.classList.add("on"); return; }
    });
  }

  document.addEventListener('mm:lang', function () { render(); kick(); });
  function boot() { wire(); if (render()) { kick(); return; } var n = 0, t = setInterval(function () { if (render() || ++n > 20) { kick(); clearInterval(t); } }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__INS = { render: render, animate: kick };
})();
