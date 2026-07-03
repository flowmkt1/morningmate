/* =========================================================================
   leadflow.js — 리드 시연 오케스트레이터 (app.html 전용, ?convert=1 일 때만 동작)
   - mode=auto   : 탭을 자동으로 순회하며 "자동 시연" → 끝나면 전환 모달
   - mode=manual : "직접 해보기" — 다음 볼 곳 살짝 빛냄 + 준비되면 만들기 버튼 → 전환 모달
   - 전환 모달   : [무료로 시작](가입) / [번호 남기고 세팅 받기](→ HubSpot)
   기존 데모 동작에 영향 없음(convert 파라미터 없으면 즉시 no-op).
   ========================================================================= */
(function () {
  "use strict";
  var Q; try { Q = new URLSearchParams(location.search); } catch (e) { return; }
  if (!Q.get("convert")) return; // 리드 시연 진입일 때만

  var LANG = Q.get("lang") || (function () { try { return localStorage.getItem("mm_lang"); } catch (e) { return null; } })() || "ja";
  var MODE = (Q.get("mode") === "manual") ? "manual" : "auto";
  var INST = Q.get("inst") || "";
  var ROLE = Q.get("role") || "";

  /* --- 설정 (demo.html CFG와 동일하게 유지) --- */
  var CFG = {
    signupUrl: { ko: "https://flow.team", ja: "https://flow.team", en: "https://flow.team" },
    hubspot: { portalId: "24076689", formGuid: "" } // formGuid 없으면 로컬 폴백
  };

  var T = {
    ko: { skip: "자동 시연 중 · 건너뛰기", make: "🚀 내 워크스페이스 만들기", nudge: "여기도 눌러보세요",
      title: "이 워크스페이스, 진짜로 만들어드릴까요?", sub: "지금 무료로 시작하거나, 번호를 남기면 세팅해서 보내드려요.",
      signup: "🚀 무료로 시작하기", phone: "📞 번호 남기고 세팅 받기",
      ph: "010-1234-5678", send: "받기", back: "닫기",
      consent: "연락처는 워크스페이스 안내 목적에만 사용되며 언제든 수신 거부할 수 있어요.",
      ok: "✓ 접수됐어요! 5분 뒤 완성본 링크를 문자로 보내드릴게요.", invalid: "전화번호를 확인해 주세요." },
    ja: { skip: "自動デモ中 · スキップ", make: "🚀 自分のワークスペースを作る", nudge: "ここも押してみて",
      title: "このワークスペース、実際に作りましょうか?", sub: "今すぐ無料で始めるか、番号を頂ければ設定してお送りします。",
      signup: "🚀 無料で始める", phone: "📞 番号を残して設定を受け取る",
      ph: "090-1234-5678", send: "受け取る", back: "閉じる",
      consent: "連絡先はワークスペース案内の目的にのみ使用し、いつでも配信停止できます。",
      ok: "✓ 受け付けました!5分後に完成版リンクをSMSでお送りします。", invalid: "電話番号をご確認ください。" },
    en: { skip: "Auto demo · Skip", make: "🚀 Build my workspace", nudge: "Try this too",
      title: "Want us to build this workspace for real?", sub: "Start free now, or leave your number and we'll set it up and send it.",
      signup: "🚀 Start free", phone: "📞 Leave number, get it set up",
      ph: "+81 90 1234 5678", send: "Get it", back: "Close",
      consent: "We use your contact only to send workspace info; you can opt out anytime.",
      ok: "✓ Got it! We'll text you the finished link in 5 min.", invalid: "Please check the phone number." }
  };
  function t() { return T[LANG] || T.ja; }

  function css() {
    if (document.getElementById("lf-css")) return;
    var s = document.createElement("style"); s.id = "lf-css";
    s.textContent =
      ".lf-skip{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:100000;background:rgba(20,20,28,.82);color:#eaeaf0;font:600 12.5px Roboto,'Noto Sans JP','Noto Sans KR',sans-serif;padding:8px 14px;border-radius:20px;cursor:pointer;display:flex;align-items:center;gap:9px;backdrop-filter:blur(6px);box-shadow:0 6px 20px rgba(0,0,0,.3);}" +
      ".lf-skip .dot{width:7px;height:7px;border-radius:50%;background:#ff5a5a;animation:lf-bl 1s infinite;}@keyframes lf-bl{50%{opacity:.3}}" +
      ".lf-skip b{color:#b9a9ff;}" +
      ".lf-make{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:100000;background:linear-gradient(135deg,#8b5cf6,#6449FC);color:#fff;font:800 14.5px Roboto,'Noto Sans JP','Noto Sans KR',sans-serif;padding:14px 22px;border:0;border-radius:14px;cursor:pointer;box-shadow:0 14px 34px rgba(100,73,252,.5);transition:transform .15s;}" +
      ".lf-make:hover{transform:translateX(-50%) translateY(-2px);}.lf-make.pulse{animation:lf-pulse 1.4s infinite;}@keyframes lf-pulse{0%,100%{box-shadow:0 14px 34px rgba(100,73,252,.5)}50%{box-shadow:0 14px 44px rgba(100,73,252,.85)}}" +
      ".lf-ov{position:fixed;inset:0;z-index:100001;background:rgba(14,13,21,.62);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Roboto,'Noto Sans JP','Noto Sans KR',sans-serif;animation:lf-fade .3s ease both;}@keyframes lf-fade{from{opacity:0}to{opacity:1}}" +
      ".lf-card{background:#fff;border-radius:20px;max-width:400px;width:100%;padding:30px 26px 24px;box-shadow:0 30px 80px rgba(0,0,0,.4);text-align:center;animation:lf-up .35s cubic-bezier(.34,1.4,.5,1) both;}@keyframes lf-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}" +
      ".lf-emo{font-size:38px;}.lf-title{font-size:19px;font-weight:900;color:#23233a;margin:8px 0 6px;letter-spacing:-.3px;}.lf-sub{font-size:13px;color:#7a7a8c;line-height:1.6;margin-bottom:20px;}" +
      ".lf-btn{width:100%;border:0;border-radius:13px;padding:15px 0;font:800 15px inherit;cursor:pointer;display:block;text-decoration:none;text-align:center;}" +
      ".lf-btn.pri{background:linear-gradient(135deg,#8b5cf6,#6449FC);color:#fff;box-shadow:0 12px 28px rgba(100,73,252,.4);}" +
      ".lf-btn.sec{margin-top:10px;background:#f3f2fa;color:#4b3fd0;font-weight:700;}" +
      ".lf-row{display:flex;gap:8px;margin-top:12px;}.lf-in{flex:1;border:1px solid #e2e2ea;border-radius:12px;padding:14px;font:600 15px inherit;color:#222;outline:none;}.lf-in:focus{border-color:#6449FC;}" +
      ".lf-send{border:0;border-radius:12px;padding:0 18px;font:800 14px inherit;color:#fff;background:#6449FC;cursor:pointer;}.lf-send:disabled{opacity:.4;cursor:not-allowed;}" +
      ".lf-consent{font-size:11px;color:#9a9aa8;margin-top:11px;line-height:1.5;}.lf-ok{font-size:14px;color:#1a9e63;font-weight:800;padding:14px 0 4px;}.lf-x{margin-top:14px;font-size:12.5px;color:#a0a0b0;cursor:pointer;}" +
      ".lf-glow{outline:3px solid rgba(139,92,246,.9)!important;outline-offset:2px;border-radius:8px;animation:lf-g 1.2s infinite;}@keyframes lf-g{50%{outline-color:rgba(139,92,246,.35)}}";
    document.head.appendChild(s);
  }

  function tab(v) { return document.querySelector('.tab[data-view="' + v + '"]'); }
  function clickTab(v) { var el = tab(v); if (el) el.click(); }

  /* ---- 자동 시연 ---- */
  var _timer = null;
  function runAuto() {
    var seq = ["feed", "table", "gantt", "calendar", "activity", "insights"];
    var d = t();
    var bar = document.createElement("div"); bar.className = "lf-skip";
    bar.innerHTML = '<span class="dot"></span>' + d.skip + ' <b>↦</b>';
    bar.onclick = finishAuto;
    document.body.appendChild(bar);
    var i = 0;
    (function next() {
      if (i >= seq.length) { finishAuto(); return; }
      clickTab(seq[i]); i++;
      _timer = setTimeout(next, 3400);
    })();
  }
  function finishAuto() {
    if (_timer) { clearTimeout(_timer); _timer = null; }
    var b = document.querySelector(".lf-skip"); if (b) b.remove();
    clickTab("feed");
    openModal();
  }

  /* ---- 직접 해보기 ---- */
  function runManual() {
    var d = t();
    var btn = document.createElement("button"); btn.className = "lf-make"; btn.textContent = d.make;
    btn.onclick = openModal;
    document.body.appendChild(btn);
    // 다음 볼 곳 살짝 빛냄(부담 없는 넛지)
    var order = ["table", "gantt", "calendar", "activity"], gi = 0;
    function glowNext() {
      document.querySelectorAll(".lf-glow").forEach(function (e) { e.classList.remove("lf-glow"); });
      var el = tab(order[gi % order.length]); if (el) el.classList.add("lf-glow");
    }
    glowNext();
    var seen = {};
    document.addEventListener("click", function (e) {
      var tb = e.target.closest && e.target.closest('.tab[data-view]');
      if (tb) {
        tb.classList.remove("lf-glow"); seen[tb.getAttribute("data-view")] = 1; gi++;
        setTimeout(glowNext, 400);
        if (Object.keys(seen).length >= 3) btn.classList.add("pulse");
      }
    });
  }

  /* ---- 전환 모달 ---- */
  var _opened = false;
  function openModal() {
    if (_opened) return; _opened = true;
    var d = t();
    document.querySelectorAll(".lf-glow").forEach(function (e) { e.classList.remove("lf-glow"); });
    var mk = document.querySelector(".lf-make"); if (mk) mk.style.display = "none";
    var su = (CFG.signupUrl[LANG] || CFG.signupUrl.ja) + "?utm_source=demo&utm_medium=" + encodeURIComponent(MODE) + "&utm_campaign=" + encodeURIComponent(INST + "_" + ROLE);
    var ov = document.createElement("div"); ov.className = "lf-ov";
    ov.innerHTML =
      '<div class="lf-card">' +
      '<div class="lf-emo">✨</div>' +
      '<div class="lf-title">' + d.title + '</div>' +
      '<div class="lf-sub">' + d.sub + '</div>' +
      '<a class="lf-btn pri" id="lf-signup" href="' + su + '">' + d.signup + '</a>' +
      '<button class="lf-btn sec" id="lf-phone">' + d.phone + '</button>' +
      '<div id="lf-phase" style="display:none">' +
      '<div class="lf-row"><input class="lf-in" id="lf-in" inputmode="tel" placeholder="' + d.ph + '"><button class="lf-send" id="lf-send">' + d.send + '</button></div>' +
      '<div class="lf-consent">' + d.consent + '</div></div>' +
      '<div class="lf-ok lf-hide" id="lf-ok" style="display:none"></div>' +
      '<div class="lf-x" id="lf-x">' + d.back + '</div>' +
      '</div>';
    document.body.appendChild(ov);
    document.getElementById("lf-phone").onclick = function () {
      this.style.display = "none"; document.getElementById("lf-signup").style.display = "none";
      var p = document.getElementById("lf-phase"); p.style.display = "block";
      var inp = document.getElementById("lf-in"), snd = document.getElementById("lf-send");
      snd.disabled = true;
      inp.focus();
      inp.oninput = function () { snd.disabled = (inp.value.replace(/[^0-9]/g, "").length < 9); };
      snd.onclick = function () {
        if (inp.value.replace(/[^0-9]/g, "").length < 9) { alert(d.invalid); return; }
        snd.disabled = true;
        submitLead({ phone: inp.value.trim(), industry: INST, jobtitle: ROLE }, function () {
          p.style.display = "none";
          var ok = document.getElementById("lf-ok"); ok.textContent = d.ok; ok.style.display = "block";
        });
      };
    };
    document.getElementById("lf-x").onclick = function () { ov.remove(); _opened = false; };
  }

  function submitLead(data, cb) {
    var g = CFG.hubspot.formGuid;
    if (!g) {
      try { var a = JSON.parse(localStorage.getItem("mm_demo_leads") || "[]"); a.push(Object.assign({ at: new Date().toISOString(), page: location.href, src: "leadflow-" + MODE }, data)); localStorage.setItem("mm_demo_leads", JSON.stringify(a)); } catch (e) {}
      return cb && cb(true, "local");
    }
    var payload = { fields: [
      { name: "phone", value: data.phone },
      { name: "industry", value: data.industry || "" },
      { name: "jobtitle", value: data.jobtitle || "" }
    ], context: { pageUri: location.href, pageName: "leadflow-" + MODE } };
    fetch("https://api.hsforms.com/submissions/v3/integration/submit/" + CFG.hubspot.portalId + "/" + g,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { cb && cb(r.ok, r.status); }, function () { cb && cb(false, "err"); });
  }

  /* --- 부팅: 탭이 준비되면 시작 --- */
  function boot() {
    css();
    var n = 0, iv = setInterval(function () {
      n++;
      if (document.querySelector('.tab[data-view]')) {
        clearInterval(iv);
        setTimeout(function () { if (MODE === "auto") runAuto(); else runManual(); }, 900);
      } else if (n > 40) { clearInterval(iv); }
    }, 150);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
