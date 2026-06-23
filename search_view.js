/* =========================================================================
   search_view.js — Smart Search 결과 화면
   상단 "Smart Search" 바에 키워드 입력 후 Enter → 결과 오버레이 표시
   섹션: Post / Comment / Project File / Chat (+ Project 탭), 우측 Filter 패널
   ========================================================================= */
(function () {
  "use strict";
  function TL(k, fb) { var t = window.MM_TR && window.MM_TR(k); return (t && t !== k) ? t : fb; }

  var DATA = {
    posts: [
      { title: "[프리랜서 계약서] 일본 마케팅 - 김우중 계약 조건 검토 요청", body: "차주 수요일(22일)부터 하루 8시간 근무 기준, 2개월 단기 계약서로 작성했습니다. 계약서 초안(업무 범위·계약 기간·보수 지급일) 공유드리니 검토 후 회신 부탁드립니다. 단기 계약 후 성과에 따라 장기 계약서로 전환 예정입니다...", who: "Soyun Noh", date: "04-06-2026 12:36", tag: "Task", proj: "[일본] 프리랜서 협업방", color: "#F5524A" },
      { title: "SANO HARUKA 2026 업무위탁 계약서 갱신 건", body: "기존 계약서 만료(5/31)에 따라 갱신 계약서를 준비했습니다. 보수 조건은 동일하되 업무 범위에 영상 편집을 추가했습니다. 표준 계약서 양식 기준이며, 전자서명으로 진행 예정입니다. 계약서 확인 후 서명 부탁드립니다...", who: "Hyejo Seo", date: "30-05-2026 10:12", tag: "Task", proj: "[일본] 프리랜서 협업방", color: "#F5524A" },
      { title: "[법무 검토] 일본 현지 프리랜서 표준 계약서 양식 확정", body: "현지 프리랜서용 표준 계약서 양식을 법무 검토 완료했습니다. 앞으로 신규 계약은 이 계약서 양식으로 통일합니다. 첨부된 계약서 템플릿 확인 부탁드립니다...", who: "June Lee", date: "28-05-2026 16:40", tag: "Task", proj: "[일본] 프리랜서 협업방", color: "#F5524A" },
      { title: "전시회 부스 시공업체 계약서 날인 요청", body: "Japan IT Week 부스 시공업체와의 계약서 날인이 필요합니다. 계약 금액과 일정 확인 후 결재 부탁드립니다...", who: "장아람", date: "27-04-2026 11:06", tag: "Task", proj: "Japan Business", color: "#19B43A" },
      { title: "광고 대행사 연간 계약서 조건 협의 메모", body: "야후재팬·구글 광고 대행사와 연간 계약서 조건을 협의 중입니다. 계약서상 최소 집행 금액과 수수료율 조항을 조정하고 있습니다...", who: "Kimura Takuya", date: "14-05-2026 19:49", tag: "Task", proj: "[일본] 프리랜서 협업방", color: "#F5524A" }
    ],
    comments: [
      { text: "계약서 초안 확인했습니다. 보수 지급일 조항만 '월말 정산'으로 수정 부탁드려요.", who: "June Lee", date: "04-06-2026 13:10", proj: "[프리랜서 계약서] 일본 마케팅 - 김우중" },
      { text: "계약서상 업무 범위가 조금 넓은 것 같은데, 영상 편집은 별도 건으로 빼는게 좋을까요?", who: "SANO HARUKA", date: "30-05-2026 11:02", proj: "SANO HARUKA 2026 업무위탁 계약서 갱신" },
      { text: "표준 계약서 양식 첨부했습니다. 다음 계약부터는 이대로 진행하면 될 것 같아요!", who: "Hyejo Seo", date: "28-05-2026 17:20", proj: "표준 계약서 양식 확정" },
      { text: "전자서명으로 계약서 날인 완료했습니다. 원본은 법무 폴더에 보관할게요.", who: "장아람", date: "27-04-2026 15:33", proj: "부스 시공업체 계약서" },
      { text: "계약서 보수 조건 좋네요 👍 김우중님께도 조건 공유드렸습니다.", who: "Soyun Noh", date: "04-06-2026 14:05", proj: "[프리랜서 계약서] 일본 마케팅 - 김우중" }
    ],
    files: [
      { name: "20260604_김우중_프리랜서_계약서_v2.pdf", who: "Soyun Noh", date: "04-06-2026 12:40", proj: "[일본] 프리랜서 협업방", size: "1.12 MB" }
    ],
    chats: [
      { text: "계약서 초안 방금 공유드렸어요! 보수 조건 확인 부탁드려요", who: "Soyun Noh", date: "04-06-2026 12:38", proj: "SANO HARUKA" },
      { text: "계약서 보수는 월말 정산으로 통일할게요. 다음 갱신 계약서도 동일하게요!", who: "Soyun Noh", date: "08-06-2026 12:22", proj: "Soyun Noh, Hyejo Seo, June Lee" },
      { text: "표준 계약서 양식 확정되면 기존 프리랜서분들 계약서도 순차적으로 갱신할까요?", who: "Hyejo Seo", date: "28-05-2026 20:48", proj: "Hyejo Seo" },
      { text: "대표님~ 전시회 시공업체 계약서 금액 컨펌해주시면 바로 날인 진행하겠습니다!", who: "장아람", date: "27-04-2026 10:31", proj: "🔴[일본] 한국X일본XMWI 마케팅 협업방" },
      { text: "계약서 원본 스캔본 드라이브에 올렸습니다. 법무 폴더에서 확인 가능하세요!", who: "Kimura Takuya", date: "14-05-2026 13:36", proj: "자료 공유 방" }
    ],
    projects: [
      { name: "[일본] 프리랜서 계약 · 법무 협업방", who: "Soyun Noh", date: "01-02-2026 09:00", color: "#F5524A" },
      { name: "English Markets GTM — 벤더 계약서 관리", who: "Kate Lee", date: "12-03-2026 14:20", color: "#19B43A" }
    ]
  };

  var KW = "계약서";
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function hl(t) {
    var s = esc(t); if (!KW) return s;
    var k = esc(KW).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return s.replace(new RegExp(k, "g"), '<span class="ss-hl">' + esc(KW) + '</span>');
  }

  var IC = {
    list: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9a9aa2" stroke-width="1.8" stroke-linecap="round"><path d="M8 7h11M8 12h11M8 17h11"/><circle cx="4" cy="7" r="1.1" fill="#9a9aa2" stroke="none"/><circle cx="4" cy="12" r="1.1" fill="#9a9aa2" stroke="none"/><circle cx="4" cy="17" r="1.1" fill="#9a9aa2" stroke="none"/></svg>',
    cmt: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9a9aa2" stroke-width="1.7" stroke-linejoin="round"><path d="M21 11.5a8 8 0 01-8 8 8 8 0 01-3.5-.8L3 20l1.3-4.5A8 8 0 0113 3.5a8 8 0 018 8z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9a9aa2" stroke-width="1.7" stroke-linejoin="round"><path d="M20 4H4a1 1 0 00-1 1v11a1 1 0 001 1h3v3l4-3h9a1 1 0 001-1V5a1 1 0 00-1-1z"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#b6b6be" stroke-width="1.7"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6"/></svg>',
    file: '<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M6 2h9l5 5v15H6z" opacity=".25"/><path d="M6 2h9l5 5h-5z" fill="#fff"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-4-4 4-4M5 10h9a5 5 0 010 10h-1"/></svg>',
    spark: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z"/><path d="M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/></svg>',
    proj: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="7" y="3" width="13" height="13" rx="2"/><path d="M4 7v12a1 1 0 001 1h12"/></svg>',
    post: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/></svg>',
    cmt2: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M21 11.5a8 8 0 01-8 8 8 8 0 01-3.5-.8L3 20l1.3-4.5A8 8 0 0113 3.5a8 8 0 018 8z"/></svg>',
    chat2: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M20 4H4a1 1 0 00-1 1v11a1 1 0 001 1h3v3l4-3h9a1 1 0 001-1V5a1 1 0 00-1-1z"/></svg>',
    folder: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>'
  };

  function meta(it, withTag) {
    var dot = it.color ? '<span class="ss-pdot" style="background:' + it.color + '"></span>' : '';
    return '<div class="ss-meta"><span class="mu">' + IC.user + ' ' + esc(it.who) + '</span><span class="sep">|</span><span>' + esc(it.date) + '</span>' +
      (withTag ? '<span class="sep">|</span><span class="ss-tg">' + esc(it.tag || "Task") + '</span>' : '') +
      '<span class="sep">|</span><span class="mp">' + dot + esc(it.proj) + '</span></div>';
  }
  function postRow(it) {
    return '<div class="ss-row"><span class="ss-ic">' + IC.list + '</span><div class="ss-rb">' +
      '<div class="ss-rt">' + hl(it.title) + '</div>' +
      (it.body ? '<div class="ss-rx">' + hl(it.body) + '</div>' : '') + meta(it, true) + '</div></div>';
  }
  function lineRow(icon, it) {
    return '<div class="ss-row"><span class="ss-ic">' + icon + '</span><div class="ss-rb">' +
      '<div class="ss-rx2">' + hl(it.text) + '</div>' + meta(it, false) + '</div></div>';
  }
  function fileRow(it) {
    return '<div class="ss-row"><span class="ss-fic">' + IC.file + '</span><div class="ss-rb">' +
      '<div class="ss-rt">' + hl(it.name) + '</div>' +
      '<div class="ss-meta"><span class="mu">' + IC.user + ' ' + esc(it.who) + '</span><span class="sep">|</span><span>' + esc(it.date) + '</span><span class="sep">|</span><span class="mp">' + esc(it.proj) + '</span><span class="sep">|</span><span>' + esc(it.size) + '</span></div></div></div>';
  }
  function projRow(it) {
    return '<div class="ss-row"><span class="ss-ic">' + IC.list + '</span><div class="ss-rb">' +
      '<div class="ss-rt"><span class="ss-pdot" style="background:' + it.color + '"></span>' + hl(it.name) + '</div>' +
      '<div class="ss-meta"><span class="mu">' + IC.user + ' ' + esc(it.who) + '</span><span class="sep">|</span><span>' + esc(it.date) + '</span></div></div></div>';
  }
  function section(title, count, rowsHtml, key) {
    return '<div class="ss-sec" data-sec="' + key + '"><div class="ss-sh">' + title + ' <b>' + count + '</b></div>' +
      '<div class="ss-list">' + rowsHtml + '</div><div class="ss-more">' + TL('search.more','More →').replace(' →','') + ' <span>→</span></div></div>';
  }

  function contentHtml() {
    var sec = '';
    sec += section(TL('search.section.project','Project'), DATA.projects.length, DATA.projects.map(projRow).join(""), "project");
    sec += section(TL('search.section.post','Post'), "5+", DATA.posts.map(postRow).join(""), "post");
    sec += section(TL('search.section.comment','Comment'), "5+", DATA.comments.map(function (c) { return lineRow(IC.cmt, c); }).join(""), "comment");
    sec += section(TL('pc.projectFile','Project File'), DATA.files.length, DATA.files.map(fileRow).join(""), "file");
    sec += section(TL('search.section.chat','Chat'), "5+", DATA.chats.map(function (c) { return lineRow(IC.chat, c); }).join(""), "chat");
    return sec;
  }
  function filterHtml() {
    return '<div class="ss-fil">' +
      '<div class="ss-fh">' + TL('pc.filter','Filter') + ' <span class="ss-reset">' + TL('pc.filterReset','Reset') + ' ⟳</span></div>' +
      '<div class="ss-fg"><div class="ss-fl">⇅ ' + TL('pc.sort','Sort') + '</div><div class="ss-chips" data-grp="sort"><span class="on">' + TL('pc.related','Related') + '</span><span>' + TL('pc.latest','Latest') + '</span><span>' + TL('pc.oldest','Oldest') + '</span></div></div>' +
      '<div class="ss-fg"><div class="ss-fl">📅 ' + TL('pc.dateRange','Date Range') + '</div><div class="ss-chips wrap" data-grp="date"><span class="on">' + TL('pc.all','All') + '</span><span>' + TL('pc.today','Today') + '</span><span>' + TL('pc.week','Week') + '</span><span>' + TL('pc.month1','1 month') + '</span><span>' + TL('pc.months6','6 months') + '</span><span>' + TL('pc.custom','Custom') + '</span></div></div>' +
      '<div class="ss-fg"><div class="ss-fl">' + IC.user + ' ' + TL('pc.creator','Creator') + '</div><div class="ss-finput">' + TL('pc.searchByAuthors','Search by authors') + '</div></div>' +
      '<div class="ss-fg"><div class="ss-fl">▥ ' + TL('pc.project','Project') + '</div><div class="ss-finput">' + TL('pc.searchByProject','Search by project') + '</div></div>' +
      '</div>';
  }

  function ensureStyle() {
    if (document.getElementById("mm-search-style")) return;
    var st = document.createElement("style"); st.id = "mm-search-style"; st.textContent = CSS; document.head.appendChild(st);
  }
  function buildOverlay() {
    if (document.getElementById("mm-search")) return;
    ensureStyle();
    var o = document.createElement("div"); o.id = "mm-search";
    o.innerHTML =
      '<div class="ss-top"><button class="ss-back">' + IC.back + ' ' + TL('pc.goBack','뒤로가기') + '</button><div class="ss-title"><span class="kw"></span> ' + TL('pc.searchResults','검색 결과') + '</div></div>' +
      '<div class="ss-tabs">' +
      '<span class="ss-tab ss-schip"><span class="ic">' + IC.spark + '</span>' + TL('pc.searchChip','검색') + '</span>' +
      '<span class="ss-sep2"></span>' +
      '<span class="ss-tab on" data-tab="all"><span class="ic">' + IC.grid + '</span>' + TL('search.tab.all','전체 결과') + '</span>' +
      '<span class="ss-tab" data-tab="project"><span class="ic">' + IC.proj + '</span>' + TL('search.tab.project','프로젝트') + '</span>' +
      '<span class="ss-tab" data-tab="post"><span class="ic">' + IC.post + '</span>' + TL('search.tab.post','게시물') + '</span>' +
      '<span class="ss-tab" data-tab="comment"><span class="ic">' + IC.cmt2 + '</span>' + TL('search.tab.comment','댓글') + '</span>' +
      '<span class="ss-tab" data-tab="chat"><span class="ic">' + IC.chat2 + '</span>' + TL('search.tab.chat','채팅') + '</span>' +
      '<span class="ss-tab" data-tab="file"><span class="ic">' + IC.folder + '</span>' + TL('search.tab.file','파일') + '</span>' +
      '</div>' +
      '<div class="ss-main"><div class="ss-content"></div>' + filterHtml() + '</div>';
    (document.querySelector(".main") || document.body).appendChild(o);
    wire(o);
  }

  function setTab(o, tab) {
    [].forEach.call(o.querySelectorAll(".ss-tab"), function (t) { t.classList.toggle("on", t.getAttribute("data-tab") === tab); });
    [].forEach.call(o.querySelectorAll(".ss-sec"), function (s) {
      var sec = s.getAttribute("data-sec");
      // Results(all)에는 Project 섹션 제외 → Post/Comment/File/Chat 노출
      var show = (tab === "all") ? (sec !== "project") : (sec === tab);
      s.style.display = show ? "" : "none";
    });
    o.querySelector(".ss-content").scrollTop = 0;
  }

  function wire(o) {
    o.querySelector(".ss-back").addEventListener("click", close);
    o.addEventListener("click", function (e) {
      var tab = e.target.closest(".ss-tab"); if (tab) { setTab(o, tab.getAttribute("data-tab")); return; }
      var chip = e.target.closest(".ss-chips span"); if (chip) { [].forEach.call(chip.parentNode.children, function (c) { c.classList.remove("on"); }); chip.classList.add("on"); return; }
      var reset = e.target.closest(".ss-reset"); if (reset) { o.querySelectorAll('.ss-chips[data-grp="sort"] span')[0].click && setChip(o, "sort", "Related"); setChip(o, "sort", "Related"); setChip(o, "date", "All"); return; }
      var more = e.target.closest(".ss-more"); if (more) { if (window.MM_TOAST) window.MM_TOAST("더 많은 결과 불러오기"); return; }
      var row = e.target.closest(".ss-row"); if (row) { if (window.MM_TOAST) window.MM_TOAST("결과 항목 열기"); return; }
    });
  }
  function setChip(o, grp, label) {
    var box = o.querySelector('.ss-chips[data-grp="' + grp + '"]'); if (!box) return;
    [].forEach.call(box.children, function (c) { c.classList.toggle("on", c.textContent.trim() === label); });
  }

  function open(kw) {
    buildOverlay();
    KW = kw || (window.MM_C && MM_C('pc.search.kw')) || "행사";
    var o = document.getElementById("mm-search");
    o.querySelector(".kw").textContent = KW;
    o.querySelector(".ss-content").innerHTML = contentHtml();
    setTab(o, "all");
    o.classList.add("on");
    if (window.MM_MOTION) o.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
    // 결과 카드(행)가 스크롤될 때마다 하나씩 생성되는 효과
    setupScrollReveal(o);
  }
  // post/comment/file/chat 등 결과 행을 스크롤 진입 시 하나씩 등장(스크롤 기반 + 안전망)
  function setupScrollReveal(o) {
    if (!(window.MM_MOTION && window.MM_MOTION.enabled)) return;
    var root = o.querySelector(".ss-content");
    var rows = [].slice.call(o.querySelectorAll(".ss-row"));
    rows.forEach(function (r) { r.style.opacity = "0"; r.style.transform = "translateY(18px)"; });
    if (!root) { rows.forEach(function (r) { r.style.opacity = ""; r.style.transform = ""; }); return; }
    var seen = 0;
    function revealRow(r) {
      if (r._rev) return; r._rev = true;
      var d = (seen++ % 6) * 70;
      setTimeout(function () { r.style.transition = "opacity .42s ease, transform .45s cubic-bezier(.2,.8,.3,1)"; r.style.opacity = "1"; r.style.transform = "translateY(0)"; }, d);
    }
    function check() {
      var rb = root.getBoundingClientRect();
      rows.forEach(function (r) { if (r._rev) return; var cr = r.getBoundingClientRect(); if (cr.top < rb.bottom - 8 && cr.bottom > rb.top) revealRow(r); });
    }
    root.addEventListener("scroll", check);
    check(); // 처음 보이는 행부터 순차 등장
    // 안전망: 일정 시간 뒤 남은 행 모두 표시(스크롤 안 해도 결과가 비지 않게)
    setTimeout(function () { rows.forEach(function (r) { if (!r._rev) revealRow(r); }); }, 1500);
  }
  function close() {
    var o = document.getElementById("mm-search"); if (o) o.classList.remove("on");
    var bar = document.querySelector(".top .search"); if (bar) { bar._ssAuto = false; var inp = bar.querySelector(".ss-barinput"); if (inp) inp.value = ""; }
  }

  /* ---- 상단 Smart Search 바 연결 ---- */
  function wireBar() {
    var bar = document.querySelector(".top .search"); if (!bar) return false;
    if (bar.dataset.ssWired) return true; bar.dataset.ssWired = "1";
    ensureStyle(); // 검색바 스타일(투명 배경/흰 글씨)을 부팅 시점에 즉시 주입
    var lz = bar.querySelector(".lz"), mg = bar.querySelector(".mg");
    var input = document.createElement("input"); input.className = "ss-barinput"; input.placeholder = TL('pc.smartSearch', 'Smart Search');
    input.setAttribute("autocomplete", "off"); input.setAttribute("autocorrect", "off"); input.setAttribute("spellcheck", "false"); input.setAttribute("name", "mm-smart-search-" + Math.floor(performance.now()));
    var txt = bar.querySelector(".txt"); if (txt) bar.replaceChild(input, txt); else bar.insertBefore(input, mg || null);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && input.value.trim()) open(input.value.trim()); });
    if (mg) mg.addEventListener("click", function () { if (input.value.trim()) open(input.value.trim()); else { input.focus(); } });
    // 마우스를 올리면 placeholder가 사라지고 '계약서'가 자동 타이핑되어 검색 실행
    bar.addEventListener("mouseenter", function () {
      if (bar._ssAuto) return; bar._ssAuto = true;
      var kw = (window.MM_C && MM_C('pc.search.kw')) || KW || "계약서"; input.value = ""; var i = 0;   // 언어별 키워드
      (function step() {
        if (!bar._ssAuto) return;
        if (i <= kw.length) { input.value = kw.slice(0, i); i++; setTimeout(step, 120); }
        else { setTimeout(function () { if (bar._ssAuto) open(kw); }, 380); }
      })();
    });
    return true;
  }

  var CSS = [
    ".main{position:relative;}",
    "#mm-search{position:absolute;inset:0;z-index:60;background:#F4F2F7;display:none;flex-direction:column;font-family:Roboto,'Noto Sans KR','Noto Sans JP',sans-serif;color:#2b2b33;}",
    "#mm-search.on{display:flex;}",
    ".ss-top{display:flex;align-items:center;justify-content:flex-start;gap:16px;height:52px;padding:0 22px;border-bottom:1px solid #E8E6EE;background:#fff;flex-shrink:0;}",
    ".ss-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#555;background:#fff;border:1px solid #E2E2E8;border-radius:8px;padding:7px 13px;cursor:pointer;flex-shrink:0;}",
    ".ss-back:hover{background:#F6F6F8;}",
    ".ss-title{font-size:17px;font-weight:700;}.ss-title .kw{color:#6449FC;}",
    ".ss-tabs{display:flex;align-items:center;gap:8px;height:48px;padding:0 22px;border-bottom:1px solid #E8E6EE;background:#fff;flex-shrink:0;overflow-x:auto;scrollbar-width:none;}.ss-tabs::-webkit-scrollbar{display:none;}",
    ".ss-tab{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;color:#555;background:#F1F1F4;border-radius:18px;padding:7px 15px;cursor:pointer;border:1px solid transparent;white-space:nowrap;flex-shrink:0;}",
    ".ss-tab .ic{display:inline-flex;color:#8a8a92;}",
    ".ss-tab:hover{background:#E9E9EE;}",
    ".ss-tab.on{background:#1f1f27;color:#fff;}.ss-tab.on .ic{color:#fff;}",
    ".ss-schip{background:#F1F1F4;cursor:default;}.ss-schip .ic{color:#7B5BFF;}",
    ".ss-sep2{width:1px;height:22px;background:#E2E2E8;flex-shrink:0;margin:0 2px;}",
    ".ss-main{flex:1;display:flex;justify-content:center;gap:26px;overflow:hidden;padding:14px 22px 22px;}",
    ".ss-content{flex:0 1 676px;max-width:676px;overflow:auto;display:flex;flex-direction:column;gap:18px;}",
    ".ss-sec{border:1px solid #ECECEF;border-radius:14px;padding:18px 20px;background:#fff;}",
    ".ss-sh{font-size:16px;font-weight:700;margin-bottom:8px;}.ss-sh b{color:#6449FC;font-weight:700;margin-left:2px;}",
    ".ss-list{}",
    ".ss-row{display:flex;gap:12px;padding:14px 4px;border-top:1px solid #F4F4F6;cursor:pointer;}.ss-row:first-child{border-top:none;}",
    ".ss-row:hover{background:#FAFAFB;border-radius:8px;}",
    ".ss-ic{width:30px;height:30px;border-radius:8px;background:#F4F4F6;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
    ".ss-fic{width:34px;height:34px;border-radius:8px;background:#F2C94C;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
    ".ss-rb{flex:1;min-width:0;}",
    ".ss-rt{font-size:14.5px;font-weight:700;color:#2b2b33;margin-bottom:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:7px;}",
    ".ss-rx{font-size:13px;color:#777;line-height:1.6;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}",
    ".ss-rx2{font-size:13.5px;color:#444;line-height:1.6;margin-bottom:7px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}",
    ".ss-hl{color:#6449FC;font-weight:700;}",
    ".ss-meta{display:flex;align-items:center;gap:8px;font-size:12px;color:#9a9aa2;flex-wrap:wrap;}",
    ".ss-meta .mu{display:inline-flex;align-items:center;gap:4px;}.ss-meta .sep{color:#d8d8de;}",
    ".ss-meta .ss-tg{color:#555;font-weight:600;}",
    ".ss-meta .mp{display:inline-flex;align-items:center;gap:5px;color:#777;}",
    ".ss-pdot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}",
    ".ss-more{text-align:center;font-size:13px;color:#666;background:#F7F7F9;border-radius:8px;padding:11px 0;margin-top:10px;cursor:pointer;}.ss-more:hover{background:#F0F0F3;}.ss-more span{margin-left:4px;}",
    /* filter */
    ".ss-fil{width:300px;flex-shrink:0;border:1px solid #ECECEF;border-radius:14px;padding:18px 18px;height:fit-content;background:#fff;}",
    ".ss-fh{display:flex;align-items:center;justify-content:space-between;font-size:15px;font-weight:700;margin-bottom:16px;}",
    ".ss-reset{font-size:12.5px;color:#999;font-weight:500;cursor:pointer;}.ss-reset:hover{color:#6449FC;}",
    ".ss-fg{margin-bottom:18px;}.ss-fl{display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:#444;margin-bottom:9px;}",
    ".ss-chips{display:flex;gap:7px;}.ss-chips.wrap{flex-wrap:wrap;}",
    ".ss-chips span{font-size:12.5px;color:#555;border:1px solid #E4E4EA;border-radius:7px;padding:6px 12px;cursor:pointer;}",
    ".ss-chips span:hover{border-color:#C9BFF7;}",
    ".ss-chips span.on{background:#EFECFF;color:#6449FC;border-color:#D9D2FF;font-weight:600;}",
    ".ss-finput{font-size:13px;color:#aaa;border:1px solid #E4E4EA;border-radius:8px;padding:10px 12px;}",
    ".ss-barinput{flex:1;background:transparent !important;border:none;outline:none;color:#fff;font-size:13px;font-family:inherit;min-width:0;text-align:center;appearance:none;-webkit-appearance:none;caret-color:#fff;}",
    ".ss-barinput::placeholder{color:#dcdce2;}",
    /* Chrome 자동완성이 흰 배경+검은 글씨로 덮는 것 방지 → 검색바 색(#3A3742)으로 고정 */
    ".ss-barinput:-webkit-autofill,.ss-barinput:-webkit-autofill:hover,.ss-barinput:-webkit-autofill:focus,.ss-barinput:-webkit-autofill:active{-webkit-text-fill-color:#fff !important;-webkit-box-shadow:0 0 0 1000px #3A3742 inset !important;box-shadow:0 0 0 1000px #3A3742 inset !important;caret-color:#fff !important;transition:background-color 99999s ease-in-out 0s;}",
    "@media(max-width:900px){.ss-main{flex-direction:column;justify-content:flex-start;align-items:center;}.ss-content{flex:0 1 auto;width:100%;}.ss-fil{width:100%;}}"
  ].join("\n");

  // 언어별 검색 콘텐츠/키워드 주입
  function syncSearchFromContent() {
    if (!window.MM_C) return;
    var s = window.MM_C('pc.search');
    if (s) { if (s.posts) DATA.posts = s.posts; if (s.comments) DATA.comments = s.comments; if (s.files) DATA.files = s.files; if (s.chats) DATA.chats = s.chats; if (s.projects) DATA.projects = s.projects; if (s.kw) KW = s.kw; }
  }
  syncSearchFromContent();
  function boot() { if (wireBar()) return; var n = 0, t = setInterval(function () { if (wireBar() || ++n > 40) clearInterval(t); }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__SEARCH = { open: open, close: close };
  // 언어 전환 시 검색 오버레이/바 갱신
  document.addEventListener('mm:lang', function () {
    try {
      syncSearchFromContent();    // 언어별 검색 데이터/키워드 반영
      var bar = document.querySelector('.top .search'); var inp = bar && bar.querySelector('.ss-barinput'); if (inp) inp.placeholder = TL('pc.smartSearch', 'Smart Search');
      var o = document.getElementById('mm-search'); var wasOpen = o && o.classList.contains('on');
      if (o) o.remove();          // 결과 오버레이만 제거(검색바 스타일 #mm-search-style은 유지)
      ensureStyle();              // 혹시 스타일이 없으면 재주입(검색바 투명배경 보장)
      if (wasOpen) open(KW);
    } catch (e) {}
  });
})();
