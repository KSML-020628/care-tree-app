import type { Quadrant } from "./assignment";

/**
 * 이 파일은 원래 "게임방" 개념(RoomStatus: WAITING/IN_PROGRESS/COMPLETED)을 쓰던 자리다.
 * 케어햄 스케치북은 실시간 대기·경쟁이 없는 비동기 공동 작품이므로,
 * "완성/미완성"이 아니라 "공개 상태"와 "기여 상태"만 다룬다.
 */

/** 주간 공동 캔버스의 공개 상태. 만들어지는 순간 이미 ACTIVE이며, "미완성" 상태는 없다. */
export type WeeklyCanvasStatus = "ACTIVE" | "PUBLISHED" | "ARCHIVED";

export interface WeeklyCanvas {
  id: string;
  hospitalId: string;
  themeId: string;
  status: WeeklyCanvasStatus;
  createdAt: string;
}

/** 한 사분면 기여물의 상태. DRAFT=아직 안 그림/색칠 중, SHARED=공동 그림에 반영됨, HIDDEN=운영자가 숨김. */
export type ContributionStatus = "DRAFT" | "SHARED" | "HIDDEN";

export interface DrawingContribution {
  id: string;
  weeklyCanvasId: string;
  participantId: string;
  nickname: string;
  avatar: string;
  quadrant: Quadrant;
  status: ContributionStatus;
  imageDataUrl?: string;
  thumbnail?: string;
  /** 실제 참여자가 아니라 미리 준비된 케어햄 색칠본인지 표시한다(화면에는 노출하지 않음). */
  isPlaceholder?: boolean;
  sharedAt?: string;
}
