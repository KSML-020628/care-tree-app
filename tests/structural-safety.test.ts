import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readSource(relativePath: string): string {
  return readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");
}

describe("모션·화면 안전 장치", () => {
  it("전역 CSS에 reduced-motion 규칙이 있다", () => {
    const css = readSource("app/globals.css");
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
  });

  it("TabletShell은 세로 모드에서 화면 회전 안내를 보여준다", () => {
    const source = readSource("components/common/TabletShell.tsx");
    expect(source).toMatch(/landscape:flex/);
    expect(source).toMatch(/landscape:hidden/);
    expect(source).toMatch(/orientationTitle/);
  });
});

describe("작품 점수·순위 필드가 코드에 존재하지 않는다", () => {
  const forbiddenIdentifiers = [/\bscore\b/i, /\brank(ing)?\b/i, /\bleaderboard\b/i];
  const filesToCheck = [
    "types/room.ts",
    "types/assignment.ts",
    "lib/rewards/seed-config.ts",
    "lib/rewards/seed-ledger.ts",
  ];

  it.each(filesToCheck)("%s 안에 점수/순위 관련 식별자가 없다", (relativePath) => {
    const source = readSource(relativePath);
    for (const pattern of forbiddenIdentifiers) {
      expect(source).not.toMatch(pattern);
    }
  });
});

describe("OpenAI API 키는 서버 전용이다", () => {
  it('클라이언트 컴포넌트("use client")는 OPENAI_API_KEY를 직접 참조하지 않는다', () => {
    const clientFile = readSource("app/preview/[assignmentId]/page.tsx");
    expect(clientFile).toContain('"use client"');
    expect(clientFile).not.toContain("OPENAI_API_KEY");
  });

  it("OpenAI 클라이언트 모듈은 server-only로 보호되어 있다", () => {
    const source = readSource("lib/ai/artwork-analysis.client.ts");
    expect(source.trim().startsWith('import "server-only"')).toBe(true);
  });

  it(".env.example에는 NEXT_PUBLIC_OPENAI_API_KEY 형태가 없다", () => {
    const envExample = readSource(".env.example");
    expect(envExample).not.toMatch(/NEXT_PUBLIC_OPENAI_API_KEY/);
    expect(envExample).toMatch(/^OPENAI_API_KEY=/m);
  });
});
