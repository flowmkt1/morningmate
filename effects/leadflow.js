/* =========================================================================
   leadflow.js — 리드용 가이드 워크스루 (app.html 전용) · v3
   개선(타사 조사 반영: Productboard/Paragon/Cognism/Flagsmith 등):
   - 자기주도(사용자 Next) 우선 + 자동은 느리게(9s)+일시정지
   - "목차(체크리스트)"로 제품 전 영역(7)을 보여주고 원하는 곳으로 점프(방문 ✓)
   - 웰컴 모달 WIIFM("약 1~2분"), 진행표시(n/7), 뒤로/앞으로 리로드 없음
   - 코치마크 말풍선(혜택중심)+스포트라이트+탭 비콘, 이탈구 상시(건너뛰기/ESC)
   - 끝(convert=1): 전환 모달(무료가입 / 상담 전화번호, HubSpot 보류·로컬폴백)
   - 활성: ?mode=auto|manual 또는 ?convert=1 (없으면 no-op → 무회귀)
   ========================================================================= */
(function () {
  "use strict";
  var Q; try { Q = new URLSearchParams(location.search); } catch (e) { return; }
  var MODE = Q.get("mode");
  var CONVERT = Q.get("convert") === "1";
  if (MODE !== "auto" && MODE !== "manual" && !CONVERT) return;
  if (MODE !== "manual") MODE = "auto";

  var LANG = Q.get("lang") || (function () { try { return localStorage.getItem("mm_lang"); } catch (e) { return null; } })() || "ja";
  var NAME = Q.get("name") || "", COMPANY = Q.get("company") || "", INST = Q.get("inst") || "", ROLE = Q.get("role") || "";
  var AUTO_MS = 9000;  // 자동 스텝(느긋하게)

  var CFG = {
    signupUrl: { ko: "https://flow.team", ja: "https://flow.team", en: "https://flow.team" },
    hubspot: { portalId: "24076689", formGuid: "" }
  };

  // 제품 전 영역(7). icon=목차 아이콘.
  var CHAPS = [
    { v: "feed", ic: "🏠" }, { v: "table", ic: "✅" }, { v: "gantt", ic: "📊" },
    { v: "calendar", ic: "📅" }, { v: "files", ic: "📁" }, { v: "activity", ic: "🔔" }, { v: "insights", ic: "📈" }
  ];
  var VIEWS = CHAPS.map(function (c) { return c.v; });
  var TOTAL = VIEWS.length;

  var T = {
    ko: {
      wTitle: (COMPANY ? COMPANY + "의 " : "") + "워크스페이스가 준비됐어요",
      wBody: "팀의 일이 한곳에서 어떻게 굴러가는지 1~2분이면 감이 와요. 순서대로 봐도 되고, <b>목차</b>에서 원하는 곳만 골라 봐도 돼요. 언제든 멈추거나 직접 만져볼 수 있어요.",
      start: "둘러보기 시작", skip: "건너뛰기", next: "다음", back: "뒤로", finish: "완료", toc: "목차", tocSub: "보고 싶은 곳을 눌러 바로 이동",
      names: { feed: "피드", table: "전체 업무", gantt: "간트 일정", calendar: "캘린더", files: "라이브러리", activity: "활동", insights: "리포트" },
      steps: {
        feed: { t: "피드 — 팀의 오늘", b: "누가 뭘 하는지, 새 소식·요청·결정이 여기 모여요. 메신저처럼 대화하고 그 자리에서 업무·투표·일정으로 바뀌어요." },
        table: { t: "전체 업무 한눈에", b: "모든 일을 상태·담당자·기한으로 한 표에. 하위 업무·진척률·예산까지 접었다 폈다 하며 누가 언제까지 뭘 하는지 바로 봐요." },
        gantt: { t: "일정을 타임라인으로", b: "프로젝트 전체 일정을 간트로. 막대를 끌어 기간을 바꾸고, 오늘 선으로 지금 어디쯤인지 한눈에." },
        calendar: { t: "캘린더 하나로", b: "업무 기한·일정·출퇴근까지 한 달력에. 이번 달에 뭐가 몰려 있는지 색으로 바로 보여요." },
        files: { t: "자료는 라이브러리에", b: "업무에 붙인 파일이 프로젝트별로 자동 정리돼요. 어디 뒀는지 뒤질 필요 없이 검색·필터로 바로 찾아요." },
        activity: { t: "놓친 것 없이 활동", b: "멘션·댓글·상태 변경이 활동에 모여요. 자리를 비웠어도 무슨 일이 있었는지 흐름을 그대로 따라잡아요." },
        insights: { t: "리포트는 자동으로", b: "진척률·담당자별 성과·주간 추이가 저절로 집계돼요. 위젯을 골라 우리 팀 대시보드를 만들고, 보고서 야근은 끝." }
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
      wBody: "チームの仕事が一か所でどう回るか、1〜2分で掴めます。順番に見ても、<b>目次</b>から見たい所だけ選んでもOK。いつでも止めたり自分で触れます。",
      start: "見てみる", skip: "スキップ", next: "次へ", back: "戻る", finish: "完了", toc: "目次", tocSub: "見たい所を押してすぐ移動",
      names: { feed: "フィード", table: "全体タスク", gantt: "ガント", calendar: "カレンダー", files: "ライブラリ", activity: "アクティビティ", insights: "レポート" },
      steps: {
        feed: { t: "フィード — チームの今日", b: "誰が何を、新着・依頼・決定がここに集まります。チャット感覚で会話し、その場で業務・投票・予定に変わります。" },
        table: { t: "全体タスクを一目で", b: "すべての仕事をステータス・担当・期日で一つの表に。サブタスク・進捗・予算まで開閉しながら、誰がいつまでに何をか一目瞭然。" },
        gantt: { t: "予定をタイムラインで", b: "プロジェクト全体の予定をガントで。バーをドラッグして期間を変え、今日ラインで現在地が一目で分かります。" },
        calendar: { t: "カレンダー一つで", b: "業務の期日・予定・出退勤まで一つのカレンダーに。今月どこが混んでいるか色で分かります。" },
        files: { t: "資料はライブラリに", b: "業務に添付したファイルがプロジェクト別に自動整理。どこに置いたか探さず、検索・フィルタですぐ見つかります。" },
        activity: { t: "見逃さないアクティビティ", b: "メンション・コメント・ステータス変更がここに集約。席を外していても、何があったか流れをそのまま追えます。" },
        insights: { t: "レポートは自動で", b: "進捗率・担当者別の成果・週次推移が自動集計。ウィジェットを選んでチームのダッシュボードを作れ、報告書の残業は不要。" }
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
      wBody: "Get a feel for how your team's work runs in one place in 1–2 min. Go in order, or pick sections from the <b>menu</b>. Pause or try it yourself anytime.",
      start: "Take a look", skip: "Skip", next: "Next", back: "Back", finish: "Done", toc: "Sections", tocSub: "Tap any section to jump",
      names: { feed: "Feed", table: "Tasks", gantt: "Gantt", calendar: "Calendar", files: "Files", activity: "Activity", insights: "Insights" },
      steps: {
        feed: { t: "Feed — your team today", b: "Who's doing what — news, requests and decisions in one place. Chat like a messenger, and turn it into tasks, votes or events right there." },
        table: { t: "All tasks at a glance", b: "Every task by status, owner and due date in one table. Expand subtasks, progress and budget — see who does what by when instantly." },
        gantt: { t: "Schedule as a timeline", b: "Your whole project timeline as a Gantt. Drag a bar to change dates; the today line shows where you are." },
        calendar: { t: "One calendar", b: "Task due dates, events and attendance in a single calendar. See where the month gets busy, by color." },
        files: { t: "Files in the library", b: "Files attached to work are auto-organized by project. No hunting — search and filter to find them fast." },
        activity: { t: "Never miss a thing", b: "Mentions, comments and status changes roll up here. Step away and still catch the whole flow of what happened." },
        insights: { t: "Reports, automatic", b: "Progress, per-owner performance and weekly trends roll up on their own. Pick widgets for your team dashboard — no report all-nighters." }
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

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function el(tag, id) { var e = document.createElement(tag); if (id) e.id = id; return e; }

  var CSS = ""
    + "#lf{position:fixed;inset:0;z-index:99000;font-family:Roboto,'Noto Sans JP','Noto Sans KR',sans-serif;}"
    + "#lf-catch{position:absolute;inset:0;background:transparent;}"
    + "#lf-spot{position:absolute;border-radius:12px;box-shadow:0 0 0 100vmax rgba(12,12,22,.55);border:2px solid rgba(139,92,246,.7);transition:all .5s cubic-bezier(.4,0,.2,1);pointer-events:none;}"
    + "#lf-beacon{position:absolute;width:16px;height:16px;pointer-events:none;transition:all .5s cubic-bezier(.4,0,.2,1);}"
    + "#lf-beacon i{position:absolute;inset:0;border-radius:50%;background:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.35);}"
    + "#lf-beacon::after{content:'';position:absolute;inset:0;border-radius:50%;background:rgba(139,92,246,.55);animation:lfpulse 1.6s ease-out infinite;}"
    + "@keyframes lfpulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}"
    + "#lf-tip{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);width:min(440px,93vw);background:#181722;color:#eae9f2;border:1px solid rgba(255,255,255,.1);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.55);padding:18px 18px 0;overflow:hidden;}"
    + "#lf-tip.center{top:50%;bottom:auto;transform:translate(-50%,-50%);width:min(410px,93vw);text-align:center;padding-top:24px;}"
    + ".lf-step{font-size:11.5px;font-weight:800;letter-spacing:.4px;color:#9a8cff;display:flex;align-items:center;gap:8px;}"
    + ".lf-toc-btn{margin-left:auto;font-weight:700;color:#c7c7d8;background:rgba(255,255,255,.08);border:0;border-radius:8px;padding:5px 9px;font:700 11px inherit;cursor:pointer;}"
    + ".lf-toc-btn:hover{background:rgba(255,255,255,.15);}"
    + ".lf-emo{font-size:36px;line-height:1;margin-bottom:6px;}"
    + ".lf-t{font-size:17px;font-weight:800;margin:8px 0 7px;letter-spacing:-.2px;}"
    + ".lf-b{font-size:13.5px;line-height:1.62;color:#c9c9db;}"
    + ".lf-b b{color:#b9a9ff;}"
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
    + ".lf-fade{animation:lffade .42s ease both;}@keyframes lffade{from{opacity:0;transform:translateY(8px)}to{opacity:1}}"
    // 목차 팝오버
    + "#lf-toc{position:absolute;left:50%;bottom:96px;transform:translateX(-50%);width:min(300px,90vw);background:#1f1d2c;border:1px solid rgba(255,255,255,.12);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.6);padding:12px;display:none;}"
    + "#lf-toc.on{display:block;animation:lffade .25s ease both;}"
    + ".lf-toc-h{font-size:12px;color:#a7a7bb;font-weight:800;padding:4px 6px 8px;}"
    + ".lf-toc-h span{display:block;font-weight:500;color:#7c7c92;font-size:10.5px;margin-top:2px;}"
    + ".lf-toc-i{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:9px;font-size:13.5px;color:#dcdcec;cursor:pointer;}"
    + ".lf-toc-i:hover{background:rgba(255,255,255,.07);}"
    + ".lf-toc-i.cur{background:rgba(139,92,246,.18);color:#fff;font-weight:700;}"
    + ".lf-toc-i .n{width:20px;text-align:center;}.lf-toc-i .nm{flex:1;}"
    + ".lf-toc-i .ck{color:#5fe0a0;font-size:12px;opacity:0;}.lf-toc-i.done .ck{opacity:1;}"
    // 전환 CTA
    + ".lf-cta{display:block;width:100%;text-align:center;text-decoration:none;border:0;border-radius:12px;padding:14px 0;font:800 15px inherit;cursor:pointer;margin-top:10px;}"
    + ".lf-cta.pri{background:linear-gradient(135deg,#8b5cf6,#6449FC);color:#fff;box-shadow:0 12px 30px rgba(100,73,252,.45);}"
    + ".lf-cta.sec{background:rgba(255,255,255,.07);color:#dcdcec;border:1px solid rgba(255,255,255,.12);}"
    + ".lf-crow{display:flex;gap:8px;margin-top:10px;}"
    + ".lf-in{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:12px 13px;color:#fff;font:600 14px inherit;outline:none;}"
    + ".lf-in:focus{border-color:#8b5cf6;}"
    + ".lf-send{border:0;border-radius:10px;padding:0 16px;font:800 13px inherit;color:#fff;background:#6449FC;cursor:pointer;}.lf-send:disabled{opacity:.4;cursor:not-allowed;}"
    + ".lf-consent{font-size:10.5px;color:#7c7c92;margin-top:8px;line-height:1.5;}"
    + ".lf-okmsg{font-size:13.5px;color:#5fe0a0;font-weight:700;padding:8px 0 4px;}";

  var root, spot, beacon, tip, toc, catchEl, styleEl;
  var idx = -1, visited = {};
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
    remain = Math.max(600, remain - (Date.now() - tStart));
    var pf = tip.querySelector(".lf-prog"); if (pf) { var w = getComputedStyle(pf).width; pf.style.transition = "none"; pf.style.width = w; }
    paintPause();
  }
  function resumeTimer() { if (MODE !== "auto" || !paused) return; startTimer(remain); paintPause(); }
  function paintPause() { var b = tip.querySelector(".lf-pause"); if (b) b.innerHTML = paused ? "▶" : "❚❚"; }

  function hideToc() { toc.className = ""; }
  function buildToc() {
    toc.innerHTML = '<div class="lf-toc-h">' + esc(D.toc) + '<span>' + esc(D.tocSub) + '</span></div>'
      + CHAPS.map(function (c, i) {
        return '<div class="lf-toc-i' + (i === idx ? " cur" : "") + (visited[i] ? " done" : "") + '" data-i="' + i + '"><span class="n">' + c.ic + '</span><span class="nm">' + esc(D.names[c.v]) + '</span><span class="ck">✓</span></div>';
      }).join("");
    toc.onclick = function (e) { var it = e.target.closest("[data-i]"); if (!it) return; hideToc(); idx = +it.getAttribute("data-i"); renderStep(); };
  }

  function renderWelcome() {
    stopTimer(); idx = -1; hideToc(); spot.style.display = "none"; beacon.style.display = "none";
    tip.className = "center lf-fade";
    tip.innerHTML =
      '<div class="lf-emo">🎬</div>'
      + '<div class="lf-t">' + esc(D.wTitle) + '</div>'
      + '<div class="lf-b">' + D.wBody + '</div>'
      + '<div class="lf-ctrls" style="justify-content:center;padding-bottom:18px;">'
      + '<button class="lf-btn ghost lf-skip2">' + esc(D.skip) + '</button>'
      + '<button class="lf-btn pri lf-start">' + esc(D.start) + ' →</button>'
      + '</div>';
    tip.querySelector(".lf-start").onclick = function () { idx = 0; renderStep(); };
    tip.querySelector(".lf-skip2").onclick = finish;
  }

  function renderStep() {
    var view = VIEWS[idx];
    visited[idx] = 1;
    switchView(view);
    setTimeout(function () { positionFor(view); }, 400);
    var s = D.steps[view];
    tip.className = "lf-fade";
    var pauseBtn = MODE === "auto" ? '<button class="lf-btn ghost ic lf-pause">❚❚</button>' : "";
    var backBtn = idx > 0 ? '<button class="lf-btn ghost lf-back">' + esc(D.back) + '</button>' : "";
    var last = idx >= TOTAL - 1;
    tip.innerHTML =
      '<div class="lf-step">' + (idx + 1) + ' / ' + TOTAL + ' · ' + esc(D.names[view]) + '<button class="lf-toc-btn">☰ ' + esc(D.toc) + '</button></div>'
      + '<div class="lf-t">' + esc(s.t) + '</div>'
      + '<div class="lf-b">' + esc(s.b) + '</div>'
      + '<div class="lf-ctrls">'
      + '<button class="lf-skip">' + esc(D.skip) + '</button><span class="lf-sp"></span>'
      + pauseBtn + backBtn
      + '<button class="lf-btn pri lf-next">' + esc(last ? D.finish : D.next) + (last ? '' : ' →') + '</button>'
      + '</div><div class="lf-prog"></div>';
    tip.querySelector(".lf-next").onclick = next;
    var bk = tip.querySelector(".lf-back"); if (bk) bk.onclick = back;
    tip.querySelector(".lf-skip").onclick = finish;
    var pz = tip.querySelector(".lf-pause"); if (pz) pz.onclick = function () { paused ? resumeTimer() : pauseTimer(); };
    tip.querySelector(".lf-toc-btn").onclick = function () { if (toc.className === "on") { hideToc(); } else { buildToc(); toc.className = "on"; pauseTimer(); } };
    startTimer(AUTO_MS);
  }

  function next() { stopTimer(); hideToc(); if (idx < TOTAL - 1) { idx++; renderStep(); } else { finish(); } }
  function back() { stopTimer(); hideToc(); if (idx > 0) { idx--; renderStep(); } else { renderWelcome(); } }

  function renderConvert() {
    stopTimer(); idx = TOTAL; hideToc(); spot.style.display = "none"; beacon.style.display = "none";
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

  function finish() { stopTimer(); hideToc(); if (CONVERT) renderConvert(); else teardown(); }
  function teardown() { stopTimer(); if (root && root.parentNode) root.parentNode.removeChild(root); window.removeEventListener("resize", onResize); document.removeEventListener("keydown", onKey); }

  function onResize() { if (idx >= 0 && idx < TOTAL) positionFor(VIEWS[idx]); }
  function onKey(e) {
    if (e.key === "Escape") { if (toc.className === "on") hideToc(); else finish(); }
    else if (e.key === " " && MODE === "auto" && idx >= 0 && idx < TOTAL) { e.preventDefault(); paused ? resumeTimer() : pauseTimer(); }
    else if (e.key === "ArrowRight" && idx >= 0 && idx < TOTAL) next();
    else if (e.key === "ArrowLeft" && idx >= 0 && idx < TOTAL) back();
  }

  function build() {
    styleEl = el("style"); styleEl.textContent = CSS; document.head.appendChild(styleEl);
    root = el("div", "lf");
    catchEl = el("div", "lf-catch");
    spot = el("div", "lf-spot"); spot.style.display = "none";
    beacon = el("div", "lf-beacon"); beacon.innerHTML = "<i></i>"; beacon.style.display = "none";
    toc = el("div", "lf-toc");
    tip = el("div", "lf-tip");
    root.appendChild(catchEl); root.appendChild(spot); root.appendChild(beacon); root.appendChild(toc); root.appendChild(tip);
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
