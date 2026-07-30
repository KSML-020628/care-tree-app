import { describe, expect, it } from "vitest";
import { FULL_IMAGE_SIZE, QUADRANT_RECTS, QUADRANT_SIZE } from "@/lib/config/quadrants";

describe("사분면 합성 좌표 (AI가 건드릴 수 없는 deterministic 값)", () => {
  it("전체 캔버스는 1024x1024, 조각은 512x512다", () => {
    expect(FULL_IMAGE_SIZE).toBe(1024);
    expect(QUADRANT_SIZE).toBe(512);
  });

  it("좌표가 요구사항과 정확히 일치한다", () => {
    expect(QUADRANT_RECTS.TOP_LEFT).toEqual({ x: 0, y: 0, width: 512, height: 512 });
    expect(QUADRANT_RECTS.TOP_RIGHT).toEqual({ x: 512, y: 0, width: 512, height: 512 });
    expect(QUADRANT_RECTS.BOTTOM_LEFT).toEqual({ x: 0, y: 512, width: 512, height: 512 });
    expect(QUADRANT_RECTS.BOTTOM_RIGHT).toEqual({ x: 512, y: 512, width: 512, height: 512 });
  });
});
