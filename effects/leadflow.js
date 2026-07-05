/* =========================================================================
   leadflow.js — 리드용 가이드 워크스루 (app.html 전용)
   - 활성 조건: ?mode=auto|manual 또는 ?convert=1 (없으면 no-op → 무회귀)
   - mode=auto   : 코치마크 말풍선으로 뷰를 순회하며 자동 시연(편안한 속도 + 일시정지)
   - mode=manual : "하나씩" 튜토리얼 — 사용자가 [다음]으로 진행(자기주도)
   - 끝(convert=1): "진짜로 만들어드릴까요?" → 무료가입 / 상담(전화번호, HubSpot 보류·로컬폴백)
   - UX 원칙(타사 조사 반영): 5스텝, 첫 화면 모달, 스텝당 5~10초, 툴팁 25~30단어·혜택중심,
     진행표시(n/5)+시각 비콘, 이탈구 상시(건너뛰기/ESC), 다음/뒤로/일시정지.
   ========================================================================= */
(function () {
  "use strict";
  var Q; try { Q = new URLSearchParams(location.search); } catch (e) { return; }
  var MODE = Q.get("mode");
  var CONVERT = Q.get("convert") === "1";
  if (MODE !== "auto" && MODE !== "manual" && !CONVERT) return;   // 무회귀 가드
  if (MODE !== "manual") MODE = "auto";                            // convert만 있으면 자동

  var LANG = Q.get("lang") || (function () { try { return localStorage.getItem("mm_lang"); } catch (e) { return null; } })() || "ja";
  var NAME = Q.get("name") || "", COMPANY = Q.get("company") || "", INST = Q.get("inst") || "", ROLE = Q.get("role") || "";
  var AUTO_MS = 7000;

  var CFG = {
    signupUrl: { ko: "https://flow.team", ja: "https://flow.team", en: "https://flow.team" },
    hubspot: { portalId: "24076689", formGuid: "" }  // HubSpot 보류: 비면 로컬 폴백
  };

  var T = {
    ko: {
      wTitle: (COMPANY ? COMPANY + "의 " : "") + "워크스페이스가 준비됐어요",
      wBody: "팀의 일이 어떻게 한곳에서 굴러가는지 30초만 함께 볼까요? 언제든 멈추거나 직접 만져볼 수 있어요.",
      start: "둘러보기 시작", skip: "건너뛰기", next: "다음", back: "뒤로", finish: "완료",
      steps: {
        feed: { t: "피드 — 팀의 오늘", b: "누가 뭘 하는지, 새 소식과 요청이 여기 모여요. 대화가 그대로 업무로 이어져요." },
        table: { t: "전체 업무 한눈에", b: "모든 일을 상태·담당자·기한으로 한 표에. 누가 언제까지 뭘 하는지 바로 보여요." },
        gantt: { t: "일정을 타임라인으로", b: "프로젝트 전체 일정을 간트로. 막대만 끌면 기간이 정리돼요." },
        calendar: { t: "캘린더 하나로", b: "업무·일정·출퇴근까지 한 달력에. 이번 달에 뭐가 있는지 한눈에." },
        insights: { t: "리포트 자동 집계", b: "진척률·담당자별 성과가 저절로 모여요. 보고서 만드느라 야근할 필요 없어요." }
      },
      cTitle: "이 워크스페이스, 진짜로 만들어드릴까요?",
      cBody: "지금 무료로 시작하거나, 번호만 남겨주시면 세팅해서 보내드릴게요.",
      signup: "무료로 시작하기", consult: "상담 신청 (번호 남기기)",
      phPh: "010-1234-5678", send: "보내기",
      consent: "연락처는 워크스페이스 안내 목적에만 사용되며 언제든 수신 거부할 수 있어요.",
      ok: "✓ 접수됐어요! 세팅 후 문자로 보내드릴게요.", invalid: "전화번호를 확인해 주세요.", again: "다시 보기"
    },
    ja: {
      wTitle: (COMPANY ? COMPANY + "の " : "") + "ワークスペースが完成しました",
      wBody: "チームの仕事がどう一か所で回るか、30秒だけ一緒に見ませんか?いつでも止めたり自分で触れます。",
      start: "見てみる", skip: "スキップ", next: "次へ", back: "戻る", finish: "完了",
      steps: {
        feed: { t: "フィード — チームの今日", b: "誰が何をしているか、新着や依頼がここに集まります。会話がそのまま業務につながります。" },
        table: { t: "全体タスクを一目で", b: "すべての仕事をステータス・担当・期日で一つの表に。誰がいつまでに何をするか一目瞭然。" },
        gantt: { t: "予定をタイムラインで", b: "プロジェクト全体の予定をガントで。バーをドラッグするだけで期間が整います。" },
        calendar: { t: "カレンダー一つで", b: "業務・予定・出退勤まで一つのカレンダーに。今月の予定が一目で分かります。" },
        insights: { t: "レポート自動集計", b: "進捗率や担当者別の成果が自動で集まります。報告書作りで残業する必要はありません。" }
      },
      cTitle: "このワークスペース、実際に作りましょうか?",
      cBody: "今すぐ無料で始めるか、番号を頂ければ設定してお送りします。",
      signup: "無料で始める", consult: "相談する (番号を残す)",
      phPh: "090-1234-5678", send: "送信",
      consent: "連絡先はワークスペース案内の目的にのみ使用し、いつでも配信停止できます。",
      ok: "✓ 受け付けました!設定後にSMSでお送りします。", invalid: "電話番号をご確認ください。", again: "もう一度"
    },
    en: {
      wTitle: (COMPANY ? COMPANY + "'s " : "Your ") + "workspace is ready",
      wBody: "Want a 30-second look at how your team's work runs in one place? You can pause or try it yourself anytime.",
      start: "Take a look", skip: "Skip", next: "Next", back: "Back", finish: "Done",
      steps: {
        feed: { t: "Feed — your team today", b: "Who's doing what, plus news and requests, all in one place. Conversations turn straight into work." },
        table: { t: "All tasks at a glance", b: "Every task by status, owner and due date in one table. See who does what by when, instantly." },
        gantt: { t: "Schedule as a timeline", b: "Your whole project timeline as a Gantt. Just drag a bar to adjust the dates." },
        calendar: { t: "One calendar", b: "Tasks, events and attendance in a single calendar. See the whole month at a glance." },
        insights: { t: "Reports, automatic", b: "Progress and per-owner performance roll up on their own. No more late nights on reports." }
      },
      cTitle: "Shall we build this workspace for real?",
      cBody: "Start free now, or leave your number and we'll set it up and send it over.",
      signup: "Start free", consult: "Talk to us (leave number)",
      phPh: "+81 90 1234 5678", send: "Send",
      consent: "We use your contact only to send workspace info; you can opt out anytime.",
      ok: "✓ Got it! We'll text you after setup.", invalid: "Please check the phone number.", again: "Replay"
    }
  };
  var D = T[LANG] || T.ja;
  var VIEWS = ["feed", "table", "gantt", "calendar", "insights"];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function el(tag, id) { var e = document.createElement(tag); if (id) e.id = id; return e; }

  var CSS = ""
    + "#lf{position:fixed;inset:0;z-index:99000;font-family:Roboto,'Noto Sans JP','Noto Sans KR',sans-serif;}"
    + "#lf-catch{position:absolute;inset:0;background:transparent;}"
    + "#lf-spot{position:absolute;border-radius:12px;box-shadow:0 0 0 100vmax rgba(12,12,22,.58);border:2px solid rgba(139,92,246,.7);transition:all .45s cubic-bezier(.4,0,.2,1);pointer-events:none;}"
    + "#lf-beacon{position:absolute;width:16px;height:16px;pointer-events:none;transition:all .45s cubic-bezier(.4,0,.2,1);}"
    + "#lf-beacon i{position:absolute;inset:0;border-radius:50%;background:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.35);}"
    + "#lf-beacon::after{content:'';position:absolute;inset:0;border-radius:50%;background:rgba(139,92,246,.55);animation:lfpulse 1.5s ease-out infinite;}"
    + "@keyframes lfpulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}"
    + "#lf-tip{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);width:min(430px,92vw);background:#181722;color:#eae9f2;border:1px solid rgba(255,255,255,.1);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.55);padding:18px 18px 0;overflow:hidden;}"
    + "#lf-tip.center{top:50%;bottom:auto;transform:translate(-50%,-50%);width:min(400px,92vw);text-align:center;padding-top:24px;}"
    + ".lf-step{font-size:11.5px;font-weight:800;letter-spacing:.4px;color:#9a8cff;}"
    + ".lf-emo{font-size:36px;line-height:1;margin-bottom:6px;}"
    + ".lf-t{font-size:17px;font-weight:800;margin:6px 0;letter-spacing:-.2px;}"
    + ".lf-b{font-size:13.5px;line-height:1.6;color:#c7c7d8;}"
    + ".lf-dots{display:flex;gap:5px;justify-content:center;margin-top:12px;}"
    + ".lf-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18);transition:.2s;}"
    + ".lf-dots i.on{background:#8b5cf6;width:18px;border-radius:3px;}"
    + ".lf-ctrls{display:flex;align-items:center;gap:8px;margin-top:16px;padding-bottom:16px;}"
    + ".lf-skip{font-size:12px;color:#8a8a9c;cursor:pointer;background:none;border:0;font-family:inherit;padding:6px 2px;}"
    + ".lf-skip:hover{color:#c7c7d8;text-decoration:underline;}"
    + ".lf-sp{flex:1;}"
    + ".lf-btn{border:0;border-radius:10px;padding:10px 16px;font:800 13.5px inherit;cursor:pointer;transition:.13s;color:#dcdcec;}"
    + ".lf-btn.ghost{background:rgba(255,255,255,.08);}.lf-btn.ghost:hover{background:rgba(255,255,255,.14);}"
    + ".lf-btn.pri{background:linear-gradient(135deg,#8b5cf6,#6449FC);color:#fff;box-shadow:0 8px 20px rgba(100,73,252,.42);}"
    + ".lf-btn.pri:hover{transform:translateY(-1px);}"
    + ".lf-btn.ic{width:38px;padding:10px 0;text-align:center;}"
    + ".lf-prog{position:absolute;left:0;bottom:0;height:3px;background:linear-gradient(90deg,#8b5cf6,#6449FC);width:0;}"
    + ".lf-fade{animation:lffade .4s ease both;}@keyframes lffade{from{opacity:0;transform:translateY(8px)}to{opacity:1}}"
    + ".lf-cta{display:block;width:100%;text-align:center;text-decoration:none;border:0;border-radius:12px;padding:14px 0;font:800 15px inherit;cursor:pointer;margin-top:10px;}"
    + ".lf-cta.pri{background:linear-gradient(135deg,#8b5cf6,#6449FC);color:#fff;box-shadow:0 12px 30px rgba(100,73,252,.45);}"
    + ".lf-cta.sec{background:rgba(255,255,255,.07);color:#dcdcec;border:1px solid rgba(255,255,255,.12);}"
    + ".lf-crow{display:flex;gap:8px;margin-top:10px;}"
    + ".lf-in{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:12px 13px;color:#fff;font:600 14px inherit;outline:none;}"
    + ".lf-in:focus{border-color:#8b5cf6;}"
    + ".lf-send{border:0;border-radius:10px;padding:0 16px;font:800 13px inherit;color:#fff;background:#6449FC;cursor:pointer;}.lf-send:disabled{opacity:.4;cursor:not-allowed;}"
    + ".lf-consent{font-size:10.5px;color:#7c7c92;margin-top:8px;line-height:1.5;}"
    + ".lf-okmsg{font-size:13.5px;color:#5fe0a0;font-weight:700;padding:8px 0 4px;}";

  var root, spot, beacon, tip, catchEl, styleEl;
  var idx = -1;
  var timer = null, remain = AUTO_MS, tStart = 0, paused = false;

  function switchView(v) { var tab = document.querySelector('.tab[data-view="' + v + '"]'); if (tab) tab.click(); }
  function rectOf(sel) { var e = document.querySelector(sel); return e ? e.getBoundingClientRect() : null; }

  function positionFor(view) {
    var r = rectOf('.vsec[data-view="' + view + '"]') || rectOf('.content');
    if (r && r.height > 20) {
      var pad = 6;
      spot.style.display = "";
      spot.style.left = Math.max(4, r.left - pad) + "px";
      spot.style.top = Math.max(4, r.top - pad) + "px";
      spot.style.width = Math.min(window.innerWidth - 8, r.width + pad * 2) + "px";
      spot.style.height = Math.min(window.innerHeight - 8, r.height + pad * 2) + "px";
    } else { spot.style.display = "none"; }
    var tr = rectOf('.tab[data-view="' + view + '"]');
    if (tr) { beacon.style.display = ""; beacon.style.left = (tr.left + tr.width - 6) + "px"; beacon.style.top = (tr.top - 4) + "px"; }
    else { beacon.style.display = "none"; }
  }

  function stopTimer() { if (timer) { clearTimeout(timer); timer = null; } }
  function startTimer(ms) {
    stopTimer(); if (MODE !== "auto") return;
    remain = ms; tStart = Date.now(); paused = false;
    var pf = tip.querySelector(".lf-prog");
    if (pf) { pf.style.transition = "none"; pf.style.width = "0%"; void pf.offsetWidth; pf.style.transition = "width " + ms + "ms linear"; pf.style.width = "100%"; }
    timer = setTimeout(next, ms);
  }
  function pauseTimer() {
    if (MODE !== "auto" || paused) return; paused = true; stopTimer();
    remain = Math.max(500, remain - (Date.now() - tStart));
    var pf = tip.querySelector(".lf-prog"); if (pf) { var w = getComputedStyle(pf).width; pf.style.transition = "none"; pf.style.width = w; }
    paintPause();
  }
  function resumeTimer() { if (MODE !== "auto" || !paused) return; startTimer(remain); paintPause(); }
  function paintPause() { var b = tip.querySelector(".lf-pause"); if (b) b.innerHTML = paused ? "▶" : "❚❚"; }

  function renderWelcome() {
    stopTimer(); idx = -1; spot.style.display = "none"; beacon.style.display = "none";
    tip.className = "center lf-fade";
    tip.innerHTML =
      '<div class="lf-emo">🎬</div>'
      + '<div class="lf-t">' + esc(D.wTitle) + '</div>'
      + '<div class="lf-b">' + esc(D.wBody) + '</div>'
      + '<div class="lf-ctrls" style="justify-content:center;padding-bottom:18px;">'
      + '<button class="lf-btn ghost lf-skip2">' + esc(D.skip) + '</button>'
      + '<button class="lf-btn pri lf-start">' + esc(D.start) + ' →</button>'
      + '</div>';
    tip.querySelector(".lf-start").onclick = function () { idx = 0; renderStep(); };
    tip.querySelector(".lf-skip2").onclick = finish;
  }

  function renderStep() {
    var view = VIEWS[idx];
    switchView(view);
    setTimeout(function () { positionFor(view); }, 380);
    var s = D.steps[view];
    tip.className = "lf-fade";
    var dots = VIEWS.map(function (_, i) { return '<i class="' + (i === idx ? "on" : "") + '"></i>'; }).join("");
    var pauseBtn = MODE === "auto" ? '<button class="lf-btn ghost ic lf-pause">❚❚</button>' : "";
    var backBtn = idx > 0 ? '<button class="lf-btn ghost lf-back">' + esc(D.back) + '</button>' : "";
    var last = idx >= VIEWS.length - 1;
    tip.innerHTML =
      '<div class="lf-step">' + (idx + 1) + ' / ' + VIEWS.length + '</div>'
      + '<div class="lf-t">' + esc(s.t) + '</div>'
      + '<div class="lf-b">' + esc(s.b) + '</div>'
      + '<div class="lf-dots">' + dots + '</div>'
      + '<div class="lf-ctrls">'
      + '<button class="lf-skip">' + esc(D.skip) + '</button><span class="lf-sp"></span>'
      + pauseBtn + backBtn
      + '<button class="lf-btn pri lf-next">' + esc(last ? D.finish : D.next) + (last ? '' : ' →') + '</button>'
      + '</div><div class="lf-prog"></div>';
    tip.querySelector(".lf-next").onclick = next;
    var bk = tip.querySelector(".lf-back"); if (bk) bk.onclick = back;
    tip.querySelector(".lf-skip").onclick = finish;
    var pz = tip.querySelector(".lf-pause"); if (pz) pz.onclick = function () { paused ? resumeTimer() : pauseTimer(); };
    startTimer(AUTO_MS);
  }

  function next() { stopTimer(); if (idx < VIEWS.length - 1) { idx++; renderStep(); } else { finish(); } }
  function back() { stopTimer(); if (idx > 0) { idx--; renderStep(); } else { renderWelcome(); } }

  function renderConvert() {
    stopTimer(); idx = VIEWS.length; spot.style.display = "none"; beacon.style.display = "none";
    tip.className = "center lf-fade";
    var su = (CFG.signupUrl[LANG] || CFG.signupUrl.ja) + "?utm_source=demo&utm_medium=" + encodeURIComponent(MODE) + "&utm_campaign=" + encodeURIComponent(INST + "_" + ROLE);
    tip.innerHTML =
      '<div class="lf-emo">🚀</div>'
      + '<div class="lf-t">' + esc(D.cTitle) + '</div>'
      + '<div class="lf-b">' + esc(D.cBody) + '</div>'
      + '<a class="lf-cta pri" href="' + su + '">' + esc(D.signup) + ' →</a>'
      + '<button class="lf-cta sec lf-open">' + esc(D.consult) + '</button>'
      + '<div class="lf-form" style="display:none">'
      + '<div class="lf-crow"><input class="lf-in" inputmode="tel" placeholder="' + esc(D.phPh) + '"><button class="lf-send" disabled>' + esc(D.send) + '</button></div>'
      + '<div class="lf-consent">' + esc(D.consent) + '</div></div>'
      + '<div class="lf-okmsg" style="display:none"></div>'
      + '<div style="margin-top:12px"><button class="lf-skip lf-again">↺ ' + esc(D.again) + '</button></div>';
    tip.querySelector(".lf-again").onclick = renderWelcome;
    var openB = tip.querySelector(".lf-open"), form = tip.querySelector(".lf-form");
    openB.onclick = function () { openB.style.display = "none"; form.style.display = ""; form.querySelector(".lf-in").focus(); };
    var inp = form.querySelector(".lf-in"), snd = form.querySelector(".lf-send"), okm = tip.querySelector(".lf-okmsg");
    function valid(v) { return v.replace(/[^0-9]/g, "").length >= 9; }
    inp.oninput = function () { snd.disabled = !valid(inp.value); };
    snd.onclick = function () {
      if (!valid(inp.value)) { alert(D.invalid); return; }
      snd.disabled = true;
      submitLead({ phone: inp.value.trim(), firstname: NAME, industry: INST, jobtitle: ROLE }, function () {
        form.style.display = "none"; okm.style.display = ""; okm.textContent = D.ok;
      });
    };
  }

  function submitLead(data, cb) {
    var g = CFG.hubspot.formGuid;
    if (!g) {
      try { var a = JSON.parse(localStorage.getItem("mm_demo_leads") || "[]"); a.push(Object.assign({ at: new Date().toISOString(), page: location.href, src: "leadflow-" + MODE }, data)); localStorage.setItem("mm_demo_leads", JSON.stringify(a)); } catch (e) { }
      return cb && cb(true, "local");
    }
    var payload = { fields: [
      { name: "phone", value: data.phone }, { name: "firstname", value: data.firstname || "" },
      { name: "industry", value: data.industry || "" }, { name: "jobtitle", value: data.jobtitle || "" }
    ], context: { pageUri: location.href, pageName: "leadflow-" + MODE } };
    fetch("https://api.hsforms.com/submissions/v3/integration/submit/" + CFG.hubspot.portalId + "/" + g,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { cb && cb(r.ok, r.status); }, function () { cb && cb(false, "err"); });
  }

  function finish() { stopTimer(); if (CONVERT) renderConvert(); else teardown(); }
  function teardown() { stopTimer(); if (root && root.parentNode) root.parentNode.removeChild(root); window.removeEventListener("resize", onResize); document.removeEventListener("keydown", onKey); }

  function onResize() { if (idx >= 0 && idx < VIEWS.length) positionFor(VIEWS[idx]); }
  function onKey(e) {
    if (e.key === "Escape") finish();
    else if (e.key === " " && MODE === "auto" && idx >= 0 && idx < VIEWS.length) { e.preventDefault(); paused ? resumeTimer() : pauseTimer(); }
    else if (e.key === "ArrowRight" && idx >= 0 && idx < VIEWS.length) next();
    else if (e.key === "ArrowLeft" && idx >= 0 && idx < VIEWS.length) back();
  }

  function build() {
    styleEl = el("style"); styleEl.textContent = CSS; document.head.appendChild(styleEl);
    root = el("div", "lf");
    catchEl = el("div", "lf-catch");
    spot = el("div", "lf-spot"); spot.style.display = "none";
    beacon = el("div", "lf-beacon"); beacon.innerHTML = "<i></i>"; beacon.style.display = "none";
    tip = el("div", "lf-tip");
    root.appendChild(catchEl); root.appendChild(spot); root.appendChild(beacon); root.appendChild(tip);
    document.body.appendChild(root);
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    renderWelcome();
  }
  function ready(cb) {
    var n = 0; (function w() {
      if (document.querySelector('.tab[data-view="feed"]') && document.querySelector('.vsec[data-view="feed"]')) return cb();
      if (n++ < 50) setTimeout(w, 100);
    })();
  }
  function boot() { ready(function () { setTimeout(build, 500); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__LEADFLOW = { finish: finish, teardown: teardown };
})();
