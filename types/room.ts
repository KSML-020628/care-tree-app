import type { Quadrant } from "./assignment";

export type ParticipantStatus = "WAITING" | "DRAWING" | "SUBMITTED";

export interface RoomParticipant {
  userId: string;
  nickname: string;
  avatar: string;
  quadrant: Quadrant;
  status: ParticipantStatus;
  thumbnail?: string;
}

export type RoomStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED";

export interface CollaborationRoom {
  id: string;
  hospitalId: string;
  themeId: string;
  participants: RoomParticipant[];
  status: RoomStatus;
}
