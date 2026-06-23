/* effects/editor.js — 검수(인라인 편집) 모드
 * 데모 화면의 글자를 클릭해 그 자리에서 수정 → localStorage에 자동 저장
 * (새로고침·언어전환·뷰 재렌더에도 유지) → "내보내기"로 JSON 추출(영구 반영용).
 * 콘텐츠 경로(MM_C)와 무관하게 "원문 텍스트 → 수정 텍스트" 오버라이드로 동작.
 */
(function(){
  if (window.__MM_EDITOR) return; window.__MM_EDITOR = true;

  function qp(k){ try{ return new URLSearchParams(location.search).get(k); }catch(e){ return null; } }
  var INST = qp('inst') || (function(){try{return localStorage.getItem('mm_instance');}catch(e){return null;}})() || 'jp-freelance';
  function curLang(){ return qp('lang') || (function(){try{return localStorage.getItem('mm_lang');}catch(e){return null;}})() || 'ko'; }
  var LANG = curLang();

  function storeKey(){ return 'mm_edits_' + INST + '_' + LANG; }
  function load(){ try{ return JSON.parse(localStorage.getItem(storeKey()) || '{}'); }catch(e){ return {}; } }
  function save(m){ try{ localStorage.setItem(storeKey(), JSON.stringify(m)); }catch(e){} }
  var EDITS = load();          // { 원문: 수정문 }
  var editing = false, lastHover = null;

  /* ---------- 편집 가능한 '잎' 요소 판별 ---------- */
  function isEditable(el){
    if (!el || el.nodeType !== 1) return false;
    if (el.closest('#mm-ed, #mm-ed-bar, #mm-rec, #mm-recpanel, #m-lang, #mm-curava, #m-finger')) return false;
    if (/^(SCRIPT|STYLE|INPUT|TEXTAREA|SVG|PATH|IMG|BUTTON|SELECT|CANVAS|VIDEO|I)$/.test(el.tagName)) return false;
    var hasText = false;
    for (var i=0; i<el.childNodes.length; i++){
      var n = el.childNodes[i];
      if (n.nodeType === 1) return false;            // 자식 요소 있으면 잎 아님
      if (n.nodeType === 3 && n.nodeValue.trim()) hasText = true;
    }
    if (!hasText) return false;
    var t = el.textContent.trim();
    return t.length >= 1 && t.length <= 400;
  }

  /* ---------- 저장된 수정 재적용(재렌더 후) ---------- */
  var obs = null, pending = null;
  function applyEdits(root){
    if (!Object.keys(EDITS).length) return;
    if (obs) obs.disconnect();
    root = root || document.body;
    var all = root.getElementsByTagName('*');
    for (var i=0; i<all.length; i++){
      var el = all[i];
      if (!isEditable(el)) continue;
      var orig = el.getAttribute('data-mm-orig');
      if (orig != null && EDITS[orig] != null){
        if (el.textContent.trim() !== EDITS[orig]) el.textContent = EDITS[orig];
        continue;
      }
      var cur = el.textContent.trim();
      if (EDITS[cur] != null){ el.setAttribute('data-mm-orig', cur); el.textContent = EDITS[cur]; }
    }
    if (obs) obs.observe(document.body, {childList:true, subtree:true});
  }
  obs = new MutationObserver(function(){
    if (pending || !Object.keys(EDITS).length) return;
    pending = setTimeout(function(){ pending = null; applyEdits(); }, 120);
  });

  /* ---------- 클릭 → 인라인 편집 ---------- */
  function beginEdit(el){
    if (!el.getAttribute('data-mm-orig')) el.setAttribute('data-mm-orig', el.textContent.trim());
    el.setAttribute('contenteditable', 'true');
    el.classList.add('mm-ed-active');
    el.focus();
    try{ var r=document.createRange(); r.selectNodeContents(el); var s=getSelection(); s.removeAllRanges(); s.addRange(r); }catch(e){}
  }
  function commit(el){
    el.removeAttribute('contenteditable');
    el.classList.remove('mm-ed-active');
    var orig = el.getAttribute('data-mm-orig'); if (orig == null) return;
    var val = el.textContent.replace(/\s+$/,'').replace(/^\s+/,'');
    if (val === orig || val === ''){ delete EDITS[orig]; if(val==='') el.textContent = orig; }
    else { EDITS[orig] = val; }
    save(EDITS); updateBar();
  }

  document.addEventListener('click', function(e){
    if (!editing) return;
    var el = e.target;
    if (el.getAttribute && el.getAttribute('contenteditable')) return; // 편집 중 클릭은 통과
    if (!isEditable(el)) return;
    e.preventDefault(); e.stopPropagation();
    beginEdit(el);
  }, true);

  document.addEventListener('focusout', function(e){
    var el = e.target;
    if (el && el.getAttribute && el.getAttribute('contenteditable')) commit(el);
  }, true);

  document.addEventListener('keydown', function(e){
    var el = document.activeElement;
    if (!el || !el.getAttribute || !el.getAttribute('contenteditable')) return;
    if (e.key === 'Enter'){ e.preventDefault(); el.blur(); }
    else if (e.key === 'Escape'){ e.preventDefault(); el.textContent = el.getAttribute('data-mm-orig') || el.textContent; el.blur(); }
  }, true);

  document.addEventListener('mouseover', function(e){
    if (!editing) return;
    if (lastHover){ lastHover.classList.remove('mm-ed-hover'); lastHover = null; }
    if (isEditable(e.target)){ e.target.classList.add('mm-ed-hover'); lastHover = e.target; }
  }, true);

  /* ---------- 내보내기 / 초기화 ---------- */
  function exportJSON(){
    var data = { _instance: INST, _lang: LANG, edits: EDITS };
    var txt = JSON.stringify(data, null, 2);
    try{ navigator.clipboard && navigator.clipboard.writeText(txt); }catch(e){}
    var blob = new Blob([txt], {type:'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'edits_' + INST + '_' + LANG + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
  }
  function resetAll(){
    if (!confirm('이 언어(' + LANG.toUpperCase() + ')의 수정 내용을 모두 되돌릴까요?')) return;
    EDITS = {}; save(EDITS);
    location.reload();
  }

  /* ---------- UI ---------- */
  function injectCSS(){
    var s = document.createElement('style');
    s.textContent =
      '#mm-ed{position:fixed;right:16px;bottom:16px;z-index:2147483600;width:42px;height:42px;border-radius:50%;' +
        'background:#fff;border:1px solid #e3e3ea;box-shadow:0 4px 14px rgba(20,20,40,.18);cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;font-size:18px;transition:.15s}' +
      '#mm-ed:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(20,20,40,.24)}' +
      '#mm-ed.on{background:#6C5CE7;border-color:#6C5CE7}' +
      '#mm-ed-bar{position:fixed;right:16px;bottom:66px;z-index:2147483600;background:#fff;border:1px solid #e3e3ea;' +
        'border-radius:12px;box-shadow:0 8px 24px rgba(20,20,40,.18);padding:10px 12px;width:230px;display:none;' +
        'font-family:"Noto Sans KR",system-ui,sans-serif}' +
      '#mm-ed-bar.show{display:block}' +
      '#mm-ed-bar .t{font-size:12.5px;font-weight:700;color:#23233a;margin-bottom:6px}' +
      '#mm-ed-bar .n{font-size:11.5px;color:#8a8a9a;line-height:1.5;margin-bottom:9px}' +
      '#mm-ed-bar .cnt{color:#6C5CE7;font-weight:700}' +
      '#mm-ed-bar button{width:100%;border:0;border-radius:8px;padding:8px 0;font-size:12.5px;font-weight:700;cursor:pointer;margin-top:6px}' +
      '#mm-ed-bar .exp{background:#6C5CE7;color:#fff}' +
      '#mm-ed-bar .rst{background:#f3f3f7;color:#6b6b7b}' +
      'body.mm-editing .mm-ed-hover{outline:1.5px dashed #6C5CE7 !important;outline-offset:1px;cursor:text;border-radius:3px}' +
      'body.mm-editing .mm-ed-active{outline:2px solid #6C5CE7 !important;outline-offset:1px;background:rgba(108,92,231,.07);border-radius:3px}';
    document.head.appendChild(s);
  }
  var btn, bar;
  function updateBar(){
    if (!bar) return;
    var n = Object.keys(EDITS).length;
    bar.querySelector('.cnt').textContent = n;
  }
  function toggle(){
    editing = !editing;
    document.body.classList.toggle('mm-editing', editing);
    btn.classList.toggle('on', editing);
    btn.textContent = editing ? '✓' : '✏️';
    bar.classList.toggle('show', editing);
    if (!editing && lastHover){ lastHover.classList.remove('mm-ed-hover'); lastHover = null; }
    if (editing) applyEdits();
  }
  function build(){
    injectCSS();
    btn = document.createElement('div'); btn.id = 'mm-ed'; btn.title = '검수(편집) 모드'; btn.textContent = '✏️';
    btn.addEventListener('click', toggle);
    bar = document.createElement('div'); bar.id = 'mm-ed-bar';
    bar.innerHTML =
      '<div class="t">검수 · 편집 모드</div>' +
      '<div class="n">수정할 <b>글자를 클릭</b>해 바로 고치세요. Enter=저장 · Esc=취소.<br>' +
        '자동 저장됨(<span class="cnt">0</span>건). 영구 반영하려면 <b>내보내기</b> 후 전달해 주세요.</div>' +
      '<button class="exp">JSON 내보내기</button>' +
      '<button class="rst">전체 되돌리기</button>';
    bar.querySelector('.exp').addEventListener('click', exportJSON);
    bar.querySelector('.rst').addEventListener('click', resetAll);
    document.body.appendChild(btn); document.body.appendChild(bar);
    updateBar();
    obs.observe(document.body, {childList:true, subtree:true});
    setTimeout(applyEdits, 300); setTimeout(applyEdits, 1000);
  }

  /* 언어 전환 시 해당 언어 수정본으로 교체 */
  document.addEventListener('mm:lang', function(e){
    LANG = (e && e.detail && e.detail.lang) || curLang();
    EDITS = load(); updateBar();
    setTimeout(applyEdits, 200);
  });
  window.addEventListener('mm-lang', function(){ LANG = curLang(); EDITS = load(); updateBar(); setTimeout(applyEdits, 200); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
