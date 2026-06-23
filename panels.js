/* =========================================================================
   panels.js — 공유 모듈: 우측 상단 💬채팅 / 🔔알림 패널 + 채팅창/업무 모달
   - 모든 morningmate 뷰(task/calendar/files/activity/insights)에 <script>로 포함
   - .top .right 의 종(🔔) 옆에 채팅 버튼을 주입하고 클릭 동작을 연결
   ========================================================================= */
(function () {
  "use strict";
  function TL(k, fb) { var t = window.MM_TR && window.MM_TR(k); return (t && t !== k) ? t : fb; }

  /* ---------- 데이터 ---------- */
  var CHAT_ROOMS = [
    { name: "SANO HARUKA", pin: true, last: "영상 업무 아직 착수를 못했어요 ㅎㅎㅎㅎ ㅠㅠㅠㅠ", time: "08:16 PM", color: "#9DC8FF", active: true, convo: true },
    { name: "Hyejo (Jo) Seo, Jessica B...", count: 3, last: "하게 되면 채팅 남길게요", time: "05/18/2026", color: "#A8E6C0" },
    { name: "❤️[협업방] KGNC X morni...", count: 4, last: "@신원준 안녕하세요 대표님, 오랜만에 인사드립니다.", time: "04/28/2026", color: "#FFB0B0" },
    { name: "Sooyoung Oh (work Jun 2,...", pin: true, last: "수영님~", time: "02/04/2026", color: "#FFD4A8" },
    { name: "Ashley, 김채영", count: 3, pin: true, last: "ㅎㅎ 일정 공유주셔서 감사합니다!! 🙏 올 한해도 잘부탁드립니다!", time: "01/30/2026", color: "#C5A3FF" },
    { name: "Hyejo Seo", last: "https://www.facebook.com/ads/library/?active_statu...", time: "04:58 PM", color: "#9DC8FF" },
    { name: "김채영", last: "네네!! ㅎㅎ 말씀주세요😋", time: "06/02/2026", color: "#A8E6C0" },
    { name: "WOOJUNG KIM", last: "네넴 댓글 남겼습니다 https://morningmate.com/l/coYl", time: "05/15/2026", color: "#FFB89D" },
    { name: "Hyejo Seo, SANO HARUK...", count: 4, last: "네! 감사합니다!", time: "05/13/2026", color: "#9DC8FF" },
    { name: "Jessica Baek, WOOJUNG ...", count: 3, last: "감사합니다!! 잘 부탁드립니다. 가까운 시일 내에 또 뵙겠습니다.", time: "05/12/2026", color: "#A8E6C0" },
    { name: "Hyejo Seo, WOOJUNG KIM", count: 3, last: "네네!!", time: "05/11/2026", color: "#C5A3FF" }
  ];
  var CONVO = [
    { side: "them", link: "https://www.instagram.com/reel/DYg7JoCBL6F/?utm_source=ig_web_copy_link&igsh=MzRIODBiNWFIZA==" },
    { side: "them", card: { title: "モーニングメイト - Instagram: ...", meta: "May 17, 2026, 5 likes, 0 comme..." } },
    { side: "them", text: "이거인가요?", time: "5:46 PM" },
    { side: "them", text: "이거는 flow쓰고 음성과 원본 다 만들었어요!", time: "5:47 PM" },
    { side: "me", text: "넹넹" },
    { side: "me", text: "하루카상 미안한데요 ㅠ" },
    { side: "me", text: "혹시 내일 말고 월요일에 나와주는걸로 할수있을까요", time: "8:15 PM" },
    { side: "me", text: "영상 업무 아직 착수를 못했어요 ㅎㅎㅎㅎ ㅠㅠㅠㅠ", time: "8:16 PM" },
    { side: "them", text: "넵 알겠습니다! 월요일에 뵙겠습니다 🙏", time: "10:42 PM" }
  ];
  var NOTIS = [
    { proj: "English Markets GTM", emoji: "🟢", av: "#9DC8FF", actor: "Hyejo Seo's comment", task: "가설 ICP 세우기 2차", activity: "'🚫 Not started' → '⏳ In Progress' Status has been updated.", time: "a few seconds ago", unread: true },
    { proj: "English Markets GTM", emoji: "🟢", av: "#9DC8FF", actor: "Hyejo Seo added a new task", task: "가설 ICP 세우기 2차", time: "4 minutes ago", unread: true },
    { proj: "English Markets GTM", emoji: "🟢", av: "#9DC8FF", actor: "Hyejo Seo's comment", task: "경쟁사 마케팅 채널 및 전략 조사", activity: "'⏳ In Progress' → '🎉 Done' Status has been updated.", time: "5 minutes ago", unread: true },
    { proj: "English Markets GTM", emoji: "🟢", av: "#9DC8FF", actor: "Hyejo Seo's comment", task: "추가 마케팅 채널 조사", activity: "'⏳ In Progress' → '🎉 Done' Status has been updated.", time: "5 minutes ago", unread: true },
    { proj: "[QA] Morningmate", av: "#A8E6C0", actor: "Kate Lee added a new reply", task: "[Website] Can't sign up to Morningmate", activity: "감사합니다 팀장님!!", time: "an hour ago" },
    { proj: "[일본] 프리랜서 협업방", emoji: "🔴", av: "#C5A3FF", actor: "SANO HARUKA added a new comment", plain: "먼저 퇴근하겠습니다! 내일 뵙겠습니다", time: "an hour ago" },
    { proj: "English Markets GTM", emoji: "🟢", av: "#FFB89D", actor: "Kate Lee's comment", task: "저녁 레스토랑 부킹", activity: "'Kate Lee' Assignee has been added.", time: "2 hours ago" },
    { proj: "English Markets GTM", emoji: "🟢", av: "#FFB89D", actor: "Kate Lee added a new comment", task: "[공유 및 컨펌 요청] 브루넬 대학교 부총장 방문 미팅 어레인지 건", activity: "3시 사무실 방문 + 이후 저녁으로 어레인지 완료", time: "2 hours ago" }
  ];
  var TASK = {
    crumb: "English Markets GTM › … › 경쟁사 마케팅 채널 및 전략 조사",
    author: "Hyejo Seo", date: "06/03/2026 18:42", title: "추가 마케팅 채널 조사", taskNo: "43770",
    status: "🚫 요청", assignee: "Hyejo Seo", due: "Until 06-04-2026 (Thu), 12:30", progress: 0,
    comment: { author: "Hyejo Seo", date: "06/03/2026 18:42", text: "'🚫 Not started' → '⏳ In Progress' Status has been updated." }
  };

  var PARTNER = { name: "SANO HARUKA", color: "#9DC8FF" };

  // 프로젝트 단체 메시지방(여러 사람이 함께 대화)
  var GROUP_MEMBERS = { "Soyun Noh": "#F2A65A", "SANO HARUKA": "#7E8694", "장아람": "#5BBF9A", "Hyejo Seo": "#D98AA6", "June Lee": "#5B6CF0" };
  var GROUP_CONVO = [
    { side: "them", who: "June Lee", text: "다들 이번 주 [일본] 전시회 부스 준비 상황 공유 부탁드려요 🙌", time: "9:02 AM" },
    { side: "them", who: "장아람", text: "부스 부자재 오늘 발주 넣었습니다! 금요일 입고 예정이에요 📦", time: "9:10 AM" },
    { side: "them", who: "SANO HARUKA", text: "현지 통역 2명 섭외 완료했어요. 명단은 곧 공유드릴게요 😊", time: "9:15 AM" },
    { side: "me", text: "다들 고생 많으셨어요! 배너 시안은 제가 오늘 중으로 올릴게요" },
    { side: "them", who: "Hyejo Seo", text: "리드 수집용 QR 신청 폼도 거의 완성됐습니다 🔗", time: "9:22 AM" },
    { side: "me", text: "좋아요 🔥 그럼 목요일에 최종 리허설 한번 돌리시죠" },
    { side: "them", who: "June Lee", text: "👍 목요일 오후 3시로 캘린더 잡아둘게요", time: "9:30 AM" }
  ];
  var GROUP_CHAT = { group: true, name: "[일본] 프리랜서 협업방", color: "#C5A3FF", members: 5, pin: "📢 [일본] 전시회 D-3! 부스 최종 점검 부탁드려요 🔥", convo: GROUP_CONVO, auto: "방금 배너 최종 시안 공유드렸어요! 확인 후 코멘트 부탁드려요 🙏" };
  var HARUKA_CHAT = { group: false, name: "SANO HARUKA", color: "#9DC8FF", pin: "📢 8일 출근, 18일 출근하겠습니다!", convo: CONVO, auto: "하루카상 영상 편집본 확인했어요! 퀄리티 너무 좋네요 👍 월요일에 뵐게요" };
  var _personChats = {};
  var PERSON_TPL = null;  // 콘텐츠에서 주입되는 1:1 템플릿(pin/auto/msgs)
  function personChat(name, color) {
    if (name && name.indexOf("SANO HARUKA") === 0) return HARUKA_CHAT;
    if (!_personChats[name]) {
      var tpl = PERSON_TPL || { pin: "📢 " + name + "님과의 1:1 대화", auto: "넵 확인했습니다! 바로 반영해서 다시 공유드릴게요 🙌",
        msgs: [{ side: "them", text: "안녕하세요! 방금 공유해주신 자료 잘 받았습니다 😊" }, { side: "me", text: "네 확인 부탁드려요!" }, { side: "them", text: "넵 바로 반영해서 회신드릴게요 🙌" }] };
      var convo = (tpl.msgs || []).map(function (m) { var o = { side: m.side, text: m.text }; if (m.side === "them") { o.who = name; o.time = "방금"; } return o; });
      _personChats[name] = { group: false, name: name, color: color || "#9DC8FF", pin: String(tpl.pin || "").replace("{name}", name), auto: tpl.auto, convo: convo };
    }
    return _personChats[name];
  }
  // 언어별 채팅/알림 콘텐츠 주입(캡처된 참조까지 갱신)
  function syncChatFromContent() {
    if (!window.MM_C) return;
    var c = window.MM_C('pc.chat'); if (!c) return;
    if (c.rooms) CHAT_ROOMS = c.rooms;
    if (c.convo) CONVO = c.convo;
    if (c.groupConvo) GROUP_CONVO = c.groupConvo;
    if (c.notis) NOTIS = c.notis;
    if (c.haruka) { HARUKA_CHAT.pin = c.haruka.pin; HARUKA_CHAT.auto = c.haruka.auto; }
    HARUKA_CHAT.convo = CONVO;
    if (c.rooms && c.rooms[0]) HARUKA_CHAT.name = c.rooms[0].name, HARUKA_CHAT.color = c.rooms[0].color || HARUKA_CHAT.color;
    if (c.group) { GROUP_CHAT.name = c.group.name; GROUP_CHAT.pin = c.group.pin; GROUP_CHAT.auto = c.group.auto; }
    GROUP_CHAT.convo = GROUP_CONVO;
    if (c.personTpl) PERSON_TPL = c.personTpl;
    _personChats = {};  // 언어 변경 시 1:1 캐시 초기화
  }
  var currentChat = HARUKA_CHAT;
  var SEARCH_IC = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="#8A8A92" stroke-width="2.2"/><path d="M19.6 19.6l-4-4" stroke="#8A8A92" stroke-width="2.6" stroke-linecap="round"/></svg>';
  var MENU_IC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var TOOL_EMOJI = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#7d7d85" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.1" fill="#7d7d85" stroke="none"/><circle cx="15" cy="10" r="1.1" fill="#7d7d85" stroke="none"/><path d="M8.5 14.2a4.2 4.2 0 007 0" stroke-linecap="round"/></svg>';
  var TOOL_ATTACH = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#7d7d85" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.5l-8.6 8.6a5 5 0 01-7.1-7.1l8.6-8.6a3.3 3.3 0 014.7 4.7l-8.6 8.6a1.65 1.65 0 01-2.3-2.3l7.9-7.9"/></svg>';
  var TOOL_TIMER = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7d7d85" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12"/><path d="M8 3v4l4 5 4-5V3"/><path d="M8 21v-4l4-5 4 5v4"/></svg>';
  var TOOL_VIDEO = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7d7d85" stroke-width="1.6" stroke-linejoin="round"><rect x="2.5" y="6.5" width="13" height="11" rx="2.5"/><path d="M15.5 10l6-3.2v10.4l-6-3.2z"/></svg>';
  var TK_CHEVRON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  var TK_SUB = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M8 12h8" stroke-linecap="round"/></svg>';
  var TK_LIKE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20s-7-4.6-9.3-9A4.4 4.4 0 0112 5.4 4.4 4.4 0 0121.3 11C19 15.4 12 20 12 20z"/></svg>';
  var TK_BOOK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.7" stroke-linejoin="round"><path d="M6 4h12v16l-6-4-6 4z"/></svg>';
  var TK_REMIND = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><path d="M12 10v3.2l2 1.3"/><path d="M5 3.5L2.5 6M19 3.5L21.5 6"/></svg>';

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function ava(color, size) { return '<span class="mmp-ava" style="width:' + size + 'px;height:' + size + 'px;background:' + (color || "#C7C7CF") + '"></span>'; }
  // 이름 기반 프로필 사진 아바타(성별에 맞는 사진)
  function avaN(name, size, color) {
    if (window.MM_AV && name) return '<span class="mmp-ava" style="width:' + size + 'px;height:' + size + 'px;background:' + (color || "#C7C7CF") + ' url(' + MM_AV.photo(name) + ') center/cover no-repeat"></span>';
    return ava(color, size);
  }

  /* ---------- CSS ---------- */
  var CSS = ''
    + '.mmp-ava{border-radius:50%;display:inline-block;flex-shrink:0;}'
    + '.mmp-iconbtn{cursor:pointer;display:inline-flex;align-items:center;position:relative;}'
    + '#mmp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.34);z-index:1400;display:none;}'
    + '#mmp-overlay.on{display:block;}'
    /* 우측 패널 */
    + '.mmp-panel{position:fixed;top:0;right:0;bottom:0;width:360px;background:#fff;box-shadow:-4px 0 24px rgba(0,0,0,.12);z-index:1500;transform:translateX(106%);transition:transform .22s ease;display:flex;flex-direction:column;font-family:Roboto,"Noto Sans KR","Noto Sans JP",sans-serif;}'
    + '.mmp-panel.open{transform:translateX(0);}'
    + '.mmp-ph{display:flex;align-items:center;gap:10px;padding:18px 18px 12px;}'
    + '.mmp-ph .t{font-size:17px;font-weight:800;color:#222;}'
    + '.mmp-ph .sp{flex:1;}'
    + '.mmp-ph .x{cursor:pointer;color:#aaa;font-size:18px;}'
    + '.mmp-ph .gbtn{background:#36CFBD;color:#fff;font-size:12px;font-weight:600;border-radius:6px;padding:6px 12px;}'
    + '.mmp-ph .gear{color:#888;font-size:12px;}'
    + '.mmp-tabs{display:flex;gap:20px;padding:0 18px;border-bottom:1px solid #EEE;}'
    + '.mmp-tabs span{font-size:14px;color:#999;padding:8px 0;border-bottom:2px solid transparent;cursor:pointer;}'
    + '.mmp-tabs span.on{color:#222;font-weight:700;border-bottom-color:#6449FC;}'
    + '#mmp-noti .mmp-tabs span.on{border-bottom-color:#222;}'
    + '.mmp-tabs .ra{margin-left:auto;color:#bbb;font-size:13px;border:none;}'
    + '.mmp-search{margin:12px 16px;display:flex;align-items:center;gap:8px;background:#F4F4F6;border-radius:8px;padding:9px 12px;color:#aaa;font-size:13px;}'
    + '.mmp-chips{display:flex;align-items:center;gap:8px;padding:6px 16px 14px;}'
    + '.mmp-chips span{font-size:13px;color:#555;border:1px solid #E2E2E8;border-radius:17px;padding:7px 14px;}'
    + '.mmp-chips .srch{margin-left:auto;width:34px;height:34px;border-radius:50%;padding:0;display:inline-flex;align-items:center;justify-content:center;}'
    + '.mmp-list{flex:1;overflow:auto;}'
    /* 채팅 룸 */
    + '.mmp-room{display:flex;gap:11px;padding:13px 16px;cursor:pointer;border-bottom:1px solid #F4F4F4;}'
    + '.mmp-room:hover{background:#FAF9FF;} .mmp-room.active{background:#EFEBFF;}'
    + '.mmp-room .rb{flex:1;min-width:0;}'
    + '.mmp-room .r1{display:flex;align-items:center;gap:5px;}'
    + '.mmp-room .nm{font-size:13.5px;font-weight:700;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
    + '.mmp-room .cnt{font-size:12px;color:#aaa;} .mmp-room .pin{font-size:11px;}'
    + '.mmp-room .tm{margin-left:auto;font-size:11px;color:#bbb;flex-shrink:0;}'
    + '.mmp-room .lst{font-size:12.5px;color:#999;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
    /* 알림 */
    + '.mmp-noti{display:flex;align-items:flex-start;gap:11px;padding:14px 16px;cursor:pointer;border-bottom:1px solid #F2F2F2;background:#F6F4FF;}'
    + '.mmp-noti.read{background:#fff;} .mmp-noti:hover{background:#F0EEFB;}'
    + '.mmp-noti .nb{flex:1;min-width:0;}'
    + '.mmp-noti .pn-row{display:flex;align-items:center;gap:8px;}'
    + '.mmp-noti .pn{font-size:12.5px;color:#36A;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
    + '.mmp-noti .tm{font-size:11px;color:#bbb;flex-shrink:0;}'
    + '.mmp-noti .ac{font-size:13px;color:#333;font-weight:600;margin-top:3px;}'
    + '.mmp-noti .ln{font-size:12.5px;color:#666;margin-top:3px;}'
    + '.mmp-noti .ln .lab{color:#999;} .mmp-noti .ln .lnk{color:#6449FC;}'
    /* 채팅 모달 */
    + '#mmp-chatwin{position:fixed;z-index:1600;width:404px;height:600px;top:80px;left:calc(50% - 202px);background:#fff;border-radius:12px;box-shadow:0 18px 60px rgba(0,0,0,.32);display:none;flex-direction:column;overflow:hidden;font-family:Roboto,"Noto Sans KR","Noto Sans JP",sans-serif;}'
    + '#mmp-chatwin.on{display:flex;}'
    + '.cw-h{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #EEE;}'
    + '.cw-h .nm{font-weight:700;color:#222;font-size:14px;} .cw-h .sp{flex:1;} .cw-h .ic{color:#aaa;display:inline-flex;align-items:center;cursor:pointer;}'
    + '.cw-h .cw-mem{font-size:12px;font-weight:600;color:#9a9aa2;background:#F1F0F6;border-radius:9px;padding:1px 8px;}'
    + '.cw-pin{display:flex;align-items:center;gap:8px;margin:10px 12px;background:#F4F4F6;border-radius:8px;padding:10px 12px;font-size:13px;color:#444;}'
    + '.cw-body{flex:1;overflow:auto;padding:6px 14px 12px;display:flex;flex-direction:column;gap:7px;}'
    + '.cw-row{display:flex;gap:8px;align-items:flex-start;max-width:88%;}'
    + '.cw-row.them{align-self:flex-start;} .cw-row.me{align-self:flex-end;max-width:80%;}'
    + '.cw-avc{width:34px;flex-shrink:0;display:flex;justify-content:center;} .cw-sp{width:34px;flex-shrink:0;}'
    + '.cw-content{min-width:0;display:flex;flex-direction:column;gap:4px;}'
    + '.cw-row.me .cw-content{align-items:flex-end;}'
    + '.cw-name{font-size:13px;font-weight:700;color:#1f1f24;margin-bottom:1px;}'
    + '.cw-bub{font-size:13px;line-height:1.45;padding:9px 12px;border-radius:12px;word-break:break-all;align-self:flex-start;}'
    + '.cw-row.me .cw-bub{align-self:flex-end;}'
    + '.cw-row.them .cw-bub{background:#FDEBD8;color:#5a4632;border-top-left-radius:3px;}'
    + '.cw-row.me .cw-bub{background:#E9E5FF;color:#33307a;border-top-right-radius:3px;}'
    + '.cw-time{font-size:10px;color:#bbb;}'
    + '.cw-emo img{width:104px;height:auto;display:block;border-radius:8px;}'
    + '.cw-card{background:#fff;border:1px solid #EEE;border-radius:8px;overflow:hidden;width:200px;}'
    + '.cw-card .ph{height:120px;background:#F1F1F4;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:11px;}'
    + '.cw-card .cc{padding:9px 11px;} .cw-card .ct{font-size:12.5px;color:#333;font-weight:600;} .cw-card .cm{font-size:11px;color:#aaa;margin-top:3px;}'
    + '.cw-input{border-top:1px solid #EEE;padding:8px 14px 12px;}'
    + '.cw-tools{display:flex;gap:18px;align-items:center;padding:4px 2px 10px;}'
    + '.cw-tools svg{cursor:pointer;display:block;}'
    + '.cw-box{border:1px solid #E4E4E8;border-radius:10px;padding:8px 8px 8px 14px;font-size:13px;color:#9a9aa2;display:flex;align-items:center;gap:10px;}'
    + '.cw-box .cw-ph{flex:1;line-height:1.45;}'
    + '.cw-send{background:#EFEFF1;color:#8a8a90;border-radius:8px;padding:9px 17px;font-weight:600;flex-shrink:0;cursor:pointer;}'
    /* 업무 모달 */
    + '#mmp-task{position:fixed;z-index:1600;width:720px;max-height:84vh;top:8vh;left:calc(50% - 360px);background:#fff;border-radius:12px;box-shadow:0 18px 60px rgba(0,0,0,.32);display:none;flex-direction:column;overflow:hidden;font-family:Roboto,"Noto Sans KR","Noto Sans JP",sans-serif;}'
    + '#mmp-task.on{display:flex;}'
    + '.tk-crumb{display:flex;align-items:center;gap:8px;padding:14px 20px;border-bottom:1px solid #F0F0F0;font-size:13px;color:#888;}'
    + '.mmp-modalfeed{padding:12px 16px 18px;overflow:auto;background:#fff;}'
    + '.mmp-modalfeed .mmc-feed{padding:0;}.mmp-modalfeed .mmc-card{margin-bottom:0;}'
    + '.tk-crumb .x{margin-left:auto;color:#bbb;cursor:pointer;font-size:16px;}'
    + '.tk-body{overflow:auto;padding:16px 22px 10px;}'
    + '.tk-prof{display:flex;align-items:center;gap:10px;} .tk-prof .nm{font-weight:700;color:#333;font-size:14px;} .tk-prof .dt{font-size:12px;color:#aaa;}'
    + '.tk-title{display:flex;align-items:center;margin:14px 0 16px;} .tk-title h1{font-size:21px;font-weight:700;color:#333;margin:0;flex:1;}'
    + '.tk-no{font-size:12px;color:#888;background:#F4F4F6;border-radius:4px;padding:5px 10px;}'
    + '.tk-row{display:flex;align-items:center;gap:14px;min-height:52px;} .tk-row .lab{width:96px;font-size:14px;color:#777;}'
    + '.tk-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(66,61,197,.28);color:#402A9D;font-size:13px;font-weight:700;border-radius:6px;padding:6px 12px;}'
    + '.tk-chip{display:inline-flex;align-items:center;gap:7px;background:#EEE;border-radius:6px;padding:5px 10px 5px 6px;font-size:13px;font-weight:700;color:#333;} .tk-chip .x{color:#999;}'
    + '.tk-change{font-size:13px;color:#999;text-decoration:underline;text-underline-offset:3px;}'
    + '.tk-due{font-size:14px;color:#FF3B30;} .tk-due .x{color:#ccc;margin-left:8px;}'
    + '.tk-prog{display:flex;align-items:center;gap:12px;flex:1;} .tk-prog .trk{width:200px;height:6px;background:#EEE;border-radius:6px;overflow:hidden;} .tk-prog .fil{height:100%;background:#6449FC;} .tk-prog .pct{font-weight:700;color:#333;font-size:14px;}'
    + '.tk-more{font-size:14px;color:#6449FC;padding:10px 0;cursor:pointer;}'
    + '.tk-div{height:1px;background:#F0F0F0;margin:8px 0;}'
    + '.tk-sub{font-size:14px;color:#333;font-weight:600;padding:10px 0;display:flex;align-items:center;gap:8px;}'
    + '.tk-addsub{font-size:13px;color:#555;border:1px solid #E0E0E0;border-radius:6px;padding:8px 14px;display:inline-block;margin:4px 0 14px;}'
    + '.tk-acts{display:flex;align-items:center;gap:18px;font-size:13px;color:#999;padding:12px 0;border-top:1px solid #F0F0F0;} .tk-acts span{display:inline-flex;align-items:center;gap:6px;} .tk-acts .read{margin-left:auto;color:#bbb;}'
    + '.tk-cmttabs{display:flex;gap:8px;margin:6px 0 12px;} .tk-cmttabs span{font-size:13px;color:#888;border:1px solid #E4E4E8;border-radius:14px;padding:5px 12px;} .tk-cmttabs span.on{background:#EFECFF;color:#6449FC;border-color:#D9D2FF;}'
    + '.tk-cmt{display:flex;gap:10px;} .tk-cmt .cb .nm{font-weight:700;color:#333;font-size:13.5px;} .tk-cmt .cb .dt{font-size:12px;color:#aaa;margin-left:6px;} .tk-cmt .cb .tx{font-size:13.5px;color:#444;margin-top:5px;} .tk-cmt .cb .lk{font-size:12px;color:#999;margin-top:6px;}'
    + '.tk-input{border-top:1px solid #F0F0F0;padding:14px 22px;} .tk-input .box{border:1px solid #E4E4E8;border-radius:10px;padding:12px 14px;font-size:13px;color:#aaa;}'
    + '@media (max-width:820px){.mmp-panel{width:100%;} #mmp-chatwin{width:94vw;height:84vh;top:7vh;left:3vw;} #mmp-task{width:94vw;left:3vw;top:6vh;max-height:88vh;} .tk-body{padding:14px 16px 10px;} .tk-input{padding:12px 16px;}}';

  /* ---------- 렌더 ---------- */
  function roomsHtml() {
    return CHAT_ROOMS.map(function (r, i) {
      return '<div class="mmp-room' + (r.active ? " active" : "") + '" data-room="' + i + '">' + avaN(r.name, 38, r.color) +
        '<div class="rb"><div class="r1"><span class="nm">' + esc(r.name) + '</span>' +
        (typeof r.count === 'number' ? '<span class="cnt">(' + r.count + ')</span>' : "") + (r.pin ? '<span class="pin">📌</span>' : "") +
        '<span class="tm">' + esc(r.time) + '</span></div><div class="lst">' + esc(r.last) + '</div></div></div>';
    }).join("");
  }
  function notisHtml() {
    return NOTIS.map(function (n, i) {
      var body = '<div class="ac">' + esc(n.actor) + '</div>';
      if (n.task) body += '<div class="ln"><span class="lab">Task :</span> <span class="lnk">' + esc(n.task) + '</span></div>';
      if (n.activity) body += '<div class="ln"><span class="lab">Activity :</span> ' + esc(n.activity) + '</div>';
      if (n.plain) body += '<div class="ln">' + esc(n.plain) + '</div>';
      return '<div class="mmp-noti' + (n.unread ? "" : " read") + '" data-noti="' + i + '">' +
        avaN(n.actor, 38, n.av || "#C7C7CF") +
        '<div class="nb"><div class="pn-row"><span class="pn">' + (n.emoji ? esc(n.emoji) + ' ' : '') + esc(n.proj) + '</span><span class="tm">' + esc(n.time) + '</span></div>' +
        body + '</div></div>';
    }).join("");
  }
  function bubbleInner(m) {
    if (m.emo) return '<div class="cw-emo"><img src="' + esc(m.emo) + '" alt="emoticon"></div>';
    if (m.link) return '<div class="cw-bub">' + esc(m.link) + '</div>';
    if (m.card) return '<div class="cw-card"><div class="ph">🖼 NO PHOTO</div><div class="cc"><div class="ct">' + esc(m.card.title) + '</div><div class="cm">' + esc(m.card.meta) + '</div></div></div>';
    return '<div class="cw-bub">' + esc(m.text) + '</div>';
  }
  function convoHtml(ctx) {
    ctx = ctx || currentChat;
    var conv = ctx.convo;
    return conv.map(function (m, i) {
      var inner = bubbleInner(m);
      if (m.time) inner += '<div class="cw-time">' + esc(m.time) + '</div>';
      if (m.side === "them") {
        var who = m.who || ctx.name;
        var color = ctx.group ? (GROUP_MEMBERS[who] || ctx.color) : ctx.color;
        var prev = conv[i - 1];
        var first = (i === 0 || prev.side !== "them" || (ctx.group && prev.who !== who));
        var av = first ? '<div class="cw-avc">' + avaN(who, 34, color) + '</div>' : '<span class="cw-sp"></span>';
        var nm = first ? '<div class="cw-name">' + esc(who) + '</div>' : '';
        return '<div class="cw-row them">' + av + '<div class="cw-content">' + nm + inner + '</div></div>';
      }
      return '<div class="cw-row me"><div class="cw-content">' + inner + '</div></div>';
    }).join("");
  }
  function commentHtml() {
    var t = TASK;
    return '<div class="tk-cmt">' + ava("#9DC8FF", 32) + '<div class="cb"><div><span class="nm">' + esc(t.comment.author) + '</span><span class="dt">' + esc(t.comment.date) + '</span></div><div class="tx">' + esc(t.comment.text) + '</div><div class="lk">😊 Like</div></div></div>';
  }
  function taskHtml() {
    var t = TASK;
    return '<div class="tk-crumb"><span>🟡 🟢 ' + esc(t.crumb) + '</span><span class="x" data-close="task">✕</span></div>' +
      '<div class="tk-body">' +
      '<div class="tk-prof">' + ava("#9DC8FF", 36) + '<div><div class="nm">' + esc(t.author) + '</div><div class="dt">' + esc(t.date) + ' 🔒</div></div></div>' +
      '<div class="tk-title"><h1>' + esc(t.title) + '</h1><span class="tk-no">Task # ' + esc(t.taskNo) + '</span></div>' +
      '<div class="tk-row"><span class="lab">Status</span><span class="tk-badge">' + esc(t.status) + TK_CHEVRON + '</span></div>' +
      '<div class="tk-row"><span class="lab">Assignee</span><span class="tk-chip">' + ava("#9DC8FF", 22) + esc(t.assignee) + ' <span class="x">✕</span></span><span class="tk-change">Change Assignee</span></div>' +
      '<div class="tk-row"><span class="lab">Due date</span><span class="tk-due">' + esc(t.due) + ' <span class="x">✕</span></span></div>' +
      '<div class="tk-row"><span class="lab">Progress</span><span class="tk-prog"><span class="trk"><span class="fil" style="width:' + t.progress + '%"></span></span><span class="pct">' + t.progress + '%</span></span></div>' +
      '<div class="tk-more">＋ Show more</div><div class="tk-div"></div>' +
      '<div class="tk-sub">' + TK_SUB + '<span>Subtasks</span></div><div class="tk-addsub">＋ Add subtask</div>' +
      '<div class="tk-acts"><span>' + TK_LIKE + ' Like</span><span>' + TK_BOOK + ' Bookmark</span><span>' + TK_REMIND + ' Reminder</span><span class="read">Read 3</span></div>' +
      '<div class="tk-cmttabs"><span class="on">All 4</span><span>Comment 0</span></div>' +
      '<div class="tk-cmtwrap">' + (t._showComment ? commentHtml() : '') + '</div>' +
      '</div>' +
      '<div class="tk-input"><div class="box">Press Shift + Enter to add a new line and Enter to post</div></div>';
  }

  /* ---------- DOM 구성 ---------- */
  function build() {
    if (document.getElementById("mmp-style")) return;
    var st = document.createElement("style"); st.id = "mmp-style"; st.textContent = CSS; document.head.appendChild(st);

    var overlay = document.createElement("div"); overlay.id = "mmp-overlay"; document.body.appendChild(overlay);

    var chatPanel = document.createElement("div"); chatPanel.className = "mmp-panel"; chatPanel.id = "mmp-chat";
    chatPanel.innerHTML = '<div class="mmp-ph"><span class="t">' + TL('pc.chat','Chat') + '</span><span>↻</span><span class="sp"></span><span class="gear">⚙ ' + TL('pc.settings','Settings') + '</span><span class="gbtn">' + TL('pc.newChat','＋ Chat') + '</span><span class="x" data-close="chat">✕</span></div>' +
      '<div class="mmp-tabs"><span class="on">' + TL('pc.chat','Chat') + '</span><span>' + TL('pc.contact','Contact') + '</span></div>' +
      '<div class="mmp-search">' + SEARCH_IC + ' ' + TL('pc.searchByName','Search by name or chat room name') + '</div>' +
      '<div class="mmp-list">' + roomsHtml() + '</div>';
    document.body.appendChild(chatPanel);

    var notiPanel = document.createElement("div"); notiPanel.className = "mmp-panel"; notiPanel.id = "mmp-noti";
    notiPanel.innerHTML = '<div class="mmp-ph"><span class="t">' + TL('pc.notifications','Notifications') + '</span><span class="sp"></span><span class="x" data-close="noti">✕</span></div>' +
      '<div class="mmp-tabs"><span class="on">' + TL('pc.unread','Unread') + '</span><span>' + TL('pc.all','All') + '</span><span class="ra">' + TL('pc.readAll','Read All') + '</span></div>' +
      '<div class="mmp-chips"><span>' + TL('pc.mentions','Mentions') + '</span><span>' + TL('pc.myPosts','My Posts') + '</span><span>' + TL('pc.myTasks','My tasks') + '</span><span class="srch">' + SEARCH_IC + '</span></div>' +
      '<div class="mmp-list">' + notisHtml() + '</div>';
    document.body.appendChild(notiPanel);

    var chatWin = document.createElement("div"); chatWin.id = "mmp-chatwin";
    chatWin.innerHTML = '<div class="cw-h">' + ava("#9DC8FF", 30) + '<span class="nm">SANO HARUKA</span><span class="sp"></span><span class="ic">' + SEARCH_IC + '</span><span class="ic">' + MENU_IC + '</span><span class="ic" data-close="chatwin" style="cursor:pointer">✕</span></div>' +
      '<div class="cw-pin">📢 8일 출근, 18일 출근하겠습니다! <span style="margin-left:auto;color:#bbb">⌄</span></div>' +
      '<div class="cw-body">' + convoHtml() + '</div>' +
      '<div class="cw-input"><div class="cw-tools">' + TOOL_EMOJI + TOOL_ATTACH + TOOL_TIMER + TOOL_VIDEO + '</div>' +
      '<div class="cw-box"><span class="cw-ph">' + TL('chat.windowPlaceholder','Type a message... (@ to mention / Shift + Enter for new line)') + '</span><span class="cw-send">' + TL('chat.send','Send') + '</span></div></div>';
    document.body.appendChild(chatWin);

    var taskModal = document.createElement("div"); taskModal.id = "mmp-task"; taskModal.innerHTML = taskHtml(); document.body.appendChild(taskModal);

    /* 이벤트 */
    overlay.addEventListener("click", closeAll);
    document.addEventListener("click", function (e) {
      var cl = e.target.closest("[data-close]");
      if (cl) { e.stopPropagation(); var w = cl.getAttribute("data-close"); if (w === "chat") closePanel("mmp-chat"); else if (w === "noti") closePanel("mmp-noti"); else if (w === "chatwin") { chatWin.classList.remove("on"); maybeOverlay(); } else if (w === "task") { taskModal.classList.remove("on"); maybeOverlay(); } return; }
      var pfc = e.target.closest('[data-mmp-chat], .parts .part .chat'); if (pfc) { e.stopPropagation(); openChatWin(pfc); return; }
      var room = e.target.closest(".mmp-room"); if (room) { openChatWin(room); return; }
      var noti = e.target.closest(".mmp-noti"); if (noti) { noti.classList.add("read"); openTaskModal(); return; }
    });
    // 알림으로 열리는 TASK: 상태 뱃지에 마우스가 지나가면 요청→진행중→완료 자동 진행(+진행바/컨페티)
    document.addEventListener("mouseover", function (e) {
      if (!e.target.closest) return;
      if (e.target.closest("#mmp-task .tk-badge")) tkAdvance();
    });
    // 피드의 'Chat' 버튼과 SANO HARUKA 옆 채팅 아이콘에 마우스를 올리면 알아서 채팅창이 열림
    document.addEventListener("mouseover", function (e) {
      if (!e.target.closest) return;
      var trig = e.target.closest('.parts-foot [data-mmp-chat], .parts .part .chat');
      if (!trig) return;
      var part = trig.closest(".part");
      if (part) { var pn = part.querySelector(".pn"); if (!pn || pn.textContent.indexOf("SANO HARUKA") !== 0) return; } // 1:1은 SANO HARUKA만 hover 오픈
      var cw = document.getElementById("mmp-chatwin"); if (cw && cw.classList.contains("on")) return;
      openChatWin(trig);
    });
    // 입력칸에 마우스를 올리면 자동으로 메시지가 작성됨
    document.addEventListener("mouseover", function (e) {
      if (!e.target.closest) return;
      var box = e.target.closest("#mmp-chatwin .cw-box");
      if (box && !box._filled) {
        box._filled = true;
        var ph = box.querySelector(".cw-ph");
        if (ph) { ph.style.color = "#333"; ph.textContent = currentChat.auto; if (window.MM_MOTION) window.MM_MOTION.typewriter(ph); }
      }
    });
  }
  function chatCtxFor(anchor) {
    if (!anchor) return HARUKA_CHAT;
    // 피드의 'Chat' 버튼 → 여러 사람이 함께하는 프로젝트 단체방
    if (anchor.matches && (anchor.matches("[data-mmp-chat]") || (anchor.closest && anchor.closest("[data-mmp-chat]")))) return GROUP_CHAT;
    // Participants 각 인물 옆 채팅 아이콘 → 그 사람과의 1:1 (SANO HARUKA는 기존 대화)
    var part = anchor.closest && anchor.closest(".part");
    if (part) {
      var pn = part.querySelector(".pn"), pa = part.querySelector(".pa");
      var name = pn ? pn.textContent.replace(/\s*\(You\)\s*$/, "").trim() : "";
      var color = pa ? (pa.style.background || "#9DC8FF") : "#9DC8FF";
      return personChat(name, color);
    }
    // 채팅 패널 룸 목록 → 단체방(협업방) 또는 하루카 1:1
    var room = anchor.closest && anchor.closest(".mmp-room");
    if (room) {
      var ri = +room.getAttribute("data-room"); var r = CHAT_ROOMS[ri] || {};
      var isGroup = (typeof r.count === 'number') || !!r.members;   // 숫자 인원수/멤버가 있을 때만 단체방(count:true 등 오작성 방지)
      var base = r.convo ? HARUKA_CHAT : (isGroup ? GROUP_CHAT : personChat(r.name, r.color)); // 하루카 1:1 / 단체방 / 1:1
      var ctx = {}; for (var k in base) ctx[k] = base[k];
      ctx.name = r.name; ctx.color = r.color || ctx.color;  // 창 제목 = 클릭한 목록 제목
      ctx.group = isGroup;
      if (typeof r.count === 'number') ctx.members = r.count;
      return ctx;
    }
    return HARUKA_CHAT;
  }
  function renderChatWin(ctx) {
    var chatWin = document.getElementById("mmp-chatwin"); if (!chatWin) return;
    var head = chatWin.querySelector(".cw-h");
    if (head) head.innerHTML = (ctx.group ? ava(ctx.color, 30) : avaN(ctx.name, 30, ctx.color)) + '<span class="nm">' + esc(ctx.name) + '</span>' +
      (ctx.group ? '<span class="cw-mem">' + ctx.members + '</span>' : '') +
      '<span class="sp"></span><span class="ic">' + SEARCH_IC + '</span><span class="ic">' + MENU_IC + '</span><span class="ic" data-close="chatwin" style="cursor:pointer">✕</span>';
    var pin = chatWin.querySelector(".cw-pin");
    if (pin) pin.innerHTML = esc(ctx.pin) + ' <span style="margin-left:auto;color:#bbb">⌄</span>';
    var body = chatWin.querySelector(".cw-body");
    if (body) body.innerHTML = convoHtml(ctx);
  }
  function openChatWin(anchor) {
    var chatWin = document.getElementById("mmp-chatwin"), overlay = document.getElementById("mmp-overlay");
    currentChat = chatCtxFor(anchor);
    renderChatWin(currentChat);
    chatWin.classList.add("on"); overlay.classList.add("on");
    if (window.MM_MOTION) window.MM_MOTION.chatEmerge(chatWin, anchor);
    var ph = chatWin.querySelector(".cw-box .cw-ph");
    if (ph) { ph.textContent = "Type a message... (@ to mention / Shift + Enter for new line)"; ph.style.color = ""; }
    var box = chatWin.querySelector(".cw-box"); if (box) box._filled = false;
    var body = chatWin.querySelector(".cw-body");
    if (body && window.MM_MOTION) setTimeout(function () { window.MM_MOTION.autoScroll(body, { duration: 2600 }); }, 520);
    // 자동으로 메시지가 작성되고 → Send 가 눌려 → 채팅창에 남는다 (고정 타이밍으로 견고하게)
    setTimeout(function () {
      if (!chatWin.classList.contains("on")) return;
      if (box) box._filled = true;
      var send = chatWin.querySelector(".cw-send");
      var autoMsg = currentChat.auto;
      if (ph) { ph.style.color = "#333"; ph.textContent = autoMsg; if (window.MM_MOTION) window.MM_MOTION.typewriter(ph); }
      var emoUrl = randomEmo();
      setTimeout(function () {
        if (!chatWin.classList.contains("on")) return;
        if (send && window.MM_MOTION) window.MM_MOTION.pulse(send, "rgba(100,73,252,.5)");
        setTimeout(function () {
          sendChatMsg(autoMsg);
          if (ph) { ph.textContent = "Type a message... (@ to mention / Shift + Enter for new line)"; ph.style.color = ""; }
          if (box) box._filled = false;
          // 이모티콘도 하나 전송 (채팅 열 때마다 랜덤)
          setTimeout(function () {
            if (!chatWin.classList.contains("on")) return;
            if (send && window.MM_MOTION) window.MM_MOTION.pulse(send, "rgba(100,73,252,.5)");
            setTimeout(function () { sendChatMsg({ emo: emoUrl }); }, 280);
          }, 850);
        }, 320);
      }, 650);
    }, 3300);
  }
  function sendChatMsg(msg) {
    var m = (typeof msg === "string") ? { text: msg } : msg;
    currentChat.convo.push({ side: "me", text: m.text, emo: m.emo, time: "now" });
    var chatWin = document.getElementById("mmp-chatwin"), body = chatWin && chatWin.querySelector(".cw-body");
    if (!body) return;
    body.innerHTML = convoHtml(currentChat);
    var rows = body.querySelectorAll(".cw-row.me"), last = rows[rows.length - 1];
    if (last && window.MM_MOTION) last.animate([{ opacity: 0, transform: "translateY(12px) scale(.9)" }, { opacity: 1, transform: "translateY(-3px) scale(1.04)", offset: .7 }, { opacity: 1, transform: "translateY(0) scale(1)" }], { duration: 380, easing: "cubic-bezier(.2,.85,.3,1)" });
    body.scrollTop = body.scrollHeight;
    // 이모티콘(GIF)은 로드 후 높이가 잡히므로 로드되면 다시 맨 아래로
    var img = last && last.querySelector("img");
    if (img) { var toBot = function () { body.scrollTop = body.scrollHeight; }; img.addEventListener("load", toBot); setTimeout(toBot, 250); setTimeout(toBot, 600); }
  }
  function randomEmo() { var n = 1 + Math.floor(Math.random() * 24); return "assets/emo/peng" + (n < 10 ? "0" + n : n) + ".gif"; }

  var TK_STATUS = [{ label: "🚫 요청", prog: 0 }, { label: "⏳ 진행중", prog: 60 }, { label: "🎉 완료", prog: 100 }];
  var tkAdvancing = false;
  function openTaskModal() {
    var modal = document.getElementById("mmp-task"), overlay = document.getElementById("mmp-overlay");
    // FEED 첫 번째 TASK와 동일한 데이터/UI로 표시(댓글은 숨김)
    var cardHtml = (window.__MMC && window.__MMC.cardHtml) ? window.__MMC.cardHtml(0) : "";
    modal.innerHTML = '<div class="tk-crumb"><span>🔴 [일본] 프리랜서 협업방 › 피드</span><span class="x" data-close="task">✕</span></div>' +
      '<div class="feed-content mmp-modalfeed" id="mmp-feedhost">' + cardHtml + '</div>';
    modal.classList.add("on"); overlay.classList.add("on");
    if (window.MM_MOTION) modal.animate([{ opacity: 0, transform: "translateY(34px) scale(.965)" }, { opacity: 1, transform: "translateY(-6px) scale(1.005)", offset: .75 }, { opacity: 1, transform: "translateY(0) scale(1)" }], { duration: 520, easing: "cubic-bezier(.16,.7,.2,1)" });
  }
  function tkAdvance() {
    if (tkAdvancing || TASK.status === "🎉 완료") return;
    tkAdvancing = true;
    (function step() {
      var modal = document.getElementById("mmp-task");
      var cur = -1; for (var i = 0; i < TK_STATUS.length; i++) if (TK_STATUS[i].label === TASK.status) cur = i;
      if (cur >= TK_STATUS.length - 1) { tkAdvancing = false; return; }
      var prevProg = TK_STATUS[cur].prog, nx = TK_STATUS[cur + 1];
      TASK.status = nx.label; TASK.progress = nx.prog;
      var badge = modal.querySelector(".tk-badge"); if (badge) badge.innerHTML = esc(TASK.status) + TK_CHEVRON;
      var fil = modal.querySelector(".tk-prog .fil"); if (fil) { fil.style.width = nx.prog + "%"; if (window.MM_MOTION) fil.animate([{ width: prevProg + "%" }, { width: nx.prog + "%" }], { duration: 600, easing: "cubic-bezier(.4,0,.2,1)" }); }
      var pct = modal.querySelector(".tk-prog .pct"); if (pct) pct.textContent = nx.prog + "%";
      if (window.MM_MOTION) window.MM_MOTION.statusFlip(badge);
      if (nx.label === "🎉 완료") { if (window.MM_MOTION) window.MM_MOTION.confetti(badge, { count: 12, scale: .6 }); if (window.MM_GAME) window.MM_GAME.complete(badge); tkAdvancing = false; return; }
      setTimeout(step, 640);
    })();
  }

  function closePanel(id) { document.getElementById(id).classList.remove("open"); maybeOverlay(); }
  function closeAll() {
    ["mmp-chat", "mmp-noti"].forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.remove("open"); });
    var cw = document.getElementById("mmp-chatwin"); if (cw) cw.classList.remove("on");
    var tk = document.getElementById("mmp-task"); if (tk) tk.classList.remove("on");
    document.getElementById("mmp-overlay").classList.remove("on");
  }
  function maybeOverlay() {
    var open = document.querySelector("#mmp-chatwin.on, #mmp-task.on");
    if (!open) document.getElementById("mmp-overlay").classList.remove("on");
  }
  function togglePanel(id) {
    var el = document.getElementById(id), other = id === "mmp-chat" ? "mmp-noti" : "mmp-chat";
    document.getElementById(other).classList.remove("open");
    el.classList.toggle("open");
  }
  function openPanel(id) {
    var other = id === "mmp-chat" ? "mmp-noti" : "mmp-chat";
    var o = document.getElementById(other); if (o) o.classList.remove("open");
    var el = document.getElementById(id); if (el && !el.classList.contains("open")) el.classList.add("open");
  }

  /* ---------- 상단 아이콘 연결 ---------- */
  function wireIcons() {
    var right = document.querySelector(".top .right");
    if (!right) return false;
    var bell = right.querySelector(".badge-n");
    // 채팅 버튼 주입 (종 앞)
    if (!right.querySelector(".mmp-chatbtn")) {
      var chatBtn = document.createElement("span");
      chatBtn.className = "mmp-iconbtn mmp-chatbtn";
      chatBtn.innerHTML = '<span class="mm-ic chat" style="font-size:21px;line-height:1;"></span>';
      chatBtn.style.cursor = "pointer";
      if (bell) right.insertBefore(chatBtn, bell); else right.appendChild(chatBtn);
      chatBtn.addEventListener("click", function (e) { e.stopPropagation(); togglePanel("mmp-chat"); });
    }
    if (bell && !bell.dataset.mmpWired) {
      bell.dataset.mmpWired = "1"; bell.style.cursor = "pointer";
      bell.addEventListener("click", function (e) { e.stopPropagation(); togglePanel("mmp-noti"); });
    }
    return true;
  }

  function boot() { syncChatFromContent(); build(); if (wireIcons()) return; var n = 0, t = setInterval(function () { if (wireIcons() || ++n > 30) clearInterval(t); }, 150); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.__MMP = { openTaskModal: openTaskModal, openChatWin: openChatWin };
  // 언어 전환 시 채팅/알림 패널 재생성(번역 반영)
  document.addEventListener('mm:lang', function () {
    try {
      var open = { chat: false, noti: false };
      var c = document.getElementById('mmp-chat'); if (c) { open.chat = c.classList.contains('open'); }
      var n = document.getElementById('mmp-noti'); if (n) { open.noti = n.classList.contains('open'); }
      ['mmp-chat', 'mmp-noti', 'mmp-chatwin', 'mmp-task', 'mmp-overlay', 'mmp-style'].forEach(function (id) { var el = document.getElementById(id); if (el) el.remove(); });
      syncChatFromContent();
      build();
      if (open.chat) { var c2 = document.getElementById('mmp-chat'); if (c2) c2.classList.add('open'); }
      if (open.noti) { var n2 = document.getElementById('mmp-noti'); if (n2) n2.classList.add('open'); }
    } catch (e) {}
  });
})();
