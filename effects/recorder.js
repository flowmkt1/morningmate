/* =========================================================================
   recorder.js — 데모 안 "녹화 마법사" (A안)
   - "화면 따라 기록": 데모를 직접 클릭하며 둘러보면 클릭 좌표와 순서를 기억
   - [녹화 시작] → 가짜 커서가 그 좌표로 부드럽게 이동 + 쫀득한 줌인/줌아웃 +
     실제 클릭 → 데모가 반응 → 그대로 녹화 → MP4 저장
   - 캔버스 자가캡처(크래시 원인) 제거: getDisplayMedia 스트림을 직접 녹화하고,
     커서/줌은 화면 위(DOM)에 그려 자연스럽게 캡처됨
   ========================================================================= */
(function () {
  "use strict";

  var IS_PC = !!document.querySelector('.tabs') || /app\.html/i.test(location.pathname);
  var VIEWS_PC = [['feed', '피드'], ['table', '업무'], ['gantt', '간트'], ['calendar', '캘린더'], ['files', '파일'], ['insights', '인사이트'], ['activity', '활동'], ['search', '검색']];
  var VIEWS_MO = [['room', '피드'], ['tasks', '업무'], ['cal', '캘린더'], ['files', '파일'], ['chat', '채팅'], ['noti', '알림']];
  var VIEWS = IS_PC ? VIEWS_PC : VIEWS_MO;
  var LABEL = {}; VIEWS.forEach(function (v) { LABEL[v[0]] = v[1]; });

  var path = [];                 // [{v:viewKey} | {x,y(0~1)}, s:seconds, z:zoom배율]
  var rec = null, stream = null, recRunning = false, cursorEl = null, zoomEl = null, recWrap = null;
  var ZOOM_OPTS = [['없음', 1], ['1.2x', 1.2], ['1.4x', 1.4], ['1.6x', 1.6]];
  var defaultZoom = 1;           // 기본=줌 없음(사용자가 직접 켬)
  function zoomLabel(z) { for (var i = 0; i < ZOOM_OPTS.length; i++) if (ZOOM_OPTS[i][1] === z) return ZOOM_OPTS[i][0]; return z + 'x'; }
  function nextZoom(z) { for (var i = 0; i < ZOOM_OPTS.length; i++) if (ZOOM_OPTS[i][1] === z) return ZOOM_OPTS[(i + 1) % ZOOM_OPTS.length][1]; return 1; }

  var cursorPerson = null;   // 녹화 커서에 붙일 프로필 인물(없으면 화살표만)
  function photoOf(name) {
    try { if (window.MM_AV && MM_AV.photo) { var u = MM_AV.photo(name); if (u) return u; } } catch (e) {}
    try { if (window.photoFor) { var v = window.photoFor(name); if (v) return v; } } catch (e) {}
    return '';
  }
  function instancePeople() {   // 인스턴스 인력(채팅 1:1방 + 피드 작성자)
    var ns = [];
    function add(n) { if (!n) return; n = String(n).replace(/^[🔴❤️\s]+/, '').trim(); if (n && n.indexOf(',') < 0 && n.indexOf('TF') < 0 && n.indexOf('전체') < 0 && n.indexOf('全体') < 0 && n.indexOf('All') < 0 && ns.indexOf(n) < 0) ns.push(n); }
    try { var rooms = (window.MM_C && MM_C('pc.chat.rooms')) || window.CHATS; (rooms || []).forEach(function (r) { if (r && !r.count && !r.members) add(r.name); }); } catch (e) {}
    try { var feed = (window.MM_C && MM_C('pc.feed')) || window.FEED; (feed || []).forEach(function (p) { if (p && p.author) add(p.author.name); }); } catch (e) {}
    return ns.slice(0, 6);
  }

  function pickMime() {
    // MP4(H.264) 우선 — 고해상 캡처 요청을 제거했으므로 깨짐 없이 인코딩됨.
    // (안 열리면 MP4로변환.bat로 표준 MP4 재변환)
    var prefs = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    if (!window.MediaRecorder) return '';
    for (var i = 0; i < prefs.length; i++) { if (MediaRecorder.isTypeSupported(prefs[i])) return prefs[i]; }
    return '';
  }
  function extOf(m) { return (m && m.indexOf('mp4') >= 0) ? 'mp4' : 'webm'; }
  function lang() { try { return (window.MM_I18N && window.MM_I18N.lang) || 'ko'; } catch (e) { return 'ko'; } }
  function stamp() { var d = new Date(); function p(n) { return (n < 10 ? '0' : '') + n; } return '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function downloadBlob(blob, ext) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'morningmate_' + (IS_PC ? 'pc' : 'mo') + '_' + lang() + '_' + stamp() + '.' + ext;
    a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function saveRecording(blob, type) { downloadBlob(blob, extOf(type)); }

  // 스크롤 컨테이너 탐지/식별/복원 — 스크롤 후 클릭 좌표가 어긋나지 않게
  function scrollableOf(el) {
    for (var n = el; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      var s; try { s = getComputedStyle(n); } catch (e) { continue; }
      if (/(auto|scroll)/.test(s.overflowY + s.overflow) && (n.scrollHeight - n.clientHeight > 4)) return n;
    }
    return document.scrollingElement || document.documentElement;
  }
  function selOf(el) {
    if (!el || el === document.scrollingElement || el === document.documentElement || el === document.body) return '';
    if (el.id) return '#' + el.id;
    var c = (el.className && typeof el.className === 'string') ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return el.tagName.toLowerCase() + c;
  }
  function restoreScroll(st) {
    if (st.sc == null) return;
    var el = null;
    if (st.scSel) { try { el = document.querySelector(st.scSel); } catch (e) {} }
    if (!el) el = document.scrollingElement || document.documentElement;
    if (el) el.scrollTop = st.sc;
  }

  function navTo(v) {
    if (IS_PC) {
      if (v === 'search') { try { window.__SEARCH && window.__SEARCH.open(window.MM_C ? window.MM_C('pc.search.kw') : ''); } catch (e) {} return; }
      try { window.__SEARCH && window.__SEARCH.close(); } catch (e) {}
      var t = document.querySelector('.tabs .tab[data-view="' + v + '"]'); if (t) t.click();
    } else { try { window.go && window.go(v); } catch (e) {} }
  }

  /* ---------- 화면 따라 기록(클릭 좌표 캡처) ---------- */
  var capturing = false, lastTs = 0, origGo = null;
  function pushStep(step) { var now = Date.now(); if (path.length) path[path.length - 1].s = Math.max(1, Math.round((now - lastTs) / 1000)); step.s = step.s || 3; if (step.z == null) step.z = defaultZoom; path.push(step); lastTs = now; renderSeq(); updateCapBtn(); }
  function startCapture() {
    capturing = true; path = []; lastTs = Date.now(); renderSeq(); updateCapBtn();
    if (!document.getElementById('mm-capbanner')) { var d = document.createElement('div'); d.id = 'mm-capbanner'; d.textContent = '● 기록 중 — 보여줄 곳을 순서대로 클릭하세요 (끝나면 "기록 끝")'; document.body.appendChild(d); }
    if (!IS_PC && window.go && !origGo) { origGo = window.go; window.go = function () { return origGo.apply(this, arguments); }; }
  }
  function stopCapture() {
    if (path.length) path[path.length - 1].s = Math.max(1, Math.round((Date.now() - lastTs) / 1000));
    capturing = false; renderSeq(); updateCapBtn();
    var d = document.getElementById('mm-capbanner'); if (d) d.remove();
    if (origGo) { window.go = origGo; origGo = null; }
  }
  function updateCapBtn() { var b = document.querySelector('.rp-cap'); if (!b) return; b.textContent = capturing ? ('■ 기록 끝 (' + path.length + '개)') : '● 화면 따라 기록'; b.classList.toggle('on', capturing); }

  /* ---------- 커서 + 줌 ---------- */
  function ensureCursor() {
    if (cursorEl) return cursorEl;
    cursorEl = document.createElement('div'); cursorEl.id = 'mm-cursor';
    cursorEl.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M5 2.5l14.5 7.2-6.3 1.7L9.7 18.5z" fill="#fff" stroke="#222" stroke-width="1.3" stroke-linejoin="round"/></svg><span class="mm-cur-ava"></span>';
    document.body.appendChild(cursorEl);
    updateCursorAvatar();
    return cursorEl;
  }
  function updateCursorAvatar() {
    if (!cursorEl) return; var av = cursorEl.querySelector('.mm-cur-ava');
    var url = cursorPerson ? photoOf(cursorPerson) : '';
    if (av) { av.style.backgroundImage = url ? ('url(' + url + ')') : ''; av.style.display = url ? 'block' : 'none'; }
  }
  function demoCursor() { return document.getElementById('mm-curava'); }   // 데모 자체 커서(화살표+프로필 사진)
  function moveCursor(px, py) {
    var dc = demoCursor();
    if (dc) { dc.style.transition = 'left .5s cubic-bezier(.5,0,.2,1),top .5s cubic-bezier(.5,0,.2,1)'; dc.style.left = (px - 3) + 'px'; dc.style.top = (py - 2) + 'px'; dc.style.opacity = '1'; return sleep(520); }
    var c = ensureCursor(); c.style.transition = 'left .5s cubic-bezier(.5,0,.2,1),top .5s cubic-bezier(.5,0,.2,1)'; c.style.left = px + 'px'; c.style.top = py + 'px'; return sleep(520);
  }
  function pressCursor(px, py) {
    var r = document.createElement('span'); r.className = 'mm-ripple';
    r.style.cssText = 'position:fixed;z-index:9499;left:' + px + 'px;top:' + py + 'px;';
    document.body.appendChild(r); setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 600);
  }
  function zoomIn(px, py, level) {
    if (!zoomEl || !level || level <= 1) return Promise.resolve();
    zoomEl.style.transformOrigin = px + 'px ' + py + 'px';
    zoomEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(' + level + ')' }], { duration: 650, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' });   // 쫀득(오버슈트)
    return sleep(560);
  }
  function zoomOut(level) {
    if (!zoomEl || !level || level <= 1) return Promise.resolve();
    zoomEl.animate([{ transform: 'scale(' + level + ')' }, { transform: 'scale(1)' }], { duration: 520, easing: 'cubic-bezier(.34,1.4,.5,1)', fill: 'forwards' });
    return sleep(440);
  }

  function targetOf(step) {
    var W = window.innerWidth, H = window.innerHeight;
    if (step.x != null) return { px: step.x * W, py: step.y * H, coord: true };
    if (IS_PC) { var t = document.querySelector('.tabs .tab[data-view="' + step.v + '"]'); if (t) { var r = t.getBoundingClientRect(); return { px: r.left + r.width / 2, py: r.top + r.height / 2, el: t }; } }
    return { px: W / 2, py: H * 0.42, view: step.v };
  }
  function clickAt(t) {
    if (t.coord) { var e = document.elementFromPoint(t.px, t.py); if (e) e.click(); return; }
    if (t.el) { t.el.click(); return; }
    if (t.view) navTo(t.view);
  }

  /* ---------- 녹화 ---------- */
  function run() {
    if (capturing) stopCapture();
    if (!path.length) { alert('녹화할 곳을 1개 이상 추가하세요. (화면 따라 기록 또는 버튼 추가)'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) { alert('이 브라우저는 화면 녹화를 지원하지 않습니다. Chrome/Edge 최신 버전을 사용하세요.'); return; }
    navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 }, audio: false,
      preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', systemAudio: 'exclude'
    }).then(startWith, function () {});
  }
  function startWith(s) { beginRec(s, true); }      // 자동 경로 재생 녹화
  function startManual(s) { beginRec(s, false); }   // 직접 진행(수동) 녹화

  // PC 녹화를 항상 16:9(1600x900)로. 녹화 중 데모(.app)를 16:9 박스로 reflow시키고
  // (html.mm-rec169), 캡처 영상에서 .app 영역만 잘라 1600x900으로 그림 → 여백 없이
  // 제품이 꽉 찬 16:9. 캔버스/비디오는 DOM 미부착 → 탭 자가캡처(크래시) 회피.
  // .app(16:9) 영역만 잘라 녹화. 캔버스를 '캡처된 실제 해상도'에 맞춰(업스케일 X →
  // 흐릿함 없음, 소스만큼 선명). 1080p 상한·짝수 보정(인코딩 깨짐 방지). 비동기(메타 대기).
  function buildRecStream(srcStream) {
    return new Promise(function (resolve) {
      if (!IS_PC) { resolve({ stream: srcStream, ratio: (window.innerWidth > window.innerHeight ? '16x9' : '9x16') }); return; }
      var appEl = document.querySelector('.app') || document.body;
      var video = document.createElement('video'); video.muted = true; video.playsInline = true; video.srcObject = srcStream;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      var OUT_W = 1920, OUT_H = 1080, running = true, raf = 0, rect = null, rectT = 0;
      function getRect(now) { if (!rect || now - rectT > 500) { rect = appEl.getBoundingClientRect(); rectT = now; } return rect; }
      function sizeCanvas() {
        var vw = video.videoWidth, vh = video.videoHeight, r = appEl.getBoundingClientRect();
        if (vw && vh && r.width && r.height) {
          var rx = vw / window.innerWidth, ry = vh / window.innerHeight;
          var w = Math.round(r.width * rx), h = Math.round(r.height * ry);   // .app의 캡처 해상도(=1:1, 업스케일 없음)
          var CAP = 1920; if (w > CAP) { h = Math.round(h * CAP / w); w = CAP; }   // 1080p 상한
          w -= w % 2; h -= h % 2;                                            // 짝수
          if (w >= 640 && h >= 360) { OUT_W = w; OUT_H = h; }
        }
        canvas.width = OUT_W; canvas.height = OUT_H;
      }
      function paint(now) {
        var vw = video.videoWidth, vh = video.videoHeight; if (!vw || !vh) return;
        var rx = vw / window.innerWidth, ry = vh / window.innerHeight;
        var r = getRect(now || 0);
        var sx = Math.max(0, r.left * rx), sy = Math.max(0, r.top * ry);
        var sw = Math.min(vw - sx, r.width * rx), sh = Math.min(vh - sy, r.height * ry);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, OUT_W, OUT_H);
        try { ctx.drawImage(video, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H); } catch (e) {}
      }
      function loopVFC(now) { if (!running) return; paint(now); video.requestVideoFrameCallback(loopVFC); }
      function loopRAF(now) { if (!running) return; raf = requestAnimationFrame(loopRAF); paint(now); }
      function go() {
        sizeCanvas();
        if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(loopVFC); else raf = requestAnimationFrame(loopRAF);
        resolve({
          stream: canvas.captureStream(30), ratio: '16x9',
          stop: function () { running = false; if (raf) cancelAnimationFrame(raf); try { video.pause(); video.srcObject = null; } catch (e) {} }
        });
      }
      if (video.readyState >= 1) { video.play().then(go, go); }   // 메타데이터(해상도) 준비 후 캔버스 크기 결정
      else { video.addEventListener('loadedmetadata', function () { video.play().then(go, go); }, { once: true }); try { video.play().catch(function () {}); } catch (e) {} }
    });
  }
  // .app을 짝수 16:9 박스로(가운데, 바깥 흰 여백) — Region Capture가 이 영역만 잘라냄
  function sizeApp169() {
    var appEl = document.querySelector('.app'); if (!appEl) return null;
    var W = window.innerWidth, H = window.innerHeight, w, h;
    if (W / H > 16 / 9) { h = H; w = Math.round(h * 16 / 9); } else { w = W; h = Math.round(w * 9 / 16); }
    w -= w % 2; h -= h % 2;   // 짝수(인코딩 깨짐 방지)
    appEl.style.position = 'fixed';
    appEl.style.width = w + 'px'; appEl.style.height = h + 'px';
    appEl.style.left = Math.round((W - w) / 2) + 'px';
    appEl.style.top = Math.round((H - h) / 2) + 'px';
    void appEl.offsetWidth;   // 강제 레이아웃 반영
    return appEl;
  }
  // Region Capture: .app(16:9) 영역만 GPU에서 잘라 직접 녹화(재인코딩 없음 → 선명 + 끊김/깨짐 없음)
  function regionCrop169(s) {
    return new Promise(function (resolve) {
      if (!IS_PC) return resolve(false);
      try {
        var track = s.getVideoTracks()[0];
        if (typeof CropTarget === 'undefined' || !CropTarget.fromElement || !track || !track.cropTo) return resolve(false);
        document.documentElement.classList.add('mm-rec169');
        var appEl = sizeApp169(); if (!appEl) { document.documentElement.classList.remove('mm-rec169'); return resolve(false); }
        CropTarget.fromElement(appEl)
          .then(function (ct) { return track.cropTo(ct); })
          .then(function () { resolve(true); }, function () { resolve(false); });
      } catch (e) { resolve(false); }
    });
  }
  function beginRec(s, drive) {
    stream = s; recRunning = true;
    document.documentElement.classList.add('mm-recording');
    panelClose();
    zoomEl = document.querySelector('.app, .m-app') || document.body;
    try { if (cursorPerson && window.MM_MOTION && MM_MOTION.setCursorPhoto) MM_MOTION.setCursorPhoto(photoOf(cursorPerson)); } catch (e) {}
    if (!demoCursor()) { ensureCursor(); cursorEl.style.display = 'block'; }
    // 캡처 스트림을 그대로(재인코딩 없이) 직접 녹화 → 가장 선명, 끊김/깨짐 없음.
    // 16:9 정리는 녹화 후 별도 1회 변환으로(화질 손실 최소).
    recWrap = null;
    var ratio = IS_PC ? '16x9' : (window.innerWidth > window.innerHeight ? '16x9' : '9x16');
    startRecorder(s, ratio, drive);
  }
  function startRecorder(recStream, ratio, drive) {
    var mime = pickMime(), opts = { videoBitsPerSecond: 12000000 }; if (mime) opts.mimeType = mime;
    var chunks = [];
    try { rec = new MediaRecorder(recStream, opts); } catch (e) { rec = new MediaRecorder(recStream); }
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function () {
      var type = (rec && rec.mimeType) || mime || 'video/webm';
      var blob = new Blob(chunks, { type: type });
      cleanup();
      saveRecording(blob, type);   // webm이면 표준 MP4로 자동 변환 후 저장
    };
    var vt = stream.getVideoTracks()[0]; if (vt) vt.addEventListener('ended', stop);  // 크롬 "공유 중지" 감지
    rec.start();
    if (drive) runPath();   // 자동 경로 재생. 수동이면 사용자가 직접 진행 → 크롬 '공유 중지'로 종료
    else { document.title = '● 녹화중(직접 진행) — 멈추려면 브라우저 "공유 중지"'; }
  }
  function runManual() {
    if (capturing) stopCapture();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) { alert('이 브라우저는 화면 녹화를 지원하지 않습니다. Chrome/Edge 최신 버전을 사용하세요.'); return; }
    navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 }, audio: false,
      preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', systemAudio: 'exclude'
    }).then(startManual, function () {});
  }
  function runPath() {
    var i = 0;
    (function step() {
      if (!recRunning) return;
      if (i >= path.length) { setTimeout(stop, 500); return; }
      var st = path[i++]; var z = st.z || 1;
      document.title = '● 녹화중 ' + i + '/' + path.length;
      restoreScroll(st);                       // 기록 당시 스크롤 위치 복원 → 좌표가 같은 내용을 가리킴
      sleep(280).then(function () {
        var t = targetOf(st);
        return moveCursor(t.px, t.py)
          .then(function () { return zoomIn(t.px, t.py, z); })
          .then(function () { pressCursor(t.px, t.py); clickAt(t); return sleep((st.s || 3) * 1000); })
          .then(function () { return zoomOut(z); });
      }).then(function () { if (recRunning) step(); });
    })();
  }
  function stop() { recRunning = false; if (rec && rec.state !== 'inactive') rec.stop(); }
  function cleanup() {
    if (recWrap && recWrap.stop) { recWrap.stop(); } recWrap = null;
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (zoomEl) { zoomEl.style.transform = ''; zoomEl.style.transformOrigin = ''; }
    if (cursorEl) cursorEl.style.display = 'none';
    var dc = demoCursor(); if (dc) dc.style.transition = '';   // 데모 커서 transition 원복(이후 마우스 즉시 추종)
    var appEl = document.querySelector('.app'); if (appEl) { appEl.style.position = ''; appEl.style.width = ''; appEl.style.height = ''; appEl.style.left = ''; appEl.style.top = ''; }   // 16:9 박스 원복
    document.documentElement.classList.remove('mm-recording');
    document.documentElement.classList.remove('mm-rec169');
    document.title = document.title.replace(/^● 녹화중[^—]*/, '');
  }

  /* ---------- 마법사 패널 ---------- */
  // 현재 창의 화면 영역이 16:9에 가까운지
  function is169Window() { var a = window.innerWidth / window.innerHeight; return Math.abs(a - 16 / 9) < 0.02; }
  // 패널의 16:9 가이드를 현재 창 비율에 맞춰 갱신(창 크기 조절하면 실시간)
  function updateAspect() {
    var el = document.getElementById('rp-aspect'); if (!el) return;
    var a = window.innerWidth / window.innerHeight, ok = Math.abs(a - 16 / 9) < 0.02;
    el.classList.toggle('ok', ok);
    if (ok) { el.innerHTML = '✅ 지금 창이 <b>16:9</b>예요 — 바로 녹화하면 16:9로 저장돼요'; }
    else {
      var hint = a > 16 / 9 ? '창을 조금 <b>좁게</b> 줄이면' : '창을 조금 <b>넓게</b> 늘리면';
      el.innerHTML = '현재 창 비율 <b>' + a.toFixed(2) + '</b> (16:9 = 1.78)<br>' + hint + ' ✅ 정확한 16:9가 됩니다';
    }
  }
  function panelOpen() {
    if (document.getElementById('mm-recpanel')) return;
    var p = document.createElement('div'); p.id = 'mm-recpanel';
    p.innerHTML =
      '<div class="rp-h">화면 녹화<span class="rp-x" data-x="1">✕</span></div>' +
      (IS_PC ? '<div class="rp-aspect" id="rp-aspect"></div>' : '') +
      '<button class="rp-manual" data-manual="1">● 녹화 시작</button>' +
      '<div class="rp-note">시작 → "이 탭" 공유 → 직접 클릭·스크롤하며 진행하세요. 멈추려면 브라우저의 <b>"공유 중지"</b>. 끝나면 영상 파일이 저장됩니다.</div>';
    document.body.appendChild(p);
    updateAspect();
  }
  function panelClose() { var p = document.getElementById('mm-recpanel'); if (p) p.remove(); }
  function renderSeq() {
    var box = document.getElementById('rp-seq'); if (!box) return;
    if (!path.length) { box.innerHTML = '<div class="rp-empty">아직 없음 — 위에서 기록하거나 화면을 추가하세요</div>'; return; }
    box.innerHTML = path.map(function (st, i) {
      var nm = st.v ? (LABEL[st.v] || st.v) : ('클릭 ' + Math.round(st.x * 100) + ',' + Math.round(st.y * 100));
      var zv = st.z || 1;
      return '<div class="rp-item"><span class="rp-n">' + (i + 1) + '</span><span class="rp-vn">' + nm + '</span>' +
        '<button class="rp-zbtn' + (zv > 1 ? ' on' : '') + '" data-zi="' + i + '" title="줌 켜기/끄기">🔍 ' + zoomLabel(zv) + '</button>' +
        '<span class="rp-sec2"><button data-dec="' + i + '">−</button><b>' + st.s + 's</b><button data-inc="' + i + '">+</button></span>' +
        '<span class="rp-del" data-del="' + i + '">✕</span></div>';
    }).join('');
  }

  // 기록/녹화 중 hover '진입' 자동효과(상태순환 등)만 차단. mousemove는 막지 않음(데모 프로필 커서가 따라오게)
  // 녹화/기록 중 클릭 → 그 위치에 mouseover를 보내 데모 hover 효과를 발동(클릭으로 호버 대체)
  function fireHoverAt(el, x, y) {
    function send(target) { var m = new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }); m._mmAllow = true; try { target.dispatchEvent(m); } catch (e) {} }
    send(document.body);   // 상태 dedup 리셋(같은 칸 반복 클릭도 매번 동작)
    if (el) send(el);
  }
  function installHoverBlock() {
    function block(e) { if ((capturing || recRunning) && !e._mmAllow) { e.stopImmediatePropagation(); } }
    ['mouseover', 'mouseout', 'pointerover', 'pointerout'].forEach(function (ev) {
      window.addEventListener(ev, block, true);   // capture 단계에서 먼저 가로채 데모 핸들러로 전파 차단
    });
  }

  function inject() {
    if (document.getElementById('mm-rec')) return;
    installHoverBlock();
    window.addEventListener('resize', function () { updateAspect(); });   // 창 크기 조절 시 16:9 가이드 실시간 갱신
    var st = document.createElement('style');
    st.textContent =
      '#mm-rec{position:fixed;left:16px;bottom:16px;z-index:9000;display:flex;align-items:center;gap:7px;height:34px;padding:0 13px;border:none;border-radius:18px;background:#2B2B33;color:#fff;font:600 12.5px Roboto,"Noto Sans KR","Noto Sans JP",sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.28);}' +
      '#mm-rec .rd{width:10px;height:10px;border-radius:50%;background:#FF4D4D;}' +
      'html.mm-recording #mm-rec,html.mm-recording #m-lang,html.mm-recording #mm-recpanel,html.mm-recording #mm-capbanner{display:none !important;}' +
      /* 녹화 중 데모를 16:9 박스로 reflow(가운데 정렬, 바깥은 흰 여백 → 캡처 시 잘려나감) */
      'html.mm-rec169{background:#fff;}html.mm-rec169 body{overflow:hidden;background:#fff;}' +
      'html.mm-rec169 .app{position:fixed;width:min(100vw,calc(100vh * 16 / 9));height:min(100vh,calc(100vw * 9 / 16));' +
        'left:calc((100vw - min(100vw,calc(100vh * 16 / 9))) / 2);top:calc((100vh - min(100vh,calc(100vw * 9 / 16))) / 2);}' +
      'html.mm-recording #mm-cursor{display:block !important;}' +   /* 녹화 중 가짜 커서 표시(진짜 커서는 그대로 보임) */
      '#mm-cursor{position:fixed;z-index:9500;left:50%;top:50%;width:0;height:0;pointer-events:none;display:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}' +
      '#mm-cursor svg{position:absolute;left:-4px;top:-3px;transition:transform .12s;}#mm-cursor.press svg{transform:scale(.8);}' +
      '#mm-cursor .mm-cur-ava{position:absolute;left:14px;top:16px;width:46px;height:46px;border-radius:14px;background:#9DC8FF center/cover no-repeat;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.3);display:none;}' +
      '#mm-recpanel .rp-cps{display:flex;flex-wrap:wrap;gap:6px;}#mm-recpanel .rp-cp{display:flex;align-items:center;gap:5px;padding:4px 9px 4px 5px;border:1px solid #DADADF;border-radius:16px;background:#fff;font-size:11.5px;cursor:pointer;color:#555;}#mm-recpanel .rp-cp.on{border-color:#6449FC;background:#EFECFF;color:#6449FC;font-weight:600;}' +
      '#mm-recpanel .rp-cpa{width:18px;height:18px;border-radius:50%;background:#ddd center/cover no-repeat;flex-shrink:0;}' +
      '.mm-ripple{position:fixed;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:rgba(100,73,252,.4);animation:mmrip .55s ease-out forwards;pointer-events:none;z-index:9499;}' +
      '@keyframes mmrip{from{transform:scale(.2);opacity:.7;}to{transform:scale(1.6);opacity:0;}}' +
      '#mm-capbanner{position:fixed;top:0;left:0;right:0;z-index:9002;background:#FF3B3B;color:#fff;text-align:center;font:600 13px Roboto,"Noto Sans KR","Noto Sans JP",sans-serif;padding:9px;box-shadow:0 2px 10px rgba(0,0,0,.2);}' +
      '#mm-recpanel{position:fixed;left:16px;bottom:58px;z-index:9001;width:300px;background:#fff;border:1px solid #E6E6EA;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.26);padding:14px;font-family:Roboto,"Noto Sans KR","Noto Sans JP",sans-serif;color:#222;}' +
      '#mm-recpanel .rp-h{font-weight:700;font-size:14px;display:flex;align-items:center;margin-bottom:10px;}#mm-recpanel .rp-x{margin-left:auto;cursor:pointer;color:#aaa;font-size:13px;}' +
      '#mm-recpanel .rp-sec{margin:10px 0;}#mm-recpanel .rp-lab{font-size:11.5px;color:#888;margin-bottom:6px;}#mm-recpanel .rp-hint{color:#bbb;}' +
      '#mm-recpanel .rp-cap{width:100%;padding:9px;border:1px solid #DADADF;border-radius:9px;background:#FAFAFB;font-size:12.5px;cursor:pointer;color:#333;}#mm-recpanel .rp-cap.on{background:#FFECEC;border-color:#FF8A8A;color:#E03030;font-weight:700;}' +
      '#mm-recpanel .rp-vs{display:flex;flex-wrap:wrap;gap:6px;}#mm-recpanel .rp-v{padding:5px 9px;border:1px solid #DADADF;border-radius:8px;background:#FAFAFB;font-size:12px;cursor:pointer;color:#444;}#mm-recpanel .rp-v:hover{background:#EFECFF;border-color:#6449FC;color:#6449FC;}' +
      '#mm-recpanel .rp-zs{display:flex;gap:6px;}#mm-recpanel .rp-z{flex:1;padding:6px 0;border:1px solid #DADADF;border-radius:8px;background:#fff;font-size:12px;cursor:pointer;color:#444;}#mm-recpanel .rp-z.on{background:#6449FC;color:#fff;border-color:#6449FC;}' +
      '#mm-recpanel .rp-zbtn{font-size:11px;padding:3px 6px;border:1px solid #DADADF;border-radius:6px;background:#fff;cursor:pointer;color:#999;white-space:nowrap;}#mm-recpanel .rp-zbtn.on{background:#EFECFF;border-color:#6449FC;color:#6449FC;font-weight:600;}' +
      '#mm-recpanel .rp-seq{max-height:150px;overflow:auto;border:1px solid #EEE;border-radius:8px;padding:4px;}#mm-recpanel .rp-empty{color:#bbb;font-size:12px;text-align:center;padding:14px;}' +
      '#mm-recpanel .rp-item{display:flex;align-items:center;gap:8px;padding:6px;border-radius:6px;}#mm-recpanel .rp-item:hover{background:#FAFAFB;}#mm-recpanel .rp-n{width:18px;height:18px;border-radius:50%;background:#6449FC;color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '#mm-recpanel .rp-vn{font-size:12.5px;flex:1;}#mm-recpanel .rp-sec2{display:flex;align-items:center;gap:6px;font-size:12px;}#mm-recpanel .rp-sec2 button{width:20px;height:20px;border:1px solid #DADADF;border-radius:5px;background:#fff;cursor:pointer;}' +
      '#mm-recpanel .rp-del{cursor:pointer;color:#c8c8cf;font-size:12px;}#mm-recpanel .rp-del:hover{color:#FF4D4D;}' +
      '#mm-recpanel .rp-foot{display:flex;gap:8px;margin-top:10px;}#mm-recpanel .rp-clear{padding:9px 12px;border:1px solid #DADADF;border-radius:9px;background:#fff;font-size:12.5px;cursor:pointer;}#mm-recpanel .rp-go{flex:1;padding:9px;border:none;border-radius:9px;background:#FF3B3B;color:#fff;font-weight:700;font-size:13px;cursor:pointer;}' +
      '#mm-recpanel .rp-manual{width:100%;margin-top:8px;padding:9px;border:1.5px solid #FF3B3B;border-radius:9px;background:#fff;color:#E03030;font-weight:700;font-size:12px;cursor:pointer;}#mm-recpanel .rp-manual:hover{background:#FFECEC;}' +
      '#mm-recpanel .rp-note{font-size:11px;color:#aaa;margin-top:8px;line-height:1.5;}' +
      '#mm-recpanel .rp-aspect{font-size:12px;color:#8a6d00;background:#FFF6DA;border:1px solid #F0E2A8;border-radius:8px;padding:9px 11px;margin-bottom:8px;line-height:1.55;}' +
      '#mm-recpanel .rp-aspect.ok{color:#1A8F2E;background:#E7F7EC;border-color:#BBE7C6;font-weight:600;}' +
      '@media (max-width:820px){#mm-rec{left:12px;bottom:12px;height:30px;padding:0 11px;font-size:11.5px;}#mm-recpanel{left:8px;right:8px;width:auto;bottom:50px;}}';
    document.head.appendChild(st);
    var b = document.createElement('button'); b.id = 'mm-rec';
    b.innerHTML = '<span class="rd"></span><span class="rl">녹화</span>';
    b.title = (pickMime().indexOf('mp4') >= 0) ? 'MP4 고화질 — 커서·줌 자동 녹화' : 'WebM으로 저장됩니다';
    document.body.appendChild(b);
    b.addEventListener('click', function () { if (document.getElementById('mm-recpanel')) panelClose(); else panelOpen(); });

    // 기록/녹화 중: 클릭 좌표 캡처(기록 모드) + 클릭→hover 효과 발동(레코더 UI 제외)
    document.addEventListener('click', function (e) {
      if (!(capturing || recRunning)) return;
      var ui = e.target.closest && e.target.closest('#mm-recpanel,#mm-rec,#mm-capbanner');
      if (ui) return;
      if (capturing) { var se = scrollableOf(e.target); pushStep({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, sc: se.scrollTop, scSel: selOf(se) }); }
      fireHoverAt(e.target, e.clientX, e.clientY);   // 클릭으로 데모 hover 효과 실행
    }, true);   // capture 단계 — 데모 자체 핸들러보다 먼저

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest && t.closest('[data-cap]')) { if (capturing) stopCapture(); else startCapture(); return; }
      if (t.closest && t.closest('[data-x]')) { panelClose(); return; }
      var v = t.closest && t.closest('.rp-v'); if (v) { pushStepManual({ v: v.getAttribute('data-v') }); return; }
      var gz = t.closest && t.closest('[data-z]'); if (gz) { defaultZoom = parseFloat(gz.getAttribute('data-z')); path.forEach(function (s) { s.z = defaultZoom; }); [].forEach.call(document.querySelectorAll('.rp-z'), function (x) { x.classList.toggle('on', parseFloat(x.getAttribute('data-z')) === defaultZoom); }); renderSeq(); return; }
      var zi = t.closest && t.closest('[data-zi]'); if (zi) { var zix = +zi.getAttribute('data-zi'); path[zix].z = nextZoom(path[zix].z || 1); renderSeq(); return; }
      var cp = t.closest && t.closest('[data-cp]'); if (cp) { cursorPerson = cp.getAttribute('data-cp') || null; [].forEach.call(document.querySelectorAll('.rp-cp'), function (x) { x.classList.toggle('on', (x.getAttribute('data-cp') || null) === cursorPerson); }); updateCursorAvatar(); try { if (cursorPerson && window.MM_MOTION && MM_MOTION.setCursorPhoto) MM_MOTION.setCursorPhoto(photoOf(cursorPerson)); } catch (e) {} return; }
      if (t.closest && t.closest('[data-clear]')) { path = []; renderSeq(); return; }
      if (t.closest && t.closest('[data-go]')) { run(); return; }
      if (t.closest && t.closest('[data-manual]')) { runManual(); return; }
      var del = t.closest && t.closest('[data-del]'); if (del) { path.splice(+del.getAttribute('data-del'), 1); renderSeq(); return; }
      var inc = t.closest && t.closest('[data-inc]'); if (inc) { var ii = +inc.getAttribute('data-inc'); path[ii].s = Math.min(20, path[ii].s + 1); renderSeq(); return; }
      var dec = t.closest && t.closest('[data-dec]'); if (dec) { var di = +dec.getAttribute('data-dec'); path[di].s = Math.max(1, path[di].s - 1); renderSeq(); return; }
    });
  }
  function pushStepManual(step) { step.s = step.s || 3; if (step.z == null) step.z = defaultZoom; path.push(step); renderSeq(); }   // 버튼 추가(시간 비측정)

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();

  /* ---------- 녹화/언어 토글 자동 숨김(직접 녹화 시 화면에 안 잡히게) ----------
     잠시 움직임 없으면 사라지고, 그 모서리에 마우스를 가져가면 다시 나타남 */
  (function autoHide() {
    var IDS = ['mm-rec', 'm-lang', 'mm-ed'];   // 녹화·언어·검수(✏️) 버튼
    var hideT = {};
    var st = document.createElement('style');
    st.textContent = '#mm-rec,#m-lang,#mm-ed{transition:opacity .4s ease;}' +
      '#mm-rec.mm-faded,#m-lang.mm-faded,#mm-ed.mm-faded{opacity:0 !important;pointer-events:none !important;}';
    document.head.appendChild(st);
    function elOf(id) { return document.getElementById(id); }
    function show(id) { var e = elOf(id); if (e) e.classList.remove('mm-faded'); clearTimeout(hideT[id]); }
    function hideSoon(id) { clearTimeout(hideT[id]); hideT[id] = setTimeout(function () { var e = elOf(id); if (e) e.classList.add('mm-faded'); }, 1400); }
    function near(e, x, y, pad) { var r = e.getBoundingClientRect(); return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad; }
    document.addEventListener('mousemove', function (ev) {
      IDS.forEach(function (id) {
        var e = elOf(id); if (!e) return;
        if (id === 'mm-rec' && document.getElementById('mm-recpanel')) { show(id); return; }   // 패널 열려 있으면 유지
        if (id === 'mm-ed' && document.getElementById('mm-ed-bar') && document.getElementById('mm-ed-bar').classList.contains('show')) { show(id); return; } // 편집 패널 열려 있으면 유지
        if (near(e, ev.clientX, ev.clientY, 130)) show(id);
        else if (!e.classList.contains('mm-faded')) hideSoon(id);
      });
    });
    setTimeout(function () { IDS.forEach(function (id) { var e = elOf(id); if (e) e.classList.add('mm-faded'); }); }, 3000);   // 처음 3초 뒤 숨김
  })();
})();
