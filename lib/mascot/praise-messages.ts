/**
 * 케어햄이 아이에게 보여주는 칭찬은 전부 여기 미리 검수된 문장 풀에서만 고른다.
 * AI가 자유롭게 새 문장을 만들어 아이에게 직접 말하지 않는다 (AI는 이 중 어느 "카테고리"를
 * 고를지만 고른다 — lib/ai/artwork-analysis.types.ts의 PraiseCategory 참고).
 *
 * 결과를 평가하지 않고, 아이가 고른 색과 참여 자체를 구체적으로 인정하는 문장만 둔다.
 */
export const PRAISE_MESSAGES = {
  SUBMISSION: [
    "네 색깔이 우리 그림에 더해졌어!",
    "우리 그림이 더 알록달록해졌어!",
    "네가 고른 색이 작품에 들어갔어!",
    "세상에 하나뿐인 색깔이 생겼어!",
  ],
  COLORFUL: ["여러 색깔이 함께 어울리고 있어!", "알록달록한 색이 반짝이고 있어!"],
  WARM_COLOR: ["따뜻한 색깔이 작품에 더해졌어!"],
  COOL_COLOR: ["시원한 색깔이 작품에 더해졌어!"],
  WEEKLY_REVEAL: ["친구들의 색깔이 모여 멋진 작품이 되었어!", "우리 모두 함께 만든 그림이야!"],
  SEED_REWARD: ["해바라씨가 항아리에 쏙 들어갔어!", "새로운 씨앗이 생겼어!"],
} as const;

export type PraiseCategory = keyof typeof PRAISE_MESSAGES;

/**
 * 절대 아이에게 보여주면 안 되는 표현. AI caption을 포함해 어떤 문장이든 이 목록에
 * 걸리면 화면에 쓰지 않고 기본(fallback) 문장으로 대체한다.
 */
export const BANNED_PRAISE_PHRASES: readonly string[] = [
  "최고야",
  "가장 잘 그렸어",
  "제일 잘",
  "완벽해",
  "친구보다 잘",
  "친구보다 못",
  "착한 아이야",
  "끝까지 해야",
  "네가 안 했으면",
  "네가 안했으면",
  "용감한 아이는 울지 않아",
  "1등",
  "꼴찌",
  "순위",
  "점수",
  "랭킹",
];

/** 주어진 문장에 금지 표현이 들어있는지 확인한다. AI caption 검증 등에 쓴다. */
export function containsBannedPhrase(text: string): boolean {
  return BANNED_PRAISE_PHRASES.some((phrase) => text.includes(phrase));
}

/** 카테고리 안에서 문장 하나를 무작위로 고른다. 항상 사전 검수된 문장 풀 안에서만 고른다. */
export function getRandomPraise(category: PraiseCategory): string {
  const pool = PRAISE_MESSAGES[category];
  return pool[Math.floor(Math.random() * pool.length)];
}
