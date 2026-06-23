/* =========================================================================
   gantt_view.js — morningmate "Gantt 뷰" (좌측 태스크 테이블 + 우측 타임라인 바)
   - 좌측 패널은 Table 뷰와 동일 컬럼(Task/Status/Assignee/Start/Due/Progress/더블체크/예산)
   - 우측 타임라인: 날짜 바, 주말(토/일) 보라 세로 음영, 오늘 세로선
   ========================================================================= */
(function () {
  "use strict";
  function TL(k, fb) { var t = window.MM_TR && window.MM_TR(k); return (t && t !== k) ? t : fb; }
  var STATUS = {
    Complete: { dot: "#423DC5", bg: "rgba(66,61,197,.28)", text: "#402A9D", bar: "#3D2FD6" },
    Pending: { dot: "#00B5F1", bg: "rgba(0,181,241,.28)", text: "#0053BF", bar: "#21C6C6" },
    Progress: { dot: "#00B01C", bg: "rgba(0,176,28,.28)", text: "#1A8F2E", bar: "#2DB84D" },
    Hold: { dot: "#484848", bg: "rgba(72,72,72,.28)", text: "#484848", bar: "#9a9a9a" }
  };
  var G = {
    start: "2026-05-17", days: 37, today: "2026-06-04", dayW: 34,
    rows: [
      { task: "노션 웨비나", count: 3, status: "Complete", collapsed: true, prog: 100, budget: "1,000" },
      { task: "kintone 웨비나", count: 2, status: "Complete", collapsed: true, prog: 100, budget: "1,000" },
      { task: "커타 웨비나", count: 3, status: "Complete", collapsed: true, prog: 100 },
      { task: "flyle 웨비나", status: "Complete", start: "2026-05-21", due: "2026-05-26", prog: 100, assignee: "SANO HARUKA", more: 1 },
      { task: "TENDA 웨비나", status: "Pending", start: "2026-05-20", due: "2026-05-20", prog: 0, assignee: "SANO HARUKA", more: 1 },
      { task: "GOOGLE cloude", status: "Pending", start: "2026-06-11", due: "2026-06-11", prog: 0 },
      { task: "[검수] 일본어", count: 4, status: "Progress", prog: 60, check: true },
      { task: "전시화 관련", status: "Complete", due: "2026-04-06", prog: 100 },
      { task: "PR 기사", count: 6, status: "Complete", due: "2026-04-07", prog: 100, budget: "1,000" },
      { task: "[일본] 프리랜서 비용 지급", count: 5, status: "Pending", prog: 0 },
      { task: "김우중 4월 계약금", status: "Complete", start: "2026-05-20", due: "2026-05-20", prog: 100, assignee: "SANO HARUKA", budget: "1,000" },
      { task: "하루카 2월 계약금", status: "Complete", due: "2026-03-31", prog: 100, budget: "1,000" },
      { task: "하루카 4월 계약금", status: "Pending", start: "2026-06-05", due: "2026-06-05", prog: 0, assignee: "SANO HARUKA" },
      { task: "하루카 5월 계약금", status: "Pending", start: "2026-07-03", due: "2026-07-03", prog: 0 }
    ]
  };
  var GASSIGN = ["SANO HARUKA", "Kimura Takuya", "Soyun Noh", "Hyejo Seo"];
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function parse(d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function diff(a, b) { return Math.round((parse(a) - parse(b)) / 86400000); }
  function fmt(d) { return ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" + d.getFullYear(); }
  function badge(s) { var c = STATUS[s] || STATUS.Hold; return '<span class="g-badge" style="background:' + c.bg + ';color:' + c.text + '"><span class="d" style="background:' + c.dot + '"></span>' + esc(TL('status.' + String(s).toLowerCase(), s)) + '</span>'; }
  function pbar(p, c) { return '<div class="g-prog"><div class="g-trk"><div class="g-fil" style="width:' + p + '%;background:' + (p ? c.bar : "#bbb") + '"></div></div><span class="g-pct">' + p + '%</span></div>'; }

  var IC = {
    filter: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 5h18l-7 8v5l-4 2v-7z"/></svg>',
    group: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4.5" width="18" height="5" rx="1.2"/><rect x="3" y="14" width="18" height="5" rx="1.2"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    gear: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1"/></svg>',
    caret: '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
  };
  var CHECK = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#cfcfd6" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.6 2.6L16 9.5"/></svg>';
  var CHECK_ON = '<span class="g-dcon"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" stroke-width="2.6"><path d="M6 12.5l3.5 3.5L18 8"/></svg></span>';

  function render() {
    var host = document.getElementById("gantt");
    if (!host) return false;
    var startD = parse(G.start), W = G.dayW, N = G.days;
    // 헤더: 월 그룹 + 일, 주말 음영
    var months = [], days = "", weekend = "";
    for (var i = 0; i < N; i++) {
      var d = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate() + i);
      var key = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
      if (!months.length || months[months.length - 1].key !== key) months.push({ key: key, n: 0 });
      months[months.length - 1].n++;
      var ymd = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
      var isToday = ymd === G.today;
      var wd = d.getDay();
      var isWe = (wd === 0 || wd === 6);
      if (isWe) weekend += '<div class="g-weekend" style="left:' + (i * W) + 'px;width:' + W + 'px"></div>';
      days += '<div class="g-day' + (isToday ? " today" : (isWe ? " weekend" : "")) + '" style="width:' + W + 'px">' + d.getDate() + '</div>';
    }
    var mhtml = months.map(function (m) { return '<div class="g-month" style="width:' + (m.n * W) + 'px">' + m.key + '</div>'; }).join("");

    // 좌측 행 + 우측 바
    var left = "", right = "";
    G.rows.forEach(function (r, i) {
      var isParent = r.count != null || r.collapsed;
      var tg = !isParent ? '<span class="g-dot"></span>' : (r.collapsed ? '<span class="g-tg plus">＋</span>' : '<span class="g-tg">−</span>');
      var done = r.status === "Complete" ? " done" : "";
      var c = STATUS[r.status] || STATUS.Hold;
      var p = r.prog != null ? r.prog : (r.status === "Complete" ? 100 : 0);
      if (!r.assignee) r.assignee = GASSIGN[i % GASSIGN.length];
      var assignee = '<span class="g-anm">' + esc(r.assignee) + '</span>' + (r.more ? ' <span class="g-amore">+' + r.more + '</span>' : "");
      left += '<div class="g-row' + done + '" data-gi="' + i + '">' +
        '<div class="g-c1">' + tg + '<span class="nm">' + esc(r.task) + (r.count != null ? ' <span class="cnt">(' + r.count + ')</span>' : "") + '</span></div>' +
        '<div class="g-c2" data-act="gstatus" data-gi="' + i + '" title="클릭하여 상태 변경">' + badge(r.status) + '</div>' +
        '<div class="g-c3 g-assignee">' + assignee + '</div>' +
        '</div>';
      // 바
      var bar = "";
      if (r.start && r.due) {
        var s = diff(r.start, G.start), e = diff(r.due, G.start);
        if (e >= 0 && s <= N) {
          var cs = Math.max(0, s), ce = Math.min(N - 1, e);
          var x = cs * W, w = (ce - cs + 1) * W - 6;
          bar = '<div class="g-bar" style="left:' + x + 'px;width:' + Math.max(W - 6, w) + 'px;background:' + c.bar + '"></div>';
        }
      } else if (r.due) {
        var md = diff(r.due, G.start);
        if (md >= 0 && md < N) bar = '<div class="g-mile" style="left:' + (md * W + 2) + 'px;border-right-color:' + c.bar + '"></div>';
      }
      right += '<div class="g-track" data-gi="' + i + '">' + bar + '</div>';
    });

    var todayX = diff(G.today, G.start) * W;
    var toolbar =
      '<div class="g-toolbar"><div class="g-tb-l">' +
        '<span class="g-dd">' + TL('pc.allTasks', 'All Tasks') + ' ' + IC.caret + '</span>' +
        '<span class="g-tbtn">' + IC.filter + ' ' + TL('pc.filter', 'Filter') + '</span>' +
        '<span class="g-tbtn">' + IC.group + ' ' + TL('pc.groupedView', 'Grouped View') + '</span>' +
        '<span class="g-tbtn">' + IC.eye + ' ' + TL('pc.hide', 'Hide') + '</span></div>' +
      '<div class="g-tb-r">' +
        '<label class="g-hide"><input type="checkbox"> ' + TL('pc.hideAll', 'Hide all') + '</label>' +
        '<span class="g-tnow">' + TL('pc.today', 'Today') + '</span>' +
        '<span class="g-dd2">' + TL('pc.day', 'Day') + ' ' + IC.caret + '</span>' +
        '<span class="g-add">' + TL('pc.addTask', 'Add Task') + ' ' + IC.caret + '</span>' +
        '<span class="g-gear">' + IC.gear + '</span></div></div>';
    host.innerHTML = toolbar +
      '<div class="g-wrap">' +
      '<div class="g-left"><div class="g-lhead">' +
        '<div class="g-c1">' + TL('pc.col.task', 'Task') + '</div><div class="g-c2">' + TL('pc.col.status', 'Status') + '</div><div class="g-c3">' + TL('pc.col.assignee', 'Assignee') + '</div></div>' +
        '<div class="g-lrows">' + left + '</div></div>' +
      '<div class="g-right"><div class="g-rinner" style="width:' + (N * W) + 'px">' +
      '<div class="g-rhead"><div class="g-months">' + mhtml + '</div><div class="g-days">' + days + '</div></div>' +
      '<div class="g-rrows">' + weekend + (todayX >= 0 ? '<div class="g-todayline" style="left:' + (todayX + W / 2) + 'px"></div>' : "") + right + '</div>' +
      '</div></div></div>';
    if (!document.getElementById("g-istyle")) {
      var ist = document.createElement("style"); ist.id = "g-istyle";
      ist.textContent = ".g-c2[data-act]{cursor:pointer;}.g-c2[data-act]:hover .g-badge{filter:brightness(.95);}.g-row{transition:background .15s;}.g-row.g-hl{background:#F1ECFF;}.g-tnow{cursor:pointer;}.g-bar{transition:filter .15s;cursor:grab;}.g-bar:hover{filter:brightness(1.08);}.g-bar:active{cursor:grabbing;}.g-bar::before,.g-bar::after{content:'';position:absolute;top:0;bottom:0;width:7px;cursor:ew-resize;opacity:0;background:rgba(255,255,255,.55);}.g-bar::before{left:0;border-radius:5px 0 0 5px;}.g-bar::after{right:0;border-radius:0 5px 5px 0;}.g-bar:hover::before,.g-bar:hover::after{opacity:1;}.g-fil{transition:width .3s;}.g-track{position:relative;}.g-ghost{position:absolute;top:7px;bottom:7px;background:rgba(100,73,252,.16);border:1.5px dashed #6449FC;border-radius:6px;pointer-events:none;display:flex;align-items:center;justify-content:center;color:#6449FC;font-size:15px;font-weight:700;z-index:3;}";
      document.head.appendChild(ist);
    }
    return true;
  }

  var ORDER = ["Pending", "Progress", "Complete", "Hold"];
  function GM() { return window.MM_GAME; }
  function MM() { return window.MM_MOTION; }
  function playIntro() { var host = document.getElementById("gantt"); if (host && MM() && MM().ganttReveal) MM().ganttReveal(host); }
  var startDg = parse(G.start);
  function ymdAt(idx) { var d = new Date(startDg.getFullYear(), startDg.getMonth(), startDg.getDate() + idx); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  var ghostEl = null, drag = null, gBarDragged = false, barPumpTimer = null;
  function removeGhost() { if (ghostEl && ghostEl.parentNode) ghostEl.parentNode.removeChild(ghostEl); ghostEl = null; }
  // 간트바 5개 이상이면: 무작위 바의 길이를 늘리거나 줄임(먼저 세로 두께가 두꺼워졌다가 → 길이 변경 → 두께 복귀)
  function pumpBar(bar) {
    if (bar._pumping) return; bar._pumping = true;
    var W = G.dayW, maxX = G.days * W, left = parseFloat(bar.style.left) || 0, curW = parseFloat(bar.style.width) || W;
    var newW = Math.max(W - 6, Math.min(maxX - left, (1 + Math.floor(Math.random() * 7)) * W - 6));
    bar.style.transformOrigin = "center";
    bar.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(1.9)", offset: .25 }, { transform: "scaleY(1.9)", offset: .62 }, { transform: "scaleY(1)" }], { duration: 1000, easing: "ease-in-out" });
    setTimeout(function () { bar.style.transition = "width .5s cubic-bezier(.4,0,.2,1)"; bar.style.width = newW + "px"; }, 250);
    // 다른 사람 프로필이 막대 '끝'에 붙어 길이를 잡고 움직이는 것처럼
    var track = bar.closest(".g-track");
    if (track) {
      var cy = bar.offsetTop + bar.offsetHeight / 2;
      var av = document.createElement("div"); av.className = "g-dragava";
      var avImg = (window.MM_AV) ? MM_AV.randomAny() : "https://picsum.photos/seed/mmother" + (Math.floor(Math.random() * 9) + 1) + "/72";
      // 마우스 포인터 + 프로필 사진 조합(커서가 막대 끝을 잡고 움직이는 것처럼)
      av.style.cssText = "position:absolute;z-index:7;width:0;height:0;pointer-events:none;top:" + cy + "px;left:" + (left + curW) + "px;";
      av.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" style="position:absolute;left:-5px;top:-7px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45));"><path d="M5 2.5l14.5 7.2-6.3 1.7L9.7 18.5z" fill="#fff" stroke="#2b2b33" stroke-width="1.3" stroke-linejoin="round"/></svg>' +
        '<span style="position:absolute;left:11px;top:12px;width:45px;height:45px;border-radius:13px;background:#9DC8FF url(' + avImg + ') center/cover;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);"></span>';
      track.appendChild(av);
      av.animate([{ left: (left + curW) + "px", opacity: 0 }, { left: (left + curW) + "px", opacity: 1, offset: .18 }, { left: (left + newW) + "px", opacity: 1, offset: .85 }, { left: (left + newW) + "px", opacity: 0 }], { duration: 1050, delay: 200, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
      setTimeout(function () { if (av.parentNode) av.parentNode.removeChild(av); }, 1350);
    }
    setTimeout(function () { bar._pumping = false; bar.style.transition = ""; }, 1150);
  }
  function startBarPump() {
    if (barPumpTimer || !MM() || !MM().enabled) return;
    // 한 번에 하나씩만 '시작'하도록 전역적으로 직렬화 → 어떤 두 막대도 동시에 시작하지 않음.
    // 단, 한 번 시작한 애니메이션(~1.35s)이 다음 시작(0.95~1.55s 후)까지 이어지므로
    // 화면에는 여러 막대가 '동시에 움직이는' 것처럼 보인다(시작 타이밍만 어긋남).
    function tick() {
      barPumpTimer = setTimeout(tick, 480 + Math.floor(Math.random() * 380));
      var host = document.getElementById("gantt"); if (!host) { clearTimeout(barPumpTimer); barPumpTimer = null; return; }
      var sec = document.querySelector('.vsec[data-view="gantt"]'); if (sec && !sec.classList.contains("on")) return;
      if (drag) return;
      var all = [].slice.call(host.querySelectorAll(".g-bar"));
      if (all.length < 5) return;
      var avail = all.filter(function (b) { return !b._pumping; });
      if (!avail.length) return;
      var b = avail[Math.floor(Math.random() * avail.length)];
      if (b) pumpBar(b);
    }
    tick();
  }
  function showGhost(track, day) { removeGhost(); ghostEl = document.createElement("div"); ghostEl.className = "g-ghost"; ghostEl.style.left = (day * G.dayW) + "px"; ghostEl.style.width = (3 * G.dayW - 6) + "px"; ghostEl.textContent = "＋"; track.appendChild(ghostEl); }
  function dayAt(track, clientX) { var rect = track.getBoundingClientRect(); return Math.max(0, Math.min(G.days - 1, Math.floor((clientX - rect.left) / G.dayW))); }
  function addBarAt(track, clientX) {
    var gi = +track.getAttribute("data-gi"), r = G.rows[gi], day = dayAt(track, clientX);
    removeGhost();
    var len = 1 + Math.floor(Math.random() * 6); // 1~6일 랜덤 길이
    r.start = ymdAt(day); r.due = ymdAt(Math.min(G.days - 1, day + len)); render();
    var nt = document.querySelectorAll("#gantt .g-track")[gi];
    var bar = nt && nt.querySelector(".g-bar");
    if (bar && MM()) bar.animate([{ transform: "scaleX(0)", transformOrigin: "left", opacity: .5 }, { transform: "scaleX(1)", opacity: 1 }], { duration: 400, easing: "cubic-bezier(.2,.8,.3,1)" });
    if (GM()) GM().award(6, bar || track);
    if (window.MM_TOAST) window.MM_TOAST("일정 막대를 추가했습니다");
    if (document.querySelectorAll("#gantt .g-bar").length >= 5) startBarPump();
  }
  function wire() {
    if (window.__GANTT_WIRED) return; window.__GANTT_WIRED = true;
    document.addEventListener("click", function (e) {
      var host = document.getElementById("gantt"); if (!host) return;
      var st = e.target.closest('#gantt .g-c2[data-act="gstatus"]');
      if (st) {
        var r = G.rows[+st.getAttribute("data-gi")], i = ORDER.indexOf(r.status);
        var prev = r.status; r.status = ORDER[(i + 1) % ORDER.length];
        if (r.status === "Complete") r.prog = 100;
        render();
        var badgeEl = document.querySelector('#gantt .g-c2[data-act][data-gi="' + r._gi + '"]');
        var row = document.querySelector('#gantt .g-row[data-gi="' + (+st.getAttribute("data-gi")) + '"]');
        var bEl = row ? row.querySelector(".g-badge") : null;
        if (window.MM_MOTION) window.MM_MOTION.statusFlip(bEl);
        if (r.status === "Complete" && prev !== "Complete") { if (GM()) GM().complete(bEl || row); }
        else if (GM()) GM().award(5, bEl || row);
        return;
      }
      var tnow = e.target.closest("#gantt .g-tnow");
      if (tnow) {
        var rightPane = host.querySelector(".g-right");
        var tline = host.querySelector(".g-todayline");
        if (rightPane && tline) rightPane.scrollTo({ left: Math.max(0, parseFloat(tline.style.left) - rightPane.clientWidth / 2), behavior: "smooth" });
        if (window.MM_TOAST) window.MM_TOAST("오늘로 이동");
        return;
      }
      var bar = e.target.closest("#gantt .g-bar, #gantt .g-mile");
      if (bar) { if (gBarDragged) { gBarDragged = false; return; } if (window.MM_TOAST) window.MM_TOAST("일정 막대 — 드래그로 위치/길이 조절"); return; }
      var track = e.target.closest("#gantt .g-track");
      if (track && !track.querySelector(".g-bar, .g-mile")) { addBarAt(track, e.clientX); return; }
      var grw = e.target.closest("#gantt .g-row[data-gi]");
      if (grw) { host.querySelectorAll(".g-row.g-hl").forEach(function (x) { x.classList.remove("g-hl"); }); grw.classList.add("g-hl"); }
    });
    // 빈 트랙 위에 마우스를 올리면 막대 추가 위치 고스트 표시
    document.addEventListener("mousemove", function (e) {
      if (drag || !e.target.closest) return;
      var track = e.target.closest("#gantt .g-track");
      if (!track || track.querySelector(".g-bar, .g-mile")) { removeGhost(); return; }
      showGhost(track, dayAt(track, e.clientX));
    });
    // 막대를 드래그해서 이동 / 양끝으로 길이 조절
    document.addEventListener("mousedown", function (e) {
      var bar = e.target.closest("#gantt .g-bar"); if (!bar) return;
      e.preventDefault();
      var track = bar.closest(".g-track");
      var left = parseFloat(bar.style.left) || 0, width = parseFloat(bar.style.width) || G.dayW;
      var rel = e.clientX - bar.getBoundingClientRect().left;
      var mode = rel < 9 ? "L" : (rel > width - 9 ? "R" : "M");
      drag = { bar: bar, gi: +track.getAttribute("data-gi"), startX: e.clientX, left: left, width: width, mode: mode, moved: false };
      bar.style.cursor = "grabbing";
    });
    document.addEventListener("mousemove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.startX, W = G.dayW, maxX = G.days * W;
      if (Math.abs(dx) > 2) drag.moved = true;
      if (drag.mode === "M") drag.bar.style.left = Math.max(0, Math.min(maxX - drag.width, drag.left + dx)) + "px";
      else if (drag.mode === "R") drag.bar.style.width = Math.max(W - 6, Math.min(maxX - drag.left, drag.width + dx)) + "px";
      else { var nl = Math.max(0, drag.left + dx), nw = drag.width - (nl - drag.left); if (nw >= W - 6) { drag.bar.style.left = nl + "px"; drag.bar.style.width = nw + "px"; } }
    });
    document.addEventListener("mouseup", function () {
      if (!drag) return; var d = drag; drag = null;
      if (!d.moved) return;
      gBarDragged = true;
      var W = G.dayW, left = parseFloat(d.bar.style.left) || 0, width = parseFloat(d.bar.style.width) || W;
      var s = Math.round(left / W), eday = Math.round((left + width) / W) - 1; if (eday < s) eday = s;
      var r = G.rows[d.gi]; r.start = ymdAt(Math.max(0, s)); r.due = ymdAt(Math.min(G.days - 1, eday));
      render();
      if (GM()) GM().award(4, document.querySelectorAll("#gantt .g-track")[d.gi]);
      if (window.MM_TOAST) window.MM_TOAST("일정 기간을 조정했습니다");
    });
  }

  function maybeIntro() { var sec = document.querySelector('.vsec[data-view="gantt"]'); if (sec && sec.classList.contains("on")) { playIntro(); if (document.querySelectorAll("#gantt .g-bar").length >= 5) startBarPump(); } }
  // 언어별 콘텐츠(행)를 G.rows 로 주입
  function syncGanttFromContent() {
    if (!window.MM_C) return;
    var rows = window.MM_C('pc.gantt');
    if (rows && rows.length) G.rows = rows;
  }
  function boot() { syncGanttFromContent(); wire(); if (render()) { maybeIntro(); return; } var n = 0, t = setInterval(function () { if (render() || ++n > 20) { maybeIntro(); clearInterval(t); } }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__GANTT = { render: render, intro: function () { playIntro(); if (document.querySelectorAll("#gantt .g-bar").length >= 5) startBarPump(); } };
  document.addEventListener('mm:lang', function () { try { syncGanttFromContent(); render(); } catch (e) {} });
})();
