import type { Quadrant } from "@/types/assignment";

export const QUADRANTS: readonly Quadrant[] = [
  "TOP_LEFT",
  "TOP_RIGHT",
  "BOTTOM_LEFT",
  "BOTTOM_RIGHT",
] as const;

export interface QuadrantRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 전체 원본 도안의 한 변 크기. 모든 사분면 좌표는 이 값을 기준으로 계산한다. */
export const FULL_IMAGE_SIZE = 1024;

/** 한 아이가 색칠하는 정사각형 조각의 크기. */
export const QUADRANT_SIZE = FULL_IMAGE_SIZE / 2;

/**
 * 사분면별로 원본 도안에서 잘라낼 좌표. 4개 조각이 항상 같은 원본 좌표계를 기준으로
 * 계산되므로, 나중에 다시 합칠 때 이가 맞지 않는(seam) 문제가 생기지 않는다.
 */
export const QUADRANT_RECTS: Record<Quadrant, QuadrantRect> = {
  TOP_LEFT: { x: 0, y: 0, width: QUADRANT_SIZE, height: QUADRANT_SIZE },
  TOP_RIGHT: { x: QUADRANT_SIZE, y: 0, width: QUADRANT_SIZE, height: QUADRANT_SIZE },
  BOTTOM_LEFT: { x: 0, y: QUADRANT_SIZE, width: QUADRANT_SIZE, height: QUADRANT_SIZE },
  BOTTOM_RIGHT: { x: QUADRANT_SIZE, y: QUADRANT_SIZE, width: QUADRANT_SIZE, height: QUADRANT_SIZE },
};

/** 배정 화면 등에서 2x2 그리드를 그릴 때 쓰는 순서. */
export const QUADRANT_GRID_ORDER: readonly Quadrant[] = [
  "TOP_LEFT",
  "TOP_RIGHT",
  "BOTTOM_LEFT",
  "BOTTOM_RIGHT",
] as const;

export interface QuadrantPercentRect {
  top: string;
  left: string;
  width: string;
  height: string;
}

/** 사분면 좌표를 전체 이미지 위에 겹쳐 그릴 때 쓰는 퍼센트 좌표로 바꾼다. */
export function getQuadrantPercentRect(quadrant: Quadrant): QuadrantPercentRect {
  const rect = QUADRANT_RECTS[quadrant];
  return {
    top: `${(rect.y / FULL_IMAGE_SIZE) * 100}%`,
    left: `${(rect.x / FULL_IMAGE_SIZE) * 100}%`,
    width: `${(rect.width / FULL_IMAGE_SIZE) * 100}%`,
    height: `${(rect.height / FULL_IMAGE_SIZE) * 100}%`,
  };
}

/**
 * 사분면의 사람이 읽을 수 있는 위치 설명. AI 분석 요청에 넣는 zoneLabel은 항상 이 표에서만
 * 가져오고 클라이언트가 보낸 자유 텍스트를 그대로 쓰지 않는다(프롬프트 주입 방지).
 */
export const QUADRANT_ZONE_LABELS: Record<Quadrant, string> = {
  TOP_LEFT: "그림 왼쪽 위",
  TOP_RIGHT: "그림 오른쪽 위",
  BOTTOM_LEFT: "그림 왼쪽 아래",
  BOTTOM_RIGHT: "그림 오른쪽 아래",
};
