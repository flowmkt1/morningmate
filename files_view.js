/* =========================================================================
   files_view.js — morningmate "파일함(Files) 뷰" (데이터 주입형)
   - 좌측 패널: File Type + Project 목록 / 본문: 파일 카드 그리드
   - 파일 카드: 정사각 썸네일(영상=teal 아이콘 / 이미지=placeholder) + 파일명
   - 토큰: 카드 #FAFAFA·border #DDD·radius10, Add folder 보라
   ========================================================================= */
(function () {
  "use strict";

  var FILES = {
    fileType: "All",
    sort: "Latest",
    projects: [
      { color: "#F2A65A", emoji: "🔴", name: "[일본] 프리랜서 협업방", active: true },
      { color: "#FFC400", emoji: "🇬🇧", name: "English Market..." },
      { color: "#9AA0AA", emoji: "🤖", name: "AI 팀 만들기 프..." },
      { color: "#9AA0AA", emoji: "🇯🇵", name: "[일본] 모닝메이트..." },
      { color: "#4A90E2", emoji: "", name: "[노소연] 개인 to-do" },
      { color: "#7A5BFF", emoji: "", name: "Data Extraction" },
      { color: "#FF5A5A", emoji: "🔴", name: "[일본] 경쟁사 모..." },
      { color: "#FF5A5A", emoji: "🔴", name: "[일본] 한국X일본..." },
      { color: "#7A5BFF", emoji: "", name: "[PM] Policy & Impr..." },
      { color: "#FFC400", emoji: "", name: "[QA] 모닝메이트 신..." },
      { color: "#D8D8DE", emoji: "", name: "노소연 개인방" },
      { color: "#36CFBD", emoji: "", name: "[PM] morningmate..." },
      { color: "#7A5BFF", emoji: "🌏", name: "Global MKT Hub" },
      { color: "#7A5BFF", emoji: "🎬", name: "영상 크리에이티..." },
      { color: "#FF5A5A", emoji: "🎬", name: "영상 크리에이티..." },
      { color: "#9AA0AA", emoji: "🟡", name: "Japan Business" },
      { color: "#FF5A5A", emoji: "", name: "Data Extraction Ro..." },
      { color: "#36CFBD", emoji: "", name: "모닝메이트 x 인니컨..." },
      { color: "#FFC400", emoji: "", name: "Morningmate 사용..." },
      { color: "#36CFBD", emoji: "🇬🇧", name: "[UK] Sales" }
    ],
    files: [
      { name: "video_F.mp4", type: "video" },
      { name: "video_A.mp4", type: "video" },
      { name: "video_E.mp4", type: "video" },
      { name: "video_G.mp4", type: "video" },
      { name: "video_D.mp4", type: "video" },
      { name: "ad_video.mp4", type: "video" },
      { name: "video_H.mp4", type: "video" },
      { name: "video_I.mp4", type: "video" },
      { name: "video_B.mp4", type: "video" },
      { name: "video_C.mp4", type: "video", selected: true },
      { name: "image.png", type: "image", tint: "#FDF3EC" },
      { name: "image.png", type: "image", tint: "#F1F1F4" },
      { name: "image.png", type: "image", tint: "#EAF0FA" },
      { name: "2.mp4", type: "video" }
    ]
  };

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function TL(k, fb) { var t = window.MM_TR && window.MM_TR(k); return (t && t !== k) ? t : fb; }
  function typeLabel(t) { return (t === "All") ? TL('files.allFormats', 'All formats') : TL('files.format.' + t, t.charAt(0).toUpperCase() + t.slice(1)); }

  var VIDEO_ICON = '<span class="f-vicon"><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M5 5h11a2 2 0 012 2v2.2l4-2.2v10l-4-2.2V17a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg></span>';
  var IMAGE_ICON = '<svg viewBox="0 0 24 24" width="30" height="30" fill="#C4C4CC"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#cfcfd6" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.6 2.6L16 9.5"/></svg>';

  var CHECK_ON = '<span class="f-checkon"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="2.8"><path d="M6 12.5l3.5 3.5L18 8"/></svg></span>';
  function fileCard(f, i) {
    var inner = f.type === "video"
      ? VIDEO_ICON
      : '<div class="f-imgph" style="background:' + (f.tint || "#EEE") + '">' + IMAGE_ICON + '</div>';
    return '<div class="f-card' + (f.selected ? " sel" : "") + '" data-fi="' + i + '">' +
      '<div class="f-thumb">' +
      '<span class="f-check" data-act="fcheck" data-fi="' + i + '">' + (f.selected ? CHECK_ON : CHECK) + '</span>' +
      (f.type === "video" ? '<span class="f-dots" data-act="fdots">⋮</span>' : "") +
      inner +
      '</div>' +
      '<div class="f-name">' + esc(f.name) + '</div></div>';
  }

  function render() {
    var grid = document.getElementById("files-grid");
    var plist = document.getElementById("files-projects");
    if (!grid || !plist) return false;
    plist.innerHTML = FILES.projects.map(function (p, i) {
      return '<div class="f-proj' + (p.active ? " on" : "") + '" data-act="fproj" data-pi="' + i + '"><span class="sq" style="background:' + p.color + '"></span>' +
        (p.emoji ? '<span class="em">' + p.emoji + '</span>' : "") + '<span class="nm">' + esc(p.name) + '</span></div>';
    }).join("");
    var cur = FILES.fileType || "All";
    grid.innerHTML = FILES.files.map(function (f, i) {
      if (cur !== "All" && f.type !== cur) return "";   // 유형 필터
      return fileCard(f, i);
    }).join("");
    // 파일 유형 드롭다운(모바일과 동일 기능) — 정렬 바와 그리드 사이에 표시
    var types = []; FILES.files.forEach(function (f) { if (f.type && types.indexOf(f.type) < 0) types.push(f.type); });
    var bar = document.getElementById("files-typebar");
    if (!bar) { bar = document.createElement("div"); bar.id = "files-typebar"; grid.parentNode.insertBefore(bar, grid); }
    bar.innerHTML = '<div class="f-fmt' + (cur !== "All" ? " on" : "") + '" data-act="ffmt">' + esc(typeLabel(cur)) + ' ▾</div>' +
      '<div class="f-fmt-menu" id="files-fmtmenu" style="display:none">' +
      ['All'].concat(types).map(function (t) { return '<div class="f-fmt-i' + (cur === t ? " on" : "") + '" data-act="ftype" data-ftype="' + t + '">' + esc(typeLabel(t)) + '</div>'; }).join("") +
      '</div>';
    if (!document.getElementById("f-istyle")) {
      var st = document.createElement("style"); st.id = "f-istyle";
      st.textContent = ".f-card{cursor:pointer;transition:transform .12s;}.f-card:hover{transform:translateY(-2px);}.f-card.sel .f-thumb{outline:2.5px solid #6449FC;outline-offset:1px;}.f-check{cursor:pointer;}.f-checkon{width:20px;height:20px;border-radius:50%;background:#6449FC;display:inline-flex;align-items:center;justify-content:center;}.f-proj{cursor:pointer;}.f-dots{cursor:pointer;}" +
        "#files-typebar{position:relative;padding:0 22px 10px;}" +
        ".f-fmt{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#555;border:1px solid #E2E2E8;border-radius:8px;padding:7px 13px;cursor:pointer;background:#fff;}" +
        ".f-fmt:hover{border-color:#C9BFF7;}.f-fmt.on{background:#EFECFF;border-color:#D9D2FF;color:#6449FC;font-weight:600;}" +
        ".f-fmt-menu{position:absolute;z-index:30;top:38px;left:22px;min-width:160px;background:#fff;border:1px solid #E6E6EA;border-radius:10px;box-shadow:0 12px 34px rgba(0,0,0,.16);padding:6px;}" +
        ".f-fmt-i{font-size:13px;color:#444;padding:8px 12px;border-radius:7px;cursor:pointer;}.f-fmt-i:hover{background:#F4F4F6;}.f-fmt-i.on{background:#EFECFF;color:#6449FC;font-weight:600;}";
      document.head.appendChild(st);
    }
    return true;
  }

  function GM() { return window.MM_GAME; }
  function selectedCount() { return FILES.files.filter(function (f) { return f.selected; }).length; }
  function wire() {
    if (window.__FILES_WIRED) return; window.__FILES_WIRED = true;
    document.addEventListener("click", function (e) {
      var sort = e.target.closest(".f-sort span");
      if (sort) { sort.parentNode.querySelectorAll("span").forEach(function (s) { s.classList.remove("on"); }); sort.classList.add("on"); if (window.MM_TOAST) window.MM_TOAST(sort.textContent.trim() + " 정렬"); return; }
      var el = e.target.closest("[data-act]"); if (!el) { var mn = document.getElementById("files-fmtmenu"); if (mn) mn.style.display = "none"; return; }
      var act = el.getAttribute("data-act");
      if (act === "ffmt") { var menu = document.getElementById("files-fmtmenu"); if (menu) menu.style.display = (menu.style.display === "none" ? "block" : "none"); return; }
      if (act === "ftype") { FILES.fileType = el.getAttribute("data-ftype") || "All"; render(); maybeIntro(); return; }
      if (act === "fcheck" || act === "fproj" || act === "fdots") {
        if (act === "fcheck") {
          var f = FILES.files[+el.getAttribute("data-fi")]; f.selected = !f.selected; render();
          if (f.selected) {
            var card = document.querySelector('.f-card[data-fi="' + FILES.files.indexOf(f) + '"]');
            if (window.MM_MOTION) window.MM_MOTION.pulse(card && card.querySelector(".f-thumb"));
            if (GM()) GM().award(4, card);
            var n = selectedCount();
            if (n >= 5 && GM()) GM().achievement("organizer", "파일 정리왕", "파일 5개 선택", "🗂️");
          }
        } else if (act === "fproj") {
          FILES.projects.forEach(function (p) { p.active = false; });
          FILES.projects[+el.getAttribute("data-pi")].active = true; render();
          if (GM()) GM().award(2, el);
        } else if (act === "fdots") {
          if (window.MM_TOAST) window.MM_TOAST("미리보기 · 다운로드 메뉴");
        }
      } else {
        var card = e.target.closest(".f-card[data-fi]");
        if (card && !e.target.closest("[data-act]")) {
          var ff = FILES.files[+card.getAttribute("data-fi")]; ff.selected = !ff.selected; render();
          if (ff.selected && GM()) GM().award(4, card);
        }
      }
    });
  }

  function MM() { return window.MM_MOTION; }
  function playIntro() {
    if (!MM() || !MM().enabled) return;
    [].forEach.call(document.querySelectorAll("#files-grid .f-card"), function (c, i) {
      c.animate([{ opacity: 0, transform: "translateY(16px) scale(.96)" }, { opacity: 1, transform: "translateY(0) scale(1)" }], { duration: 420, delay: i * 80, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
    });
  }
  function maybeIntro() { var sec = document.querySelector('.vsec[data-view="files"]'); if (sec && sec.classList.contains("on")) playIntro(); }
  // 언어별 프로젝트방 이름 주입
  function syncFilesFromContent() {
    if (!window.MM_C) return;
    var pj = window.MM_C('pc.files.projects');
    if (pj && pj.length) FILES.projects = pj;
  }
  function boot() { syncFilesFromContent(); wire(); if (render()) { maybeIntro(); return; } var n = 0, t = setInterval(function () { if (render() || ++n > 20) { maybeIntro(); clearInterval(t); } }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  document.addEventListener('mm:lang', function () { try { syncFilesFromContent(); render(); } catch (e) {} });
  window.__FILES = { DATA: FILES, render: render, intro: playIntro };
})();
