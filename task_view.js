/* =========================================================================
   task_view.js — morningmate "업무(Table) 뷰" — 계층형 트리 테이블 (데이터 주입형)
   - 부모행/하위그룹/하위태스크가 모두 풀 행(상태·담당자·날짜·진행률·더블체크·예산)
   - 펼침 "−" / 접힘 검은 "＋" 박스 + (개수) / Complete 행은 텍스트 dim
   - 더블체크 파란 채움 또는 회색 외곽 / 일부 100% 막대 보라
   - 상태배지 색은 실제 morningmate Table에서 추출
   ========================================================================= */
(function () {
  "use strict";

  function TL(k, fb) { var t = window.MM_TR && window.MM_TR(k); return (t && t !== k) ? t : fb; }
  var COLKEY = ["task", "status", "assignee", "startDate", "dueDate", "progress", "doubleCheck", "budget"];

  var STATUS = {
    "Complete": { dot: "#423DC5", bg: "rgba(66,61,197,.28)", text: "#402A9D" },
    "Pending":  { dot: "#00B5F1", bg: "rgba(0,181,241,.28)", text: "#0053BF" },
    "Progress": { dot: "#00B01C", bg: "rgba(0,176,28,.28)", text: "#1A8F2E" },
    "Hold":     { dot: "#484848", bg: "rgba(72,72,72,.28)", text: "#484848" }
  };

  /* ---- 데이터 (트리). 여기만 바꾸면 됨 ------------------------------- */
  var TABLE_DATA = {
    view: "haruka", total: 219,
    columns: ["Task", "Status", "Assignee", "Start date", "Due date", "Progress", "더블체크", "예산"],
    rows: [
      { task: "X/인스타/유튜브", count: 2, status: "Progress", assignee: "SANO HARUKA", start: "05/14/2026", progress: 0, check: true, budget: "1,000",
        children: [
          { task: "5월", count: 3, status: "Complete", progress: 100, budget: "1,000", collapsed: true },
          { task: "6월", count: 1, status: "Progress", assignee: "SANO HAR...", more: 1, progress: 0, budget: "1,000", collapsed: true }
        ] },
      { task: "일본 현지 직장인 심층 인터뷰", status: "Complete", assignee: "SANO HARUKA", due: "04/29/2026", progress: 100, budget: "1,000" },
      { task: "[강의공유] 스킬업", count: 2, status: "Progress", assignee: "SANO HAR...", more: 1, progress: 0,
        children: [
          { task: "n8n", count: 3, status: "Progress", progress: 0, collapsed: true },
          { task: "Claude Code", count: 4, status: "Progress", progress: 0, collapsed: true }
        ] },
      { task: "일본 IT도입보조금 조사", status: "Pending", progress: 0 },
      { task: "[정보 공유] 세미나/웨비나/오프라인 행사 등", count: 7, status: "Progress", progress: 0,
        children: [
          { task: "백로그 웨비나", status: "Complete", assignee: "SANO HAR...", more: 1, due: "Apr 22, 12:..", progress: 100 },
          { task: "노션 웨비나", count: 3, status: "Complete", progress: 100, collapsed: true },
          { task: "kintone 웨비나", count: 2, status: "Complete", progress: 100, collapsed: true },
          { task: "커타 웨비나", count: 3, status: "Complete", progress: 100, collapsed: true },
          { task: "flyle 웨비나", status: "Complete", assignee: "SANO HAR...", more: 1, start: "05/21/2026", due: "05/26/2026", progress: 100 },
          { task: "TENDA 웨비나", status: "Pending", assignee: "SANO HAR...", more: 1, start: "05/20/2026", progress: 0 },
          { task: "GOOGLE cloude", status: "Pending", assignee: "Soyun Noh", more: 1, due: "06/11/2026", progress: 0 }
        ] },
      { task: "[검수] 일본어", count: 4, status: "Progress", assignee: "SANO HARUKA", progress: 100, purpleBar: true,
        children: [
          { task: "전시화 관련", status: "Complete", assignee: "SANO HARUKA", due: "04/06/2026", progress: 100 }
        ] },
      { task: "PR 기사", count: 6, status: "Complete", assignee: "SANO HARUKA", due: "04/07/2026", progress: 100,
        children: [
          { task: "이벤트 참여안내문", status: "Complete", assignee: "SANO HARUKA", due: "04/07/2026", progress: 100 },
          { task: "회원가입 이메일 시퀀스", status: "Complete", assignee: "SANO HAR...", more: 1, due: "04/27/2026", progress: 100 }
        ] },
      { task: "[일본] 프리랜서 비용 지급", count: 5, status: "Pending", progress: 0,
        children: [
          { task: "김우중 4월 계약금 (4/27 출근)", status: "Complete", assignee: "Soyun Noh", due: "05/20/2026", progress: 100 },
          { task: "하루카 2월 계약금", status: "Complete", assignee: "Soyun Noh", due: "03/31/2026", progress: 100 },
          { task: "하루카 3월 계약금", status: "Complete", assignee: "Soyun Noh", due: "05/06/2026", progress: 100 },
          { task: "하루카 4월 계약금", status: "Pending", assignee: "Soyun Noh", due: "06/05/2026", progress: 0 },
          { task: "하루카 5월 계약금", status: "Pending", assignee: "Soyun Noh", due: "07/03/2026", progress: 0 }
        ] },
      { task: "[Paid] PR/미디어/퍼포먼스", count: 5, status: "Progress", assignee: "Soyun Noh", progress: 0,
        children: [
          { task: "[키워드광고] 야후 재팬 광고 셋팅", status: "Hold", assignee: "Soyun Noh", progress: 0 },
          { task: "[키워드광고] 키워드 조사", status: "Complete", assignee: "SANO HARUKA", due: "03/11/2026", progress: 100 },
          { task: "[키워드광고] 구글 광고 셋팅", status: "Pending", assignee: "Soyun Noh", progress: 0 },
          { task: "[PR] PR TIMES 1개월 플랜 결제", count: 1, status: "Complete", assignee: "SANO HARUKA", due: "04/06/2026", progress: 100, collapsed: true },
          { task: "[퍼포먼스] 광고소재 조사", status: "Complete", assignee: "Soyun Noh", progress: 100 }
        ] },
      { task: "[일본] SNS/Blog", count: 16, status: "Progress", assignee: "Soyun Noh", more: 1, progress: 0,
        children: [
          { task: "[일본] 인스타그램", count: 12, status: "Progress", assignee: "SANO HARUKA", progress: 0, collapsed: true },
          { task: "[일본] X", count: 1, status: "Progress", assignee: "SANO HARUKA", progress: 0, collapsed: true },
          { task: "[일본] Blog", count: 1, status: "Progress", assignee: "SANO HARUKA", progress: 0, collapsed: true },
          { task: "[일본]note", count: 3, status: "Progress", progress: 100, purpleBar: true, collapsed: true }
        ] }
    ]
  };

  /* ---- 유틸 ---------------------------------------------------------- */
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function badge(label) {
    var s = STATUS[label] || { dot: "#999", bg: "#eee", text: "#777" };
    return '<span class="mmt-badge" style="background:' + s.bg + ';color:' + s.text + '"><span class="dot" style="background:' + s.dot + '"></span>' + esc(TL('status.' + String(label).toLowerCase(), label)) + '</span>';
  }
  function progressCell(p, bar, pct) {
    if (p == null) return "";
    return '<div class="mmt-prog"><div class="trk"><div class="fil" style="width:' + p + '%;background:' + (bar || "#555") + '"></div></div><span class="pct" style="color:' + (pct || "#888") + '">' + p + '%</span></div>';
  }
  var AVA_PALETTE = ["#9DC8FF", "#F2A65A", "#A8E6C0", "#C5A3FF", "#FFB0B0", "#5B6CF0", "#36CFBD", "#FFD4A8"];
  function avaColor(name) { var h = 0; for (var i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return AVA_PALETTE[h % AVA_PALETTE.length]; }
  var ASG_POOL = ["SANO HARUKA", "Kimura Takuya", "Soyun Noh", "Hyejo Seo"];
  var _asgN = 0, _asgDone = false;
  function assignAll(nodes) { nodes.forEach(function (n) { n.assignee = ASG_POOL[_asgN++ % ASG_POOL.length]; if (n.children) assignAll(n.children); }); }
  function ensureAssignees() { if (_asgDone) return; _asgDone = true; assignAll(TABLE_DATA.rows); }
  function clearColData(nodes) { nodes.forEach(function (n) { n.start = ""; n.due = ""; n.budget = ""; n.check = false; if (n.children) clearColData(n.children); }); }
  var _clearDone = false;
  function ensureCleared() { if (_clearDone) return; _clearDone = true; clearColData(TABLE_DATA.rows); }
  function assigneeHtml(node) {
    return '<span class="anm">' + esc(node.assignee || "") + '</span>' + (node.more ? ' <span class="amore">+' + node.more + '</span>' : "");
  }
  var CHECK ='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#cfcfd6" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.6 2.6L16 9.5"/></svg>';
  var CHECK_ON = '<span class="dc-on"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="2.6"><path d="M6 12.5l3.5 3.5L18 8"/></svg></span>';

  /* ---- 트리 행 렌더 -------------------------------------------------- */
  var NODES = [];
  function nodeRows(node, depth, flat) {
    var id = NODES.length; NODES.push(node); node._id = id;
    var isParent = !flat && ((node.children && node.children.length) || node.collapsed);
    var toggle = !isParent ? '<span class="leafdot"></span>'
      : (node.collapsed ? '<span class="tg plus" data-act="toggle" data-tid="' + id + '">＋</span>' : '<span class="tg minus" data-act="toggle" data-tid="' + id + '">−</span>');
    var count = node.count != null ? ' <span class="cnt">(' + node.count + ')</span>' : '';
    var done = node.status === "Complete" ? " done" : "";
    var assignee = assigneeHtml(node);
    var dc = node.check ? CHECK_ON : CHECK;
    var bar = node.purpleBar ? "#5B4BE0" : (node.status === "Complete" ? "#5B4BE0" : "#555");
    var pct = node.purpleBar ? "#5B4BE0" : "#888";
    var row = '<div class="mmt-row' + done + '" data-tid="' + id + '">' +
      '<div class="c-task" style="padding-left:' + (16 + depth * 22) + 'px">' + toggle + '<span class="tname">' + esc(node.task) + count + '</span></div>' +
      '<div class="c-status" data-act="status" data-tid="' + id + '" title="클릭하여 상태 변경">' + badge(node.status) + '</div>' +
      '<div class="c-assignee">' + assignee + '</div>' +
      '<div class="c-start">' + (node.start ? esc(node.start) : '<span class="mmt-ph">＋</span>') + '</div>' +
      '<div class="c-due">' + (node.due ? esc(node.due) : '<span class="mmt-ph">＋</span>') + '</div>' +
      '<div class="c-prog">' + progressCell(node.progress, bar, pct) + '</div>' +
      '<div class="c-check" data-act="check" data-tid="' + id + '" title="더블체크">' + dc + '</div>' +
      '<div class="c-budget">' + (node.budget ? esc(node.budget) : '<span class="mmt-ph">＋</span>') + '</div>' +
      '<div class="c-plus"></div></div>';
    var kids = (!flat && node.children && !node.collapsed) ? node.children.map(function (c) { return nodeRows(c, depth + 1); }).join("") : "";
    return row + kids;
  }

  function CSS() {
    return [
      '#mmt-view{font-family:Roboto,"Noto Sans KR","Noto Sans JP",sans-serif;color:#333;background:#fff;}',
      '.mmt-toolbar{display:flex;align-items:center;gap:10px;padding:12px 20px;border-bottom:1px solid #EEE;}',
      '.mmt-view{display:flex;align-items:center;gap:8px;border:1px solid #E2E2E8;border-radius:6px;padding:7px 12px;font-size:13px;color:#333;min-width:120px;justify-content:space-between;}',
      '.mmt-iconbtn{width:30px;height:30px;border:1px solid #E2E2E8;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#888;font-size:13px;background:#fff;}',
      '.mmt-tbtn{display:flex;align-items:center;gap:6px;font-size:13px;color:#555;padding:7px 12px;border-radius:6px;cursor:pointer;}',
      '.mmt-tbtn.hide{background:#EFECFF;color:#6449FC;}',
      '.mmt-spacer{flex:1;}.mmt-hideall{font-size:13px;color:#888;display:flex;align-items:center;gap:6px;}',
      '.mmt-add{background:#6449FC;color:#fff;font-weight:600;font-size:13px;border-radius:6px;padding:8px 16px;display:flex;align-items:center;gap:6px;}',
      '.mmt-grid{font-size:14px;}',
      '.mmt-colhead,.mmt-row{display:grid;grid-template-columns:2.37fr 1fr 1.1fr 0.82fr 0.82fr 0.73fr 0.66fr 0.72fr 38px;align-items:center;}',
      '.mmt-colhead{height:42px;border-bottom:1px solid #EEE;color:#888;font-size:12.5px;background:#FAFAFB;position:sticky;top:0;z-index:2;}',
      '.mmt-colhead>div{padding:0 10px;text-align:center;}.mmt-colhead .ch-task{text-align:center;}',
      '.mmt-row{height:42px;border-bottom:1px solid #F2F2F4;}',
      '.mmt-row:hover{background:#FAF9FF;}',
      '.mmt-row>div{padding:0 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.mmt-row>div:not(.c-task){text-align:center;}',
      '.mmt-row .c-task{display:flex;align-items:center;gap:8px;}',
      '.mmt-row .tname{color:#333;overflow:hidden;text-overflow:ellipsis;}',
      '.mmt-row .cnt{color:#bbb;}',
      '.mmt-row.done .tname,.mmt-row.done .c-assignee,.mmt-row.done .c-start,.mmt-row.done .c-due,.mmt-row.done .c-budget,.mmt-row.done .pct{color:#bcbcc2 !important;}',
      '.mmt-row.done .cnt{color:#d2d2d8;}',
      /* 토글 */
      '.tg{width:16px;height:16px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;cursor:pointer;}',
      '.tg.plus{background:#3A3A3A;color:#fff;font-size:11px;}',
      '.tg.minus{color:#9a9aa2;}',
      '.leafdot{width:5px;height:5px;border-radius:50%;background:#D8D8DE;flex-shrink:0;margin:0 5px;}',
      /* 배지 */
      '.mmt-badge{display:inline-flex;align-items:center;justify-content:center;gap:5px;font-size:12.5px;border-radius:5px;padding:6px 6px;white-space:nowrap;width:96px;}',
      '.mmt-badge .dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}',
      /* 담당자 */
      '.mmt-row .c-assignee{color:#555;font-size:13px;display:flex;align-items:center;justify-content:center;gap:7px;}',
      '.amini{width:22px;height:22px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;box-shadow:inset 0 -3px 6px rgba(0,0,0,.18);}',
      '.anm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.amore{color:#999;font-size:12px;}',
      '.mmt-row .c-start,.mmt-row .c-due{color:#888;font-size:13px;}',
      /* 진행바 */
      '.mmt-prog{display:flex;align-items:center;gap:8px;}',
      '.mmt-prog .trk{flex:1;height:6px;background:#EDEDED;border-radius:6px;overflow:hidden;}',
      '.mmt-prog .fil{height:100%;border-radius:6px;}',
      '.mmt-prog .pct{font-size:12px;width:34px;text-align:right;}',
      /* 더블체크 */
      '.c-check{display:flex;align-items:center;justify-content:center;}',
      '.dc-on{width:18px;height:18px;border-radius:50%;background:#5B6CF0;display:inline-flex;align-items:center;justify-content:center;}',
      '.c-budget{font-size:13px;color:#555;}',
      /* 상호작용 */
      '.mmt-row .tg,.mmt-row .c-status[data-act],.mmt-row .c-check[data-act]{cursor:pointer;}',
      '.mmt-row .c-status[data-act]:hover .mmt-badge{filter:brightness(.95);}',
      '.mmt-row .c-check[data-act]{transition:transform .12s;}.mmt-row .c-check[data-act]:hover{transform:scale(1.12);}',
      '.mmt-prog .fil{transition:width .3s;}',
      '.mmt-add{cursor:pointer;}',
      '.mmt-ph{color:#D2D2D8;font-size:15px;}.mmt-row:hover .mmt-ph{color:#9aa0ff;}.mmt-row .c-start,.mmt-row .c-due,.mmt-row .c-budget{cursor:pointer;}'
    ].join("\n");
  }

  function render() {
    var host = document.getElementById("mmt-table");
    if (!host) return false;
    if (!document.getElementById("mmt-style")) {
      var st = document.createElement("style"); st.id = "mmt-style"; st.textContent = CSS(); document.head.appendChild(st);
    }
    var d = TABLE_DATA;
    var IC = {
      check: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l4 4L19 6"/></svg>',
      refresh: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12a8 8 0 0113.7-5.6L20 8M20 3.5V8h-4.5"/><path d="M20 12a8 8 0 01-13.7 5.6L4 16M4 20.5V16h4.5"/></svg>',
      filter: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 5h18l-7 8v5l-4 2v-7z"/></svg>',
      group: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4.5" width="18" height="5" rx="1.2"/><rect x="3" y="14" width="18" height="5" rx="1.2"/></svg>',
      eye: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
      search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
      gear: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1"/></svg>',
      caret: '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
    };
    var toolbar = '<div class="mmt-toolbar">' +
      '<div class="mmt-view" data-act="asgfilter" title="담당자별 업무 모아보기"><span>' + esc(asgFilter || TL('common.allAssignees', '전체 담당자')) + '</span><span style="color:#bbb;display:flex">' + IC.caret + '</span></div>' +
      '<div class="mmt-iconbtn">' + IC.check + '</div><div class="mmt-iconbtn">' + IC.refresh + '</div>' +
      '<div class="mmt-tbtn">' + IC.filter + ' ' + TL('pc.filter', 'Filter') + '</div><div class="mmt-tbtn">' + IC.group + ' ' + TL('pc.groupedView', 'Grouped View') + '</div>' +
      '<div class="mmt-tbtn">' + IC.eye + ' ' + TL('pc.hide', 'Hide') + '</div><div class="mmt-spacer"></div>' +
      '<label class="mmt-hideall"><input type="checkbox"> ' + TL('pc.hideAll', 'Hide all') + '</label>' +
      '<div class="mmt-iconbtn">' + IC.search + '</div><div class="mmt-add">' + TL('pc.addTask', 'Add Task') + ' <span style="display:flex">' + IC.caret + '</span></div><div class="mmt-iconbtn">' + IC.gear + '</div>' +
      '</div>';
    var head = '<div class="mmt-colhead"><div class="ch-task">' + esc(TL('pc.col.' + COLKEY[0], d.columns[0])) + '</div>' +
      d.columns.slice(1).map(function (c, i) { return '<div>' + esc(TL('pc.col.' + (COLKEY[i + 1] || ''), c)) + '</div>'; }).join("") + '<div></div></div>';
    NODES = [];
    var rows;
    if (asgFilter) {
      var flat = tasksForAssignee(asgFilter);   // 담당자별 5~10개 랜덤 표시
      rows = flat.map(function (n) { return nodeRows(n, 0, true); }).join("");
    } else {
      rows = d.rows.map(function (n) { return nodeRows(n, 0); }).join("");
    }
    host.innerHTML = '<div id="mmt-view">' + toolbar + '<div class="mmt-grid">' + head + rows + '</div></div>';
    return true;
  }

  /* ---- 상호작용 + 게이미피케이션 ------------------------------------- */
  var STATUS_CYCLE = ["Pending", "Progress", "Complete", "Hold"];
  var asgFilter = null;
  var _asgViewCache = {};
  // 데이터에 실제로 쓰인 담당자(현지화된 이름) 목록 — 드롭다운용
  function dataAssignees() {
    var seen = {}, list = [];
    (function walk(ns) { ns.forEach(function (n) { var a = n.assignee; if (a && a.indexOf("...") < 0 && !seen[a]) { seen[a] = 1; list.push(a); } if (n.children) walk(n.children); }); })(TABLE_DATA.rows);
    return list;
  }
  // 담당자 선택 시 5~10개 업무를 랜덤하게 그 사람 담당으로 보여줌(데모용, 빈 화면 방지)
  function tasksForAssignee(name) {
    if (_asgViewCache[name]) return _asgViewCache[name];
    var all = []; (function walk(ns) { ns.forEach(function (n) { if (n.task) all.push(n); if (n.children) walk(n.children); }); })(TABLE_DATA.rows);
    for (var i = all.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = all[i]; all[i] = all[j]; all[j] = t; }
    var k = Math.min(all.length, 5 + Math.floor(Math.random() * 6));   // 5~10개
    var pick = all.slice(0, k).map(function (o) { var c = {}; for (var p in o) c[p] = o[p]; delete c.children; delete c.count; delete c.collapsed; c.assignee = name; return c; });
    _asgViewCache[name] = pick;
    return pick;
  }
  function MM() { return window.MM_MOTION; }
  function GM() { return window.MM_GAME; }

  // 상태별 진행률(complete가 아니면 0%부터 그 비율로)
  var RATIO = { Pending: 0, Progress: 65, Complete: 100, Hold: 30 };
  // 전체 리렌더 없이 해당 셀만 갱신 → 등장 애니메이션/호버 유지
  function cycleStatus(node, statusCell) {
    var prev = node.status;
    var i = STATUS_CYCLE.indexOf(node.status); node.status = STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length];
    node.progress = RATIO[node.status]; node.purpleBar = false;
    statusCell.innerHTML = badge(node.status);
    var row = statusCell.closest(".mmt-row");
    if (row) row.classList.toggle("done", node.status === "Complete");
    var progCell = row && row.querySelector(".c-prog");
    if (progCell) {
      var complete = node.status === "Complete";
      // 100%(완료)에서만 보라색, 그 외엔 중립색
      progCell.innerHTML = progressCell(node.progress, complete ? "#5B4BE0" : "#A9A9B4", complete ? "#5B4BE0" : "#888");
      var fill = progCell.querySelector(".fil");
      if (MM() && fill) fill.animate([{ width: "0%" }, { width: node.progress + "%" }], { duration: 700, easing: "cubic-bezier(.4,0,.2,1)" });
    }
    var badgeEl = statusCell.querySelector(".mmt-badge");
    if (MM()) MM().statusFlip(badgeEl);
    if (node.status === "Complete" && prev !== "Complete") { if (GM()) GM().complete(badgeEl || statusCell); }
    else if (GM()) { GM().award(5, badgeEl || statusCell); }
  }
  function checkOnHover(node, checkCell) {
    if (node.check) return;
    node.check = true; checkCell.innerHTML = CHECK_ON;
    if (MM()) MM().pulse(checkCell, "rgba(91,108,240,.5)");
    if (GM()) GM().award(8, checkCell);
  }
  function toggleCheck(node, checkCell) {
    node.check = !node.check; checkCell.innerHTML = node.check ? CHECK_ON : CHECK;
    if (node.check) { if (MM()) MM().pulse(checkCell, "rgba(91,108,240,.5)"); if (GM()) GM().award(8, checkCell); }
  }

  function playIntro() {
    var host = document.getElementById("mmt-view");
    if (host && MM() && MM().tableReveal) MM().tableReveal(host);
  }
  function closeAsgMenu() { var m = document.querySelector(".mmt-asgmenu"); if (m) m.remove(); }
  function openAsgMenu(anchor) {
    closeAsgMenu();
    var m = document.createElement("div"); m.className = "mmt-asgmenu";
    var items = ['<div class="mi" data-asg="__all">' + TL('common.allAssignees', '전체 담당자') + '</div>'].concat(dataAssignees().map(function (n) {
      return '<div class="mi' + (asgFilter === n ? " on" : "") + '" data-asg="' + n + '"><span class="ad"></span>' + n + '</div>';
    }));
    m.innerHTML = items.join("");
    document.body.appendChild(m);
    var r = anchor.getBoundingClientRect();
    m.style.cssText = "position:fixed;z-index:3000;top:" + (r.bottom + 6) + "px;left:" + r.left + "px;min-width:" + Math.max(170, r.width) + "px;";
    if (!document.getElementById("mmt-asgstyle")) {
      var st = document.createElement("style"); st.id = "mmt-asgstyle";
      st.textContent = ".mmt-view[data-act]{cursor:pointer;}.mmt-asgmenu{background:#fff;border:1px solid #E6E6EA;border-radius:9px;box-shadow:0 10px 30px rgba(0,0,0,.16);padding:6px;}.mmt-asgmenu .mi{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#333;padding:9px 12px;border-radius:6px;cursor:pointer;}.mmt-asgmenu .mi:hover{background:#F4F4F6;}.mmt-asgmenu .mi.on{background:#EFECFF;color:#6449FC;font-weight:600;}.mmt-asgmenu .ad{width:8px;height:8px;border-radius:50%;background:#6449FC;}.mmt-empty{padding:40px;text-align:center;color:#aaa;font-size:14px;}";
      document.head.appendChild(st);
    }
  }

  var insideStatus = null, insideCheck = null;
  function wire() {
    if (window.__MMT_WIRED) return; window.__MMT_WIRED = true;
    document.addEventListener("click", function (e) {
      // 담당자 필터 메뉴 항목
      var mi = e.target.closest(".mmt-asgmenu .mi");
      if (mi) {
        var v = mi.getAttribute("data-asg"); asgFilter = (v === "__all") ? null : v; closeAsgMenu();
        if (asgFilter) fillFilteredData(asgFilter); // 그 사람 업무는 내용이 채워진 채로
        render();
        if (asgFilter) revealFilteredRows();
        return;
      }
      if (!e.target.closest(".mmt-asgmenu")) closeAsgMenu();
      // 담당자 필터 드롭다운 열기
      var fdd = e.target.closest('#mmt-view .mmt-view[data-act="asgfilter"]');
      if (fdd) { openAsgMenu(fdd); return; }
      var add = e.target.closest(".mmt-add");
      if (add) { if (window.MM_TOAST) window.MM_TOAST("새 업무 입력란을 열었습니다"); if (GM()) GM().award(3, add); return; }
      var el = e.target.closest('#mmt-view [data-act]'); if (!el) return;
      var act = el.getAttribute("data-act"), node = NODES[+el.getAttribute("data-tid")];
      if (!node) return;
      if (act === "toggle") { node.collapsed = !node.collapsed; render(); }
      else if (act === "check") { toggleCheck(node, el); }
      else if (act === "status") { cycleStatus(node, el); }
    });
    // 상태/더블체크/날짜: 마우스가 지나가면 변경(셀 진입 시 1회). 녹화 중엔 recorder가 클릭→mouseover로 발동
    document.addEventListener("mouseover", function (e) {
      var scell = e.target.closest('#mmt-view .c-status[data-act]');
      if (scell) { if (scell !== insideStatus) { insideStatus = scell; var n1 = NODES[+scell.getAttribute("data-tid")]; if (n1) cycleStatus(n1, scell); } }
      else insideStatus = null;
      var tcell = e.target.closest('#mmt-view .c-start, #mmt-view .c-due, #mmt-view .c-budget, #mmt-view .c-check[data-act]');
      if (tcell) {
        var col = tcell.classList.contains("c-start") ? "start" : (tcell.classList.contains("c-due") ? "due" : (tcell.classList.contains("c-budget") ? "budget" : "check"));
        if (!colsDone[col]) { colsDone[col] = true; fillColumn(col); }
      }
    });
  }
  var FILL_STARTS = ["05/14/2026", "05/20/2026", "04/29/2026", "06/02/2026", "05/06/2026", "04/22/2026"];
  var FILL_DUES = ["05/26/2026", "06/05/2026", "05/10/2026", "06/13/2026", "05/30/2026", "04/30/2026"];
  function fillFilteredData(filter) {
    var i = 0;
    (function walk(ns) { ns.forEach(function (n) { if (n.assignee === filter) { n.start = FILL_STARTS[i % FILL_STARTS.length]; n.due = FILL_DUES[i % FILL_DUES.length]; n.budget = "1,000"; n.check = (i % 2 === 0); i++; } if (n.children) walk(n.children); }); })(TABLE_DATA.rows);
  }
  function revealFilteredRows() {
    if (!MM() || !MM().enabled) return;
    [].slice.call(document.querySelectorAll("#mmt-view .mmt-row")).forEach(function (row, idx) {
      row.animate([{ opacity: 0, transform: "translateY(13px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 400, delay: idx * 75, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
    });
  }
  var colsDone = {};
  function fillColumn(col) {
    if (col === "check") {
      [].slice.call(document.querySelectorAll("#mmt-view .c-check[data-act]")).forEach(function (cell, i) {
        var row = cell.closest(".mmt-row"), node = row && NODES[+row.getAttribute("data-tid")];
        if (!node || node.check) return;
        (function (c, n) { setTimeout(function () { if (!c.isConnected) return; n.check = true; c.innerHTML = CHECK_ON; if (MM()) MM().pulse(c, "rgba(91,108,240,.5)"); }, i * 55); })(cell, node);
      });
      return;
    }
    var val = col === "start" ? "06/09/2026" : (col === "due" ? "06/13/2026" : "1,000");
    [].slice.call(document.querySelectorAll("#mmt-view .c-" + col)).forEach(function (cell, i) {
      var row = cell.closest(".mmt-row"), node = row && NODES[+row.getAttribute("data-tid")];
      if (!node) return;
      var has = col === "start" ? node.start : (col === "due" ? node.due : node.budget);
      if (has) return; // 이미 값이 있으면 건너뜀
      if (col === "start") node.start = val; else if (col === "due") node.due = val; else node.budget = val;
      (function (c) { setTimeout(function () { if (!c.isConnected) return; c.textContent = val; if (MM()) MM().typewriter(c); }, i * 55); })(cell);
    });
  }

  // 언어별 콘텐츠(행)를 TABLE_DATA.rows 로 주입
  function syncTableFromContent() {
    if (!window.MM_C) return;
    var rows = window.MM_C('pc.table');
    if (rows && rows.length) { TABLE_DATA.rows = rows; ensureAssignees(); ensureCleared(); _asgViewCache = {}; asgFilter = null; }
  }
  function maybeIntro() { var sec = document.querySelector('.vsec[data-view="table"]'); if (sec && sec.classList.contains("on")) playIntro(); }
  function boot() { syncTableFromContent(); ensureAssignees(); ensureCleared(); wire(); if (render()) { maybeIntro(); return; } var n = 0, t = setInterval(function () { if (render() || ++n > 20) { maybeIntro(); clearInterval(t); } }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__MMT = { DATA: TABLE_DATA, render: render, intro: playIntro };
  document.addEventListener('mm:lang', function () { try { syncTableFromContent(); render(); } catch (e) {} });
})();
