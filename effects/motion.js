/* =========================================================================
   effects/motion.js — 데모용 "모션/효과" 전용 모듈 (window.MM_MOTION)
   ─────────────────────────────────────────────────────────────────────────
   · 기본 동작(클릭/상태변경/댓글 등)은 flow_card.js·panels.js에 있고,
     "보여주기용 애니메이션"만 여기 모아둠 → 켜고/끄기·관리가 쉽도록 분리.
   · 끄는 법:  콘솔에서  MM_MOTION.set(false)   (localStorage 에 저장됨)
              다시 켜기:  MM_MOTION.set(true)
   · 끈 상태에서는 모든 효과 함수가 즉시 no-op → 기본 동작은 그대로 작동.
   ========================================================================= */
(function () {
  "use strict";
  var M = { enabled: true };
  try { if (localStorage.getItem("mm_motion") === "0") M.enabled = false; } catch (e) {}
  M.set = function (v) { M.enabled = !!v; try { localStorage.setItem("mm_motion", M.enabled ? "1" : "0"); } catch (e) {} return M.enabled; };
  M.toggle = function () { return M.set(!M.enabled); };

  var rnd = Math.random;
  function spawn(html, cssText) {
    var el = document.createElement("div");
    el.style.cssText = "position:fixed;pointer-events:none;z-index:4000;" + cssText;
    el.innerHTML = html; document.body.appendChild(el); return el;
  }

  /* 1) 좋아요 → 스마일(+하트눈) 풍선처럼 떠오름 */
  M.smiles = function (anchor) {
    if (!M.enabled || !anchor) return;
    var r = anchor.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var cols = ["#FFD43B", "#FFC400", "#FFCE3A", "#FFD95E", "#FFC824"];
    for (var i = 0; i < 10; i++) {
      var heart = rnd() < 0.4, col = cols[i % cols.length];
      var eyes = heart
        ? '<g fill="#E0335B"><path d="M8 9.5c.5-.7 1.7-.3 1.7.6 0 .7-.9 1.3-1.7 2-.8-.7-1.7-1.3-1.7-2 0-.9 1.2-1.3 1.7-.6z"/><path d="M16 9.5c.5-.7 1.7-.3 1.7.6 0 .7-.9 1.3-1.7 2-.8-.7-1.7-1.3-1.7-2 0-.9 1.2-1.3 1.7-.6z"/></g>'
        : '<circle cx="9" cy="10" r="1.5" fill="#5a4a00"/><circle cx="15" cy="10" r="1.5" fill="#5a4a00"/>';
      var size = 16 + Math.round(rnd() * 18);
      var el = spawn(
        '<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="11" fill="' + col + '"/>' + eyes + '<path d="M8.2 14.4a4.2 4.2 0 007.6 0" stroke="#5a4a00" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>',
        "width:" + size + "px;height:" + size + "px;left:" + (cx - size / 2) + "px;top:" + (cy - size / 2) + "px;");
      var dx = Math.round(rnd() * 150 - 75), rot = Math.round(rnd() * 80 - 40), dur = 1100 + rnd() * 900, delay = rnd() * 280;
      var a = el.animate([
        { transform: "translate(0,0) scale(.35) rotate(0)", opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.12 },
        { transform: "translate(" + dx + "px,-170px) scale(1.05) rotate(" + rot + "deg)", opacity: 0, offset: 1 }
      ], { duration: dur, delay: delay, easing: "ease-out", fill: "forwards" });
      a.onfinish = (function (n) { return function () { n.remove(); }; })(el);
    }
  };

  /* 2) 완료 → 별 반짝임 + 뱃지 글로우 */
  M.sparkle = function (el) {
    if (!M.enabled || !el) return;
    var r = el.getBoundingClientRect();
    el.animate([
      { boxShadow: "0 0 0 0 rgba(255,196,0,0)" },
      { boxShadow: "0 0 0 4px rgba(255,196,0,.45)", offset: 0.3 },
      { boxShadow: "0 0 0 0 rgba(255,196,0,0)" }
    ], { duration: 900, easing: "ease-out" });
    for (var i = 0; i < 12; i++) {
      var x = r.left - 6 + rnd() * (r.width + 12), y = r.top - 6 + rnd() * (r.height + 12);
      var sz = 10 + Math.round(rnd() * 12), delay = rnd() * 350;
      var s = spawn('<svg viewBox="0 0 24 24" width="100%" height="100%" fill="#FFC400"><path d="M12 1.5l1.9 7.6L21.5 11l-7.6 1.9L12 20.5l-1.9-7.6L2.5 11l7.6-1.9z"/></svg>',
        "left:" + x + "px;top:" + y + "px;width:" + sz + "px;height:" + sz + "px;transform:translate(-50%,-50%);");
      var a = s.animate([
        { opacity: 0, transform: "translate(-50%,-50%) scale(0) rotate(0)" },
        { opacity: 1, transform: "translate(-50%,-50%) scale(1.15) rotate(90deg)", offset: 0.4 },
        { opacity: 0, transform: "translate(-50%,-50%) scale(.4) rotate(170deg)" }
      ], { duration: 850, delay: delay, easing: "ease-out", fill: "forwards" });
      a.onfinish = (function (n) { return function () { n.remove(); }; })(s);
    }
  };

  /* 3) 진척도 바 채워지는 모션 (+ % 카운트업) */
  M.progressFill = function (card, target) {
    if (!card) return;
    var fill = card.querySelector(".mmc-prog .fill"), pct = card.querySelector(".mmc-prog .pct");
    target = target || 100;
    if (fill) {
      if (M.enabled) { fill.style.width = target + "%"; fill.animate([{ width: "0%" }, { width: target + "%" }], { duration: 950, easing: "cubic-bezier(.4,0,.2,1)" }); }
      else fill.style.width = target + "%";
    }
    if (pct && M.enabled) {
      var v = 0, step = Math.max(1, Math.round(target / 24)); pct.textContent = "0%";
      var id = setInterval(function () { v = Math.min(target, v + step); pct.textContent = v + "%"; if (v >= target) clearInterval(id); }, 30);
    } else if (pct) pct.textContent = target + "%";
  };

  /* 4) 상태값 → 태그 안에서 플립/팝 모션 */
  M.statusFlip = function (badge) {
    if (!M.enabled || !badge) return;
    badge.animate([
      { transform: "perspective(300px) rotateX(85deg) scale(.85)", opacity: 0.15 },
      { transform: "perspective(300px) rotateX(0) scale(1.06)", opacity: 1, offset: 0.65 },
      { transform: "perspective(300px) rotateX(0) scale(1)", opacity: 1 }
    ], { duration: 420, easing: "cubic-bezier(.34,1.4,.5,1)" });
  };

  /* 5) 담당자 → PARTICIPANTS 패널에서 칩이 날아 들어옴 */
  M.assigneeFlyIn = function (card, names) {
    if (!card) return;
    var chips = [].slice.call(card.querySelectorAll(".mmc-asgs .mmc-chip"));
    names.forEach(function (nm, idx) {
      var chip = null;
      chips.forEach(function (c) { var cn = c.querySelector(".cn"); if (cn && cn.textContent === nm) chip = c; });
      if (!chip) return;
      if (!M.enabled) return; // 효과 OFF → 칩은 이미 렌더되어 보임
      var part = null;
      [].slice.call(document.querySelectorAll(".parts .part")).forEach(function (pp) { var pn = pp.querySelector(".pn"); if (pn && pn.textContent.indexOf(nm) === 0) part = pp; });
      var chipAva = chip.querySelector(".mmc-ava") || chip;
      var to = chipAva.getBoundingClientRect();
      var srcAva = part && part.querySelector(".pa");
      var from = srcAva ? srcAva.getBoundingClientRect() : { left: to.left + 360, top: to.top, width: to.width };
      chip.style.visibility = "hidden";
      var sz = Math.max(to.width, 18);
      var bg = srcAva ? getComputedStyle(srcAva).backgroundColor : (chipAva.style.background || "#bbb");
      var fly = spawn("", "z-index:5000;width:" + sz + "px;height:" + sz + "px;border-radius:50%;left:" + from.left + "px;top:" + from.top + "px;background:" + bg + ";box-shadow:0 6px 16px rgba(0,0,0,.22);");
      var dx = to.left - from.left, dy = to.top - from.top;
      var a = fly.animate([
        { transform: "translate(0,0) scale(1.45)", opacity: 0.95 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(1)", opacity: 1 }
      ], { duration: 540, delay: idx * 130, easing: "cubic-bezier(.4,.1,.2,1)", fill: "forwards" });
      a.onfinish = (function (c, n) { return function () { c.style.visibility = ""; c.animate([{ transform: "scale(.6)", opacity: .4 }, { transform: "scale(1)", opacity: 1 }], { duration: 220, easing: "ease-out" }); n.remove(); }; })(chip, fly);
    });
  };

  /* 6) 채팅창 → 클릭한 버튼에서 튀어나오는 모션 */
  M.chatEmerge = function (win, btn) {
    if (!M.enabled || !win) return;
    var wr = win.getBoundingClientRect(), origin = "50% 50%";
    if (btn) { var br = btn.getBoundingClientRect(); origin = (br.left + br.width / 2 - wr.left) + "px " + (br.top + br.height / 2 - wr.top) + "px"; }
    win.style.transformOrigin = origin;
    win.animate([
      { transform: "scale(.1)", opacity: 0 },
      { transform: "scale(1.09)", opacity: 1, offset: 0.55 },
      { transform: "scale(.96)", opacity: 1, offset: 0.78 },
      { transform: "scale(1.02)", opacity: 1, offset: 0.9 },
      { transform: "scale(1)", opacity: 1 }
    ], { duration: 720, easing: "cubic-bezier(.22,.9,.3,1)" });
  };

  /* 컨테이너를 맨 위→맨 아래로 천천히 자동 스크롤 */
  M.autoScroll = function (el, opts) {
    if (!M.enabled || !el) return;
    opts = opts || {}; var dur = opts.duration || 2400, fps = 60, steps = Math.round(dur / 1000 * fps);
    el.scrollTop = 0;
    var to = el.scrollHeight - el.clientHeight; if (to <= 2) return;
    var i = 0;
    if (el._asTimer) clearInterval(el._asTimer);
    el._asTimer = setInterval(function () {
      i++; if (!el.isConnected) { clearInterval(el._asTimer); return; }
      var k = Math.min(1, i / steps);
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      el.scrollTop = to * e;
      if (k >= 1) clearInterval(el._asTimer);
    }, 1000 / fps);
  };

  /* 7) 본문 타이핑 효과 */
  M.typewriter = function (el, done) {
    if (!el) { if (done) done(); return; }
    var lines = [].map.call(el.querySelectorAll("p"), function (p) { return p.textContent; });
    var text = lines.length ? lines.join("\n") : el.textContent;
    if (!M.enabled || !text.trim()) { if (done) done(); return; }
    if (el._twTimer) clearTimeout(el._twTimer);
    el.classList.add("mm-typing"); el.textContent = ""; el.style.whiteSpace = "pre-line";
    var i = 0;
    (function tick() {
      if (!el.isConnected) return;
      el.textContent = text.slice(0, i);
      if (i >= text.length) { el.classList.remove("mm-typing"); if (done) done(); return; }
      i += 1; el._twTimer = setTimeout(tick, 15);
    })();
  };

  /* 8) 스크롤 등장(통합) — 캡처 단계 스크롤로 내부 컨테이너 스크롤까지 감지.
        뷰는 요소에 class="mm-reveal" data-rgrp="<group>" 를 붙이고,
        그룹별 핸들러를 revealRegister(group, fn)로 등록한다. */
  M._revealHandlers = {};
  M._revealInited = false;
  function ensureRevealCss() {
    if (document.getElementById("mm-reveal-css")) return;
    var s = document.createElement("style"); s.id = "mm-reveal-css"; s.textContent = ".mm-reveal{opacity:0 !important;}"; document.head.appendChild(s);
  }
  M.revealRegister = function (group, handler) {
    M._revealHandlers[group] = handler;
    if (!M._revealInited) {
      M._revealInited = true; ensureRevealCss();
      var scan = function () { M._revealScan(); };
      document.addEventListener("scroll", scan, true);
      window.addEventListener("resize", scan);
    }
  };
  M._revealScan = function () {
    if (!M.enabled) return;
    var vh = window.innerHeight, line = vh * 0.72;
    [].slice.call(document.querySelectorAll(".mm-reveal")).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (r.bottom < -40) { el.classList.remove("mm-reveal"); return; } // 위로 지나간 건 그냥 표시
      if (r.top < line || r.bottom <= vh + 2) {
        el.classList.remove("mm-reveal");
        var h = M._revealHandlers[el.getAttribute("data-rgrp")];
        if (h) h(el); else el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: "backwards" });
      }
    });
  };
  M.revealKick = function () { if (!M.enabled) return; M._revealScan(); requestAnimationFrame(function () { M._revealScan(); }); };

  /* 피드 카드 등장 — 쫀득하게: 느리게 올라와 살짝 오버슈트 후 가속 스냅 */
  M.feedRevealAnim = function (el) {
    el.animate([
      { opacity: 0, transform: "translateY(72px) scale(.945)" },
      { opacity: 1, transform: "translateY(-9px) scale(1.016)", offset: 0.72 },
      { opacity: 1, transform: "translateY(3px) scale(.997)", offset: 0.88 },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ], { duration: 1080, easing: "cubic-bezier(.16,.66,.18,1)", fill: "backwards" });
    // 2) 카드 내부 요소가 하나씩 등장
    var kids = el.querySelectorAll(".mmc-head,.mmc-title,.mmc-rows,.mmc-more,.mmc-todo,.mmc-sch,.mmc-vote,.mmc-foot,.mmc-cmts");
    [].forEach.call(kids, function (k, i) { k.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 420, delay: 180 + i * 130, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" }); });
    // 8) 본문 타이핑 → 끝나면 이미지가 등장
    var body = el.querySelector(".mmc-body"), imgs = el.querySelector(".mmc-imgs");
    if (imgs) imgs.style.visibility = "hidden";
    function showImgs() { if (imgs) { imgs.style.visibility = ""; imgs.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }], { duration: 520, easing: "cubic-bezier(.2,.8,.3,1)" }); } }
    if (body) M.typewriter(body, showImgs); else showImgs();
    var fillEl = el.querySelector(".mmc-prog .fill"); if (fillEl) M.progressFill(el, parseInt(fillEl.style.width, 10) || 100);
  };
  /* 인사이트 위젯 등장 */
  M.insRevealAnim = function (el) {
    // 피드 카드처럼 잠깐 커졌다가 자리잡는 팝 모션
    el.animate([
      { opacity: 0, transform: "translateY(40px) scale(.9)" },
      { opacity: 1, transform: "translateY(-7px) scale(1.045)", offset: 0.68 },
      { opacity: 1, transform: "translateY(2px) scale(.996)", offset: 0.86 },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ], { duration: 760, easing: "cubic-bezier(.16,.7,.2,1)", fill: "backwards" });
  };
  /* 간트 행 한 줄씩 등장 */
  M.ganttReveal = function (container) {
    if (!container) return;
    var lrows = [].slice.call(container.querySelectorAll(".g-lrows .g-row"));
    var tracks = [].slice.call(container.querySelectorAll(".g-rrows .g-track"));
    if (!M.enabled) return;
    lrows.forEach(function (row, i) {
      row.animate([{ opacity: 0, transform: "translateX(-22px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 420, delay: i * 95, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
      var tr = tracks[i];
      if (tr) { var bar = tr.querySelector(".g-bar,.g-mile"); if (bar) bar.animate([{ opacity: 0, transform: "scaleX(0)", transformOrigin: "left" }, { opacity: 1, transform: "scaleX(1)" }], { duration: 460, delay: i * 95 + 160, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" }); }
    });
  };

  /* 9) 컨페티 폭발 */
  M.confetti = function (anchor, opts) {
    if (!M.enabled) return;
    opts = opts || {};
    var r = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight * 0.3, width: 0, height: 0 };
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var cols = ["#FF5B79", "#FFC400", "#6449FC", "#19B43A", "#00B5F1", "#FF7A3D", "#E0335B", "#36CFBD"];
    var n = opts.count || 28, sc = opts.scale || 1;
    for (var i = 0; i < n; i++) {
      var col = cols[i % cols.length], w = (6 + Math.round(rnd() * 6)) * sc, h = (9 + Math.round(rnd() * 9)) * sc;
      var round = rnd() < 0.3;
      var el = spawn("", "z-index:6000;width:" + w + "px;height:" + h + "px;left:" + cx + "px;top:" + cy + "px;background:" + col + ";border-radius:" + (round ? "50%" : "2px") + ";");
      var ang = rnd() * Math.PI * 2, dist = (70 + rnd() * 170) * sc;
      var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - (60 + rnd() * 130);
      var rot = rnd() * 720 - 360, dur = 950 + rnd() * 850;
      var a = el.animate([
        { transform: "translate(-50%,-50%) rotate(0)", opacity: 1 },
        { transform: "translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg)", opacity: 1, offset: 0.7 },
        { transform: "translate(" + (dx * 1.1) + "px," + (dy + 240) + "px) rotate(" + (rot * 1.4) + "deg)", opacity: 0 }
      ], { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)", fill: "forwards" });
      a.onfinish = (function (nd) { return function () { nd.remove(); }; })(el);
    }
  };

  /* 10) 요소 펄스(클릭 강조) */
  M.pulse = function (el, color) {
    if (!M.enabled || !el) return;
    el.animate([
      { boxShadow: "0 0 0 0 " + (color || "rgba(100,73,252,.5)") },
      { boxShadow: "0 0 0 7px rgba(100,73,252,0)", offset: 1 }
    ], { duration: 550, easing: "ease-out" });
  };

  /* 11) 숫자 카운트업(요소 텍스트) */
  M.countUp = function (el, target, suffix, dur) {
    if (!el) return;
    suffix = suffix || ""; var dec = (target % 1 !== 0) ? 2 : 0;
    if (!M.enabled) { el.textContent = target.toFixed(dec) + suffix; return; }
    var t0 = null, total = dur || 900;
    function frame(ts) {
      if (t0 == null) t0 = ts; var k = Math.min(1, (ts - t0) / total);
      el.textContent = (target * (0.2 + 0.8 * k * (2 - k))).toFixed(dec) + suffix;
      if (k < 1) requestAnimationFrame(frame); else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(frame);
  };

  /* 담당자 셀: 프로필 사진이 먼저 → 이름으로 바뀌는 모션 */
  function doAssignee(cell, d) {
    var nm = cell.querySelector(".anm"), mo = cell.querySelector(".amore");
    if (nm) {
      var full = nm.textContent;
      var more = 0; if (mo) { var mm2 = (mo.textContent || "").match(/\d+/); more = mm2 ? +mm2[0] : 0; }
      var total = 1 + more, seedBase = full.replace(/[^a-zA-Z0-9가-힣]/g, ""), avs = [];
      for (var z = 0; z < total; z++) {
        var av = document.createElement("span"); av.className = "amini";
        var avImg = (window.MM_AV) ? MM_AV.photo(full) : "https://picsum.photos/seed/mm" + encodeURIComponent(seedBase + z) + "/40";
        av.style.cssText = "background-color:#C7C7CF;background-image:url(" + avImg + ");" + (z > 0 ? "margin-left:-8px;" : "");
        cell.insertBefore(av, nm);
        av.animate([{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "scale(1.15)", offset: 0.7 }, { opacity: 1, transform: "scale(1)" }], { duration: 400, delay: d + z * 130, easing: "cubic-bezier(.34,1.6,.5,1)", fill: "backwards" });
        avs.push(av);
      }
      nm.textContent = "";
      (function (n, t, avEls, mc) {
        setTimeout(function () {
          if (!n.isConnected) return;
          avEls.forEach(function (avEl, idx) {
            var a = avEl.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.5)" }], { duration: 340, delay: idx * 70, easing: "ease-in", fill: "forwards" });
            a.onfinish = function () { if (avEl.parentNode) avEl.parentNode.removeChild(avEl); };
          });
          n.textContent = t; M.typewriter(n);
        }, d + 680 + mc * 130);
      })(nm, full, avs, more);
    }
    if (mo) mo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: d + 700, fill: "backwards" });
  }
  /* 12) 테이블 행 순차 등장 + 컬럼 순차 채움(담당자=아바타→이름 모션) */
  M.tableReveal = function (container) {
    if (!container) return;
    var rows = [].slice.call(container.querySelectorAll(".mmt-row"));
    if (!M.enabled) { rows.forEach(function (r) { r.style.opacity = ""; }); return; }
    var COLS = [".c-task", ".c-status", ".c-assignee", ".c-start", ".c-due", ".c-prog", ".c-check", ".c-budget"];
    var ROW = 115, CELL = 58;
    rows.forEach(function (row, ri) {
      var base = ri * ROW;
      row.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 340, delay: base, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
      COLS.forEach(function (sel, ci) {
        var cell = row.querySelector(sel); if (!cell) return;
        var d = base + 150 + ci * CELL;
        if (sel === ".c-assignee") doAssignee(cell, d);
        else cell.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 320, delay: d, easing: "ease-out", fill: "backwards" });
      });
    });
  };

  /* 댓글 등록 강조 — 색 없이 '끼어드는' 효과: 공간이 열리며 옆에서 비집고 들어옴 */
  M.commentPop = function (el) {
    if (!M.enabled || !el) return;
    var h = el.scrollHeight || el.offsetHeight || 60, prevOv = el.style.overflow;
    el.style.overflow = "hidden";
    var a = el.animate([
      { maxHeight: "0px", opacity: 0, transform: "translateX(-22px)" },
      { maxHeight: (h + 30) + "px", opacity: 1, transform: "translateX(6px)", offset: 0.6 },
      { maxHeight: (h + 30) + "px", opacity: 1, transform: "translateX(-3px)", offset: 0.8 },
      { maxHeight: (h + 30) + "px", opacity: 1, transform: "translateX(0)" }
    ], { duration: 600, easing: "cubic-bezier(.2,.85,.3,1.1)" });
    a.onfinish = function () { el.style.overflow = prevOv; };
  };

  /* 공용 토스트 (어느 뷰에서나 호출)
     사용자 요청: 자막 토스트를 모든 영역에서 제거 → no-op 처리. 다시 켜려면 아래 return 줄 삭제. */
  window.MM_TOAST = function (msg) {
    return; /* 자막 토스트 전역 비활성화 */
    var t = document.getElementById("mm-gtoast");
    if (!t) {
      t = document.createElement("div"); t.id = "mm-gtoast";
      t.style.cssText = "position:fixed;left:50%;bottom:40px;transform:translateX(-50%) translateY(20px);background:#2B2B33;color:#fff;font:500 13.5px Roboto,'Noto Sans KR',sans-serif;padding:12px 20px;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.28);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:6500;";
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(t._h); t._h = setTimeout(function () { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(20px)"; }, 1800);
  };

  /* 마우스에 사람 프로필이 달려 따라다님(창 전역) */
  function _bgOf(url) { return (window.MM_AV && MM_AV.bgColor) ? MM_AV.bgColor(url) : "#6449FC"; }
  function _applyCursor(el, url, color) {
    // 화살표는 gantt와 동일(흰 채움+진한 외곽선) 고정, 사진만 교체
    var ph = el.querySelector(".ca-photo"); if (ph) { ph.style.backgroundImage = "url(" + url + ")"; ph.style.backgroundColor = color; }
  }
  // ===== 진입 시 '마우스에 프로필 사진 붙이기' on/off 선택 (1회 후 기억) =====
  function _cursorOff() { try { return localStorage.getItem("mm_cursor_on") === "0"; } catch (e) { return false; } }
  function _cursLang() { try { var u = new URLSearchParams(location.search); return u.get("lang") || localStorage.getItem("mm_lang") || "ja"; } catch (e) { return "ja"; } }
  var _CURTX = {
    ko: { title: "마우스에 프로필 사진을 붙일까요?", desc: "데모 중 마우스 커서에 담당자 프로필 사진이 따라다닙니다. 녹화·발표용으로 끌 수도 있어요. (좌측 하단에서 언제든 변경)", yes: "붙이기", no: "일반 커서", label: "프로필 커서" },
    ja: { title: "マウスにプロフィール写真を付けますか?", desc: "デモ中、マウスカーソルに担当者のプロフィール写真が付いてきます。録画・発表用にオフにもできます。(左下からいつでも変更)", yes: "付ける", no: "通常カーソル", label: "プロフィールカーソル" },
    en: { title: "Attach a profile photo to your cursor?", desc: "During the demo a profile photo follows your cursor. You can turn it off for recording or presenting. (Change anytime, bottom-left.)", yes: "Attach", no: "Normal cursor", label: "Profile cursor" }
  };
  function _startCursorAvatar() {
    M._curHidden = false;
    // OS 기본 커서를 숨겨 '커서 2개'로 보이지 않게 함(커스텀 커서만 표시)
    if (!document.getElementById("mm-curhide")) { var hs = document.createElement("style"); hs.id = "mm-curhide"; hs.textContent = "html,body,*{cursor:none !important;}"; document.head.appendChild(hs); }
    if (M._curAva) { M._curAva.style.opacity = "1"; return; }
    if (!document.body) return;
    function rnd() { return (window.MM_AV) ? MM_AV.randomAny() : "assets/profile/man" + (1 + Math.floor(Math.random() * 6)) + ".png"; }
    var saved = null; try { saved = localStorage.getItem("mm_cursor"); } catch (e) {}
    var url = saved || rnd(), color = _bgOf(url);
    var el = document.createElement("div"); el.id = "mm-curava";
    el.style.cssText = "position:fixed;z-index:9998;width:0;height:0;pointer-events:none;left:-300px;top:-300px;opacity:0;transition:opacity .2s;";
    el.innerHTML = '<svg class="ca-arrow" width="44" height="44" viewBox="0 0 24 24" style="position:absolute;left:0;top:0;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45));"><path d="M5 2.5l14.5 7.2-6.3 1.7L9.7 18.5z" fill="#fff" stroke="#2b2b33" stroke-width="1.3" stroke-linejoin="round"/></svg>' +
      '<span class="ca-photo" style="position:absolute;left:22px;top:26px;width:58px;height:58px;border-radius:15px;background:' + color + ' center/cover no-repeat;background-image:url(' + url + ');box-shadow:0 5px 16px rgba(0,0,0,.34);"></span>';
    document.body.appendChild(el); M._curAva = el;
    document.addEventListener("mousemove", function (e) { if (M._curHidden) { el.style.opacity = "0"; return; } el.style.left = (e.clientX - 3) + "px"; el.style.top = (e.clientY - 2) + "px"; el.style.opacity = "1"; });
    document.addEventListener("mouseleave", function () { el.style.opacity = "0"; });
    // 선택된 사진이 없으면 항상 랜덤으로 바뀜(화살표 색도 함께). 선택(룰렛)되면 고정.
    if (!saved) M._curAvaTimer = setInterval(function () { var u = rnd(); _applyCursor(el, u, _bgOf(u)); }, 2500);
  }
  function _stopCursorAvatar() {
    M._curHidden = true;
    if (M._curAvaTimer) { clearInterval(M._curAvaTimer); M._curAvaTimer = null; }
    if (M._curAva) M._curAva.style.opacity = "0";
    var hs = document.getElementById("mm-curhide"); if (hs) hs.remove();
  }
  // 좌측 하단 토글(코너 hover 시 진하게): 프로필 커서 켜기/끄기 — 언제든 변경
  function _addCursorToggle(isOn) {
    if (document.getElementById("mm-curtoggle") || !document.body) return;
    var tx = _CURTX[_cursLang()] || _CURTX.ja;
    var b = document.createElement("div"); b.id = "mm-curtoggle";
    b.style.cssText = "position:fixed;left:14px;bottom:14px;z-index:99990;display:flex;align-items:center;gap:6px;background:rgba(20,20,26,.62);color:#eaeaf0;font:600 11px Roboto,'Noto Sans JP','Noto Sans KR',sans-serif;padding:6px 11px;border-radius:16px;cursor:pointer;opacity:.16;transition:opacity .2s;backdrop-filter:blur(4px);user-select:none;";
    function paint(on) { b.innerHTML = '🖱 ' + tx.label + ' <b style="color:' + (on ? '#3FD09E' : '#FF6B6B') + '">' + (on ? 'ON' : 'OFF') + '</b>'; }
    paint(isOn);
    b.addEventListener("mouseenter", function () { b.style.opacity = "1"; });
    b.addEventListener("mouseleave", function () { b.style.opacity = ".16"; });
    b.addEventListener("click", function () {
      var curOn; try { curOn = localStorage.getItem("mm_cursor_on") !== "0"; } catch (e) { curOn = true; }
      var nowOn = !curOn;
      try { localStorage.setItem("mm_cursor_on", nowOn ? "1" : "0"); } catch (e) {}
      if (nowOn) _startCursorAvatar(); else _stopCursorAvatar();
      paint(nowOn);
    });
    document.body.appendChild(b);
  }
  function _askCursorChoice() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", _askCursorChoice); return; }
    if (document.getElementById("mm-curask")) return;
    var tx = _CURTX[_cursLang()] || _CURTX.ja;
    var ov = document.createElement("div"); ov.id = "mm-curask";
    ov.style.cssText = "position:fixed;inset:0;z-index:100002;display:flex;align-items:center;justify-content:center;background:rgba(18,18,26,.55);backdrop-filter:blur(3px);font-family:Roboto,'Noto Sans JP','Noto Sans KR',sans-serif;";
    ov.innerHTML = '<div style="background:#fff;border-radius:18px;padding:30px 30px 24px;max-width:380px;width:88%;box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center;">'
      + '<div style="font-size:34px;margin-bottom:8px;">🖱️</div>'
      + '<div style="font-size:18px;font-weight:800;color:#23233a;margin-bottom:8px;">' + tx.title + '</div>'
      + '<div style="font-size:13px;line-height:1.6;color:#73737f;margin-bottom:22px;">' + tx.desc + '</div>'
      + '<div style="display:flex;gap:10px;">'
      + '<button id="mm-cur-no" style="flex:1;padding:12px 0;border:1px solid #e2e2ea;background:#f4f4f8;color:#4b4b5a;font:700 14px inherit;border-radius:11px;cursor:pointer;">' + tx.no + '</button>'
      + '<button id="mm-cur-yes" style="flex:1;padding:12px 0;border:0;background:#6449FC;color:#fff;font:700 14px inherit;border-radius:11px;cursor:pointer;">' + tx.yes + '</button>'
      + '</div></div>';
    document.body.appendChild(ov);
    function choose(on) { try { localStorage.setItem("mm_cursor_on", on ? "1" : "0"); } catch (e) {} ov.remove(); if (on) _startCursorAvatar(); _addCursorToggle(on); }
    document.getElementById("mm-cur-yes").addEventListener("click", function () { choose(true); });
    document.getElementById("mm-cur-no").addEventListener("click", function () { choose(false); });
  }
  M.initCursorAvatar = function () {
    if (M._curAva) return;
    // 임베드(iframe)·터치 기기에서는 커서 아바타/선택 미표시
    try { var q = new URLSearchParams(location.search); if (q.get("embed")) return; } catch (e) {}
    var fine = !window.matchMedia || window.matchMedia("(pointer:fine)").matches;
    if (!fine) return;
    var choice = null; try { choice = localStorage.getItem("mm_cursor_on"); } catch (e) {}
    if (choice === "0") { _addCursorToggle(false); return; }
    if (choice === "1") { _startCursorAvatar(); _addCursorToggle(true); return; }
    _askCursorChoice(); // 처음 진입: 한 번 물어보고 기억
  };
  // 룰렛에서 고른 프로필을 커서에 고정(화살표 색=배경색) + 다른 뷰/페이지에도 적용(localStorage)
  M.setCursorPhoto = function (url) {
    if (_cursorOff()) return;
    try { localStorage.setItem("mm_cursor", url); } catch (e) {}
    if (M._curAvaTimer) { clearInterval(M._curAvaTimer); M._curAvaTimer = null; }
    if (M._curAva) _applyCursor(M._curAva, url, _bgOf(url));
  };
  // 커서 프로필 표시/숨김(로고뷰 진입 시 숨겼다가 카드 선택되면 표시)
  M.setCursorVisible = function (v) {
    if (_cursorOff()) return;
    M._curHidden = !v;
    if (M._curAva) M._curAva.style.opacity = v ? "1" : "0";
  };

  window.MM_MOTION = M;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { M.initCursorAvatar(); }); else M.initCursorAvatar();
})();
