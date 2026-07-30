import { THEME_IMAGES } from "@/lib/constants/images";
import type { WeeklyTheme } from "@/types/theme";

/** 이번 주 활성화된 주제. 다음 주제를 추가할 때 이 배열에 항목을 더하고 상태만 바꾸면 된다. */
export const WEEKLY_THEMES: readonly WeeklyTheme[] = [
  {
    id: "theme-tree-001",
    title: "나무",
    description: "사과가 열린 큰 나무를 친구들과 함께 색칠해요.",
    fullImagePath: THEME_IMAGES.tree.full,
    startsAt: "2026-07-27T00:00:00+09:00",
    endsAt: "2026-08-02T23:59:59+09:00",
    status: "ACTIVE",
  },
];

export function getActiveTheme(): WeeklyTheme {
  const active = WEEKLY_THEMES.find((theme) => theme.status === "ACTIVE");
  return active ?? WEEKLY_THEMES[0];
}
