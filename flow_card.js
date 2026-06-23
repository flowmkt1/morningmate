/* =========================================================================
   flow_card.js — 실제 flow 셸 피드에 "모든 게시물 유형" 주입
   유형: write(글) · task(업무) · todo(할일) · schedule(일정) · vote(투표)
   토큰은 실제 flow 저장본에서 추출(픽셀 일치). DATA.posts만 바꾸면 재사용.
   ========================================================================= */
(function () {
  "use strict";

  /* ---- i18n: 사전 있으면 번역, 없으면 한국어 폴백 ------------------- */
  function TL(k, fb) { var t = window.MM_TR && window.MM_TR(k); return (t && t !== k) ? t : fb; }
  var STATUS_KEY = { "요청": "request", "진행중": "inProgress", "피드백": "feedback", "완료": "done" };
  function TS(label) { return TL('status.' + (STATUS_KEY[label] || ''), label); }  // 상태 라벨 번역(데이터는 한국어 유지)

  /* ---- 데이터 (여기만 바꾸면 됨) ------------------------------------- */
  var AUTHOR = { name: "노소연", role: "팀장", team: "Market Expansion팀", color: "#F2A65A" };
  // 작성자/댓글 작성자 다양화용 인물 풀(맥락에 맞게 지정)
  var PPL = {
    soyun: AUTHOR,
    aram: { name: "장아람", role: "Office Lead", team: "Operations팀", color: "#5BBF9A" },
    haruka: { name: "SANO HARUKA", role: "Freelancer", team: "Japan", color: "#7E8694" },
    hyejo: { name: "Hyejo Seo", role: "Associate", team: "Market Expansion팀", color: "#D98AA6" },
    june: { name: "June Lee", role: "Founder & CEO", team: "morningmate", color: "#5B6CF0" },
    kimura: { name: "Kimura Takuya", role: "Freelancer", team: "Japan", color: "#5B6CF0" }
  };

  var DATA = {
    posts: [
      {
        type: "task",
        author: PPL.soyun, datetime: "2026-06-04 12:36", taskNo: "582462", read: 1,
        title: "[프리랜서 계약] 일본 마케팅 - 김우중",
        status: { label: "요청", color: "#0053BF", bg: "rgba(0,181,241,.20)" },
        assignee: { name: "유성균", color: "#5B6CF0" },
        due: "",
        progress: 0,
        body: [
          "김우중님 차주 수요일(22일)부터 하루 8시간 근무 예정입니다.",
          "2개월 계약 진행부탁드립니다.",
          "단기계약 후 장기계약을 고려하겠습니다."
        ]
      },
      {
        type: "todo",
        author: PPL.aram, datetime: "2026-06-04 12:37", read: 3,
        title: "전시회 부스 준비 체크리스트",
        items: [
          { text: "부스 디자인 시안 확정", done: false, assignee: { name: "박선아", color: "#9DC8FF" } },
          { text: "배너·현수막 인쇄 발주",  done: false, assignee: { name: "정해성", color: "#A8E6C0" } },
          { text: "샘플 제품 포장",         done: false, assignee: { name: "한지민", color: "#FFD4A8" } },
          { text: "상담 예약 리스트 정리",   done: false, assignee: { name: "노소연", color: "#F2A65A" } },
          { text: "현장 스태프 배치표",      done: false, assignee: { name: "유성균", color: "#5B6CF0" } }
        ]
      },
      {
        type: "schedule",
        author: PPL.haruka, datetime: "2026-06-04 12:37", read: 1,
        title: "Japan IT Week 부스 운영",
        dateBadge: { month: "2026-06", day: "04" },
        timeRange: "2026-06-04 (목), 12:40 — 13:40",
        participants: {
          going: 1, notGoing: 1, pending: 0,
          avatars: [{ name: "노소연", color: "#F2A65A" }, { name: "서혜조", color: "#B0A4E6" }]
        },
        zoom: true,
        reminder: "10분 전 미리 알림",
        recording: true,
        body: [
          "도쿄 빅사이트 East Hall · Booth E-12",
          "부스 운영 / 상담 응대 / 리드 수집 진행합니다."
        ],
        rsvp: true
      },
      {
        type: "vote",
        author: PPL.hyejo, datetime: "2026-06-04 16:14", read: 1,
        status: "진행중",
        title: "9월 신제품 키 비주얼 투표",
        description: "세 가지 키 비주얼 시안 중 가장 좋은 안을 골라주세요. 9월 런칭 메인 KV로 사용됩니다.",
        voters: 12,
        options: [
          { label: "A안 — 미니멀 화이트", votes: 7, voted: true },
          { label: "B안 — 비비드 그라데이션", votes: 4 },
          { label: "C안 — 다크 프리미엄", votes: 1 }
        ]
      },
      {
        type: "write",
        author: PPL.june, datetime: "2026-06-04 12:39", read: 8,
        title: "이번 주 마케팅 위클리 공유",
        body: [
          "1) 일본 전시회 리드 312건 수집 완료 — CRM 업로드 진행 중",
          "2) 신규 LP A/B 테스트: B안 전환율 +18%",
          "",
          "상세 내용은 첨부 문서 참고 부탁드립니다."
        ],
        images: [
          "https://picsum.photos/seed/mmbooth1/900/720"
        ]
      }
    ]
  };

  /* ---- 토큰 ---------------------------------------------------------- */
  var T = { teal: "#00B19C", red: "#FB2A2A", cyan: "#00B2FF", purple: "#6449FC" };

  /* ---- 유틸 ---------------------------------------------------------- */
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function initial(name) { return (name || "?").slice(0, 1); }
  function ava(p, size) {
    var name = p && p.name;
    var src = (p && p.photo) ? p.photo : ((window.MM_AV && name) ? MM_AV.photo(name) : null);
    if (src) {
      return '<span class="mmc-ava" style="width:' + size + 'px;height:' + size + 'px;background:' + (p.color || "#bbb") + ' url(' + src + ') center/cover no-repeat"></span>';
    }
    return '<span class="mmc-ava" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.36) + 'px;background:' + (p.color || "#bbb") + '">' + esc(initial(name)) + '</span>';
  }

  var IC = {
    pin: '<svg class="mmc-ic" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="M9 4h6l-1 5 3.2 3.2V14H6.8v-1.8L10 9z"/><path d="M12 17v3"/></svg>',
    dots: '<svg class="mmc-ic" viewBox="0 0 24 24" fill="#999"><path d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#999"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/></svg>',
    video: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#9a9aa2"><path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#999"><path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
    mic: '<svg viewBox="0 0 24 24" width="20" height="20" fill="#999"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z"/></svg>',
    like: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M8.5 14.3a4 4 0 007 0" stroke-linecap="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
    again: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7.5"/><path d="M12 9.5v3.7l2.4 1.4"/><path d="M4.5 4.2L2 6.6M19.5 4.2L22 6.6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" width="18" height="18" fill="#6449FC"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>',
    img: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#C4C4CC"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>'
  };

  /* ---- 공통 조각 ----------------------------------------------------- */
  function header(p, rightChip) {
    return '<div class="mmc-head">' + ava(p.author, 36) +
      '<div class="mmc-who"><div class="l1"><span class="nm">' + esc(p.author.name) + '</span><span class="role">' + esc(p.author.role) + '</span><span class="dt">' + esc(p.datetime) + '</span></div>' +
      '<div class="team">' + esc(p.author.team) + '</div></div>' +
      (rightChip || "") + IC.pin + IC.dots + '</div>';
  }
  function titleEl(t) { return '<div class="mmc-title">' + esc(t) + '</div>'; }
  // 리치 본문: 문자열(문단) 또는 블록객체({t:...}) 배열을 에디터 스타일로 렌더
  function richBlock(b) {
    if (typeof b === "string") return "<p>" + (esc(b) || "&nbsp;") + "</p>";
    if (!b || !b.t) return "";
    switch (b.t) {
      case "h": // 소제목(이모지+굵게)
        return '<div class="rb-h">' + (b.e ? '<span class="rb-e">' + esc(b.e) + '</span>' : '') + esc(b.x) + '</div>';
      case "ul": // 불릿 목록(항목별 이모지/굵은 라벨/들여쓴 설명줄 지원)
        return '<ul class="rb-ul">' + (b.items || []).map(function (it) {
          if (typeof it === "string") return '<li>' + esc(it) + '</li>';
          var lead = (it.e ? '<span class="rb-e">' + esc(it.e) + '</span>' : '') + (it.b ? '<b>' + esc(it.x) + '</b>' : esc(it.x));
          var sub = (it.sub || []).map(function (s) { return '<div class="rb-sub">' + esc(s) + '</div>'; }).join("");
          return '<li>' + lead + sub + '</li>';
        }).join("") + '</ul>';
      case "check": // 체크리스트
        return '<ul class="rb-check">' + (b.items || []).map(function (it) {
          var d = (typeof it === "object" && it.done);
          var x = (typeof it === "string") ? it : it.x;
          return '<li class="' + (d ? 'on' : '') + '"><span class="rb-cb">' + (d ? '✓' : '') + '</span>' + esc(x) + '</li>';
        }).join("") + '</ul>';
      case "table": // 표(헤더 + 행)
        var head = '<tr>' + (b.cols || []).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join("") + '</tr>';
        var rows = (b.rows || []).map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + (esc(c) || '') + '</td>'; }).join("") + '</tr>'; }).join("");
        return '<div class="rb-tablewrap"><table class="rb-table"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
      case "tags": // 해시태그 줄
        return '<div class="rb-tags">' + (b.items || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join(" ") + '</div>';
      case "note": // 작은 회색 메모(예: AI 생성)
        return '<div class="rb-note">' + esc(b.x) + '</div>';
      default: return "";
    }
  }
  function bodyBlock(lines) {
    if (!lines || !lines.length) return "";
    return '<div class="mmc-body">' + lines.map(richBlock).join("") + "</div>";
  }
  var YELLOW_SMILE = '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10.5" fill="#FFC400"/><circle cx="9" cy="10" r="1.4" fill="#5a4a00"/><circle cx="15" cy="10" r="1.4" fill="#5a4a00"/><path d="M8.3 14a4 4 0 007.4 0" stroke="#5a4a00" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>';
  function actSpan(p, key, label, icon) {
    var on = !!p["_" + key];
    var ic = (key === "like" && on) ? YELLOW_SMILE : icon;
    var cnt = (key === "like" && on) ? ' <b class="n">' + (1 + (p._likeBase || 0)) + '</b>' : "";
    return '<span class="act' + (on ? " on" : "") + '" data-act="' + key + '" data-post="' + p._idx + '">' + ic + label + cnt + '</span>';
  }
  function footer(p) {
    return '<div class="mmc-foot"><div class="acts">' +
      actSpan(p, "like", TL('actions.like','좋아요'), IC.like) + actSpan(p, "book", TL('actions.bookmark','북마크'), IC.book) + actSpan(p, "again", TL('actions.remindAgain','다시 알림'), IC.again) +
      '</div><span class="read">' + TL('meta.read','읽음') + ' ' + (p.read || 1) + '</span></div>';
  }
  function imageGrid(imgs) {
    if (!imgs || !imgs.length) return "";
    var n = imgs.length, cls = "n" + Math.min(n, 4), show = imgs.slice(0, 4);
    return '<div class="mmc-imgs ' + cls + '">' + show.map(function (src, i) {
      var more = (n > 4 && i === 3) ? '<span class="mo">+' + (n - 4) + '</span>' : "";
      return '<div class="it" style="background-image:url(' + src + ')">' + more + '</div>';
    }).join("") + '</div>';
  }
  var SMILE = '<svg class="cl-ic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M8.5 14.3a4 4 0 007 0" stroke-linecap="round"/></svg>';
  var REPLYIC = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4-4 4-4"/><path d="M5 10h9a5 5 0 015 5v2"/></svg>';
  var CLIP = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#b0b0b8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.5l-8.6 8.6a5 5 0 01-7.1-7.1l8.6-8.6a3.3 3.3 0 014.7 4.7l-8.6 8.6a1.65 1.65 0 01-2.3-2.3l7.9-7.9"/></svg>';
  function commentSection(p) {
    var list = (p._comments || []).map(function (c, ci) {
      var replies = (c.replies || []).map(function (rc, ri) {
        return '<div class="mmc-cmt reply">' + ava(rc.author, 26) +
          '<div class="cb"><div class="ch"><span class="nm">' + esc(rc.author.name) + '</span><span class="dt">' + TL('meta.justNow','방금') + '</span></div>' +
          '<div class="tx">' + esc(rc.text) + '</div>' +
          '<div class="cacts"><span class="clk' + (rc._liked ? ' on' : '') + '" data-act="rcmtlike" data-post="' + p._idx + '" data-cmt="' + ci + '" data-rep="' + ri + '">' + SMILE + 'Like</span></div></div></div>';
      }).join("");
      var rbox = c._replying ? '<div class="mmc-rbox"><div class="rbh">' + REPLYIC + ' Reply to ' + esc(c.author.name) + '<span class="rbx" data-act="replyclose" data-post="' + p._idx + '" data-cmt="' + ci + '">✕</span></div>' +
        '<div class="mmc-cbox"><input class="mmc-rinput" data-post="' + p._idx + '" data-cmt="' + ci + '" placeholder="답글을 입력하세요" /><span class="mmc-cattach">' + CLIP + '</span></div></div>' : '';
      return '<div class="mmc-cmt">' + ava(c.author, 30) +
        '<div class="cb"><div class="ch"><span class="nm">' + esc(c.author.name) + '</span><span class="dt">' + TL('meta.justNow','방금') + '</span></div>' +
        '<div class="tx">' + esc(c.text) + '</div>' +
        '<div class="cacts"><span class="clk' + (c._liked ? ' on' : '') + '" data-act="cmtlike" data-post="' + p._idx + '" data-cmt="' + ci + '">' + SMILE + 'Like</span>' +
        '<span class="crep" data-act="replyhover" data-post="' + p._idx + '" data-cmt="' + ci + '">' + REPLYIC + ' Reply</span></div>' +
        (replies ? '<div class="mmc-replies">' + replies + '</div>' : '') + rbox + '</div></div>';
    }).join("");
    return '<div class="mmc-cmts">' + list +
      '<div class="mmc-crow">' + ava(AUTHOR, 30) +
      '<div class="mmc-cbox"><input class="mmc-cinput" data-post="' + p._idx + '" placeholder="' + esc(TL('comment.inputHint','Shift + Enter로 줄바꿈, Enter로 등록')) + '" />' +
      '<span class="mmc-cattach" data-act="toast" data-msg="파일을 첨부합니다">' + CLIP + '</span></div></div></div>';
  }
  var revealed = {}, MODAL_MODE = false;
  function feedRevealHandler(el) { if (window.MM_MOTION) window.MM_MOTION.feedRevealAnim(el); revealed[+el.getAttribute("data-card")] = true; }
  function card(p, inner) {
    if (MODAL_MODE) return '<div class="mmc-card" data-card="' + p._idx + '">' + inner + footer(p) + '</div>';
    var pend = (window.MM_MOTION && window.MM_MOTION.enabled && !revealed[p._idx]) ? " mm-reveal" : "";
    return '<div class="mmc-card' + pend + '" data-card="' + p._idx + '" data-rgrp="feed">' + inner + footer(p) + commentSection(p) + '</div>';
  }
  function cardHtml(idx) {
    var p = DATA.posts[idx]; if (!p) return ""; p._idx = idx;
    var fn = RENDERERS[p.type]; if (!fn) return "";
    MODAL_MODE = true; var html = '<div class="mmc-feed">' + fn(p) + '</div>'; MODAL_MODE = false;
    return html;
  }

  /* ---- 유형별 렌더 --------------------------------------------------- */
  function renderTask(p) {
    var badge = '<span class="mmc-badge" data-act="status" data-post="' + p._idx + '" style="background:' + p.status.bg + ';color:' + p.status.color + '"><span class="dot" style="background:' + p.status.color + '"></span>' + esc(TS(p.status.label)) + '<span class="caret">▼</span></span>';
    var extra = p._expanded ?
      '<div class="mmc-row"><span class="mmc-lab">우선순위</span><span class="mmc-flag">🚩 보통</span></div>' +
      '<div class="mmc-row"><span class="mmc-lab">반복</span><span class="mmc-rep">반복 없음</span></div>' +
      '<div class="mmc-row"><span class="mmc-lab">작성일</span><span class="mmc-rep">' + esc(p.datetime) + '</span></div>' : "";
    var rows = '<div class="mmc-rows">' +
      '<div class="mmc-row"><span class="mmc-lab">' + TL('task.status','상태') + '</span>' + badge + '</div>' +
      '<div class="mmc-row"><span class="mmc-lab">' + TL('task.assignee','담당자') + '</span><span class="mmc-asgs"><span class="mmc-chip">' + ava(p.assignee, 22) + '<span class="cn">' + esc(p.assignee.name) + '</span><span class="cx">✕</span></span>' +
      (p._addedAssignees || []).map(function (a) { return '<span class="mmc-chip">' + ava(a, 22) + '<span class="cn">' + esc(a.name) + '</span><span class="cx">✕</span></span>'; }).join("") +
      '<span class="mmc-change" data-act="addassignee" data-post="' + p._idx + '">' + TL('task.changeAssignee','담당자 변경') + '</span></span></div>' +
      '<div class="mmc-row"><span class="mmc-lab">' + TL('task.due','마감일') + '</span>' + (p.due
        ? '<span class="mmc-due"><span class="mmc-dueval">' + esc(p.due) + '</span><span class="x">✕</span></span>'
        : '<span class="mmc-dueadd" data-act="adddue" data-post="' + p._idx + '">' + TL('task.addDue','＋ 마감일 추가') + '</span>') + '</div>' +
      '<div class="mmc-row"><span class="mmc-lab">' + TL('task.progress','진척도') + '</span><span class="mmc-prog"><span class="track"><span class="fill" style="width:' + p.progress + '%;background:' + (p.status && p.status.label === "완료" ? "#6449FC" : "#A9A9B4") + '"></span></span><span class="pct">' + p.progress + '%</span></span></div>' +
      extra +
      '</div><div class="mmc-more" data-act="more" data-post="' + p._idx + '"><b>' + (p._expanded ? '−' : '+') + '</b> ' + (p._expanded ? TL('task.collapseItem','항목 접기') : TL('task.addItem','추가 항목 보기')) + '</div><div class="mmc-divider"></div>';
    return card(p, header(p) + titleEl(p.title) + rows + bodyBlock(p.body));
  }

  function renderTodo(p) {
    var total = p.items.length, done = p.items.filter(function (i) { return i.done; }).length;
    var pct = total ? Math.round(done / total * 100) : 0;
    var head = '<div class="mmc-todohead"><span class="ratio"><b>' + done + '</b> / ' + total + '</span><span class="tpct">' + pct + '%</span></div>' +
      '<div class="mmc-todobar"><span style="width:' + pct + '%"></span></div>';
    var items = p.items.map(function (it, ii) {
      return '<div class="mmc-todoitem"><span class="cb' + (it.done ? " on" : "") + '" data-act="todo" data-post="' + p._idx + '" data-item="' + ii + '">' +
        (it.done ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19 20 8l-1.5-1.5z"/></svg>' : "") + '</span>' +
        '<span class="txt' + (it.done ? " done" : "") + '">' + esc(it.text) + '</span>' + ava(it.assignee, 24) + '</div>';
    }).join("");
    return card(p, header(p) + titleEl(p.title) + '<div class="mmc-todo">' + head + items + '<div class="mmc-todoadd" data-act="todoadd" data-post="' + p._idx + '">' + TL('todo.addItem','+ 할 일 추가') + '</div></div>');
  }

  function renderSchedule(p) {
    var b = p.dateBadge || {};
    var badge = '<div class="mmc-datebadge"><div class="mon">' + esc(b.month) + '</div><div class="day">' + esc(b.day) + '</div></div>';
    var head = '<div class="mmc-schhead">' + badge + '<div class="mmc-schinfo"><div class="st">' + esc(p.title) + '</div><div class="stime">' + esc(p.timeRange) + '</div></div></div><div class="mmc-divider2"></div>';
    var pa = p.participants || {};
    var rv = p._rsvp;
    var go = (pa.going || 0) + (rv === "go" ? 1 : 0), no = (pa.notGoing || 0) + (rv === "no" ? 1 : 0), pe = (pa.pending || 0) + (rv === "pe" ? 1 : 0);
    var avas = (pa.avatars || []).map(function (a, i) { return '<span class="pa">' + ava(a, 28) + (i === 0 ? '<span class="rdot"></span>' : "") + '</span>'; }).join("");
    var part = '<div class="mmc-schrow">' + IC.user + '<div class="palist">' + avas + '<span class="palink">' + TL('schedule.changeParticipants','참석자 변경') + '</span></div></div>' +
      '<div class="mmc-counts"><span class="c-go">' + TL('rsvp.going','참석') + ' ' + go + '</span><span class="c-no">' + TL('rsvp.notGoing','불참') + ' ' + no + '</span><span class="c-pe">' + TL('rsvp.maybe','미정') + ' ' + pe + '</span></div>';
    var zoom = p.zoom ? '<div class="mmc-schrow">' + IC.video + '<button class="mmc-sbtn" data-act="toast" data-msg="Zoom 회의에 참여합니다">' + TL('schedule.joinZoom','Zoom으로 참여하기') + '</button><span class="mmc-slink" data-act="toast" data-msg="회의 링크를 복사했습니다">⧉ ' + TL('schedule.copyLink','링크 복사') + '</span></div>' : "";
    var alarm = p.reminder ? '<div class="mmc-schrow">' + IC.bell + '<span class="mmc-stxt">' + esc(TL('schedule.remindBefore','{n}분 전 미리 알림').replace('{n}','10')) + '</span></div>' : "";
    var rec = p.recording ? '<div class="mmc-schrow">' + IC.mic + '<button class="mmc-sbtn" data-act="toast" data-msg="미팅노트 녹음을 시작합니다">' + TL('schedule.recordNote','미팅노트로 녹음하기') + '</button><span class="mmc-info">ⓘ</span></div>' : "";
    var rsvp = p.rsvp ? '<div class="mmc-divider"></div><div class="mmc-rsvp">' +
      '<button class="r-go' + (rv === "go" ? " on" : "") + '" data-act="rsvp" data-rsvp="go" data-post="' + p._idx + '">' + TL('rsvp.going','참석') + '</button>' +
      '<button class="r-no' + (rv === "no" ? " on" : "") + '" data-act="rsvp" data-rsvp="no" data-post="' + p._idx + '">' + TL('rsvp.notGoing','불참') + '</button>' +
      '<button class="r-pe' + (rv === "pe" ? " on" : "") + '" data-act="rsvp" data-rsvp="pe" data-post="' + p._idx + '">' + TL('rsvp.maybe','미정') + '</button></div>' : "";
    return card(p, header(p) + '<div class="mmc-sch">' + head + part + zoom + alarm + rec + bodyBlock(p.body) + rsvp + '</div>');
  }

  function renderVote(p) {
    var total = p.voters || p.options.reduce(function (s, o) { return s + o.votes; }, 0);
    var titleRow = '<div class="mmc-vtitle"><span class="mmc-vbadge">' + esc(TS(p.status) || p.status || "진행중") + '</span><span class="vt">' + esc(p.title) + '</span></div>';
    var desc = p.description ? '<div class="mmc-vdesc"><span class="d">' + esc(p.description) + '</span><span class="chev">⌄</span></div>' : "";
    var pill = '<div class="mmc-vpartwrap"><span class="mmc-vpart">' + total + ' ' + TL('vote.participating','명 참여 중') + ' ›</span></div>';
    var VCHK = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12.5l3.5 3.5L18 8"/></svg>';
    var opts = p.options.map(function (o, oi) {
      var pct = total ? Math.round(o.votes / total * 100) : 0;
      var check = '<span class="vcheck' + (o.voted ? ' on' : '') + '">' + (o.voted ? VCHK : '') + '</span>';
      return '<div class="mmc-vopt' + (o.voted ? ' voted' : '') + '" data-act="vote" data-post="' + p._idx + '" data-opt="' + oi + '">' +
        '<div class="vrow">' + check + '<span class="vlabel">' + esc(o.label) + '</span><span class="vcnt">' + o.votes + ' ' + TL('vote.unit','Vote') + '</span></div>' +
        '<div class="vbar"><span style="width:' + pct + '%"></span></div></div>';
    }).join("");
    var btns = '<div class="mmc-vbtns"><button class="vend" data-act="toast" data-msg="투표를 종료했습니다">' + TL('vote.end','투표 종료') + '</button><button class="vcancel" data-act="toast" data-msg="투표를 취소했습니다">' + TL('vote.cancel','투표 취소하기') + '</button></div>';
    return card(p, header(p) + '<div class="mmc-vote">' + titleRow + desc + pill + opts + '<div class="mmc-divider"></div>' + btns + '</div>');
  }

  function renderWrite(p) { return card(p, header(p) + titleEl(p.title) + bodyBlock(p.body) + imageGrid(p.images)); }

  var RENDERERS = { task: renderTask, todo: renderTodo, schedule: renderSchedule, vote: renderVote, write: renderWrite };

  /* ---- 스타일 -------------------------------------------------------- */
  var CSS = [
    '.mmc-feed{padding:0 0 40px;}',
    '.mmc-sys{display:flex;justify-content:center;margin:14px 0;}',
    '.mmc-sys span{font-size:12.5px;color:#999;background:#fff;border:1px solid #EEE;border-radius:16px;padding:7px 16px;}',
    '.mmc-card{background:#fff;border:1px solid #ECECEC;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.04);overflow:hidden;margin-bottom:14px;}',
    '.mmc-head{display:flex;align-items:flex-start;gap:10px;padding:18px 22px 8px;}',
    '.mmc-ava{border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:700;}',
    '.mmc-who{flex:1;min-width:0;}.mmc-who .l1{display:flex;align-items:center;gap:7px;}',
    '.mmc-who .nm{font-size:14px;font-weight:700;color:#333;}.mmc-who .role{font-size:13px;color:#777;}',
    '.mmc-who .dt{font-size:13px;color:#999;margin-left:4px;}.mmc-who .team{font-size:12.5px;color:#999;margin-top:3px;}',
    '.mmc-no{font-size:12px;color:#888;background:#F4F4F6;border-radius:4px;padding:5px 10px;white-space:nowrap;align-self:flex-start;}',
    '.mmc-ic{width:18px;height:18px;opacity:.45;flex-shrink:0;cursor:pointer;}',
    '.mmc-title{font-size:18px;font-weight:700;color:#333;padding:6px 22px 16px;letter-spacing:-.3px;}',
    /* task */
    '.mmc-rows{padding:0 22px 8px;}.mmc-row{display:flex;align-items:center;min-height:49px;gap:8px;}',
    '.mmc-lab{width:88px;flex-shrink:0;white-space:nowrap;font-size:14px;font-weight:500;color:#777;}',
    '.mmc-badge{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;border-radius:4px;padding:6px 10px 6px 12px;position:relative;overflow:hidden;}',
    '.mmc-skel{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,rgba(255,255,255,0) 26%,rgba(255,255,255,.8) 50%,rgba(255,255,255,0) 74%);background-size:220% 100%;animation:mmc-shim .8s linear 2;}',
    '@keyframes mmc-shim{from{background-position:200% 0;}to{background-position:-120% 0;}}',
    '.mmc-badge .dot{width:6px;height:6px;border-radius:50%;}.mmc-badge .caret{font-size:9px;opacity:.7;margin-left:1px;}',
    '.mmc-chip{display:inline-flex;align-items:center;gap:7px;background:#EEE;border-radius:4px;padding:4px 10px 4px 4px;}',
    '.mmc-chip .cn{font-size:13px;font-weight:700;color:#333;}.mmc-chip .cx{font-size:13px;color:#999;cursor:pointer;}',
    '.mmc-change{font-size:14px;color:#999;margin-left:4px;cursor:pointer;white-space:nowrap;align-self:center;}',
    '.mmc-due{font-size:15px;color:#FF0000;}.mmc-due .x{color:#ccc;margin-left:8px;font-size:13px;cursor:pointer;}',
    '.mmc-dueadd{font-size:15px;color:#999;text-decoration:underline;text-underline-offset:3px;cursor:pointer;transition:color .15s;}.mmc-dueadd:hover{color:#6449FC;}',
    '.mmc-dueval{}',
    '.mmc-prog{display:flex;align-items:center;gap:12px;flex:1;}',
    '.mmc-prog .track{width:200px;height:8px;background:#ECECF2;border-radius:999px;overflow:hidden;}',
    '.mmc-prog .fill{display:block;height:100%;width:0;background:#6449FC;border-radius:999px;}.mmc-prog .pct{font-size:14px;font-weight:700;color:#999;}',
    '.mmc-more{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:#555;padding:12px 22px 4px;cursor:pointer;}',
    '.mmc-more b{color:#9a9aa2;font-weight:700;font-size:16px;}',
    '.mmc-divider{height:1px;background:#F0F0F0;margin:14px 22px 0;}',
    '.mmc-divider2{height:1px;background:#F0F0F0;margin:14px 22px;}',
    '.mmc-body{padding:16px 22px 20px;font-size:14.5px;line-height:1.75;color:#333;}.mmc-body p{margin:0;min-height:10px;}',
    '.rb-h{font-weight:700;font-size:14.5px;color:#1f1f29;margin:14px 0 6px;display:flex;align-items:center;gap:6px;}.rb-h:first-child{margin-top:0;}.rb-e{font-style:normal;}',
    '.rb-ul{margin:2px 0 4px;padding-left:20px;list-style:disc;}.rb-ul li{margin:3px 0;}.rb-ul .rb-e{margin-right:5px;}',
    '.rb-sub{margin:2px 0 2px;color:#666;font-size:13.5px;line-height:1.6;list-style:none;}',
    '.rb-check{margin:2px 0 4px;padding-left:2px;list-style:none;}.rb-check li{display:flex;align-items:flex-start;gap:8px;margin:4px 0;color:#333;}',
    '.rb-cb{flex-shrink:0;width:17px;height:17px;border-radius:4px;border:1.5px solid #C9C9D2;display:inline-flex;align-items:center;justify-content:center;font-size:11px;color:#fff;margin-top:2px;}.rb-check li.on .rb-cb{background:#2BB24C;border-color:#2BB24C;}.rb-check li.on{color:#9a9aa3;}',
    '.rb-tablewrap{margin:8px 0 10px;overflow-x:auto;}.rb-table{border-collapse:collapse;width:100%;font-size:13.5px;}',
    '.rb-table th{background:#F4F3E9;border:1px solid #E3E1D4;padding:7px 12px;font-weight:600;color:#3a3a44;text-align:center;white-space:nowrap;}',
    '.rb-table td{border:1px solid #EAEAEF;padding:8px 12px;color:#444;vertical-align:top;}.rb-table tbody tr:hover{background:#FAFAFB;}',
    '.rb-tags{margin:12px 0 2px;display:flex;flex-wrap:wrap;gap:8px;}.rb-tags span{color:#6449FC;font-weight:600;font-size:13.5px;}',
    '.rb-note{margin:6px 0 2px;color:#A6A6AE;font-size:12.5px;}',
    '.mmc-imgs{display:grid;gap:3px;margin:0 22px 16px;border-radius:10px;overflow:hidden;}',
    '.mmc-imgs .it{background-size:cover;background-position:center;background-color:#E6E6EA;position:relative;}',
    '.mmc-imgs.n1{grid-template-columns:1fr;}.mmc-imgs.n1 .it{aspect-ratio:1.35;}',
    '.mmc-imgs.n2{grid-template-columns:1fr 1fr;}.mmc-imgs.n2 .it{aspect-ratio:1;}',
    '.mmc-imgs.n3{grid-template-columns:1fr 1fr 1fr;}.mmc-imgs.n3 .it{aspect-ratio:1;}',
    '.mmc-imgs.n4{grid-template-columns:1fr 1fr;}.mmc-imgs.n4 .it{aspect-ratio:1.3;}',
    '.mmc-imgs .it .mo{position:absolute;inset:0;background:rgba(0,0,0,.5);color:#fff;font-size:24px;font-weight:700;display:flex;align-items:center;justify-content:center;}',
    /* todo */
    '.mmc-todo{padding:4px 22px 16px;}.mmc-todohead{display:flex;align-items:center;justify-content:space-between;margin:6px 0 10px;}',
    '.mmc-todohead .ratio{font-size:20px;color:#333;}.mmc-todohead .ratio b{font-weight:700;}.mmc-todohead .tpct{font-size:20px;font-weight:700;color:#00B2FF;}',
    '.mmc-todobar{height:8px;border-radius:8px;background:#E3F4FD;overflow:hidden;margin-bottom:14px;}.mmc-todobar span{display:block;height:100%;background:#00B2FF;border-radius:8px;transition:width .55s cubic-bezier(.4,0,.2,1);}',
    '.mmc-todoitem{display:flex;align-items:center;gap:12px;height:46px;border-top:1px solid #F2F2F2;}',
    '.mmc-todoitem .cb{width:22px;height:22px;border:1.5px solid #00B2FF;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}.mmc-todoitem .cb.on{background:#00B2FF;}',
    '.mmc-todoitem .txt{flex:1;font-size:14.5px;color:#333;}.mmc-todoitem .txt.done{color:#aaa;text-decoration:line-through;}',
    '.mmc-todoadd{display:inline-flex;align-items:center;margin-top:14px;font-size:13px;color:#555;border:1px solid #E0E0E0;border-radius:6px;padding:8px 14px;cursor:pointer;}.mmc-todoadd:hover{border-color:#C9BFF7;color:#6449FC;}',
    /* schedule */
    '.mmc-sch{padding:2px 0 8px;}',
    '.mmc-schhead{display:flex;align-items:center;gap:16px;padding:6px 22px 0;}',
    '.mmc-datebadge{width:66px;height:72px;border-radius:6px;overflow:hidden;flex-shrink:0;background:#00B19C;text-align:center;}',
    '.mmc-datebadge .mon{background:#fff;color:#00B19C;font-size:12px;font-weight:700;padding:3px 0;}',
    '.mmc-datebadge .day{color:#fff;font-size:28px;font-weight:700;line-height:46px;}',
    '.mmc-schinfo .st{font-size:18px;font-weight:700;color:#333;}.mmc-schinfo .stime{font-size:16px;color:#333;margin-top:8px;}',
    '.mmc-schrow{display:flex;align-items:center;gap:12px;padding:9px 22px;}',
    '.mmc-schrow .palist{display:flex;align-items:center;gap:8px;}',
    '.mmc-schrow .pa{position:relative;display:inline-flex;}.mmc-schrow .pa .rdot{position:absolute;top:-1px;right:-1px;width:9px;height:9px;border-radius:50%;background:#FB2A2A;border:1.5px solid #fff;}',
    '.mmc-schrow .palink{font-size:13.5px;color:#999;text-decoration:underline;text-underline-offset:3px;margin-left:4px;}',
    '.mmc-counts{display:flex;gap:16px;padding:0 22px 6px 56px;font-size:13.5px;}',
    '.mmc-counts .c-go{color:#00B19C;font-weight:600;}.mmc-counts .c-no{color:#FB2A2A;font-weight:600;}.mmc-counts .c-pe{color:#999;}',
    '.mmc-sbtn{font-size:13px;font-weight:500;color:#333;background:#F4F4F6;border:1px solid #E6E6EA;border-radius:6px;padding:7px 14px;cursor:pointer;}',
    '.mmc-slink{font-size:13px;color:#666;cursor:pointer;}.mmc-stxt{font-size:14px;color:#333;}.mmc-info{color:#bbb;font-size:13px;}',
    '.mmc-rsvp{display:flex;gap:10px;justify-content:center;padding:16px 22px 4px;}',
    '.mmc-rsvp button{flex:0 0 auto;min-width:90px;padding:9px 0;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;background:#fff;}',
    '.mmc-rsvp button{background:#fff;transition:background .2s,color .2s;}',
    '.mmc-rsvp .r-go{border:1px solid #00B19C;color:#00B19C;}',
    '.mmc-rsvp .r-go.on{background:#00B19C;color:#fff;}',
    '.mmc-rsvp .r-no{border:1px solid #FB2A2A;color:#FB2A2A;}',
    '.mmc-rsvp .r-no.on{background:#FB2A2A;color:#fff;}',
    '.mmc-rsvp .r-pe{border:1px solid #D5D5DB;color:#777;}',
    '.mmc-rsvp .r-pe.on{background:#888;color:#fff;border-color:#888;}',
    /* vote */
    '.mmc-vote{padding:2px 22px 8px;}',
    '.mmc-vtitle{display:flex;align-items:center;gap:10px;padding:4px 0 12px;}',
    '.mmc-vbadge{font-size:12px;font-weight:500;color:#FF6651;border:1px solid #FF6651;border-radius:4px;padding:2px 7px;flex-shrink:0;}',
    '.mmc-vtitle .vt{font-size:18px;font-weight:700;color:#333;}',
    '.mmc-vdesc{position:relative;display:flex;align-items:center;padding:0 24px 14px 0;border-bottom:1px solid #F0F0F0;}',
    '.mmc-vdesc .d{flex:1;font-size:14px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.mmc-vdesc .chev{position:absolute;right:0;top:-2px;color:#aaa;font-size:14px;}',
    '.mmc-vpartwrap{display:flex;justify-content:flex-end;margin:12px 0 6px;}',
    '.mmc-vpart{font-size:13px;color:#777;border:1px solid #E0E0E0;border-radius:18px;padding:7px 16px;cursor:pointer;}',
    '.mmc-vopt{margin-bottom:16px;}',
    '.mmc-vopt .vrow{display:flex;align-items:center;gap:12px;margin-bottom:8px;}',
    '.mmc-vopt .vthumb{width:48px;height:48px;border-radius:6px;flex-shrink:0;background:#EDEDF0 center/cover no-repeat;display:inline-flex;align-items:center;justify-content:center;}',
    '.mmc-vopt .vcheck{width:24px;height:24px;border-radius:50%;border:2px solid #D5D5DB;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;transition:all .15s;}',
    '.mmc-vopt .vcheck.on{background:#6449FC;border-color:#6449FC;}',
    '.mmc-vopt:hover .vcheck{border-color:#B7ABF2;}',
    '.mmc-vopt .vlabel{flex:1;font-size:15px;font-weight:700;color:#333;display:flex;align-items:center;gap:7px;}',
    '.mmc-vopt .vchk{color:#333;font-weight:700;}',
    '.mmc-vopt .vcnt{font-size:13px;color:#777;flex-shrink:0;}',
    '.mmc-vopt .vbar{height:10px;border-radius:6px;background:#E5E5E5;overflow:hidden;}',
    '.mmc-vopt .vbar span{display:block;height:100%;border-radius:6px;background:#FF6651;}',
    '.mmc-vbtns{display:flex;gap:10px;justify-content:center;padding:14px 0 4px;}',
    '.mmc-vbtns button{min-width:120px;padding:9px 0;border-radius:4px;font-size:14px;cursor:pointer;}',
    '.mmc-vbtns .vend{background:#fff;border:1px solid #D5D5DB;color:#555;}',
    '.mmc-vbtns .vcancel{background:#6449FC;border:1px solid #6449FC;color:#fff;}',
    /* footer */
    '.mmc-foot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #F0F0F0;padding:12px 22px;margin-top:4px;}',
    '.mmc-foot .acts{display:flex;gap:18px;}',
    '.mmc-foot .acts span{display:inline-flex;align-items:center;gap:5px;font-size:13px;color:#999;cursor:pointer;user-select:none;transition:color .12s;}',
    '.mmc-foot .acts span:hover{color:#666;}',
    '.mmc-foot .acts span.on{color:#6449FC;font-weight:600;}',
    '.mmc-foot .acts span .n{font-weight:700;}',
    '.mmc-foot .read{font-size:12.5px;color:#bbb;}',
    /* 상호작용 공통 */
    '.mmc-badge{cursor:pointer;}.mmc-more{cursor:pointer;}.mmc-todoitem .cb{cursor:pointer;}.mmc-vopt{cursor:pointer;border-radius:8px;padding:4px;margin:0 -4px 12px;transition:background .12s;}.mmc-vopt:hover{background:#FAFAFA;}',
    '.mmc-vopt.voted .vlabel{color:#FF6651;}',
    '.mmc-flag,.mmc-rep{font-size:14px;color:#555;}',
    /* 댓글 */
    '.mmc-cmts{padding:14px 22px 18px;border-top:1px solid #F2F2F2;}',
    '.mmc-cmt{display:flex;gap:10px;margin-bottom:14px;}',
    '.mmc-cmt .cb{flex:1;min-width:0;}',
    '.mmc-cmt .ch .nm{font-size:13.5px;font-weight:700;color:#333;}.mmc-cmt .ch .dt{font-size:12px;color:#aaa;margin-left:6px;}',
    '.mmc-cmt .tx{font-size:13.5px;color:#444;margin-top:4px;line-height:1.55;word-break:break-word;}',
    '.mmc-cmt .clk{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#999;margin-top:7px;cursor:pointer;user-select:none;transition:color .12s;}',
    '.mmc-cmt .clk:hover{color:#777;}',
    '.mmc-cmt .clk.on{color:#6449FC;font-weight:600;}',
    '.mmc-cmt .clk .cl-ic{flex-shrink:0;}',
    '.mmc-cmt .cacts{display:flex;align-items:center;gap:18px;margin-top:7px;}.mmc-cmt .cacts .clk{margin-top:0;}',
    '.mmc-cmt .crep{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#999;cursor:pointer;user-select:none;}.mmc-cmt .crep:hover{color:#6449FC;}',
    '.mmc-replies{margin-top:10px;padding-left:14px;border-left:2px solid #EEE;}.mmc-cmt.reply{margin-top:12px;}',
    '.mmc-rbox{margin-top:12px;padding-left:14px;}',
    '.mmc-rbox .rbh{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#555;margin-bottom:9px;}',
    '.mmc-rbox .rbh .rbx{margin-left:auto;color:#bbb;cursor:pointer;font-size:13px;}.mmc-rbox .rbh .rbx:hover{color:#777;}',
    /* 담당자 칩 컨테이너 (모션은 effects/motion.js) */
    '.mmc-asgs{display:inline-flex;flex-wrap:wrap;align-items:center;gap:7px;}',
    '.mmc-badge{transition:background .25s,color .25s;}',
    /* 스크롤 등장 대기 상태(모션 ON일 때만 부여) */
    '.mmc-card.mm-pending{opacity:0;}',
    '.mmc-crow{display:flex;gap:10px;align-items:center;}',
    '.mmc-cbox{flex:1;display:flex;align-items:center;gap:8px;border:1px solid #E4E4E8;border-radius:10px;padding:9px 12px;}',
    '.mmc-cbox:focus-within{border-color:#C9BFF7;}',
    '.mmc-cinput,.mmc-rinput{flex:1;border:none;outline:none;font-size:13.5px;color:#333;font-family:inherit;background:transparent;}',
    '.mmc-rinput::placeholder{color:#aaa;}',
    '.mmc-cinput::placeholder{color:#aaa;}',
    '.mmc-cattach{color:#bbb;cursor:pointer;font-size:15px;}',
    /* 토스트 */
    '#mmc-toast{position:fixed;left:50%;bottom:40px;transform:translateX(-50%) translateY(20px);background:#2B2B33;color:#fff;font-size:13.5px;font-weight:500;padding:12px 20px;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.28);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:3000;}',
    '#mmc-toast.on{opacity:1;transform:translateX(-50%) translateY(0);}'
  ].join("\n");

  /* ---- 렌더 ---------------------------------------------------------- */
  function render() {
    var feed = document.querySelector(".feed-content");
    if (!feed) return false;
    if (!document.getElementById("mmc-style")) {
      var st = document.createElement("style"); st.id = "mmc-style"; st.textContent = CSS; document.head.appendChild(st);
    }
    var html = '<div class="mmc-feed">';
    if (DATA.sysMessage) html += '<div class="mmc-sys"><span>' + esc(DATA.sysMessage.text) + " " + esc(DATA.sysMessage.time) + "</span></div>";
    DATA.posts.forEach(function (p, i) { p._idx = i; var fn = RENDERERS[p.type]; if (fn) html += fn(p); });
    html += "</div>";
    feed.innerHTML = html;
    // 알림에서 열린 TASK 모달(피드 첫 TASK와 동일 데이터/UI)도 함께 갱신
    var mh = document.getElementById("mmp-feedhost");
    if (mh) mh.innerHTML = cardHtml(0);
    var m = window.MM_MOTION;
    if (m && m.revealRegister) { m.revealRegister("feed", feedRevealHandler); m.revealKick(); }
    return true;
  }
  /* ---- 상호작용 ------------------------------------------------------ */
  var ASSIGNEE_POOL = [
    { name: "장아람", color: "#4EC196" },
    { name: "Hyejo Seo", color: "#E58BB0" },
    { name: "June Lee", color: "#5B6CF0" }
  ];
  var STATUS_OPTS = [
    { label: "요청", color: "#0053BF", bg: "rgba(0,181,241,.20)", prog: 0 },
    { label: "진행중", color: "#0A8F2E", bg: "rgba(10,143,46,.15)", prog: 45 },
    { label: "피드백", color: "#E8730C", bg: "rgba(232,115,12,.18)", prog: 75 },
    { label: "완료", color: "#402A9D", bg: "rgba(66,61,197,0.30)", prog: 100 },
    { label: "보류", color: "#8A8A92", bg: "#ECECEF", prog: 30 }
  ];
  var ADVANCE_TO = 3; // 자동 진행은 완료(index 3)까지만

  function toast(msg) {
    var t = document.getElementById("mmc-toast");
    if (!t) { t = document.createElement("div"); t.id = "mmc-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, 1800);
  }
  function MM() { return window.MM_MOTION || null; }
  function voteFor(p, oi) {
    var cur = -1;
    p.options.forEach(function (o, i) { if (o.voted) cur = i; });
    if (cur === oi) return;
    if (cur >= 0) { p.options[cur].votes = Math.max(0, p.options[cur].votes - 1); p.options[cur].voted = false; }
    else { p.voters = (p.voters || 0) + 1; }
    p.options[oi].votes++; p.options[oi].voted = true;
  }

  function statusIndex(label) { for (var i = 0; i < STATUS_OPTS.length; i++) if (STATUS_OPTS[i].label === label) return i; return -1; }

  function applyStatus(pix, o) {
    var p = DATA.posts[pix], g = window.MM_GAME, m = MM();
    var prevProg = p.progress || 0;
    p.status = { label: o.label, color: o.color, bg: o.bg }; p.progress = o.prog; render();
    var badge = document.querySelector('.mmc-badge[data-post="' + pix + '"]');
    if (m) m.statusFlip(badge);
    // 진척도 바: 상태 비율로 애니메이션, 100%(완료)에서만 보라
    var card = badge && badge.closest(".mmc-card"), fill = card && card.querySelector(".mmc-prog .fill");
    if (m && fill) fill.animate([{ width: prevProg + "%" }, { width: o.prog + "%" }], { duration: 700, easing: "cubic-bezier(.4,0,.2,1)" });
    // 완료로 바뀌면 노란 스트로크(sparkle) 대신 스켈레톤(시머) 효과
    if (m && o.label === "완료" && badge) { var sk = document.createElement("span"); sk.className = "mmc-skel"; badge.appendChild(sk); setTimeout(function () { if (sk.parentNode) sk.parentNode.removeChild(sk); }, 1300); }
    if (g) { if (o.label === "완료") g.complete(badge); else g.award(5, badge); }
  }
  // 마우스가 지나가면 요청→진행중→피드백→완료 까지 한 단계씩 (조금 더 느리게) 자동 진행
  function startStatusAdvance(pix) {
    var p = DATA.posts[pix];
    if (p._advancing || p.status.label === "완료") return;
    p._advancing = true;
    (function step() {
      var cur = statusIndex(p.status.label);
      if (cur >= ADVANCE_TO) { p._advancing = false; return; }
      applyStatus(pix, STATUS_OPTS[cur + 1]);
      if (DATA.posts[pix].status.label === "완료") { p._advancing = false; return; }
      setTimeout(step, 650);
    })();
  }
  // 추가 담당자도 언어별 참여자 목록에서(메인 담당자 제외) 가져옴
  function addAssigneePool(p) {
    var ppl = feedPeople(), mainName = p && p.assignee && p.assignee.name;
    if (ppl && ppl.length >= 2) {
      return ppl.filter(function (a) { return a.name !== mainName; })
        .slice(0, 3).map(function (a) { return { name: a.name, color: a.color, photo: a.photo }; });
    }
    return ASSIGNEE_POOL.slice();
  }
  function addAssignee(p, m) {
    if (p._addedAssignees) return;
    p._addedAssignees = addAssigneePool(p); render();
    var card = document.querySelector('.mmc-change[data-post="' + p._idx + '"]');
    card = card && card.closest(".mmc-card");
    if (m) m.assigneeFlyIn(card, p._addedAssignees.map(function (a) { return a.name; }));
    if (window.MM_GAME) window.MM_GAME.award(4, card);
  }
  function addDue(p, m) {
    if (p.due) return;
    p.due = "2026-06-13 (금) 까지"; render();
    var card2 = document.querySelector('.mmc-card[data-card="' + p._idx + '"]');
    var dv = card2 && card2.querySelector(".mmc-dueval");
    if (m && dv) m.typewriter(dv);
    if (window.MM_GAME) window.MM_GAME.award(4, dv);
  }
  /* ---- 댓글/대댓글 자동 작성 ---- */
  function typeInput(el, text, done) {
    if (!el) { if (done) done(); return; }
    if (!MM() || !MM().enabled) { el.value = text; if (done) done(); return; }
    el.value = ""; var i = 0;
    (function tick() { if (!el.isConnected) { if (done) done(); return; } el.value = text.slice(0, i); if (i >= text.length) { if (done) done(); return; } i++; setTimeout(tick, 55); })();
  }
  function lastCmtPop(p) {
    var card = document.querySelector('.mmc-card[data-card="' + p._idx + '"]');
    var cmts = card && card.querySelectorAll(".mmc-cmts > .mmc-cmt");
    var last = cmts && cmts[cmts.length - 1]; if (last && MM()) MM().commentPop(last);
  }
  function autoLikeLast(p) {
    var c0 = p._comments && p._comments[p._comments.length - 1]; if (!c0 || c0._liked) return;
    c0._liked = true; render();
    var clk = document.querySelector('.mmc-card[data-card="' + p._idx + '"] .mmc-cmts > .mmc-cmt:last-child .clk');
    if (clk && MM()) MM().smiles(clk);
  }
  // 각 task의 댓글 — 작성자도 글 작성자와 다르게(맥락에 맞는 인물) 지정 + 이모지 포함
  var POST_COMMENTS = [
    { by: PPL.june, text: "계약 조건 확인했습니다 👍 단기 후 장기 전환 방향 좋네요, 바로 진행하시죠!" },
    { by: PPL.hyejo, text: "체크리스트 꼼꼼하네요 📋 부스 디자인 시안은 제가 오늘 중으로 공유할게요!" },
    { by: PPL.soyun, text: "부스 위치 확인했어요 📍 East Hall E-12, 현장에서 뵙겠습니다!" },
    { by: PPL.aram, text: "저는 A안이 제일 깔끔한 것 같아요 🎨 가독성도 제일 좋네요!" },
    { by: PPL.haruka, text: "리드 312건 정말 대박이네요 🎉 현장 응대하느라 고생 많으셨습니다!" }
  ];
  // 댓글 작성자: 언어별 참여자 목록에서(작성자와 다른 사람) / 댓글 문구: ui.json comment.auto[언어별]
  function feedPeople() { return (window.MM_C && MM_C('pc.participants')) || null; }
  // '나'(현재 사용자) — 언어별 참여자 첫 번째, 없으면 AUTHOR
  function meUser() { var ppl = feedPeople(); if (ppl && ppl[0]) return { name: ppl[0].name, color: ppl[0].color, photo: ppl[0].photo }; return AUTHOR; }
  function commentForPost(p) {
    var arr = window.MM_TR && window.MM_TR('comment.auto');
    if (Array.isArray(arr) && arr[p._idx]) return arr[p._idx];
    return (POST_COMMENTS[p._idx] && POST_COMMENTS[p._idx].text) || TL('comment.fallback', '좋은 내용이네요 👍');
  }
  function commentAuthorForPost(p) {
    var ppl = feedPeople();
    if (ppl && ppl.length) { var a = ppl[(p._idx + 1) % ppl.length]; return { name: a.name, color: a.color, photo: a.photo }; }
    return (POST_COMMENTS[p._idx] && POST_COMMENTS[p._idx].by) || AUTHOR;
  }
  function autoWriteComment(p) {
    if (p._cmtHoverDone) return; p._cmtHoverDone = true;
    var input = document.querySelector('.mmc-card[data-card="' + p._idx + '"] .mmc-crow .mmc-cinput');
    var txt = commentForPost(p), by = commentAuthorForPost(p);
    typeInput(input, txt, function () {
      setTimeout(function () {
        (p._comments = p._comments || []).push({ author: by, text: txt }); render(); lastCmtPop(p);
        setTimeout(function () { autoLikeLast(p); }, 850); // 댓글 달리면 자동 좋아요
      }, 220);
    });
  }
  function openWriteReply(pix, ci) {
    var c = DATA.posts[pix]._comments && DATA.posts[pix]._comments[ci]; if (!c || c._replyHoverDone) return; c._replyHoverDone = true;
    c._replying = true; render();
    setTimeout(function () {
      var rin = document.querySelector('.mmc-rinput[data-post="' + pix + '"][data-cmt="' + ci + '"]');
      var rtxt = TL('comment.reply', "넵! 확인했습니다 🙌");
      typeInput(rin, rtxt, function () {
        setTimeout(function () {
          (c.replies = c.replies || []).push({ author: meUser(), text: rtxt }); c._replying = true; render();
          var card = document.querySelector('.mmc-card[data-card="' + pix + '"]');
          var reps = card && card.querySelectorAll(".mmc-replies .mmc-cmt.reply"); var lastR = reps && reps[reps.length - 1];
          if (lastR && MM()) MM().commentPop(lastR);
        }, 220);
      });
    }, 320);
  }
  // 체크박스 하나에 마우스가 지나가면 전체 항목을 순차적으로 체크
  function checkAllTodos(p) {
    if (p._allCheck) return; p._allCheck = true;
    var order = []; p.items.forEach(function (it, i) { if (!it.done) order.push(i); });
    (function step(k) {
      if (k >= order.length) return;
      var before = p.items.filter(function (i) { return i.done; }).length;
      p.items[order[k]].done = true; if (window.MM_GAME) window.MM_GAME.award(2);
      render(); animateTodoBar(p, before);
      var card = document.querySelector('.mmc-card[data-card="' + p._idx + '"]');
      var items = card ? card.querySelectorAll(".mmc-todoitem") : null;
      var el = items && items[order[k]], cbx = el && el.querySelector(".cb");
      if (cbx && MM()) cbx.animate([{ transform: "scale(.4)" }, { transform: "scale(1.25)", offset: .6 }, { transform: "scale(1)" }], { duration: 300, easing: "cubic-bezier(.34,1.6,.5,1)" });
      setTimeout(function () { step(k + 1); }, 190);
    })(0);
  }
  function animateTodoBar(p, oldDone) {
    if (!MM()) return; var total = p.items.length, newDone = p.items.filter(function (i) { return i.done; }).length;
    var card = document.querySelector('.mmc-card[data-card="' + p._idx + '"]'), span = card && card.querySelector(".mmc-todobar span");
    if (span) span.animate([{ width: Math.round(oldDone / total * 100) + "%" }, { width: Math.round(newDone / total * 100) + "%" }], { duration: 600, easing: "cubic-bezier(.4,0,.2,1)" });
  }
  function addTodos(p) {
    if (p._todoAdded) return; p._todoAdded = true;
    var od = p.items.filter(function (i) { return i.done; }).length;
    var ppl0 = feedPeople();
    var a1 = meUser();
    var a2 = (ppl0 && ppl0[1]) ? { name: ppl0[1].name, color: ppl0[1].color, photo: ppl0[1].photo } : { name: "유성균", color: "#5B6CF0" };
    p.items.push({ text: TL('todo.added1', "현장 점검표 작성"), done: false, assignee: a1 });
    p.items.push({ text: TL('todo.added2', "자료 수집 폼 설치"), done: false, assignee: a2 });
    render(); animateTodoBar(p, od);
    var card = document.querySelector('.mmc-card[data-card="' + p._idx + '"]'), items = card && card.querySelectorAll(".mmc-todoitem");
    if (items && MM()) { [items[items.length - 2], items[items.length - 1]].forEach(function (it, k) { if (it) it.animate([{ opacity: 0, transform: "translateX(-12px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 400, delay: k * 130, easing: "cubic-bezier(.2,.8,.3,1)" }); }); }
    if (window.MM_GAME) window.MM_GAME.award(3);
  }
  function rsvpComment(p, c) {
    var me = meUser(), nm = me.name;
    var txt = (c === "go") ? TL('rsvp.commentGoing','{name}님이 참석합니다.').replace('{name}', nm) : (c === "no") ? TL('rsvp.commentNotGoing','{name}님이 불참합니다.').replace('{name}', nm) : TL('rsvp.commentMaybe','{name}님이 미정입니다.').replace('{name}', nm);
    (p._comments = p._comments || []).push({ author: me, text: txt }); render(); lastCmtPop(p);
  }

  function wire() {
    if (window.__MMC_WIRED) return; window.__MMC_WIRED = true;
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-act]"); if (!el) return;
      if (!el.closest(".feed-content")) return; // 피드 영역 밖(다른 뷰)의 data-act은 무시
      var act = el.getAttribute("data-act");
      var p = DATA.posts[+el.getAttribute("data-post")], m = MM();
      var g = window.MM_GAME;
      if (act === "like" || act === "book" || act === "again") { p["_" + act] = !p["_" + act]; if (act === "like" && p._like && m) m.smiles(el); if (act === "like" && p._like && g) g.award(3, el); render(); }
      else if (act === "more") { p._expanded = !p._expanded; render(); }
      else if (act === "todo") { var ii = +el.getAttribute("data-item"); var od0 = p.items.filter(function (i) { return i.done; }).length; p.items[ii].done = !p.items[ii].done; if (p.items[ii].done && g) g.award(5, el); render(); animateTodoBar(p, od0); }
      else if (act === "todoadd") { addTodos(p); }
      else if (act === "rsvp") { var c = el.getAttribute("data-rsvp"); p._rsvp = (p._rsvp === c ? null : c); if (p._rsvp && g) g.award(3, el); if (p._rsvp) rsvpComment(p, p._rsvp); else render(); }
      else if (act === "vote") { voteFor(p, +el.getAttribute("data-opt")); if (g) { g.award(8, el); g.achievement("voter", "투표 참여!", "키 비주얼에 한 표", "🗳️"); } render(); }
      else if (act === "status") {
        startStatusAdvance(+el.getAttribute("data-post"));   // 한 번 클릭 → 요청부터 완료까지 자동 진행
      }
      else if (act === "addassignee") { addAssignee(p, m); }
      else if (act === "adddue") { addDue(p, m); }
      else if (act === "cmtlike") { var cm = p._comments[+el.getAttribute("data-cmt")]; cm._liked = !cm._liked; if (cm._liked && g) g.award(2, el); render(); }
      else if (act === "rcmtlike") { var rc = p._comments[+el.getAttribute("data-cmt")].replies[+el.getAttribute("data-rep")]; rc._liked = !rc._liked; if (rc._liked && g) g.award(2, el); render(); }
      else if (act === "replyhover") { openWriteReply(+el.getAttribute("data-post"), +el.getAttribute("data-cmt")); }
      else if (act === "replyclose") { p._comments[+el.getAttribute("data-cmt")]._replying = false; render(); }
      else if (act === "toast") { toast(el.getAttribute("data-msg")); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.shiftKey || !e.target.closest) return;
      var cin = e.target.closest(".mmc-cinput");
      if (cin) {
        e.preventDefault(); var v = cin.value.trim(); if (!v) return;
        var p = DATA.posts[+cin.getAttribute("data-post")];
        (p._comments = p._comments || []).push({ author: meUser(), text: v }); render();
        var ni = document.querySelector('.mmc-cinput[data-post="' + p._idx + '"]'); if (ni) ni.focus();
        return;
      }
      var rin = e.target.closest(".mmc-rinput");
      if (rin) {
        e.preventDefault(); var rv = rin.value.trim(); if (!rv) return;
        var pp = DATA.posts[+rin.getAttribute("data-post")], ci = +rin.getAttribute("data-cmt"), cm2 = pp._comments[ci];
        (cm2.replies = cm2.replies || []).push({ author: meUser(), text: rv }); cm2._replying = true; render();
        var nr = document.querySelector('.mmc-rinput[data-post="' + pp._idx + '"][data-cmt="' + ci + '"]'); if (nr) nr.focus();
      }
    });
    // 마우스가 지나가면 자동으로: 상태 진행 / 담당자·마감일 추가 / 좋아요 / 투표 / TODO / RSVP
    var lastTodo = null, lastRsvp = null, lastVote = null;
    document.addEventListener("mouseover", function (e) {
      if (!e.target.closest) return; var g = window.MM_GAME, m = MM();
      // 상태 자동 진행
      var sb = e.target.closest('.feed-content .mmc-badge[data-act="status"]');
      if (sb) startStatusAdvance(+sb.getAttribute("data-post"));
      // 담당자 변경
      var ca = e.target.closest('.feed-content .mmc-change[data-act="addassignee"]');
      if (ca) addAssignee(DATA.posts[+ca.getAttribute("data-post")], m);
      // 마감일 추가
      var dd = e.target.closest('.feed-content .mmc-dueadd[data-act="adddue"]');
      if (dd) addDue(DATA.posts[+dd.getAttribute("data-post")], m);
      // 좋아요
      var lk = e.target.closest('.feed-content .mmc-foot .acts span[data-act="like"]');
      if (lk) { var pl = DATA.posts[+lk.getAttribute("data-post")]; if (!pl._like) { pl._like = true; if (m) m.smiles(lk); if (g) g.award(3, lk); render(); } }
      // TODO 체크박스 하나만 지나가도 전체 체크박스가 순차적으로 자동 선택됨
      var cb = e.target.closest('.feed-content .mmc-todoitem .cb[data-act="todo"]');
      if (cb) checkAllTodos(DATA.posts[+cb.getAttribute("data-post")]);
      // 일정 RSVP (지나가면 선택 + "OO님이 참석/불참합니다" 댓글 자동 등록)
      var rb = e.target.closest('.feed-content .mmc-rsvp button[data-act="rsvp"]');
      if (rb) { if (rb !== lastRsvp) { lastRsvp = rb; var p2 = DATA.posts[+rb.getAttribute("data-post")], c = rb.getAttribute("data-rsvp"); if (p2._rsvp !== c) { p2._rsvp = c; if (g) g.award(3, rb); rsvpComment(p2, c); } } } else lastRsvp = null;
      // 댓글 입력칸에 지나가면 자동 작성, Reply에 지나가면 대댓글 작성, 할일추가에 지나가면 todo 2개 추가
      var cinHover = e.target.closest('.feed-content .mmc-crow .mmc-cbox');
      if (cinHover) { var cinp = cinHover.querySelector(".mmc-cinput"); if (cinp) autoWriteComment(DATA.posts[+cinp.getAttribute("data-post")]); }
      var repHover = e.target.closest('.feed-content .crep[data-act="replyhover"]');
      if (repHover) openWriteReply(+repHover.getAttribute("data-post"), +repHover.getAttribute("data-cmt"));
      var taHover = e.target.closest('.feed-content .mmc-todoadd[data-act="todoadd"]');
      if (taHover) addTodos(DATA.posts[+taHover.getAttribute("data-post")]);
      // 투표 (체크박스/옵션 위를 지나가면 투표)
      var vo = e.target.closest('.feed-content .mmc-vopt[data-act="vote"]');
      if (vo) { if (vo !== lastVote) { lastVote = vo; var p3 = DATA.posts[+vo.getAttribute("data-post")], oi = +vo.getAttribute("data-opt"); if (!p3.options[oi].voted) { voteFor(p3, oi); if (g) g.award(8, vo); render(); } } } else lastVote = null;
      // Invite 버튼에 지나가면 Internal에 3명 추가 + 인원수/“+2”→“+5” 갱신
      if (e.target.closest('.sub .chipbtn.invite')) addInternalPeople();
    });
  }

  // Invite hover → Participants의 Internal에 3명 추가, 인원/“+2” 갱신
  var _inviteDone = false;
  function addInternalPeople() {
    if (_inviteDone) return; _inviteDone = true;
    var card = document.querySelector('.parts .parts-card'); if (!card) { _inviteDone = false; return; }
    var foot = card.querySelector('.parts-foot');
    var chatIcon = (card.querySelector('.part .chat') || {}).innerHTML || '';
    var NEW = (window.MM_C && MM_C('pc.participantsInvited')) || [
      { name: "이준호", role: "Engineer", color: "#7BC3A0", photo: "assets/profile/man1.png" },
      { name: "카토 리쿠", role: "Sales", color: "#8FA4E6", photo: "assets/profile/man3.png" },
      { name: "정우성", role: "Support", color: "#E6B45B", photo: "assets/profile/man5.png" }
    ];
    NEW.forEach(function (p, i) {
      var div = document.createElement('div'); div.className = 'part';
      div.innerHTML = '<span class="pa" style="background:' + p.color + ' url(' + p.photo + ') center/cover"></span>' +
        '<div class="pi"><div class="pn">' + esc(p.name) + '</div><div class="pc">' + esc(p.role) + '</div></div>' +
        '<span class="chat">' + chatIcon + '</span>';
      if (foot) card.insertBefore(div, foot); else card.appendChild(div);
      if (window.MM_MOTION) div.animate([{ opacity: 0, transform: "translateX(16px) scale(.92)" }, { opacity: 1, transform: "translateX(0) scale(1)" }], { duration: 440, delay: i * 140, easing: "cubic-bezier(.2,.85,.3,1)", fill: "backwards" });
    });
    [].forEach.call(card.querySelectorAll('.parts-sec'), function (s) { if (s.textContent.indexOf('Internal') === 0) { var c = s.querySelector('.cnt'); if (c) c.textContent = '(6)'; } });
    var ph = document.querySelector('.parts .parts-h b'); if (ph) ph.textContent = '8';
    var more = document.querySelector('.sub .ppl .more'); if (more) more.textContent = '+5';
    if (window.MM_TOAST) window.MM_TOAST("Internal 멤버 3명을 초대했습니다");
  }

  function postLaterComment() {
    // 댓글은 나중에 등록되게 — 로드 후 잠시 뒤 첫 TASK에 댓글이 달림
    setTimeout(function () {
      var p = DATA.posts[0]; if (!p || (p._comments && p._comments.length)) return;
      p._comments = [{ author: commentAuthorForPost(p), text: commentForPost(p) }]; render();
      var card = document.querySelector('.mmc-card[data-card="0"] .mmc-cmt');
      if (card && window.MM_MOTION) window.MM_MOTION.commentPop(card);
      // 댓글이 달리면 자동으로 그 댓글의 좋아요가 눌림
      setTimeout(function () {
        var c0 = DATA.posts[0]._comments && DATA.posts[0]._comments[0]; if (!c0 || c0._liked) return;
        c0._liked = true; render();
        var clk = document.querySelector('.mmc-card[data-card="0"] .mmc-cmt .clk');
        if (clk && window.MM_MOTION) window.MM_MOTION.smiles(clk);
      }, 950);
    }, 3200);
  }
  // 룰렛에서 고른 프로필을 Project manager로 반영 — PM은 항상 1명만(기존 PM 슬롯을 교체)
  function addProjectManager(person) {
    var card = document.querySelector('.parts .parts-card'); if (!card || !person) return;
    var secs = card.querySelectorAll('.parts-sec');
    var pmSec = secs[0];
    // PM 섹션의 첫 멤버 part를 찾아 그 사람으로 교체(없으면 새로 삽입)
    var pmPart = pmSec.nextElementSibling;
    var color = person.color || "#9DC8FF", photo = person.photo || (window.MM_AV ? MM_AV.photo(person.name) : "");
    var chatIcon = (card.querySelector('.part .chat') || {}).innerHTML || '';
    var html = '<span class="pa" style="background:' + color + ' url(' + photo + ') center/cover"><span class="pa-skel"></span></span>' +
      '<div class="pi"><div class="pn">' + esc(person.name) + '</div><div class="pc">Project Manager</div></div>' +
      '<span class="chat">' + chatIcon + '</span>';
    if (pmPart && pmPart.classList.contains('part')) {
      pmPart.innerHTML = html; // 기존 PM 슬롯 교체 → 1명 유지
    } else {
      pmPart = document.createElement('div'); pmPart.className = 'part'; pmPart.innerHTML = html;
      pmSec.parentNode.insertBefore(pmPart, pmSec.nextSibling);
    }
    var cnt = pmSec.querySelector('.cnt'); if (cnt) cnt.textContent = '(1)';
    var pa = pmPart.querySelector('.pa');
    if (window.MM_MOTION && pa) {
      pmPart.animate([{ opacity: .2 }, { opacity: 1 }], { duration: 360, easing: "ease-out" });
      pa.animate([{ transform: "scale(2.4)" }, { transform: "scale(.88)", offset: .7 }, { transform: "scale(1)" }], { duration: 720, easing: "cubic-bezier(.3,1.4,.5,1)" });
    }
    setTimeout(function () { var sk = pa && pa.querySelector('.pa-skel'); if (sk && sk.parentNode) sk.parentNode.removeChild(sk); }, 1150);
    /* 자동 토스트 자막 제거(사용자 요청): "OOO님이 Project manager가 되었습니다" 안 띄움 */
  }

  // Feed에 들어왔을 때 Participants가 task 카드처럼 한 명씩(섹션 포함) 순차 등장
  function revealParticipants(force) {
    var m = window.MM_MOTION; if (!m || !m.enabled) return;
    var card = document.querySelector('.parts .parts-card'); if (!card) return;
    if (card._revealed && !force) return; card._revealed = true;
    var h = document.querySelector('.parts .parts-h');
    if (h) h.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 340, easing: "ease-out", fill: "backwards" });
    [].slice.call(card.children).forEach(function (el, i) {
      el.animate([
        { opacity: 0, transform: "translateY(16px) scale(.95)" },
        { opacity: 1, transform: "translateY(-3px) scale(1.02)", offset: .7 },
        { opacity: 1, transform: "translateY(0) scale(1)" }
      ], { duration: 460, delay: 120 + i * 130, easing: "cubic-bezier(.2,.85,.3,1)", fill: "backwards" });
    });
  }
  function maybeRevealParts(force) {
    var sec = document.querySelector('.vsec[data-view="feed"]');
    if (sec && !sec.classList.contains("on")) return;
    revealParticipants(force);
  }
  // 첫 번째 task의 작성자를 Project manager 프로필로 지정
  function setFirstTaskAuthor(person) {
    if (!person || !DATA.posts[0]) return;
    DATA.posts[0].author = { name: person.name, role: "Project Manager", team: "[일본] 프리랜서 협업방", color: person.color || "#9DC8FF" };
    DATA.posts[0]._authorPinned = true;  // 언어 전환(syncFeed) 시에도 PM 작성자 유지
    render();
  }
  // 로고뷰(다른 페이지)에서 선택해 넘어온 경우 — 피드 진입 시 PM 합류 + 첫 task 작성자=PM + 참여자 다 열리면 첫 task 자동 오픈
  function consumePendingPM() {
    var raw = null; try { raw = sessionStorage.getItem("mm_pm"); } catch (e) {}
    if (!raw) return;
    try { sessionStorage.removeItem("mm_pm"); } catch (e) {}
    var p; try { p = JSON.parse(raw); } catch (e) { return; }
    if (!p || !p.name) return;
    setFirstTaskAuthor(p);
    setTimeout(function () { addProjectManager(p); }, 1100);
    /* TASK 자동 팝업 제거(사용자 요청): FEED 진입 시 task 모달 자동 오픈 안 함 */
  }
  // 콘텐츠(언어별) 피드를 DATA.posts 로 주입. PM 작성자 오버라이드는 보존.
  function syncFeedFromContent() {
    if (!window.MM_C) return;
    var f = window.MM_C('pc.feed');
    if (!f || !f.length) return;
    var pinned = (DATA.posts && DATA.posts[0] && DATA.posts[0]._authorPinned) ? DATA.posts[0].author : null;
    DATA.posts = f;
    if (pinned) { f[0].author = pinned; f[0]._authorPinned = true; }
  }

  function boot() {
    syncFeedFromContent();
    wire(); var ok = render();
    // Feed 탭으로 다시 들어올 때마다 Participants 재등장
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest('.tabs .tab[data-view="feed"]')) {
        var card = document.querySelector('.parts .parts-card'); if (card) card._revealed = false;
        setTimeout(function () { maybeRevealParts(true); }, 60);
      }
    });
    if (ok) { setTimeout(function () { maybeRevealParts(false); consumePendingPM(); }, 120); return; }
    var n = 0, t = setInterval(function () { if (render() || ++n > 20) { clearInterval(t); setTimeout(function () { maybeRevealParts(false); consumePendingPM(); }, 120); } }, 150);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__MMC = {
    DATA: DATA, render: render, cardHtml: cardHtml,
    revealParticipants: function () { var card = document.querySelector('.parts .parts-card'); if (card) card._revealed = false; maybeRevealParts(true); },
    addProjectManager: addProjectManager,
    setFirstTaskAuthor: setFirstTaskAuthor
  };
  // 언어 전환 시 콘텐츠 피드 교체 후 다시 렌더(번역 반영)
  document.addEventListener('mm:lang', function () { try { syncFeedFromContent(); render(); } catch (e) {} });
})();
