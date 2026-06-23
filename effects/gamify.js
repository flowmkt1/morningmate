/* =========================================================================
   effects/gamify.js — 데모용 게이미피케이션 레이어 (window.MM_GAME)
   ─────────────────────────────────────────────────────────────────────────
   · 상단바에 레벨/경험치 HUD를 띄우고, 각 뷰의 동작(업무 완료·체크·정리 등)에서
     award()/achievement()/combo 를 호출해 포인트·콤보·업적·레벨업 연출을 보여줌.
   · 파티클/컨페티 연출은 effects/motion.js(MM_MOTION)를 사용 → 모션 OFF면 정적.
   · 진행도는 localStorage('mm_game')에 저장. 초기화:  MM_GAME.reset()
   ========================================================================= */
(function () {
  "use strict";

  var DEFAULT = { xp: 0, level: 1, total: 0, done: 0, ach: {} };
  var S = load();
  function load() { try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem("mm_game") || "{}")); } catch (e) { return Object.assign({}, DEFAULT); } }
  function save() { try { localStorage.setItem("mm_game", JSON.stringify(S)); } catch (e) {} }
  function need(level) { return 80 + level * 40; } // 레벨업에 필요한 XP

  var motion = function () { return window.MM_MOTION; };
  var combo = 0, comboTimer = null;

  /* ---------- 스타일 ---------- */
  var CSS = [
    ".mmg-hud{display:inline-flex;align-items:center;gap:9px;background:linear-gradient(135deg,#6A4DF4,#9B3FE0);color:#fff;border-radius:20px;padding:5px 12px 5px 7px;margin-right:14px;font-family:Roboto,'Noto Sans KR',sans-serif;box-shadow:0 4px 14px rgba(106,77,244,.35);cursor:default;user-select:none;}",
    ".mmg-lv{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:26px;background:rgba(255,255,255,.22);border-radius:14px;font-size:12.5px;font-weight:800;padding:0 8px;}",
    ".mmg-bar{width:96px;height:8px;background:rgba(255,255,255,.28);border-radius:5px;overflow:hidden;}",
    ".mmg-fill{display:block;height:100%;width:0;background:linear-gradient(90deg,#FFE259,#FFA751);border-radius:5px;transition:width .5s cubic-bezier(.3,1,.4,1);}",
    ".mmg-xp{font-size:11.5px;font-weight:700;opacity:.95;min-width:46px;text-align:right;}",
    ".mmg-flame{font-size:12px;font-weight:800;background:rgba(0,0,0,.16);border-radius:12px;padding:3px 8px;display:none;align-items:center;gap:2px;}",
    ".mmg-flame.on{display:inline-flex;}",
    ".mmg-pop{position:fixed;z-index:6200;font-family:Roboto,'Noto Sans KR',sans-serif;font-weight:800;font-size:15px;color:#FFB300;text-shadow:0 1px 2px rgba(0,0,0,.25);pointer-events:none;white-space:nowrap;}",
    ".mmg-pop.combo{color:#FF5B79;}",
    /* 업적 토스트 */
    ".mmg-ach{position:fixed;left:50%;top:74px;transform:translateX(-50%) translateY(-24px);z-index:6300;display:flex;align-items:center;gap:12px;background:#1f1f2b;color:#fff;border-radius:14px;padding:13px 20px 13px 14px;box-shadow:0 12px 40px rgba(0,0,0,.4);opacity:0;font-family:Roboto,'Noto Sans KR',sans-serif;}",
    ".mmg-ach.on{animation:mmgAch 3.2s ease forwards;}",
    ".mmg-ach .ic{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#FFD259,#FF9C41);display:flex;align-items:center;justify-content:center;font-size:23px;flex-shrink:0;}",
    ".mmg-ach .t1{font-size:12px;color:#FFD06A;font-weight:700;letter-spacing:.3px;}",
    ".mmg-ach .t2{font-size:14.5px;font-weight:700;margin-top:2px;}",
    ".mmg-ach .t3{font-size:12px;color:#b9b9c8;margin-top:2px;}",
    "@keyframes mmgAch{0%{opacity:0;transform:translateX(-50%) translateY(-24px) scale(.9);}10%{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}85%{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}100%{opacity:0;transform:translateX(-50%) translateY(-16px) scale(.96);}}",
    ".mmg-hud.bump{animation:mmgBump .4s ease;}",
    "@keyframes mmgBump{0%{transform:scale(1);}40%{transform:scale(1.12);}100%{transform:scale(1);}}"
  ].join("\n");

  /* ---------- HUD (요청에 따라 레벨/XP HUD 제거) ---------- */
  var HUD_ENABLED = false;
  function hud() { return document.getElementById("mmg-hud"); }
  function buildHud() {
    if (!HUD_ENABLED) {
      // 업적 토스트 스타일만 주입(HUD 막대는 만들지 않음)
      if (!document.getElementById("mmg-style")) { var s = document.createElement("style"); s.id = "mmg-style"; s.textContent = CSS; document.head.appendChild(s); }
      return true;
    }
    if (document.getElementById("mmg-style")) { return !!hud(); }
    var host = document.querySelector(".top .right");
    if (!host) return false;
    var st = document.createElement("style"); st.id = "mmg-style"; st.textContent = CSS; document.head.appendChild(st);
    var h = document.createElement("div"); h.className = "mmg-hud"; h.id = "mmg-hud";
    h.innerHTML = '<span class="mmg-lv">Lv.' + S.level + '</span><div class="mmg-bar"><span class="mmg-fill"></span></div><span class="mmg-xp"></span><span class="mmg-flame">🔥<b>0</b></span>';
    host.insertBefore(h, host.firstChild);
    paint(true);
    return true;
  }
  function paint(noTrans) {
    var h = hud(); if (!h) return;
    var fill = h.querySelector(".mmg-fill"), xp = h.querySelector(".mmg-xp"), lv = h.querySelector(".mmg-lv");
    lv.textContent = "Lv." + S.level;
    var pc = Math.min(100, Math.round(S.xp / need(S.level) * 100));
    if (noTrans) { fill.style.transition = "none"; fill.style.width = pc + "%"; fill.offsetWidth; fill.style.transition = ""; }
    else fill.style.width = pc + "%";
    xp.textContent = S.xp + "/" + need(S.level);
  }

  /* ---------- 떠오르는 포인트 ---------- */
  function floatPop(anchor, text, isCombo) {
    return; // 레벨/XP HUD 제거에 맞춰 +XP 팝업도 끔
    if (!motion() || !motion().enabled) return;
    var r = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    var el = document.createElement("div"); el.className = "mmg-pop" + (isCombo ? " combo" : ""); el.textContent = text;
    el.style.left = (r.left + r.width / 2) + "px"; el.style.top = r.top + "px";
    document.body.appendChild(el);
    el.animate([
      { transform: "translate(-50%,0) scale(.7)", opacity: 0 },
      { transform: "translate(-50%,-16px) scale(1.05)", opacity: 1, offset: 0.25 },
      { transform: "translate(-50%,-50px) scale(1)", opacity: 0 }
    ], { duration: 1100, easing: "ease-out", fill: "forwards" }).onfinish = function () { el.remove(); };
  }

  /* ---------- 공개 API ---------- */
  var G = {};
  G.state = S;

  G.award = function (points, anchor, opts) {
    opts = opts || {};
    // 콤보
    combo += 1;
    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(function () { combo = 0; updateFlame(); }, 3500);
    var mult = combo >= 2 ? (1 + (combo - 1) * 0.25) : 1;
    var gained = Math.round(points * mult);
    S.xp += gained; S.total += gained;
    floatPop(anchor, "+" + gained + " XP" + (combo >= 2 ? "  x" + combo + "🔥" : ""), combo >= 2);
    updateFlame();
    var h = hud(); if (h) { h.classList.remove("bump"); h.offsetWidth; h.classList.add("bump"); }
    // 레벨업(연출 없이 수치만 반영 — 요청에 따라 레벨업 효과 제거)
    while (S.xp >= need(S.level)) { S.xp -= need(S.level); S.level += 1; }
    paint();
    save();
    return gained;
  };

  function updateFlame() {
    var h = hud(); if (!h) return;
    var f = h.querySelector(".mmg-flame");
    if (combo >= 2) { f.classList.add("on"); f.querySelector("b").textContent = combo; }
    else f.classList.remove("on");
  }

  G.complete = function (anchor) { // 업무 완료 전용(포인트+카운트+업적)
    S.done += 1; save();
    var g = G.award(20, anchor);
    if (motion() && anchor) motion().confetti(anchor, { count: 12, scale: 0.6 });
    if (S.done === 1) G.achievement("first_done", "첫 업무 완료!", "시작이 반이에요 💪", "✅");
    if (S.done === 5) G.achievement("done5", "일잘러", "업무 5개 완료", "🚀");
    if (S.done === 15) G.achievement("done15", "프로젝트 마스터", "업무 15개 완료", "👑");
    return g;
  };

  G.achievement = function (id, title, desc, icon) {
    // 요청에 따라 업적 달성 팝업 제거 — 내부 기록만(중복 방지)
    if (S.ach[id]) return false; S.ach[id] = 1; save();
    return true;
  };

  G.reset = function () { S = Object.assign({}, DEFAULT, { ach: {} }); save(); paint(true); return "reset"; };

  function boot() {
    if (buildHud()) return;
    var n = 0, t = setInterval(function () { if (buildHud() || ++n > 40) clearInterval(t); }, 150);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.MM_GAME = G;
})();
