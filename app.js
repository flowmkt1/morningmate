/* =========================================================================
   app.js — 템플릿 렌더러 + 시나리오 엔진
   - 템플릿(table/detail)은 "유형"마다 1회 정의, 데이터(data.js)를 받아 렌더.
   - 레이아웃/상호작용은 고정, 텍스트는 전부 DATA에서 주입.
   - 시나리오(DATA.scenario)를 한 스텝씩 자동 재생 → 화면 녹화용.
   ========================================================================= */
(function () {
  "use strict";
  const DATA = window.DEMO_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const statusColor = (label) => DATA.statusPalette[label] || "#999";

  /* ---------- 공용 SVG 아이콘 (제품 톤) ---------- */
  const ICON = {
    plus: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/></svg>',
    dash: '<svg class="ico" viewBox="0 0 24 24" fill="#777"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>',
    folder: '<svg class="ico" viewBox="0 0 24 24" fill="#777"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
    globe: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"/></svg>',
    list: '<svg class="ico" viewBox="0 0 24 24" fill="#777"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>',
    gantt: '<svg class="ico" viewBox="0 0 24 24" fill="#777"><path d="M4 5h10v3H4zM4 10.5h14v3H4zM4 16h7v3H4z"/></svg>',
    cal: '<svg class="ico" viewBox="0 0 24 24" fill="#777"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>',
    lib: '<svg class="ico" viewBox="0 0 24 24" fill="#777"><path d="M4 6h2v12H4zM8 6h2v12H8zM12 6h3l3 12h-3z"/></svg>',
    bookmark: '<svg class="ico" viewBox="0 0 24 24" fill="#777"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>',
    at: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 005 0V12a9 9 0 10-3.5 7.1"/></svg>',
    search: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    bell: '<svg class="ico" viewBox="0 0 24 24" fill="#888"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
    user: '<svg class="ico" viewBox="0 0 24 24" fill="#999"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    flag: '<svg class="ico" viewBox="0 0 24 24" fill="#999"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>',
    rotate: '<svg class="ico" viewBox="0 0 24 24" fill="#6449FC"><path d="M17.65 6.35A8 8 0 1019.73 14h-2.08A6 6 0 1112 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" fill="#999"><path d="M7 10l5 5 5-5z"/></svg>',
    x: '<svg class="ico" viewBox="0 0 24 24" fill="#bbb"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    dots: '<svg class="ico" viewBox="0 0 24 24" fill="#999"><path d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z"/></svg>',
    pin: '<svg class="ico" viewBox="0 0 24 24" fill="#6449FC"><path d="M14 4l-1.2 5.5L18 11l-5 .6L12.5 20 11 12 5 11l6-1 .8-6z"/></svg>'
  };

  const logoSVG = (h) => `
    <svg width="${h * 5.2}" height="${h}" viewBox="0 0 220 44" style="display:block">
      <g>
        <path d="M22 6 L8 38" stroke="#FF3B00" stroke-width="4" stroke-linecap="round"/>
        <path d="M28 6 L14 38" stroke="#FF7A18" stroke-width="4" stroke-linecap="round"/>
        <path d="M34 8 L21 38" stroke="#FFA033" stroke-width="4" stroke-linecap="round"/>
        <path d="M40 12 L28 38" stroke="#FFC400" stroke-width="4" stroke-linecap="round"/>
      </g>
      <text x="52" y="30" font-family="Noto Sans KR, sans-serif" font-size="22" font-weight="800" fill="#3a3a3a" letter-spacing="-0.5">morningmate</text>
    </svg>`;

  const avatar = (color, size) => `
    <svg class="ava" width="${size}" height="${size}" viewBox="0 0 60 60" style="background:${color}">
      <circle cx="30" cy="23" r="11" fill="rgba(0,0,0,.32)"/>
      <ellipse cx="30" cy="56" rx="20" ry="16" fill="rgba(0,0,0,.32)"/>
    </svg>`;

  const badge = (label, soft) => {
    if (soft) return `<span class="badge soft">${esc(label)}</span>`;
    return `<span class="badge" style="background:${statusColor(label)}"><span class="dot"></span>${esc(label)}</span>`;
  };

  const progressOf = (task) => {
    const c = task.chart || { done: 0, progress: 0, pending: 0 };
    const total = c.done + c.progress + c.pending || 1;
    return Math.round((c.done / total) * 100);
  };

  /* =======================================================================
     PC: APP SHELL
     ======================================================================= */
  function shell(project, contentHTML) {
    const u = DATA.ui;
    const navIcons = [ICON.dash, ICON.folder, ICON.globe];
    const colIcons = [ICON.list, ICON.gantt, ICON.cal, ICON.lib, ICON.bookmark, ICON.at];
    return `
    <div class="app">
      <aside class="sidebar">
        <div class="sb-logo">${logoSVG(20)}</div>
        <div class="sb-create">${ICON.plus.replace('viewBox','width="16" height="16" style="fill:#fff" viewBox')}<span>${esc(u.create)}</span></div>
        ${u.nav.map((n, i) => `<div class="sb-item">${navIcons[i] || ""}<span>${esc(n)}</span></div>`).join("")}
        <div class="sb-section">${esc(u.collection)}</div>
        ${u.collectionItems.map((n, i) => `<div class="sb-item ${i === 0 ? "active" : ""}">${colIcons[i] || ""}<span>${esc(n)}</span></div>`).join("")}
        <div class="sb-spacer"></div>
        ${u.footer.map((f) => `<div class="sb-foot">${esc(f)}</div>`).join("")}
      </aside>
      <div class="main">
        <div class="topbar">
          <div class="tb-title">${esc(project.name)}</div>
          <div class="tb-spacer"></div>
          <div class="tb-icons">
            ${ICON.search}${ICON.bell}
            ${avatar(DATA.user.color, 28).replace('class="ava"', 'class="ava tb-ava"')}
          </div>
        </div>
        <div class="tabs">
          ${u.tabs.map((t) => `<div class="tab ${t === u.activeTab ? "active" : ""}">${esc(t)}</div>`).join("")}
        </div>
        <div class="content">${contentHTML}</div>
      </div>
    </div>`;
  }

  /* =======================================================================
     PC: TABLE (목록형)
     ======================================================================= */
  function renderTable(project) {
    const c = DATA.ui.cols;
    const rows = project.tasks.map((t, i) => {
      const pct = progressOf(t);
      const avas = t.assignees.map((a) => avatar(a.color, 26)).join("");
      return `
      <tr class="row" data-task="${i}">
        <td class="c-check"><div class="checkbox ${t.status === "완료" ? "done" : ""}"></div></td>
        <td><span class="taskname">${esc(t.title)}</span></td>
        <td class="c-status">${badge(t.status)}</td>
        <td class="c-assignee"><div class="assignees">${avas}</div></td>
        <td class="c-due">${esc(t.due)} ${esc(t.dueDay || "")}</td>
        <td class="c-prog"><div class="progress"><div class="track"><div class="fill" style="width:${pct}%"></div></div><span class="pct">${pct}%</span></div></td>
      </tr>`;
    }).join("");

    const content = `
      <div class="tbl-projhead">${ICON.chev}<span>${esc(project.name)}</span><span class="count">(${project.tasks.length})</span></div>
      <table class="tbl">
        <thead><tr>
          <th class="c-check"></th><th>${esc(c.task)}</th><th>${esc(c.status)}</th>
          <th>${esc(c.assignee)}</th><th>${esc(c.due)}</th><th>${esc(c.progress)}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    return shell(project, content);
  }

  /* =======================================================================
     PC: DETAIL (상세형)
     ======================================================================= */
  function renderDetail(project, task) {
    const d = DATA.ui.detail;
    const allStatuses = Object.keys(DATA.statusPalette);
    const statusChips = allStatuses.map((s) => {
      const on = s === task.status;
      return `<div class="md-stat ${on ? "on" : ""}" data-status="${esc(s)}" style="${on ? `background:${statusColor(s)}` : ""}">${esc(s)}</div>`;
    }).join("");

    const assigneePills = task.assignees.map((a) => `
      <div class="md-pill">${avatar(a.color, 26)}<span>${esc(a.name)}</span>${ICON.x}</div>`).join("");

    const subs = task.subtasks.map((s) => `
      <div class="sub">
        ${badge(s.status)}
        <span class="sname">${esc(s.title)}</span>
        <span class="sdate">${esc(s.date)} ${esc(s.day || "")}</span>
        ${avatar(s.assignee.color, 30)}
      </div>`).join("");

    const content = `
    <div class="detail-wrap"><div class="modal">
      <div class="md-cat">
        <div class="chip" style="background:#5ADBD5"></div>
        <span class="cat">${esc(task.category)}</span>
        <div class="spacer"></div>${ICON.x}
      </div>
      <div class="md-prof">
        ${avatar(task.owner.color, 40)}
        <span class="name">${esc(task.owner.name)}</span>
        <div class="spacer"></div>${ICON.pin}${ICON.dots}
      </div>
      <div class="md-title"><h1>${esc(task.title)}</h1></div>

      <div class="md-meta">
        <div class="md-row" style="margin-bottom:14px">
          ${ICON.rotate}
          <div class="md-statuses">${statusChips}</div>
        </div>
        <div class="md-row" style="margin-bottom:12px">
          ${ICON.user}
          <div class="md-statuses">${assigneePills}<span class="md-link">${esc(d.changeOwner)}</span></div>
        </div>
        <div class="md-row" style="margin-bottom:8px">
          ${ICON.cal}<span class="val">${esc(task.due)} ${esc(task.dueDay || "")} ${esc(d.dueSuffix)}</span>
        </div>
        <div class="md-row">
          ${ICON.flag}<span class="val">${esc(task.priority)}</span>
        </div>
      </div>

      <div class="md-subs">
        <div class="head">${ICON.list}<span>${esc(d.subtasks)} <b>${task.subtasks.length}</b></span></div>
        ${subs}
      </div>

      <div class="md-insights" id="insights">
        <div class="head">${ICON.dash}<span>${esc(d.insights)}</span></div>
        ${renderInsights(task)}
      </div>
    </div></div>`;
    return shell(project, content);
  }

  function renderInsights(task) {
    const c = task.chart || { done: 0, progress: 0, pending: 0 };
    const total = c.done + c.progress + c.pending || 1;
    const pct = Math.round((c.done / total) * 100);
    const colors = { done: "#6449FC", progress: "#00B01C", pending: "#E2E2E8" };
    // 도넛 (conic-gradient)
    const a1 = (c.done / total) * 360;
    const a2 = a1 + (c.progress / total) * 360;
    const donut = `
      <div class="donut" style="border-radius:50%;background:conic-gradient(
        ${colors.done} 0deg ${a1}deg,
        ${colors.progress} ${a1}deg ${a2}deg,
        ${colors.pending} ${a2}deg 360deg);">
        <div style="width:84px;height:84px;border-radius:50%;background:#fff;margin:24px auto 0;"></div>
      </div>`;
    return `
      <div class="insights-grid">
        ${donut}
        <div class="legend">
          <div class="li"><span class="sw" style="background:${colors.done}"></span>완료<span class="n">${c.done}</span></div>
          <div class="li"><span class="sw" style="background:${colors.progress}"></span>진행<span class="n">${c.progress}</span></div>
          <div class="li"><span class="sw" style="background:${colors.pending}"></span>예정<span class="n">${c.pending}</span></div>
        </div>
        <div class="bigpct"><div class="v" id="bigpct">${pct}%</div><div class="l">완료율</div></div>
      </div>`;
  }

  /* =======================================================================
     MOBILE
     ======================================================================= */
  function renderMobileTable(project) {
    const u = DATA.ui;
    const cards = project.tasks.map((t, i) => `
      <div class="m-card" data-task="${i}">
        <div class="top">
          <div class="checkbox ${t.status === "완료" ? "done" : ""}"></div>
          <span class="nm">${esc(t.title)}</span>${badge(t.status)}
        </div>
        <div class="meta">
          <div class="assignees">${t.assignees.map((a) => avatar(a.color, 22)).join("")}</div>
          <span>${esc(t.due)}</span><div class="spacer"></div>
          <span>${progressOf(t)}%</span>
        </div>
      </div>`).join("");
    return `
    <div class="m-app">
      <div class="m-statusbar">9:41</div>
      <div class="m-topbar">${logoSVG(18)}<div class="spacer"></div>${ICON.search}${ICON.bell}</div>
      <div class="m-body">
        <div class="tbl-projhead">${ICON.chev}<span>${esc(project.name)}</span><span class="count">(${project.tasks.length})</span></div>
        ${cards}
      </div>
      ${mobileTabbar(u)}
    </div>`;
  }

  function renderMobileDetail(project, task) {
    const d = DATA.ui.detail;
    const u = DATA.ui;
    const allStatuses = Object.keys(DATA.statusPalette);
    const chips = allStatuses.map((s) => {
      const on = s === task.status;
      return `<div class="md-stat ${on ? "on" : ""}" data-status="${esc(s)}" style="${on ? `background:${statusColor(s)};` : ""}font-size:12px;padding:5px 12px">${esc(s)}</div>`;
    }).join("");
    const subs = task.subtasks.map((s) => `
      <div class="sub" style="height:44px">${badge(s.status)}<span class="sname">${esc(s.title)}</span></div>`).join("");
    return `
    <div class="m-app">
      <div class="m-statusbar">9:41</div>
      <div class="m-topbar">${ICON.chev}<span class="t">${esc(DATA.ui.detail.subtasks ? task.category : "")}</span><div class="spacer"></div>${ICON.dots}</div>
      <div class="m-body">
        <div class="m-detail">
          <div class="cat">${esc(task.category)}</div>
          <h1>${esc(task.title)}</h1>
          <div class="md-statuses" style="margin-bottom:14px">${chips}</div>
          <div class="mrow"><span class="k">${esc(d.assignee)}</span><div class="assignees">${task.assignees.map((a) => avatar(a.color, 24)).join("")}</div><span style="margin-left:8px;color:#555">${esc(task.owner.name)}</span></div>
          <div class="mrow"><span class="k">${esc(d.due)}</span><span>${esc(task.due)} ${esc(task.dueDay || "")}</span></div>
          <div class="mrow"><span class="k">${esc(d.priority)}</span><span>${esc(task.priority)}</span></div>
          <div style="margin:16px 0 8px;font-weight:700;font-size:14px;color:#333">${esc(d.subtasks)} <b style="color:#6449FC">${task.subtasks.length}</b></div>
          ${subs}
          <div style="margin:18px 0 8px;font-weight:700;font-size:14px;color:#333">${esc(d.insights)}</div>
          ${renderInsights(task)}
        </div>
      </div>
      ${mobileTabbar(u)}
    </div>`;
  }

  function mobileTabbar(u) {
    const icons = [ICON.list, ICON.dash, ICON.cal, ICON.bell, ICON.dots];
    return `<div class="m-tabbar">${u.mobileNav.map((n, i) =>
      `<div class="mt ${i === 1 ? "active" : ""}">${icons[i]}<span>${esc(n)}</span></div>`).join("")}</div>`;
  }

  /* =======================================================================
     상태 머신 + 시나리오 엔진
     ======================================================================= */
  const state = {
    viewport: "pc",          // pc | mobile
    projectIndex: 0,
    view: "table",           // table | detail
    taskIndex: null,
    stepIndex: -1,
    playing: false,
    recording: false,
    speed: 1
  };

  const frame = () => $("#frame");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms / state.speed));

  function project() { return DATA.projects[state.projectIndex]; }
  function currentTask() { return state.taskIndex == null ? null : project().tasks[state.taskIndex]; }

  function paint() {
    const f = frame();
    // CTA/cursor/caption 레이어는 보존, 화면 본문만 교체
    let host = $("#screen");
    if (!host) { host = document.createElement("div"); host.id = "screen"; host.style.cssText = "width:100%;height:100%"; f.insertBefore(host, f.firstChild); }
    const p = project(), t = currentTask();
    if (state.viewport === "mobile") {
      host.innerHTML = state.view === "detail" && t ? renderMobileDetail(p, t) : renderMobileTable(p);
    } else {
      host.innerHTML = state.view === "detail" && t ? renderDetail(p, t) : renderTable(p);
    }
    wireClicks(host);
  }

  // 수동 클릭(자유 탐색) 지원
  function wireClicks(host) {
    host.querySelectorAll("[data-task]").forEach((el) => {
      el.addEventListener("click", () => {
        if (state.playing) return;
        state.taskIndex = Number(el.getAttribute("data-task"));
        state.view = "detail"; paint();
      });
    });
    host.querySelectorAll("[data-status]").forEach((el) => {
      el.addEventListener("click", () => {
        if (state.playing || !currentTask()) return;
        currentTask().status = el.getAttribute("data-status"); paint();
      });
    });
  }

  /* ---------- 시뮬레이션 커서 ---------- */
  async function moveCursorTo(el) {
    const cur = $("#cursor"); if (!cur || !el) return;
    const fb = frame().getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left - fb.left + r.width / 2;
    const y = r.top - fb.top + r.height / 2;
    cur.classList.add("show");
    cur.style.transition = `transform ${0.5 / state.speed}s cubic-bezier(.4,.1,.2,1)`;
    cur.style.transform = `translate(${x}px, ${y}px)`;
    await sleep(560);
  }
  function clickRipple() {
    const cur = $("#cursor"); if (!cur) return;
    const m = /translate\(([\-\d.]+)px, ([\-\d.]+)px\)/.exec(cur.style.transform);
    if (!m) return;
    const rip = document.createElement("div");
    rip.className = "ripple";
    rip.style.left = (parseFloat(m[1]) - 7) + "px";
    rip.style.top = (parseFloat(m[2]) - 7) + "px";
    frame().appendChild(rip);
    setTimeout(() => rip.remove(), 500);
  }

  /* ---------- 자막 ---------- */
  function showCaption(text) {
    const cap = $("#caption");
    if (!text) { cap.classList.remove("show"); return; }
    cap.textContent = text; cap.classList.add("show");
  }

  /* ---------- CTA ---------- */
  function showCTA(on) {
    const cta = $("#cta");
    cta.classList.toggle("show", !!on);
  }

  /* ---------- 스텝 파서/실행 ---------- */
  function parseStep(step) {
    if (step === "table" || step === "back") return { kind: "table" };
    if (step.startsWith("table:")) return { kind: "table", project: Number(step.split(":")[1]) };
    const open = /^detail\.click\((.+)\)$/.exec(step);
    if (open) return { kind: "open", target: open[1] };
    const st = /^detail\.status→(.+)$/.exec(step) || /^detail\.status->(.+)$/.exec(step);
    if (st) return { kind: "status", value: st[1] };
    if (step === "detail.chart" || step === "insights") return { kind: "chart" };
    if (step === "cta") return { kind: "cta" };
    return { kind: "noop" };
  }

  async function runStep(i) {
    state.stepIndex = i;
    const step = DATA.scenario[i];
    if (!step) return;
    const op = parseStep(step);
    showCaption(DATA.narration[i] || "");
    showCTA(false);

    if (op.kind === "table") {
      if (op.project != null) state.projectIndex = op.project;
      state.view = "table"; state.taskIndex = null; paint();
      await sleep(1600);

    } else if (op.kind === "open") {
      // 테이블에서 해당 행을 커서로 클릭 → 상세 진입
      if (state.view !== "table") { state.view = "table"; state.taskIndex = null; paint(); await sleep(400); }
      const idx = project().tasks.findIndex((t) => t.title === op.target);
      const rowEl = $(`#screen [data-task="${idx}"]`);
      await moveCursorTo(rowEl); clickRipple();
      if (rowEl) rowEl.classList.add("flash");
      await sleep(350);
      state.taskIndex = idx; state.view = "detail"; paint();
      await sleep(1500);

    } else if (op.kind === "status") {
      // 상태 칩을 커서로 눌러 상태 변경
      const chip = $(`#screen [data-status="${CSS.escape(op.value)}"]`);
      await moveCursorTo(chip); clickRipple();
      const t = currentTask();
      if (t) t.status = op.value;
      paint();
      const newChip = $(`#screen [data-status="${CSS.escape(op.value)}"]`);
      if (newChip) newChip.classList.add("pulse");
      await sleep(1600);

    } else if (op.kind === "chart") {
      const ins = $("#screen #insights");
      if (ins) ins.scrollIntoView({ behavior: "smooth", block: "center" });
      // 완료율 카운트업
      animateBigPct();
      await sleep(2000);

    } else if (op.kind === "cta") {
      $("#cursor").classList.remove("show");
      showCaption(DATA.narration[i] || "");
      showCTA(true);
      await sleep(2600);
    }
  }

  function animateBigPct() {
    const el = $("#screen #bigpct"); if (!el) return;
    const target = parseInt(el.textContent, 10) || 0;
    let v = 0; el.textContent = "0%";
    const step = Math.max(1, Math.round(target / 24));
    const id = setInterval(() => {
      v = Math.min(target, v + step); el.textContent = v + "%";
      if (v >= target) clearInterval(id);
    }, 24);
  }

  async function play() {
    if (state.playing) return;
    state.playing = true; setPlayUI(true);
    for (let i = 0; i < DATA.scenario.length; i++) {
      if (!state.playing) break;
      await runStep(i);
    }
    state.playing = false; setPlayUI(false);
    $("#cursor").classList.remove("show");
  }
  function stop() {
    state.playing = false; setPlayUI(false);
    showCaption(""); showCTA(false);
    $("#cursor").classList.remove("show");
  }
  function restart() { stop(); state.view = "table"; state.taskIndex = null; paint(); }

  function setPlayUI(on) {
    const b = $("#btnPlay");
    if (b) { b.textContent = on ? "⏸ 정지" : "▶ 자동재생"; b.classList.toggle("active", on); }
  }

  /* ---------- 수동 스텝 이동 ---------- */
  async function stepBy(delta) {
    stop();
    let i = state.stepIndex + delta;
    i = Math.max(0, Math.min(DATA.scenario.length - 1, i));
    await runStep(i);
    $("#cursor").classList.remove("show");
  }

  /* =======================================================================
     컨트롤 결선
     ======================================================================= */
  const VIEWPORT_SIZE = { pc: { w: 1180, h: 720 }, mobile: { w: 390, h: 760 } };
  function setViewport(vp) {
    state.viewport = vp;
    const f = frame();
    f.className = vp;
    // 크기는 인라인으로 직접 지정(클래스 기반 규칙이 transition/cascade로 무시되는 문제 회피)
    const s = VIEWPORT_SIZE[vp];
    f.style.width = s.w + "px";
    f.style.height = s.h + "px";
    $("#btnPC").classList.toggle("active", vp === "pc");
    $("#btnMobile").classList.toggle("active", vp === "mobile");
    paint();
  }

  function toggleRecording() {
    state.recording = !state.recording;
    $("#stage").classList.toggle("recording", state.recording);
    $("#controlbar").style.display = state.recording ? "none" : "flex";
    // ESC로 복귀
  }

  function init() {
    // CTA 콘텐츠 주입
    $("#cta").innerHTML = `
      <div class="ct-logo">${DATA.brand.product}</div>
      <div class="ct-head">${esc(DATA.cta.head)}</div>
      <div class="ct-sub">${esc(DATA.cta.sub)}</div>
      <a class="ct-btn" href="${esc(DATA.cta.url)}" target="_blank" rel="noopener">${esc(DATA.cta.button)}</a>`;

    $("#btnPC").addEventListener("click", () => setViewport("pc"));
    $("#btnMobile").addEventListener("click", () => setViewport("mobile"));
    $("#btnPlay").addEventListener("click", () => (state.playing ? stop() : play()));
    $("#btnPrev").addEventListener("click", () => stepBy(-1));
    $("#btnNext").addEventListener("click", () => stepBy(1));
    $("#btnRestart").addEventListener("click", restart);
    $("#btnRecord").addEventListener("click", toggleRecording);
    $("#selSpeed").addEventListener("change", (e) => (state.speed = parseFloat(e.target.value)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.recording) toggleRecording();
      if (e.key === " ") { e.preventDefault(); state.playing ? stop() : play(); }
      if (e.key === "ArrowRight") stepBy(1);
      if (e.key === "ArrowLeft") stepBy(-1);
    });

    setViewport("pc");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
