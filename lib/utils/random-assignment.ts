import { QUADRANTS } from "@/lib/config/quadrants";
import { buildRoomId } from "@/lib/mock/room";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";
import type { DrawingAssignment, Quadrant } from "@/types/assignment";
import type { WeeklyTheme } from "@/types/theme";
import type { ChildUser } from "@/types/user";

interface RoomParticipantSnapshot {
  quadrant: Quadrant;
  status: string;
}

function pickRandomQuadrant(exclude: readonly Quadrant[]): Quadrant {
  const remaining = QUADRANTS.filter((quadrant) => !exclude.includes(quadrant));
  const pool = remaining.length > 0 ? remaining : QUADRANTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function collectTakenQuadrants(roomId: string): Quadrant[] {
  const room = readJson<{ participants: RoomParticipantSnapshot[] }>(STORAGE_KEYS.room(roomId));
  if (!room) return [];
  // 제출을 마쳤거나 지금 색칠 중인 영역만 제외한다. 단순히 기다리는 중인 자리는 다시 배정될 수 있다.
  return room.participants
    .filter((participant) => participant.status === "SUBMITTED" || participant.status === "DRAWING")
    .map((participant) => participant.quadrant);
}

/**
 * 로그인한 아이에게 사분면을 배정한다.
 * - 같은 아이가 새로고침해도 같은 영역을 유지하도록 localStorage에 저장된 값을 먼저 확인한다.
 * - 이미 색칠 중이거나 제출된 영역은 배정에서 제외한다.
 * - 나중에 서버 API로 교체할 때는 이 함수 내부만 바꾸면 된다.
 */
export function getOrCreateAssignment(user: ChildUser, theme: WeeklyTheme): DrawingAssignment {
  const key = STORAGE_KEYS.assignment(user.id, theme.id);
  const existing = readJson<DrawingAssignment>(key);
  if (existing) return existing;

  const roomId = buildRoomId(theme.id);
  const takenQuadrants = collectTakenQuadrants(roomId);
  const quadrant = pickRandomQuadrant(takenQuadrants);

  const assignment: DrawingAssignment = {
    id: `assignment-${user.id}-${theme.id}`,
    userId: user.id,
    roomId,
    themeId: theme.id,
    quadrant,
    status: "ASSIGNED",
    assignedAt: new Date().toISOString(),
  };
  writeJson(key, assignment);
  return assignment;
}

export function readAssignment(userId: string, themeId: string): DrawingAssignment | null {
  return readJson<DrawingAssignment>(STORAGE_KEYS.assignment(userId, themeId));
}

export function updateAssignmentStatus(
  userId: string,
  themeId: string,
  status: DrawingAssignment["status"],
): DrawingAssignment | null {
  const key = STORAGE_KEYS.assignment(userId, themeId);
  const existing = readJson<DrawingAssignment>(key);
  if (!existing) return null;
  const updated: DrawingAssignment = { ...existing, status };
  writeJson(key, updated);
  return updated;
}
