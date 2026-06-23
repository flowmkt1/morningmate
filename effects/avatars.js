/* 프로필 사진 중앙 매핑 — 이름(성별)에 맞는 3D 프로필 이미지 배분 */
(function () {
  var BASE = "assets/profile/";
  // man4 는 '내 마우스에 달린 담당자(커서 아바타)' 전용으로 예약
  var MAN = ["man1.png", "man2.png", "man3.png", "man5.png", "man6.png"];
  var WOMAN = ["woman1.png", "woman2.png", "woman3.png", "woman4.png"];
  var CURSOR = BASE + "man4.png";

  // 자주 등장하는 인물은 사진 고정(성별 정확히 반영)
  var MAP = {
    // 여성
    "노소연": "woman1.png", "Soyun Noh": "woman1.png",
    "SANO HARUKA": "woman2.png",
    "장아람": "woman3.png",
    "Hyejo Seo": "woman4.png", "서혜조": "woman4.png", "혜조": "woman4.png",
    "박선아": "woman1.png",
    "한지민": "woman2.png",
    "Kate Lee": "woman3.png",
    "Jessica Baek": "woman1.png", "Jessica": "woman1.png",
    "김채영": "woman2.png",
    "Ashley": "woman3.png",
    "Sooyoung Oh": "woman4.png", "Sooyoung": "woman4.png",
    // 남성
    "June Lee": "man6.png",
    "Kimura Takuya": "man3.png",
    "WOOJUNG KIM": "man1.png",
    "유성균": "man2.png",
    "정해성": "man5.png",
    "신원준": "man1.png"
  };
  // fallback 성별 추정(매핑에 없는 이름용)
  var FEMALE = /(Soyun|Sano|Haruka|Hyejo|Kate|Jessica|Ashley|Sooyoung|소연|혜조|아람|선아|지민|채영|수영|혜|연|아|영|은|희|숙)/i;

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function fileFor(name) {
    if (!name) return MAN[0];
    name = ("" + name).trim();
    if (MAP[name]) return MAP[name];
    // 부분일치("Hyejo Seo's comment", "Jessica Baek, WOOJUNG..." 등)
    for (var k in MAP) { if (MAP.hasOwnProperty(k) && name.indexOf(k) === 0) return MAP[k]; }
    for (var k2 in MAP) { if (MAP.hasOwnProperty(k2) && name.indexOf(k2) >= 0) return MAP[k2]; }
    var pool = FEMALE.test(name) ? WOMAN : MAN;
    return pool[hash(name) % pool.length];
  }

  // 각 3D 프로필의 배경색(커서 화살표 색으로 사용)
  var BG = {
    "man1.png": "#F2C94C", "man2.png": "#F2C94C", "man3.png": "#F0512D", "man4.png": "#F0512D",
    "man5.png": "#36B46B", "man6.png": "#3E7BE8",
    "woman1.png": "#D84BD8", "woman2.png": "#2E78E0", "woman3.png": "#F2A93B", "woman4.png": "#8E16C6"
  };
  window.MM_AV = {
    cursor: CURSOR,
    base: BASE,
    photo: function (name) { return BASE + fileFor(name); },
    bgColor: function (s) { var m = ("" + s).match(/(man\d|woman\d)\.png/); return (m && BG[m[0]]) || "#6449FC"; },
    randomMan: function () { return BASE + MAN[Math.floor(Math.random() * MAN.length)]; },
    randomWoman: function () { return BASE + WOMAN[Math.floor(Math.random() * WOMAN.length)]; },
    randomAny: function () { var p = MAN.concat(WOMAN); return BASE + p[Math.floor(Math.random() * p.length)]; }
  };
})();
