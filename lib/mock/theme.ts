import { getActiveTheme } from "@/lib/config/themes";
import type { WeeklyTheme } from "@/types/theme";

/**
 * 이번 주 주제를 가져온다. 지금은 config에 있는 값을 그대로 돌려주지만,
 * 나중에는 이 함수 내부만 Supabase 조회로 바꾸면 나머지 화면은 그대로 동작한다.
 */
export async function fetchActiveTheme(): Promise<WeeklyTheme> {
  return getActiveTheme();
}
