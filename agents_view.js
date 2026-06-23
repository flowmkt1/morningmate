/* =========================================================================
   agents_view.js — 좌측 상단 morningmate 로고 클릭 시 열리는 "AI 에이전트 갤러리(룰렛)" 뷰
   - 흰 대시보드 + 좌측 아이콘 사이드바
   - 열리면 프로필 카드가 점점 '가속'(가로 모션블러)되며 흐르다 → '슬며시 감속'하여 한 카드에서 정지
   - 정지한 카드: 위로 살짝 들리며 3배 확대 + 스켈레톤(시머) + 후광(glow)
   - 정지한 프로필이 마우스 커서 프로필로 적용되고 다른 뷰/페이지에도 반영(localStorage)
   - 화면 클릭 시 다시 룰렛(재추첨) / ESC·로고로 닫기
   ========================================================================= */
(function () {
  "use strict";

  // 실제 인물 — 이름 아래에 이름 표시, 사진은 MM_AV 매핑으로 모든 뷰와 일치
  var PEOPLE = ["Soyun Noh", "SANO HARUKA", "장아람", "Hyejo Seo", "June Lee", "Kimura Takuya", "WOOJUNG KIM", "유성균", "정해성", "Kate Lee", "Jessica Baek", "김채영"];
  function photoFor(name) { return (window.MM_AV) ? MM_AV.photo(name) : "assets/profile/man1.png"; }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function cardHtml(name) {
    // 이름 제거(사진만) — 모바일 룰렛과 동일
    return '<div class="ag-card" data-name="' + name + '"><div class="ag-thumb"><img src="' + photoFor(name) + '" alt=""></div></div>';
  }
  function buildSet() {
    var one = shuffle(PEOPLE).map(cardHtml).join("");
    return one + one + one + one; // 룰렛 주행 거리 확보용 4배 복제
  }

  var SVG_FILTER = '<svg class="ag-defs" width="0" height="0" style="position:absolute"><filter id="ag-mblur" x="-30%" y="-12%" width="160%" height="124%"><feGaussianBlur stdDeviation="0 0"/></filter></svg>';

  var CSS = [
    "#mm-agents{position:fixed;inset:0;z-index:1700;background:#fff;display:none;opacity:0;transition:opacity .4s ease;}",
    "#mm-agents.on{display:flex;opacity:1;}",
    ".ag-side{width:64px;flex-shrink:0;border-right:1px solid #EEE;display:flex;flex-direction:column;align-items:center;gap:22px;padding:14px 0;}",
    ".ag-logo{width:30px;height:30px;cursor:pointer;display:flex;align-items:center;}",
    ".ag-logo img{width:100%;height:auto;display:block;}",
    ".ag-ic{color:#C9C9D2;font-size:21px;line-height:1;cursor:pointer;}",
    ".ag-sep{width:24px;height:1px;background:#EEE;}",
    ".ag-stage{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;cursor:pointer;}",
    ".ag-strip{width:100%;overflow:visible;}",
    ".ag-track{display:flex;gap:34px;width:max-content;padding:64px 34px;will-change:transform,filter;}",
    ".ag-card{width:210px;flex-shrink:0;cursor:pointer;text-align:center;}",
    ".ag-thumb{width:210px;height:210px;border-radius:22px;overflow:hidden;transition:transform .32s cubic-bezier(.2,.8,.3,1),box-shadow .32s;}",
    ".ag-thumb img{width:100%;height:100%;object-fit:cover;display:block;}",
    ".ag-card:hover .ag-thumb{transform:translateY(-16px) scale(1.06);box-shadow:0 22px 56px rgba(120,90,255,.38),0 0 0 4px rgba(140,110,255,.16);}",
    ".ag-name{margin-top:16px;font-size:18px;font-weight:700;color:#2b2b33;transition:color .2s;}",
    ".ag-card:hover .ag-name{color:#6449FC;}",
    ".ag-selclone{cursor:pointer;overflow:hidden;}",
    ".ag-track.ag-bgblur{filter:blur(8px);transition:filter .4s ease;}",
    ".ag-skel{position:absolute;inset:0;background:linear-gradient(110deg,rgba(255,255,255,0) 32%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 68%);background-size:220% 100%;animation:ag-shim 1.44s linear infinite;}",
    "@keyframes ag-shim{from{background-position:200% 0;}to{background-position:-120% 0;}}"
  ].join("");

  function build() {
    if (document.getElementById("mm-agents")) return;
    var st = document.createElement("style"); st.id = "mm-agents-style"; st.textContent = CSS; document.head.appendChild(st);
    var o = document.createElement("div"); o.id = "mm-agents";
    o.innerHTML = SVG_FILTER +
      '<div class="ag-stage"><div class="ag-strip"><div class="ag-track">' + buildSet() + '</div></div></div>';
    document.body.appendChild(o);
    wire(o);
  }

  /* ---------- 룰렛(가속→감속→정지) ---------- */
  function currentTX(el) {
    var t = getComputedStyle(el).transform; if (!t || t === "none") return 0;
    var m = t.match(/matrix.*\((.+)\)/); if (!m) return 0;
    var v = m[1].split(", "); return parseFloat(v.length === 6 ? v[4] : v[12]) || 0;
  }
  function nearestCardIndex(cards, centerX) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < cards.length; i++) { var r = cards[i].getBoundingClientRect(); var c = r.left + r.width / 2; var d = Math.abs(c - centerX); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  function clearSelection(o) {
    if (o._selClone && o._selClone.parentNode) o._selClone.parentNode.removeChild(o._selClone);
    o._selClone = null;
    [].forEach.call(o.querySelectorAll(".ag-card .ag-thumb"), function (t) { t.style.visibility = ""; });
    var track = o.querySelector(".ag-track"); if (track) track.classList.remove("ag-bgblur");
  }
  // 가속(천천히→빠르게)→감속(슬며시 정지). easeInOutQuint
  function ease(t) { return t < .5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2; }
  function spin(o) {
    if (o._spinning) return; o._spinning = true;
    if (window.MM_MOTION && MM_MOTION.setCursorVisible) MM_MOTION.setCursorVisible(false); // 주행 중 커서 숨김
    clearSelection(o);
    var track = o.querySelector(".ag-track");
    var cards = track.querySelectorAll(".ag-card");
    if (cards.length < 4) { o._spinning = false; return; }
    var stage = o.querySelector(".ag-stage"); var sRect = stage.getBoundingClientRect();
    var stageCenter = sRect.left + sRect.width / 2;
    var curTX = currentTX(track);
    var base = nearestCardIndex(cards, stageCenter);
    var ci = Math.min(cards.length - 2, base + 15 + Math.floor(Math.random() * 9)); // 15~23칸 주행
    var cRect = cards[ci].getBoundingClientRect();
    var targetTX = curTX + (stageCenter - (cRect.left + cRect.width / 2)); // 정지 시 ci 카드가 정중앙
    var blur = o.querySelector("#ag-mblur feGaussianBlur");
    track.style.filter = "url(#ag-mblur)";
    // 시간 기반 스텝(setInterval) — 속도에 비례해 가로 모션블러 적용 (이동 시간 2배)
    var T = 6800, start = Date.now(), lastTx = curTX;
    if (o._spinTimer) clearInterval(o._spinTimer);
    o._spinTimer = setInterval(function () {
      var el = Math.min(1, (Date.now() - start) / T);
      var tx = curTX + (targetTX - curTX) * ease(el);
      track.style.transform = "translateX(" + tx + "px)";
      var v = Math.abs(tx - lastTx); lastTx = tx;
      if (blur) blur.setAttribute("stdDeviation", Math.min(30, v * 0.62) + " 0");
      if (el >= 1) {
        clearInterval(o._spinTimer); o._spinTimer = null;
        if (blur) blur.setAttribute("stdDeviation", "0 0");
        track.style.filter = "";
        track.style.transform = "translateX(" + targetTX + "px)";
        o._spinning = false;
        selectCard(o, cards[ci]);
      }
    }, 16);
  }

  function selectCard(o, card) {
    var thumb = card.querySelector(".ag-thumb"), img = card.querySelector("img"); if (!img) return;
    var rect = thumb.getBoundingClientRect();
    // 뒤 카드들은 블러 처리
    var track = o.querySelector(".ag-track"); if (track) track.classList.add("ag-bgblur");
    var clone = document.createElement("div"); clone.className = "ag-selclone";
    clone.style.cssText = "position:fixed;z-index:1820;left:" + rect.left + "px;top:" + rect.top + "px;width:" + rect.width + "px;height:" + rect.height + "px;border-radius:22px;background:#eee center/cover no-repeat;background-image:url(" + img.src + ");box-shadow:0 18px 44px rgba(0,0,0,.22);transition:left .6s cubic-bezier(.2,.8,.3,1),top .6s cubic-bezier(.2,.8,.3,1),width .6s cubic-bezier(.2,.8,.3,1),height .6s cubic-bezier(.2,.8,.3,1),box-shadow .6s ease,opacity .6s ease,transform .6s ease;";
    clone.innerHTML = '<div class="ag-skel"></div>';
    document.body.appendChild(clone); o._selClone = clone;
    thumb.style.visibility = "hidden";
    var w = rect.width * 3, h = rect.height * 3, cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    setTimeout(function () {
      clone.style.left = (cx - w / 2) + "px"; clone.style.top = (cy - h / 2 - 26) + "px"; // 위로 살짝 들림
      clone.style.width = w + "px"; clone.style.height = h + "px";
      clone.style.boxShadow = "0 50px 140px rgba(120,90,255,.55)"; // 후광만(스트로크 없음)
    }, 30);
    var person = { name: card.getAttribute("data-name"), photo: img.src, color: (window.MM_AV ? MM_AV.bgColor(img.src) : "#9DC8FF") };
    clone.addEventListener("click", function (e) { e.stopPropagation(); goToFeed(o, clone, person); });
    // 선택된 프로필을 마우스 커서에 달고(이때부터 표시) 다른 뷰에도 적용
    if (window.MM_MOTION) {
      if (MM_MOTION.setCursorPhoto) MM_MOTION.setCursorPhoto(img.src);
      if (MM_MOTION.setCursorVisible) MM_MOTION.setCursorVisible(true);
    }
  }

  // 확대 카드 클릭 → 서서히 사라지며 FEED로 전환 + 참여자 등록 + 선택 인물 PM 합류
  function goToFeed(o, clone, person) {
    if (o._toFeed) return; o._toFeed = true;
    if (clone) { clone.style.opacity = "0"; clone.style.transform = "scale(1.06)"; }
    o.style.transition = "opacity .55s ease"; o.style.opacity = "0";
    setTimeout(function () {
      o.classList.remove("on"); o.style.opacity = "";
      if (o._spinTimer) { clearInterval(o._spinTimer); o._spinTimer = null; }
      o._spinning = false; o._toFeed = false;
      clearSelection(o);
      if (window.MM_MOTION && MM_MOTION.setCursorVisible) MM_MOTION.setCursorVisible(true);
      try { sessionStorage.setItem("mm_pm", JSON.stringify(person)); } catch (e) {}
      var feedTab = document.querySelector('.tabs .tab[data-view="feed"]');
      if (feedTab) {
        feedTab.click();
        // 첫 번째 task 작성자를 선택한 PM 프로필로
        if (window.__MMC && window.__MMC.setFirstTaskAuthor) window.__MMC.setFirstTaskAuthor(person);
        setTimeout(function () {
          if (window.__MMC && window.__MMC.revealParticipants) window.__MMC.revealParticipants();
          setTimeout(function () { if (window.__MMC && window.__MMC.addProjectManager) window.__MMC.addProjectManager(person); }, 900);
          /* TASK 자동 팝업 제거(사용자 요청): participants 열린 뒤 task 모달 자동 오픈 안 함 */
        }, 120);
      } else {
        location.href = "app.html#feed"; // projects_view 등에서 열린 경우(피드에서 sessionStorage로 합류 처리)
      }
    }, 580);
  }

  function open() {
    build();
    var o = document.getElementById("mm-agents");
    if (o._spinTimer) { clearInterval(o._spinTimer); o._spinTimer = null; }
    o._spinning = false; o._toFeed = false;
    clearSelection(o);
    if (window.MM_MOTION && MM_MOTION.setCursorVisible) MM_MOTION.setCursorVisible(false); // 진입 시 커서 숨김
    var track = o.querySelector(".ag-track");
    track.style.transition = "none"; track.style.transform = "translateX(0)"; track.style.filter = "";
    track.innerHTML = buildSet();
    o.classList.add("on");
    if (window.MM_MOTION) o.animate([{ opacity: 0, transform: "scale(1.05)" }, { opacity: 1, transform: "scale(1)" }], { duration: 440, easing: "cubic-bezier(.2,.8,.3,1)" });
    setTimeout(function () { spin(o); }, 280);
  }
  function close() {
    var o = document.getElementById("mm-agents"); if (!o) return;
    o.classList.remove("on");
    if (o._spinTimer) { clearInterval(o._spinTimer); o._spinTimer = null; }
    o._spinning = false;
    clearSelection(o);
    if (window.MM_MOTION && MM_MOTION.setCursorVisible) MM_MOTION.setCursorVisible(true); // 나가면 커서 복원
  }

  function wire(o) {
    var logo = o.querySelector(".ag-logo");
    if (logo) logo.addEventListener("click", function (e) { e.stopPropagation(); close(); });
    o.querySelector(".ag-stage").addEventListener("click", function () { if (!o._spinning) spin(o); }); // 클릭 → 재추첨
  }

  function wireLogo() {
    var logos = document.querySelectorAll(".sb-logo, .side-logo");
    if (!logos.length) return false;
    [].forEach.call(logos, function (logo) {
      if (logo.dataset.agWired) return; logo.dataset.agWired = "1"; logo.style.cursor = "pointer";
      logo.addEventListener("click", function (e) { e.stopPropagation(); open(); });
    });
    return true;
  }

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { var o = document.getElementById("mm-agents"); if (o && o.classList.contains("on")) close(); } });
  function boot() { if (wireLogo()) return; var n = 0, t = setInterval(function () { if (wireLogo() || ++n > 40) clearInterval(t); }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__AGENTS = { open: open, close: close };
})();
