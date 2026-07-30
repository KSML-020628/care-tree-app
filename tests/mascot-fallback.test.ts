import { describe, expect, it } from "vitest";
import { CARE_HAM_CONFIG, DEFAULT_MASCOT_IMAGE, MVP_ACTIVE_CARE_HAMS } from "@/lib/mascot/mascot-config";

describe("케어햄 fallback 구조", () => {
  it("10종 모두 이미지 경로와 이모지 fallback을 갖고 있다", () => {
    const types = Object.keys(CARE_HAM_CONFIG);
    expect(types.length).toBe(10);
    for (const config of Object.values(CARE_HAM_CONFIG)) {
      expect(config.imagePath).toMatch(/^\/images\/mascots\/.+\.webp$/);
      expect(config.emojiFallback.length).toBeGreaterThan(0);
    }
  });

  it("공용 default-ham 경로가 정의되어 있다(이미지가 없어도 항상 대체 가능)", () => {
    expect(DEFAULT_MASCOT_IMAGE).toBe("/images/mascots/default-ham.webp");
  });

  it("MVP에서 실제로 쓰는 4종은 GUIDE/COURAGE/SMILE/TOGETHER다", () => {
    expect([...MVP_ACTIVE_CARE_HAMS].sort()).toEqual(["COURAGE", "GUIDE", "SMILE", "TOGETHER"].sort());
  });
});
