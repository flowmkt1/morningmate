/* =========================================================================
   tutorial.js — 클릭 유도형 튜토리얼 (app.html 전용)
   - 활성: ?tutorial=1 (없으면 no-op → 무회귀)
   - 기존 데모 효과는 "hover(마우스오버)"로 발동됐음 → 튜토리얼 동안 hover 자동발동을 차단하고,
     사용자가 '하이라이트된 대상을 클릭'하면 그 자리에 mouseover를 쏘아 효과를 발동(=클릭으로 실행).
   - mode=manual : 사용자가 직접 클릭해야 다음으로(자기주도 튜토리얼)
   - mode=auto   : 잠깐 뒤 스스로 클릭해 재생(영상처럼) + 일시정지
   - recorder.js의 fireHover/hover-block 패턴 재사용.
   ========================================================================= */
(function () {
  "use strict";
  var Q; try { Q = new URLSearchParams(location.search); } catch (e) { return; }
  if (Q.get("tutorial") !== "1") return;
  var MODE = Q.get("mode") === "auto" ? "auto" : "manual";
  var MODE_EXPLICIT = (Q.get("mode") === "auto" || Q.get("mode") === "manual"); // demo.html에서 이미 선택함
  var LANG = Q.get("lang") || (function () { try { return localStorage.getItem("mm_lang"); } catch (e) { return null; } })() || "ja";
  var AUTO_MS = 2600;   // 자동: 하이라이트 후 스스로 클릭까지

  /* ---- 카피 ---- */
  var T = {
    ko: {
      wTitle: "직접 클릭하면서 둘러볼까요?", wBody: "제가 <b>여기를 눌러보세요</b> 하고 짚어드리면, 눌러서 실제로 어떻게 움직이는지 확인해보세요. 자동으로 보여드릴 수도 있어요.",
      start: "직접 해보기", auto: "자동으로 보기", skip: "건너뛰기", next: "다음", clickHint: "여기를 클릭 👆",
      dTitle: "다 둘러봤어요 🎉", dBody: "마음에 드셨다면 바로 무료로 시작하거나, 자유롭게 더 만져보세요.", signup: "무료로 시작하기", free: "자유롭게 둘러보기", pause: "일시정지", play: "재생",
      steps: {
        st: "업무 상태를 클릭해 바꿔보세요", stS: "'진행중 → 완료'처럼 클릭 한 번으로 상태가 바뀌어요.",
        like: "마음에 들면 좋아요 👍", likeS: "반응도 클릭 한 번. 팀에 바로 전해져요.",
        vote: "투표에 참여해보세요", voteS: "의견은 투표로. 결과가 실시간으로 모여요.",
        navTable: "전체 업무를 표로 보기", navTableS: "탭을 눌러 모든 일을 한 표에서 확인하세요.",
        tStatus: "표에서 상태 칸을 클릭", tStatusS: "표에서도 클릭으로 상태·담당·기한이 채워져요.",
        navGantt: "일정을 타임라인으로", navGanttS: "간트 탭을 눌러 프로젝트 일정을 한눈에.",
        navCal: "캘린더로 이동", navCalS: "탭을 눌러 이번 달 일정을 보세요.",
        calDay: "날짜를 클릭해 일정 추가", calDayS: "달력의 날짜를 누르면 일정이 톡 하고 등록돼요.",
        navFiles: "자료는 라이브러리에", navFilesS: "파일 탭을 눌러 프로젝트별 자료를 확인하세요.",
        navInsights: "리포트는 자동으로", navInsightsS: "인사이트 탭을 눌러 진척·성과 리포트를 보세요."
      }
    },
    ja: {
      wTitle: "クリックしながら見てみますか?", wBody: "<b>ここを押してみて</b>とご案内するので、押して実際の動きを確かめてください。自動で見ることもできます。",
      start: "自分でやってみる", auto: "自動で見る", skip: "スキップ", next: "次へ", clickHint: "ここをクリック 👆",
      dTitle: "ひと通り見ました 🎉", dBody: "気に入ったら今すぐ無料で始めるか、自由に触ってみてください。", signup: "無料で始める", free: "自由に見る", pause: "一時停止", play: "再生",
      steps: {
        st: "タスクのステータスをクリック", stS: "「進行中→完了」のようにクリック一つで変わります。",
        like: "いいと思ったら いいね 👍", likeS: "リアクションもワンクリック。チームにすぐ届きます。",
        vote: "投票に参加してみて", voteS: "意見は投票で。結果がリアルタイムに集まります。",
        navTable: "全体タスクを表で見る", navTableS: "タブを押して全ての仕事を一つの表で確認。",
        tStatus: "表でステータス欄をクリック", tStatusS: "表でもクリックで状態・担当・期日が埋まります。",
        navGantt: "予定をタイムラインで", navGanttS: "ガントタブでプロジェクト予定を一目で。",
        navCal: "カレンダーへ", navCalS: "タブを押して今月の予定を見てください。",
        calDay: "日付をクリックして予定追加", calDayS: "カレンダーの日付を押すと予定がポンと登録。",
        navFiles: "資料はライブラリに", navFilesS: "ファイルタブでプロジェクト別の資料を確認。",
        navInsights: "レポートは自動で", navInsightsS: "インサイトタブで進捗・成果レポートを。"
      }
    },
    en: {
      wTitle: "Explore by clicking?", wBody: "I'll point out <b>click here</b> — click to see how it really works. You can also watch it automatically.",
      start: "Try it myself", auto: "Watch auto", skip: "Skip", next: "Next", clickHint: "Click here 👆",
      dTitle: "That's the tour 🎉", dBody: "If you liked it, start free now or keep exploring on your own.", signup: "Start free", free: "Explore freely", pause: "Pause", play: "Play",
      steps: {
        st: "Click a task status to change it", stS: "One click flips it, e.g. In progress → Done.",
        like: "Like it if you like it 👍", likeS: "Reactions are one click, shared with the team instantly.",
        vote: "Cast a vote", voteS: "Opinions become votes; results gather in real time.",
        navTable: "See all tasks as a table", navTableS: "Tap the tab to see every task in one table.",
        tStatus: "Click a status cell", tStatusS: "In the table too, clicks fill status, owner and due date.",
        navGantt: "Schedule as a timeline", navGanttS: "Tap Gantt to see the project timeline at a glance.",
        navCal: "Go to the calendar", navCalS: "Tap to see this month's schedule.",
        calDay: "Click a date to add an event", calDayS: "Click a day and an event pops right in.",
        navFiles: "Files in the library", navFilesS: "Tap Files for assets organized by project.",
        navInsights: "Reports, automatic", navInsightsS: "Tap Insights for progress and performance reports."
      }
    }
  };
  var D = T[LANG] || T.ja;
  var S = D.steps;

  // 스텝: need=상호작용에 필요한 뷰(활성 보장) / nav=탭클릭(네비) / sel=대상 / fire: hover|nav|click
  var STEPS = [
    { need: "feed", sel: '.feed-content .mmc-badge[data-act="status"]', fire: "hover", t: S.st, b: S.stS },
    { need: "feed", sel: '.feed-content .mmc-foot .acts span[data-act="like"]', fire: "hover", t: S.like, b: S.likeS },
    { need: "feed", sel: '.feed-content .mmc-vopt[data-act="vote"]', fire: "hover", t: S.vote, b: S.voteS },
    { nav: true, sel: '.tab[data-view="table"]', fire: "nav", t: S.navTable, b: S.navTableS },
    { need: "table", sel: '#mmt-view .c-status[data-act]', fire: "hover", t: S.tStatus, b: S.tStatusS },
    { nav: true, sel: '.tab[data-view="gantt"]', fire: "nav", t: S.navGantt, b: S.navGanttS },
    { nav: true, sel: '.tab[data-view="calendar"]', fire: "nav", t: S.navCal, b: S.navCalS },
    { need: "calendar", sel: '#cal-grid .cal-cell[data-act="calday"]', fire: "click", t: S.calDay, b: S.calDayS },
    { nav: true, sel: '.tab[data-view="files"]', fire: "nav", t: S.navFiles, b: S.navFilesS },
    { nav: true, sel: '.tab[data-view="insights"]', fire: "nav", t: S.navInsights, b: S.navInsightsS }
  ];
  var TOTAL = STEPS.length;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  /* ---- hover 자동발동 차단 + 클릭→효과 ---- */
  var blockOn = true;
  ["mouseover", "mouseout", "pointerover", "pointerout"].forEach(function (ev) {
    window.addEventListener(ev, function (e) { if (blockOn && !e._mmAllow) e.stopImmediatePropagation(); }, true);
  });
  function fireHover(el) {
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    function send(target) { var m = new MouseEvent("mouseover", { bubbles: true, clientX: cx, clientY: cy }); m._mmAllow = true; try { target.dispatchEvent(m); } catch (e) {} }
    send(document.body); if (el) send(el);
  }

  /* ---- 스타일 ---- */
  var CSS = ""
    + "#tt{position:fixed;inset:0;z-index:99000;font-family:Roboto,'Noto Sans JP','Noto Sans KR',sans-serif;pointer-events:none;}"
    + ".tt-dim{position:absolute;background:rgba(12,12,22,.52);pointer-events:auto;transition:all .35s cubic-bezier(.4,0,.2,1);}"
    + "#tt-ring{position:absolute;border:2.5px solid #8b5cf6;border-radius:10px;box-shadow:0 0 0 4px rgba(139,92,246,.28),0 0 22px rgba(139,92,246,.5);pointer-events:none;transition:all .35s cubic-bezier(.4,0,.2,1);}"
    + "#tt-ring::after{content:'';position:absolute;inset:-3px;border-radius:12px;border:2px solid rgba(139,92,246,.6);animation:ttp 1.4s ease-out infinite;}"
    + "@keyframes ttp{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.18);opacity:0}}"
    + "#tt-hand{position:absolute;font-size:26px;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));animation:tth 1.1s ease-in-out infinite;}"
    + "@keyframes tth{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}"
    + "#tt-tip{position:absolute;width:min(320px,92vw);background:#181722;color:#eae9f2;border:1px solid rgba(255,255,255,.1);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.55);padding:15px 16px;pointer-events:auto;transition:all .35s cubic-bezier(.4,0,.2,1);}"
    + "#tt-tip.center{left:50%;top:50%;transform:translate(-50%,-50%);width:min(400px,92vw);text-align:center;}"
    + ".tt-step{font-size:11px;font-weight:800;letter-spacing:.4px;color:#9a8cff;}"
    + ".tt-emo{font-size:34px;}"
    + ".tt-t{font-size:15.5px;font-weight:800;margin:7px 0 5px;letter-spacing:-.2px;}"
    + ".tt-b{font-size:12.5px;line-height:1.6;color:#c7c7d8;}.tt-b b{color:#b9a9ff;}"
    + ".tt-hint{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;font-weight:800;color:#c4b6ff;background:rgba(139,92,246,.16);border-radius:20px;padding:6px 12px;}"
    + ".tt-ctrls{display:flex;align-items:center;gap:8px;margin-top:12px;}"
    + ".tt-skip{font-size:11.5px;color:#8a8a9c;cursor:pointer;background:none;border:0;font-family:inherit;padding:5px 2px;}.tt-skip:hover{color:#c7c7d8;text-decoration:underline;}"
    + ".tt-sp{flex:1;}"
    + ".tt-btn{border:0;border-radius:10px;padding:9px 15px;font:800 13px inherit;cursor:pointer;color:#dcdcec;transition:.13s;}"
    + ".tt-btn.ghost{background:rgba(255,255,255,.08);}.tt-btn.ghost:hover{background:rgba(255,255,255,.14);}"
    + ".tt-btn.pri{background:linear-gradient(135deg,#8b5cf6,#6449FC);color:#fff;box-shadow:0 8px 20px rgba(100,73,252,.42);}.tt-btn.pri:hover{transform:translateY(-1px);}"
    + ".tt-btn.ic{width:36px;padding:9px 0;text-align:center;}"
    + ".tt-cta{display:block;width:100%;text-align:center;text-decoration:none;border:0;border-radius:12px;padding:13px 0;font:800 14.5px inherit;cursor:pointer;margin-top:9px;}"
    + ".tt-cta.pri{background:linear-gradient(135deg,#8b5cf6,#6449FC);color:#fff;box-shadow:0 12px 30px rgba(100,73,252,.45);}"
    + ".tt-cta.sec{background:rgba(255,255,255,.07);color:#dcdcec;border:1px solid rgba(255,255,255,.12);}"
    + ".tt-fade{animation:ttf .4s ease both;}@keyframes ttf{from{opacity:0;transform:translateY(8px)}to{opacity:1}}";

  var root, dimT, dimB, dimL, dimR, ring, hand, tip, styleEl;
  var idx = -1, timer = null, remain = AUTO_MS, tStart = 0, paused = false, curSel = null;

  function activeView() { var s = document.querySelector(".vsec.on"); return s ? s.getAttribute("data-view") : null; }
  function ensureView(v, cb) { if (activeView() === v) return cb(); var tab = document.querySelector('.tab[data-view="' + v + '"]'); if (tab) tab.click(); setTimeout(cb, 480); }
  function rectOf(sel) { var e = document.querySelector(sel); return e ? e.getBoundingClientRect() : null; }

  function placeSpot(r) {
    var W = window.innerWidth, H = window.innerHeight, p = 5;
    var x = Math.max(0, r.left - p), y = Math.max(0, r.top - p), w = r.width + p * 2, h = r.height + p * 2;
    dimT.style.cssText = "position:absolute;background:rgba(12,12,22,.52);pointer-events:auto;left:0;top:0;width:100%;height:" + y + "px;";
    dimB.style.cssText = "position:absolute;background:rgba(12,12,22,.52);pointer-events:auto;left:0;top:" + (y + h) + "px;width:100%;height:" + Math.max(0, H - y - h) + "px;";
    dimL.style.cssText = "position:absolute;background:rgba(12,12,22,.52);pointer-events:auto;left:0;top:" + y + "px;width:" + x + "px;height:" + h + "px;";
    dimR.style.cssText = "position:absolute;background:rgba(12,12,22,.52);pointer-events:auto;left:" + (x + w) + "px;top:" + y + "px;width:" + Math.max(0, W - x - w) + "px;height:" + h + "px;";
    ring.style.display = ""; ring.style.left = x + "px"; ring.style.top = y + "px"; ring.style.width = w + "px"; ring.style.height = h + "px";
    hand.style.display = ""; hand.style.left = (x + w - 6) + "px"; hand.style.top = (y + h - 4) + "px"; hand.textContent = "👆";
  }
  function hideSpot() { [dimT, dimB, dimL, dimR].forEach(function (d) { d.style.cssText = "position:absolute;pointer-events:none;width:0;height:0;"; }); ring.style.display = "none"; hand.style.display = "none"; }

  function placeTip(r) {
    tip.className = "tt-fade"; // 대상 근처(아래 우선, 없으면 위, 없으면 하단중앙)
    var W = window.innerWidth, H = window.innerHeight, tw = Math.min(320, W * 0.92), th = tip.offsetHeight || 150;
    var left = Math.min(Math.max(10, r.left), W - tw - 10);
    var top;
    if (r.bottom + 14 + th < H) top = r.bottom + 14;
    else if (r.top - 14 - th > 0) top = r.top - 14 - th;
    else { left = (W - tw) / 2; top = H - th - 16; }
    tip.style.left = left + "px"; tip.style.top = top + "px"; tip.style.width = tw + "px";
  }

  function stopTimer() { if (timer) { clearTimeout(timer); timer = null; } }
  function startAuto() {
    stopTimer(); if (MODE !== "auto") return;
    remain = AUTO_MS; tStart = Date.now(); paused = false;
    timer = setTimeout(function () { doFire(); advance(); }, AUTO_MS);
  }
  function pauseAuto() { if (MODE !== "auto" || paused) return; paused = true; stopTimer(); remain = Math.max(500, remain - (Date.now() - tStart)); paint(); }
  function resumeAuto() { if (MODE !== "auto" || !paused) return; paused = false; tStart = Date.now(); timer = setTimeout(function () { doFire(); advance(); }, remain); paint(); }
  function paint() { var b = tip.querySelector(".tt-pause"); if (b) b.innerHTML = paused ? "▶" : "❚❚"; }

  function doFire() {
    var el = document.querySelector(curSel); if (!el) return;
    var s = STEPS[idx];
    if (s.fire === "hover") fireHover(el);
    else el.click();   // nav / click(캘린더): 네이티브 클릭
  }

  function showStep(i) {
    stopTimer();
    if (i >= TOTAL) return done();
    idx = i; var s = STEPS[i]; curSel = s.sel;
    function render() {
      var r = rectOf(s.sel);
      if (!r || r.width < 2) { return advance(); } // 대상 없으면 건너뜀
      placeSpot(r);
      var pauseBtn = MODE === "auto" ? '<button class="tt-btn ghost ic tt-pause">❚❚</button>' : "";
      var hint = MODE === "manual" ? '<div class="tt-hint">' + esc(D.clickHint) + '</div>' : "";
      tip.className = "tt-fade";
      tip.innerHTML =
        '<div class="tt-step">' + (i + 1) + ' / ' + TOTAL + '</div>'
        + '<div class="tt-t">' + esc(s.t) + '</div>'
        + '<div class="tt-b">' + esc(s.b) + '</div>'
        + hint
        + '<div class="tt-ctrls"><button class="tt-skip">' + esc(D.skip) + '</button><span class="tt-sp"></span>'
        + pauseBtn
        + (MODE === "manual" ? '<button class="tt-btn ghost tt-next">' + esc(D.next) + ' →</button>' : '')
        + '</div>';
      tip.querySelector(".tt-skip").onclick = done;
      var nx = tip.querySelector(".tt-next"); if (nx) nx.onclick = function () { doFire(); advance(); };
      var pz = tip.querySelector(".tt-pause"); if (pz) pz.onclick = function () { paused ? resumeAuto() : pauseAuto(); };
      placeTip(r);
      startAuto();
    }
    if (s.need) ensureView(s.need, render); else render();
  }
  function advance() { stopTimer(); showStep(idx + 1); }

  // 사용자가 하이라이트된 대상을 직접 클릭 → 효과 발동 + 다음
  function onDocClick(e) {
    if (idx < 0 || idx >= TOTAL || !curSel) return;
    var el = document.querySelector(curSel); if (!el) return;
    if (e.target === el || (el.contains && el.contains(e.target))) {
      var s = STEPS[idx];
      if (s.fire === "hover") fireHover(el);   // 네이티브 클릭은 이미 일어남 → hover 효과만 추가 발동
      setTimeout(advance, s.fire === "hover" ? 620 : 420);
    }
  }

  function renderWelcome() {
    stopTimer(); idx = -1; curSel = null; hideSpot();
    tip.className = "center tt-fade";
    tip.innerHTML =
      '<div class="tt-emo">👆</div>'
      + '<div class="tt-t">' + esc(D.wTitle) + '</div>'
      + '<div class="tt-b">' + D.wBody + '</div>'
      + '<div class="tt-ctrls" style="justify-content:center;">'
      + '<button class="tt-btn ghost tt-auto">' + esc(D.auto) + '</button>'
      + '<button class="tt-btn pri tt-start">' + esc(D.start) + ' →</button>'
      + '</div>';
    tip.querySelector(".tt-start").onclick = function () { MODE = "manual"; showStep(0); };
    tip.querySelector(".tt-auto").onclick = function () { MODE = "auto"; showStep(0); };
  }
  function done() {
    stopTimer(); idx = TOTAL; curSel = null; hideSpot(); blockOn = false; // 끝나면 자유 탐색(hover 다시 허용)
    tip.className = "center tt-fade";
    var su = "https://flow.team?utm_source=demo&utm_campaign=" + encodeURIComponent((Q.get("inst") || "") + "_" + (Q.get("role") || ""));
    tip.innerHTML =
      '<div class="tt-emo">🎉</div>'
      + '<div class="tt-t">' + esc(D.dTitle) + '</div>'
      + '<div class="tt-b">' + esc(D.dBody) + '</div>'
      + '<a class="tt-cta pri" href="' + su + '">' + esc(D.signup) + ' →</a>'
      + '<button class="tt-cta sec tt-free">' + esc(D.free) + '</button>';
    tip.querySelector(".tt-free").onclick = teardown;
  }
  function teardown() { stopTimer(); blockOn = false; if (root && root.parentNode) root.parentNode.removeChild(root); document.removeEventListener("click", onDocClick, true); window.removeEventListener("resize", onResize); document.removeEventListener("keydown", onKey); }

  function onResize() { if (idx >= 0 && idx < TOTAL && curSel) { var r = rectOf(curSel); if (r) { placeSpot(r); placeTip(r); } } }
  function onKey(e) { if (e.key === "Escape") done(); else if (e.key === " " && MODE === "auto" && idx >= 0 && idx < TOTAL) { e.preventDefault(); paused ? resumeAuto() : pauseAuto(); } }

  function build() {
    styleEl = document.createElement("style"); styleEl.textContent = CSS; document.head.appendChild(styleEl);
    root = document.createElement("div"); root.id = "tt";
    dimT = document.createElement("div"); dimB = document.createElement("div"); dimL = document.createElement("div"); dimR = document.createElement("div");
    ring = document.createElement("div"); ring.id = "tt-ring"; ring.style.display = "none";
    hand = document.createElement("div"); hand.id = "tt-hand"; hand.style.display = "none";
    tip = document.createElement("div"); tip.id = "tt-tip";
    [dimT, dimB, dimL, dimR].forEach(function (d) { d.className = "tt-dim"; root.appendChild(d); });
    root.appendChild(ring); root.appendChild(hand); root.appendChild(tip);
    document.body.appendChild(root);
    document.addEventListener("click", onDocClick, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    if (MODE_EXPLICIT) showStep(0); else renderWelcome();  // 모드 지정 시 바로 시작(웰컴 재질문 생략)
  }
  function ready(cb) { var n = 0; (function w() { if (document.querySelector('.tab[data-view="feed"]') && document.querySelector('.feed-content')) return cb(); if (n++ < 60) setTimeout(w, 100); })(); }
  function boot() { ready(function () { setTimeout(build, 500); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__TUTORIAL = { teardown: teardown };
})();
