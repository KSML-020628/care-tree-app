import { QUADRANTS } from "@/lib/config/quadrants";
import { createFlatTintDataUrl } from "@/lib/drawing/quadrant-crop";
import { MOCK_FRIEND_USERS } from "@/lib/mock/users";
import { saveSubmission } from "@/lib/mock/submissions";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";
import type { DrawingAssignment, Quadrant } from "@/types/assignment";
import type { CollaborationRoom, ParticipantStatus, RoomParticipant } from "@/types/room";
import type { ChildUser } from "@/types/user";

interface StoredRoom extends CollaborationRoom {
  createdAt: string;
}

/** mock 친구가 "색칠 중"으로 바뀌기까지 걸리는 시간(ms). */
const FRIEND_START_DELAY_MS = 1200;

/** mock 친구 3명이 각각 색칠을 마치는 시간(ms). 실제로는 Supabase Realtime 구독으로 대체한다. */
const FRIEND_COMPLETE_DELAYS_MS = [5000, 10000, 15000];

const FRIEND_TINT_COLORS = ["#FFE1A8", "#C9E7FF", "#D9F2D0"];

export function buildRoomId(themeId: string): string {
  return `room-${themeId}`;
}

/** 방이 없으면 실제 아이 1명 + mock 친구 3명으로 새로 만들고, 있으면 실제 아이 정보만 최신화한다. */
export function getOrCreateRoom(
  currentUser: ChildUser,
  assignment: DrawingAssignment,
): CollaborationRoom {
  const existing = readJson<StoredRoom>(STORAGE_KEYS.room(assignment.roomId));
  if (existing) {
    const merged = mergeCurrentUserIntoRoom(existing, currentUser, assignment);
    persistRoom(merged);
    return stripInternalFields(merged);
  }

  const takenQuadrants = new Set<Quadrant>([assignment.quadrant]);
  const friendParticipants: RoomParticipant[] = MOCK_FRIEND_USERS.map((friend) => {
    const nextQuadrant = QUADRANTS.find((quadrant) => !takenQuadrants.has(quadrant)) ?? assignment.quadrant;
    takenQuadrants.add(nextQuadrant);
    return {
      userId: friend.id,
      nickname: friend.nickname,
      avatar: friend.avatar,
      quadrant: nextQuadrant,
      status: "WAITING",
    };
  });

  const room: StoredRoom = {
    id: assignment.roomId,
    hospitalId: currentUser.hospitalId,
    themeId: assignment.themeId,
    status: "IN_PROGRESS",
    participants: [
      {
        userId: currentUser.id,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
        quadrant: assignment.quadrant,
        status: statusFromAssignment(assignment.status),
      },
      ...friendParticipants,
    ],
    createdAt: new Date().toISOString(),
  };
  persistRoom(room);
  return stripInternalFields(room);
}

export function readRoom(roomId: string): CollaborationRoom | null {
  const stored = readJson<StoredRoom>(STORAGE_KEYS.room(roomId));
  return stored ? stripInternalFields(stored) : null;
}

export function updateParticipantStatus(
  roomId: string,
  userId: string,
  status: ParticipantStatus,
  thumbnail?: string,
): CollaborationRoom | null {
  const stored = readJson<StoredRoom>(STORAGE_KEYS.room(roomId));
  if (!stored) return null;
  const nextParticipants = stored.participants.map((participant) =>
    participant.userId === userId
      ? { ...participant, status, thumbnail: thumbnail ?? participant.thumbnail }
      : participant,
  );
  const allSubmitted = nextParticipants.every((participant) => participant.status === "SUBMITTED");
  const updated: StoredRoom = {
    ...stored,
    participants: nextParticipants,
    status: allSubmitted ? "COMPLETED" : "IN_PROGRESS",
  };
  persistRoom(updated);
  return stripInternalFields(updated);
}

/**
 * mock 친구 3명을 순서대로 "색칠 중" -> "색칠 완료"로 바꾼다. 이미 완료된 친구는 다시 타이머를 걸지 않는다.
 * 반환하는 정리 함수로 타이머를 취소할 수 있다(페이지 이탈 시 사용).
 */
export function startMockFriendProgress(
  roomId: string,
  onChange: (room: CollaborationRoom) => void,
): () => void {
  const stored = readJson<StoredRoom>(STORAGE_KEYS.room(roomId));
  if (!stored) return () => {};

  const elapsedMs = Date.now() - new Date(stored.createdAt).getTime();
  const timers: ReturnType<typeof setTimeout>[] = [];

  const friendParticipants = stored.participants.filter((participant) =>
    MOCK_FRIEND_USERS.some((friend) => friend.id === participant.userId),
  );

  friendParticipants.forEach((participant, index) => {
    if (participant.status === "SUBMITTED") return;

    const startAt = FRIEND_START_DELAY_MS;
    const completeAt = FRIEND_COMPLETE_DELAYS_MS[index] ?? FRIEND_COMPLETE_DELAYS_MS[FRIEND_COMPLETE_DELAYS_MS.length - 1];

    const startDelay = Math.max(0, startAt - elapsedMs);
    const completeDelay = Math.max(startDelay + 200, completeAt - elapsedMs);

    if (participant.status === "WAITING") {
      timers.push(
        setTimeout(() => {
          const next = updateParticipantStatus(roomId, participant.userId, "DRAWING");
          if (next) onChange(next);
        }, startDelay),
      );
    }

    timers.push(
      setTimeout(() => {
        const tintColor = FRIEND_TINT_COLORS[index % FRIEND_TINT_COLORS.length];
        const thumbnail = createFriendThumbnail(tintColor);
        saveSubmission(roomId, {
          id: `submission-${participant.userId}`,
          assignmentId: `assignment-${participant.userId}-${stored.themeId}`,
          userId: participant.userId,
          quadrant: participant.quadrant,
          imageDataUrl: createFlatTintDataUrl(tintColor, 0.4),
          submittedAt: new Date().toISOString(),
        });
        const next = updateParticipantStatus(roomId, participant.userId, "SUBMITTED", thumbnail);
        if (next) onChange(next);
      }, completeDelay),
    );
  });

  return () => timers.forEach((timer) => clearTimeout(timer));
}

function statusFromAssignment(status: DrawingAssignment["status"]): ParticipantStatus {
  if (status === "SUBMITTED") return "SUBMITTED";
  if (status === "DRAWING") return "DRAWING";
  return "WAITING";
}

function mergeCurrentUserIntoRoom(
  room: StoredRoom,
  currentUser: ChildUser,
  assignment: DrawingAssignment,
): StoredRoom {
  const hasCurrentUser = room.participants.some((participant) => participant.userId === currentUser.id);
  const participants = hasCurrentUser
    ? room.participants.map((participant) =>
        participant.userId === currentUser.id
          ? { ...participant, status: statusFromAssignment(assignment.status) }
          : participant,
      )
    : [
        ...room.participants,
        {
          userId: currentUser.id,
          nickname: currentUser.nickname,
          avatar: currentUser.avatar,
          quadrant: assignment.quadrant,
          status: statusFromAssignment(assignment.status),
        },
      ];
  return { ...room, participants };
}

function persistRoom(room: StoredRoom): void {
  writeJson(STORAGE_KEYS.room(room.id), room);
}

function stripInternalFields(room: StoredRoom): CollaborationRoom {
  return {
    id: room.id,
    hospitalId: room.hospitalId,
    themeId: room.themeId,
    participants: room.participants,
    status: room.status,
  };
}

/** 실제 그림 없이도 대기실에서 보여줄 작은 색 썸네일(SVG data URL)을 만든다. */
function createFriendThumbnail(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="20" fill="${color}" /></svg>`;
  const encoded = typeof window !== "undefined" ? window.btoa(svg) : Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}
