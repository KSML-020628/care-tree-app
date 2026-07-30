import { describe, expect, it } from "vitest";
import { UI_TEXT } from "@/lib/constants/ui-text";

function flattenStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
  } else if (typeof value === "function") {
    // footerCount(count) 같은 문구 생성 함수는 대표 값으로 한 번 호출해서 검사한다.
    try {
      const sample = (value as (...args: unknown[]) => unknown)(1, "테스트");
      if (typeof sample === "string") out.push(sample);
    } catch {
      // 인자 형태가 달라 호출이 안 되면 무시한다.
    }
  } else if (value && typeof value === "object") {
    for (const entry of Object.values(value)) flattenStrings(entry, out);
  }
  return out;
}

const BANNED_UI_PHRASES = [
  "친구 기다리는 중",
  "친구들을 기다리고 있어요",
  "기다리는 중",
  "1/4",
  "2/4",
  "3/4",
  "남은 자리",
  "먼저 골랐",
  "늦었어요",
  "다른 친구가 기다려요",
  "아직 안 그린 친구",
  "모두 끝내야",
  "완성까지 몇 명",
  "네가 마지막이에요",
  "순위",
  "랭킹",
  "점수",
];

describe("화면 문구 안전성 (v0.2 원칙)", () => {
  const allStrings = flattenStrings(UI_TEXT);

  it.each(BANNED_UI_PHRASES)('화면 문구 어디에도 금지 표현 "%s"가 없다', (phrase) => {
    const offending = allStrings.filter((text) => text.includes(phrase));
    expect(offending).toEqual([]);
  });
});
