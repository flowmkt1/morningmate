/* =========================================================================
   activity_view.js — morningmate "Activity(알림) 뷰" 활동 로그 리스트
   - 항목: 아바타 + (이모지) 작성자 + 액션 / 상세줄(Task·Activity, 링크 보라) / 시간
   ========================================================================= */
(function () {
  "use strict";

  function TL(k, fb) { var t = window.MM_TR && window.MM_TR(k); return (t && t !== k) ? t : fb; }

  var ACTS = [
    { who: "SANO HARUKA", color: "#9DC8FF", action: "added a new comment",
      lines: [{ text: "먼저 퇴근하겠습니다! 내일 뵙겠습니다" }], time: "an hour ago" },
    { who: "Hyejo Seo", color: "#D98AA6", action: "added a new reply",
      lines: [{ label: "Task", link: "[퍼포먼스] 광고소재 조사", plain: true }, { label: "Activity", text: "감사합니다! 참고하겠습니다." }], time: "2 hours ago" },
    { who: "SANO HARUKA", color: "#9DC8FF", emoji: "😊", action: "liked this comment.",
      lines: [{ text: "SANO HARUKA 광고용 소재 만들기 전에, 타사 사례 조사했어요. 하루카상도 보면 도움될것같아서 공유해요 ", link: "https://app.notion.com/p/22ee68283f2", inline: true }], time: "2 hours ago" },
    { who: "장아람", color: "#5BBF9A", possessive: true, action: "comment",
      lines: [{ text: "'나레이션 대체할 서비스' is done!" }], time: "3 hours ago" },
    { who: "Kimura Takuya", color: "#5B6CF0", possessive: true, action: "comment",
      lines: [{ text: "'인스타 댓글' is done!" }], time: "3 hours ago" },
    { who: "June Lee", color: "#5B6CF0", possessive: true, action: "comment",
      lines: [{ text: "'노트 사용법 기사 올리기' is done!" }], time: "5 hours ago" },
    { who: "Hyejo Seo", color: "#D98AA6", possessive: true, action: "comment",
      lines: [{ label: "Task", link: "사용법 기사 올리기" }, { label: "Activity", text: "'Progress' → 'Feedback' Status has been updated." }], time: "5 hours ago" },
    { who: "SANO HARUKA", color: "#9DC8FF", possessive: true, action: "comment",
      lines: [{ label: "Task", link: "사용법 기사 올리기" }, { label: "Activity", text: "'Pending' → 'Progress' Status has been updated." }], time: "5 hours ago" },
    { who: "SANO HARUKA", color: "#9DC8FF", action: "added a new comment",
      lines: [{ label: "Task", link: "사용법 기사 올리기" }, { label: "Activity", text: "https://note.com/morningmate_jp/n/n758b70a4fcb6?sub_rt=share_pb 올렸습니다" }], time: "5 hours ago" }
  ];

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function titleHtml(a) {
    var name = '<b>' + esc(a.who) + '</b>';
    if (a.possessive) return (a.emoji ? esc(a.emoji) + ' ' : '') + name + "'s " + esc(a.action);
    return (a.emoji ? esc(a.emoji) + ' ' : '') + name + ' ' + esc(a.action);
  }
  function lineHtml(l) {
    if (l.label) return '<div class="act-line"><span class="lab">' + esc(l.label) + ':</span> ' + (l.link ? (l.plain ? esc(l.link) : '<span class="lnk">' + esc(l.link) + '</span>') : esc(l.text)) + '</div>';
    if (l.inline && l.link) return '<div class="act-line">' + esc(l.text) + '<span class="lnk">' + esc(l.link) + '</span></div>';
    if (l.link) return '<div class="act-line"><span class="lnk">' + esc(l.link) + '</span></div>';
    return '<div class="act-line">' + esc(l.text) + '</div>';
  }

  var SMILE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M8.5 14.3a4 4 0 007 0" stroke-linecap="round"/></svg>';
  function render() {
    var host = document.getElementById("act-list");
    if (!host) return false;
    host.innerHTML = ACTS.map(function (a, i) {
      return '<div class="act-item" data-ai="' + i + '">' +
        '<span class="act-ava" style="background:' + a.color + (window.MM_AV ? ' url(' + MM_AV.photo(a.who) + ') center/cover no-repeat' : '') + '"></span>' +
        '<div class="act-body"><div class="act-title">' + titleHtml(a) + '</div>' +
        a.lines.map(lineHtml).join("") +
        '<div class="act-foot"><span class="act-like' + (a._liked ? ' on' : '') + '" data-act="actlike" data-ai="' + i + '">' + SMILE + '<span>' + (a._liked ? TL('comment.like', '좋아요') + ' 1' : TL('comment.like', '좋아요')) + '</span></span>' +
        '<span class="act-time">' + esc(a.time) + '</span></div></div></div>';
    }).join("");
    if (!document.getElementById("act-istyle")) {
      var st = document.createElement("style"); st.id = "act-istyle";
      st.textContent = ".act-item{cursor:pointer;transition:background .15s;}.act-item:hover{background:#FAF9FF;}.act-item.act-hl{background:#F1ECFF;}.act-foot{display:flex;align-items:center;gap:14px;margin-top:6px;}.act-like{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#999;cursor:pointer;user-select:none;}.act-like.on{color:#6449FC;font-weight:600;}.act-foot .act-time{margin:0;}";
      document.head.appendChild(st);
    }
    return true;
  }
  function GM() { return window.MM_GAME; }
  function MM() { return window.MM_MOTION; }
  function playIntro() {
    if (!MM() || !MM().enabled) return;
    [].forEach.call(document.querySelectorAll("#act-list .act-item"), function (it, i) {
      it.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 400, delay: i * 95, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
    });
  }
  function wire() {
    if (window.__ACT_WIRED) return; window.__ACT_WIRED = true;
    document.addEventListener("click", function (e) {
      var like = e.target.closest('.act-like[data-act="actlike"]');
      if (like) {
        e.stopPropagation(); var a = ACTS[+like.getAttribute("data-ai")]; a._liked = !a._liked; render();
        if (a._liked && GM()) GM().award(3, like);
        return;
      }
      var item = e.target.closest("#act-list .act-item");
      if (item) {
        var host = document.getElementById("act-list");
        host.querySelectorAll(".act-item.act-hl").forEach(function (x) { x.classList.remove("act-hl"); });
        item.classList.add("act-hl");
      }
    });
  }
  // 인스턴스별 활동 로그를 content(pc.activity)에서 주입(없으면 기본 ACTS 사용)
  function syncActFromContent() { if (!window.MM_C) return; var a = window.MM_C('pc.activity'); if (a && a.length) { ACTS.length = 0; a.forEach(function (x) { ACTS.push(x); }); } }
  document.addEventListener('mm:lang', function () { syncActFromContent(); render(); });
  function maybeIntro() { var sec = document.querySelector('.vsec[data-view="activity"]'); if (sec && sec.classList.contains("on")) playIntro(); }
  function boot() { syncActFromContent(); wire(); if (render()) { maybeIntro(); return; } var n = 0, t = setInterval(function () { if (render() || ++n > 20) { maybeIntro(); clearInterval(t); } }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__ACT = { DATA: ACTS, render: render, intro: playIntro };
})();
