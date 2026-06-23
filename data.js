/* =========================================================================
   data.js — 데모 데이터 (한국어 / 제조)
   원칙: 화면에 보이는 모든 텍스트는 여기서만 정의한다. (요건 2: 100% 변수화)
   레이아웃/상호작용은 app.js·styles.css가 담당하고, 이 파일은 "내용"만 책임진다.
   산업/언어를 바꾸려면 이 파일만 교체하면 된다. (요건 5·17·19)
   ========================================================================= */
window.DEMO_DATA = {
  industry: "제조",
  language: "ko",

  brand: { product: "morningmate", tagline: "팀 협업의 모든 것" },

  /* UI 라벨 (언어 교체 지점) */
  ui: {
    create: "프로젝트 생성",
    nav: ["대시보드", "My 프로젝트", "공개 프로젝트"],
    collection: "컬렉션 뷰",
    collectionItems: ["전체 태스크", "간트차트", "캘린더", "라이브러리", "북마크", "멘션"],
    footer: ["자사 멤버 초대하기", "고객 지원"],
    tabs: ["피드", "태스크", "간트차트", "캘린더", "파일", "인사이트"],
    activeTab: "태스크",
    cols: { task: "태스크명", status: "상태", assignee: "담당자", due: "기한", progress: "진행률" },
    detail: { subtasks: "하위업무", insights: "인사이트", assignee: "담당자", due: "기한", priority: "우선순위", changeOwner: "담당자 변경", dueSuffix: "까지" },
    mobileNav: ["피드", "태스크", "캘린더", "알림", "더보기"]
  },

  /* 상태 팔레트: 라벨 → 색 (요건 17: 자유 추가/변경 가능) */
  statusPalette: {
    "요청": "#00B2FF",
    "진행": "#00B01C",
    "피드백": "#fd7900",
    "완료": "#6449FC",
    "보류": "#C7C7CC"
  },

  user: { name: "노소연", color: "#FFB89D" },

  projects: [
    {
      name: "[생산기술] 신제품 양산 준비",
      category: "[제조] 생산기술팀",
      members: 12,
      tasks: [
        {
          title: "시생산 품질검사",
          category: "[품질] QA 검증",
          status: "진행",
          owner: { name: "김우주", color: "#FFB89D" },
          assignees: [
            { name: "김우주", color: "#FFB89D" },
            { name: "박선아", color: "#9DC8FF" }
          ],
          due: "2026-06-20", dueDay: "(토)",
          priority: "높음",
          subtasks: [
            { title: "입고 자재 수입검사", status: "완료", date: "2026-06-10", day: "(수)", assignee: { color: "#FFB89D" }, count: "+3" },
            { title: "초도품 치수 측정(CTQ)", status: "완료", date: "2026-06-12", day: "(금)", assignee: { color: "#9DC8FF" }, count: "+2" },
            { title: "라인 시운전 불량률 집계", status: "진행", date: "2026-06-16", day: "(화)", assignee: { color: "#A8E6C0" }, count: "+5" },
            { title: "공정능력지수(Cpk) 산출", status: "요청", date: "2026-06-18", day: "(목)", assignee: { color: "#FFD4A8" }, count: "+1" },
            { title: "고객 승인용 검사성적서 작성", status: "요청", date: "2026-06-19", day: "(금)", assignee: { color: "#E0B0FF" }, count: "+4" },
            { title: "양산 이관 체크리스트 점검", status: "보류", date: "2026-06-20", day: "(토)", assignee: { color: "#FFB0B0" }, count: "+2" }
          ],
          chart: { done: 2, progress: 1, pending: 3 }
        },
        {
          title: "금형 제작 발주",
          category: "[설비] 금형",
          status: "완료",
          owner: { name: "정해성", color: "#A8E6C0" },
          assignees: [{ name: "정해성", color: "#A8E6C0" }],
          due: "2026-05-28", dueDay: "(목)",
          priority: "보통",
          subtasks: [
            { title: "사양 검토 및 견적 비교", status: "완료", date: "2026-05-10", day: "(일)", assignee: { color: "#A8E6C0" }, count: "+2" },
            { title: "발주 및 계약 체결", status: "완료", date: "2026-05-20", day: "(수)", assignee: { color: "#FFD4A8" }, count: "+1" }
          ],
          chart: { done: 2, progress: 0, pending: 0 }
        },
        {
          title: "설비 셋업 및 시운전",
          category: "[설비] 라인",
          status: "진행",
          owner: { name: "박선아", color: "#9DC8FF" },
          assignees: [
            { name: "박선아", color: "#9DC8FF" },
            { name: "정해성", color: "#A8E6C0" }
          ],
          due: "2026-06-25", dueDay: "(목)",
          priority: "높음",
          subtasks: [
            { title: "설비 반입 및 배치", status: "완료", date: "2026-06-08", day: "(월)", assignee: { color: "#9DC8FF" }, count: "+3" },
            { title: "유틸리티 연결(전기/에어)", status: "진행", date: "2026-06-15", day: "(월)", assignee: { color: "#A8E6C0" }, count: "+2" },
            { title: "안전 인터록 점검", status: "요청", date: "2026-06-22", day: "(월)", assignee: { color: "#FFB0B0" }, count: "+1" }
          ],
          chart: { done: 1, progress: 1, pending: 1 }
        },
        {
          title: "자재 소요량(BOM) 확정",
          category: "[구매] 자재",
          status: "요청",
          owner: { name: "한지민", color: "#FFD4A8" },
          assignees: [{ name: "한지민", color: "#FFD4A8" }],
          due: "2026-06-13", dueDay: "(토)",
          priority: "보통",
          subtasks: [
            { title: "부품별 단가 협의", status: "진행", date: "2026-06-11", day: "(목)", assignee: { color: "#FFD4A8" }, count: "+2" },
            { title: "발주 리드타임 확인", status: "요청", date: "2026-06-13", day: "(토)", assignee: { color: "#9DC8FF" }, count: "+1" }
          ],
          chart: { done: 0, progress: 1, pending: 1 }
        },
        {
          title: "양산 일정 확정 및 공유",
          category: "[생산관리] PSI",
          status: "보류",
          owner: { name: "노소연", color: "#FFB89D" },
          assignees: [{ name: "노소연", color: "#FFB89D" }],
          due: "2026-06-30", dueDay: "(화)",
          priority: "낮음",
          subtasks: [
            { title: "라인 캐파 시뮬레이션", status: "보류", date: "2026-06-28", day: "(일)", assignee: { color: "#FFB89D" }, count: "+1" }
          ],
          chart: { done: 0, progress: 0, pending: 1 }
        }
      ]
    }
  ],

  /* 영상 시나리오 = 화면 시퀀스 (요건 20). app.js가 한 스텝씩 재생한다. */
  scenario: [
    "table",
    "detail.click(시생산 품질검사)",
    "detail.status→완료",
    "detail.chart",
    "table",
    "cta"
  ],

  /* 시퀀스와 1:1로 매칭되는 나레이션 자막 (요건 4) */
  narration: [
    "제조 현장의 모든 업무를 한 화면에서 봅니다.",
    "검사 업무를 열어 진행 상황을 확인합니다.",
    "상태를 '완료'로 바꾸면 팀 전체에 즉시 공유됩니다.",
    "인사이트로 프로젝트 진척이 한눈에 보입니다.",
    "업무 누락 없이, 다음 공정으로 매끄럽게.",
    "morningmate로 제조 현장의 협업을 시작하세요."
  ],

  /* CTA 전환 장치 (요건 16) */
  cta: {
    head: "제조 현장의 업무, 누락 없이",
    sub: "morningmate를 무료로 체험해 보세요",
    button: "무료로 시작하기",
    url: "https://morningmate.com/signup"
  }
};
