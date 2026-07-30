/** 해바라씨 보상 수치. 화면에는 숫자를 직접 강조하지 않고 항아리 게이지로만 보여준다. */
export const SEED_AMOUNTS = {
  ZONE_SUBMITTED: 5,
  WEEKLY_PUBLISHED: 3,
} as const;

export type SeedEvent = keyof typeof SEED_AMOUNTS;

/** 항아리 게이지가 차오르는 기준점(다음 케어햄 실루엣이 나타나는 지점). 순위나 비교에는 쓰지 않는다. */
export const SEED_MILESTONES: readonly number[] = [10, 25, 50, 100];
