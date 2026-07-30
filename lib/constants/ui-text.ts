/**
 * 화면에 보이는 모든 한글 문구를 한 곳에 모아둔다. 문구 수정은 이 파일만 고치면 된다.
 *
 * 안전 원칙: 순위·경쟁·마감 압박 표현을 쓰지 않는다.
 * "친구 기다리는 중", "1/4 완료", "먼저 골랐어요", "네가 마지막이에요" 같은 문구는 넣지 않는다.
 * 케어햄 스케치북은 비동기 공동 작품이라, 누가 언제 접속했는지·몇 명이 남았는지를 보여주지 않는다.
 */
export const UI_TEXT = {
  common: {
    serviceName: "케어햄 스케치북",
    back: "뒤로 가기",
    help: "도움말",
    loading: "잠시만 기다려 주세요",
    confirmYes: "네",
    confirmNo: "아니요",
    orientationTitle: "태블릿을 옆으로 돌려주세요",
    orientationBody: "이 화면은 눕혀서 봐야 더 예뻐요!",
    logout: "로그아웃",
    logoutConfirmTitle: "로그아웃 할까요?",
    logoutConfirmBody: "다음에 들어올 때 팔찌 번호를 다시 눌러야 해요.",
  },
  login: {
    title: "팔찌에 적힌 번호를 눌러주세요",
    subtitle: "숫자 6개를 눌러 주세요",
    clear: "지우기",
    clearAll: "모두 지우기",
    submit: "시작하기",
    softError: "번호를 한 번 더 확인해 주세요.",
    checking: "확인하고 있어요...",
  },
  weeklyTheme: {
    eyebrow: "이번 주의 주제",
    footerNote: "우리 함께 하나의 그림을 만들어가요!",
    skip: "건너뛰기",
  },
  assignment: {
    heading: "이번 그림에서 네가 맡은 곳이야!",
    subtitle: "내가 색칠할 부분을 노란 테두리로 표시했어요",
    cta: "색칠하러 가기",
  },
  drawing: {
    themeLabel: "이번 주 주제: 나무",
    collabNote: "다른 친구들의 색깔도 함께 모이고 있어요.",
    tools: "도구",
    colors: "색깔",
    brushSize: "굵기",
    undo: "되돌리기",
    redo: "다시하기",
    clearAll: "전체 지우기",
    preview: "미리보기",
    done: "다 그렸어요!",
    clearConfirmTitle: "그림을 모두 지울까요?",
    clearConfirmBody: "지금까지 칠한 색이 모두 사라져요.",
    autoSaving: "저장하고 있어요...",
    autoSaved: "저장 완료!",
    saveFailed: "저장하지 못했어요. 다시 시도할게요.",
    leaveConfirmTitle: "그림을 두고 나갈까요?",
    leaveConfirmBody: "지금까지 그린 그림은 저장돼요.",
  },
  brushSizes: {
    SMALL: "작게",
    MEDIUM: "보통",
    LARGE: "크게",
  },
  preview: {
    heading: "내 그림이 여기에 들어가요!",
    keepDrawing: "조금 더 그릴래요",
    sendIt: "이대로 보낼래요",
    sendFailed: "지금은 보낼 수 없어요. 한 번만 더 눌러 주세요.",
  },
  submit: {
    cta: "우리 그림 보러 가기",
  },
  sharedCanvas: {
    heading: "우리 그림에 모인 색깔",
    intro1: "내 색깔이 우리 그림에 들어갔어요.",
    intro2: "다른 친구들의 색깔도 하나씩 더해지고 있어요.",
    viewFull: "우리 그림 보기",
    home: "홈으로 가기",
    viewMine: "내 그림 다시 보기",
  },
  result: {
    heading: "우리 그림이 더 알록달록해졌어요.",
    participants: "함께한 화가",
    hospital: "병원",
    date: "오늘 날짜",
    theme: "이번 주 주제",
    viewLarge: "우리 그림 크게 보기",
    gallery: "작품 보관함",
    nextWeek: "다음 주에 또 만나요!",
  },
  gallery: {
    heading: "작품 보관함",
    empty: "아직 모인 작품이 없어요",
    backHome: "처음으로",
  },
  home: {
    greeting: "케어햄 스케치북에 다시 왔구나!",
    subtitle: "오늘은 뭐 할까?",
    startWeeklyCta: "이번 주 그림 색칠하기",
    continueCta: "색칠 이어하기",
    viewSharedCta: "우리 그림 보기",
    galleryCta: "작품 보관함",
  },
  seeds: {
    jarLabel: "해바라씨 항아리",
    gained: "해바라씨가 항아리에 쏙 들어갔어요!",
  },
} as const;
