export type Quadrant = "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT";

export type AssignmentStatus = "ASSIGNED" | "DRAWING" | "SUBMITTED";

export interface DrawingAssignment {
  id: string;
  userId: string;
  /** 이 아이가 속한 주간 공동 캔버스 id (WeeklyCanvas.id). */
  roomId: string;
  themeId: string;
  quadrant: Quadrant;
  status: AssignmentStatus;
  assignedAt: string;
}

/**
 * 사분면 배정을 다루는 저장소 인터페이스. 지금은 lib/utils/random-assignment.ts가
 * localStorage 기반으로 구현하지만, 나중에 서버 API로 교체할 때 이 모양만 맞추면 된다.
 */
export interface AssignmentRepository {
  getAssignment(participantId: string, themeId: string): Promise<DrawingAssignment | null>;
  assignRandomQuadrant(participantId: string, themeId: string): Promise<DrawingAssignment>;
}
