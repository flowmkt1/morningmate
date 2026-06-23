/* =========================================================================
   calendar_view.js — morningmate "캘린더(Calendar) 뷰" 월 그리드 렌더 (데이터 주입형)
   - 요일헤더(일=빨강·토=파랑), 주말 컬럼 틴트, 전월/익월 날짜 dim, 오늘 보라 테두리
   - 이벤트=주황 펄(시간 bold) / 공휴일=진한 빨강 펄
   - CAL.events 만 바꾸면 됨 (날짜키 "YYYY-MM-DD")
   ========================================================================= */
(function () {
  "use strict";

  var CAL = {
    year: 2026, month: 5, monthLabel: "May 2026", today: "2026-06-04",
    events: {
      "2026-04-27": [{ time: "11:00 am", name: "[6/4(목) 13:00~18:00] 채널콘…", type: "event" }],
      "2026-05-05": [{ name: "Children's Day", type: "holiday" }],
      "2026-05-12": [{ time: "2:00 pm", name: "신주쿠 지사 방문", type: "event" }],
      "2026-05-19": [{ time: "11:00 am", name: "SNS 회고", type: "event" }],
      "2026-05-24": [{ name: "Buddha's Birthday", type: "holiday" }],
      "2026-05-25": [{ time: "12:00 pm", name: "Money Forward AI", type: "event" }],
      "2026-06-06": [{ name: "Memorial Day", type: "holiday" }]
    }
  };

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function syncLabel() { CAL.monthLabel = MONTHS[CAL.month - 1] + " " + CAL.year; }

  function pills(evs, key) {
    return (evs || []).map(function (e, i) {
      if (e.type === "holiday") return '<div class="cal-pill holiday" data-act="calev" data-key="' + key + '" data-ei="' + i + '">' + esc(e.name) + '</div>';
      // 등록된 일정 펄 안에는 프로필 사진을 넣지 않음(드롭 아바타로만 표현)
      return '<div class="cal-pill event" data-act="calev" data-key="' + key + '" data-ei="' + i + '">' + (e.time ? '<b>' + esc(e.time) + '</b> ' : "") + esc(e.name) + '</div>';
    }).join("");
  }

  function render() {
    var host = document.getElementById("cal-grid");
    if (!host) return false;
    var lbl = document.getElementById("cal-month"); if (lbl) lbl.textContent = CAL.monthLabel;

    var y = CAL.year, m = CAL.month;
    var first = new Date(y, m - 1, 1);
    var startDow = first.getDay();              // 0=Sun
    var start = new Date(y, m - 1, 1 - startDow); // 그리드 시작(일요일)
    var cells = "";
    for (var i = 0; i < 42; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      var cm = d.getMonth() + 1, cd = d.getDate(), dow = d.getDay();
      var key = d.getFullYear() + "-" + pad(cm) + "-" + pad(cd);
      var cls = "cal-cell";
      if (dow === 0) cls += " sun"; else if (dow === 6) cls += " sat";
      if (!(cm === m && d.getFullYear() === y)) cls += " out";
      if (key === CAL.today) cls += " today";
      var inMonth = (cm === m && d.getFullYear() === y);
      cells += '<div class="' + cls + '"' + (inMonth ? ' data-act="calday" data-key="' + key + '"' : '') + '><div class="cal-date">' + cd + '</div><div class="cal-evs">' + pills(CAL.events[key], key) + '</div></div>';
    }
    host.innerHTML = cells;
    if (!document.getElementById("cal-istyle")) {
      var st = document.createElement("style"); st.id = "cal-istyle";
      st.textContent = ".cal-cell[data-act]{cursor:pointer;user-select:none;}.cal-cell[data-act]:hover{background:#F6F4FF;}.cal-pill[data-act]{cursor:pointer;}.cal-cell.cal-sel{background:#EEF0FF !important;box-shadow:inset 0 0 0 2px #6449FC;border-radius:6px;}.cal-nav .arrow{cursor:pointer;user-select:none;}.cal-today{cursor:pointer;}.cal-add{cursor:pointer;}.cal-pa{display:inline-block;width:14px;height:14px;border-radius:50%;background-size:cover;background-position:center;vertical-align:-2px;margin-right:4px;border:1px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.06);}";
      document.head.appendChild(st);
    }
    return true;
  }

  function GM() { return window.MM_GAME; }
  function shiftMonth(delta) {
    var m = CAL.month + delta, y = CAL.year;
    if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
    CAL.month = m; CAL.year = y; syncLabel(); render();
  }
  function wire() {
    if (window.__CAL_WIRED) return; window.__CAL_WIRED = true;
    document.addEventListener("click", function (e) {
      var arrow = e.target.closest(".cal-nav .arrow");
      if (arrow) { shiftMonth(arrow.textContent.indexOf("‹") > -1 ? -1 : 1); return; }
      var today = e.target.closest(".cal-today");
      if (today) { CAL.month = 6; CAL.year = 2026; syncLabel(); render(); if (window.MM_TOAST) window.MM_TOAST("오늘로 이동"); return; }
      var add = e.target.closest(".cal-add");
      if (add) { if (window.MM_TOAST) window.MM_TOAST("새 일정 추가 패널"); if (GM()) GM().award(3, add); return; }
      var pill = e.target.closest('.cal-pill[data-act]');
      if (pill) { e.stopPropagation(); var evs = CAL.events[pill.getAttribute("data-key")] || []; var ev = evs[+pill.getAttribute("data-ei")]; if (ev && window.MM_TOAST) window.MM_TOAST("📅 " + ev.name); return; }
    });
    // 칸을 클릭하면 일정 추가, 드래그하면 여러 날에 걸친 일정(길이)
    document.addEventListener("mousedown", function (e) {
      if (e.target.closest(".cal-pill")) return;
      var cell = e.target.closest('#cal-grid .cal-cell[data-act="calday"]'); if (!cell) return;
      calDrag = { a: cell.getAttribute("data-key"), b: cell.getAttribute("data-key") }; markSel(calDrag.a, calDrag.b);
    });
    document.addEventListener("mousemove", function (e) {
      if (!calDrag) return;
      var cell = e.target.closest('#cal-grid .cal-cell[data-act="calday"]');
      if (cell) { calDrag.b = cell.getAttribute("data-key"); markSel(calDrag.a, calDrag.b); }
    });
    document.addEventListener("mouseup", function () {
      if (!calDrag) return; var d = calDrag; calDrag = null; clearSel();
      var a = d.a, b = d.b; if (a > b) { var t = a; a = b; b = t; }
      var nm = EV_NAMES[evIdx % EV_NAMES.length], tm = EV_TIMES[evIdx % EV_TIMES.length]; evIdx++;
      var cur = parseKey(a), end = parseKey(b), n = 0;
      while (cur <= end && n < 60) { var k = fmtKey(cur); (CAL.events[k] = CAL.events[k] || []).push({ name: nm, time: tm, type: "event" }); cur.setDate(cur.getDate() + 1); n++; }
      render();
      // 추가된 일정 페이드인(반짝임 X)
      if (window.MM_MOTION && window.MM_MOTION.enabled) {
        var c2 = parseKey(a), e2 = parseKey(b), m2 = 0;
        while (c2 <= e2 && m2 < 60) {
          var kk = fmtKey(c2), cell = document.querySelector('#cal-grid .cal-cell[data-key="' + kk + '"]');
          if (cell) { var ps = cell.querySelectorAll(".cal-pill"), last = ps[ps.length - 1]; if (last) last.animate([{ opacity: 0, transform: "translateY(-5px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 480, easing: "ease-out" }); }
          c2.setDate(c2.getDate() + 1); m2++;
        }
      }
      if (GM()) GM().award(5);
    });
  }
  var calDrag = null, evIdx = 0, calAutoTimer = null;
  var EV_NAMES = ["주간 마케팅 회의", "일본 광고 소재 리뷰", "콘텐츠 마감", "프리랜서 협업 미팅", "PR TIMES 발송", "키비주얼 컨펌", "전시회 부스 준비", "리드 정리 작업", "신제품 런칭 점검", "월간 리포트 작성"];
  var EV_TIMES = ["10:00 am", "2:00 pm", "11:00 am", "4:00 pm", "1:00 pm", "3:30 pm"];
  var CAL_ASG = ["노소연", "장아람", "Hyejo Seo", "SANO HARUKA", "June Lee", "Kimura Takuya"];
  // 마우스 포인터 + 프로필 사진 조합(gantt처럼) — 커서가 셀로 와서 일정을 떨어뜨림
  function dropCursor(photo, x, y) {
    var av = document.createElement("div"); av.className = "cal-dropava";
    av.style.cssText = "position:fixed;z-index:2000;left:" + x + "px;top:" + y + "px;width:0;height:0;pointer-events:none;";
    av.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" style="position:absolute;left:-5px;top:-7px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45));"><path d="M5 2.5l14.5 7.2-6.3 1.7L9.7 18.5z" fill="#fff" stroke="#2b2b33" stroke-width="1.3" stroke-linejoin="round"/></svg>' +
      '<span style="position:absolute;left:11px;top:12px;width:45px;height:45px;border-radius:13px;background:#9DC8FF url(' + photo + ') center/cover;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);"></span>';
    document.body.appendChild(av);
    return av;
  }
  // 여러 담당자가 마우스(커서+프로필)로 랜덤하게 일정을 추가(내가 클릭하지 않아도)
  function autoAddEvent() {
    var host = document.getElementById("cal-grid"); if (!host) return;
    var cells = host.querySelectorAll('.cal-cell[data-act="calday"]');
    if (!cells.length) return;
    var cell = cells[Math.floor(Math.random() * cells.length)];
    var key = cell.getAttribute("data-key");
    var who = CAL_ASG[Math.floor(Math.random() * CAL_ASG.length)];
    var photo = window.MM_AV ? MM_AV.photo(who) : "assets/profile/man4.png";
    var nm = EV_NAMES[evIdx % EV_NAMES.length], tm = EV_TIMES[evIdx % EV_TIMES.length]; evIdx++;

    function placeEvent() {
      (CAL.events[key] = CAL.events[key] || []).push({ name: nm, time: tm, type: "event", assignee: who });
      render();
      var c2 = document.querySelector('#cal-grid .cal-cell[data-key="' + key + '"]');
      if (c2 && window.MM_MOTION && window.MM_MOTION.enabled) {
        var ps = c2.querySelectorAll(".cal-pill"), last = ps[ps.length - 1];
        if (last) last.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1.08)", offset: .7 }, { opacity: 1, transform: "scale(1)" }], { duration: 460, easing: "cubic-bezier(.2,.85,.3,1)" });
      }
    }

    if (!(window.MM_MOTION && window.MM_MOTION.enabled)) { placeEvent(); return; }
    // 커서+프로필이 셀로 날아와 일정을 '톡' 떨어뜨림
    var rect = cell.getBoundingClientRect();
    var tx = rect.left + rect.width / 2, ty = rect.top + 16;
    var sx = tx + (Math.random() * 220 - 110), sy = ty - 130 - Math.random() * 70;
    var av = dropCursor(photo, sx, sy);
    av.animate([
      { left: sx + "px", top: sy + "px", opacity: 0 },
      { left: sx + "px", top: sy + "px", opacity: 1, offset: .12 },
      { left: tx + "px", top: ty + "px", opacity: 1, offset: .72 },
      { left: tx + "px", top: (ty + 6) + "px", opacity: 1, offset: .86 },
      { left: tx + "px", top: (ty + 14) + "px", opacity: 0 }
    ], { duration: 1100, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" });
    setTimeout(placeEvent, 760);
    setTimeout(function () { if (av.parentNode) av.parentNode.removeChild(av); }, 1200);
  }
  function startAutoCal() {
    if (calAutoTimer) return;
    calAutoTimer = setInterval(function () {
      var sec = document.querySelector('.vsec[data-view="calendar"]');
      if (sec && !sec.classList.contains("on")) return; // 캘린더 보일 때만
      if (calDrag) return;
      autoAddEvent();
    }, 2800);
  }
  function fmtKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseKey(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function clearSel() { [].forEach.call(document.querySelectorAll("#cal-grid .cal-cell.cal-sel"), function (c) { c.classList.remove("cal-sel"); }); }
  function markSel(a, b) { clearSel(); if (a > b) { var t = a; a = b; b = t; } [].forEach.call(document.querySelectorAll('#cal-grid .cal-cell[data-act="calday"]'), function (c) { var k = c.getAttribute("data-key"); if (k >= a && k <= b) c.classList.add("cal-sel"); }); }

  // 언어별 콘텐츠 주입(자동 추가 일정이 누적되지 않게 events는 깊은 복사)
  function syncCalFromContent() {
    if (!window.MM_C) return;
    var ev = window.MM_C('pc.calendar.events');
    if (ev) { try { CAL.events = JSON.parse(JSON.stringify(ev)); } catch (e) {} evIdx = 0; }
    var nm = window.MM_C('pc.calendar.evNames'); if (nm && nm.length) EV_NAMES = nm;
    var asg = window.MM_C('pc.calendar.assignees'); if (asg && asg.length) CAL_ASG = asg;
  }
  function boot() { syncCalFromContent(); wire(); syncLabel(); if (render()) { startAutoCal(); return; } var n = 0, t = setInterval(function () { if (render() || ++n > 20) { clearInterval(t); startAutoCal(); } }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  document.addEventListener('mm:lang', function () { try { syncCalFromContent(); render(); } catch (e) {} });
  window.__CAL = { DATA: CAL, render: render };
})();
