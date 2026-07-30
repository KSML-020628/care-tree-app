import { getActiveTheme } from "@/lib/config/themes";
import { QUADRANTS } from "@/lib/config/quadrants";
import { buildWeeklyCanvasId, readContributions } from "@/lib/mock/weekly-canvas";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";
import type { AssignmentRepository, DrawingAssignment, Quadrant } from "@/types/assignment";
import type { WeeklyTheme } from "@/types/theme";
import type { ChildUser } from "@/types/user";

function pickRandomQuadrant(exclude: readonly Quadrant[]): Quadrant {
  const remaining = QUADRANTS.filter((quadrant) => !exclude.includes(quadrant));
  const pool = remaining.length > 0 ? remaining : QUADRANTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 이미 우리 그림에 공유된(=다른 아이가 맡은) 사분면은 새 배정에서 제외한다.
 * placeholder(아직 아무도 채우지 않아 미리 넣어둔 케어햄 색칠본)는 실제 참여가 아니므로 제외 대상에서 뺀다.
 * placeholder까지 "이미 찬 자리"로 세면, 두 번째 아이부터는 배정 가능한 자리가 하나도 안 남았다고
 * 잘못 판단해 중복 배정이 일어날 수 있다.
 */
function collectTakenQuadrants(weeklyCanvasId: string): Quadrant[] {
  return readContributions(weeklyCanvasId)
    .filter((contribution) => contribution.status === "SHARED" && !contribution.isPlaceholder)
    .map((contribution) => contribution.quadrant);
}

/**
 * 로그인한 아이에게 사분면을 랜덤으로 배정한다. 이 배정 정책(랜덤·중복 제외·새로고침 유지)은 바꾸지 않는다.
 * - 같은 아이가 새로고침해도 같은 영역을 유지하도록 localStorage에 저장된 값을 먼저 확인한다.
 * - 이미 다른 아이에게 배정된(공유된) 영역은 배정에서 제외한다.
 * - 나중에 서버 API로 교체할 때는 이 함수 내부만 바꾸면 된다(AssignmentRepository 참고).
 */
export function getOrCreateAssignment(user: ChildUser, theme: WeeklyTheme): DrawingAssignment {
  const key = STORAGE_KEYS.assignment(user.id, theme.id);
  const existing = readJson<DrawingAssignment>(key);
  if (existing) return existing;

  const weeklyCanvasId = buildWeeklyCanvasId(theme.id);
  const takenQuadrants = collectTakenQuadrants(weeklyCanvasId);
  const quadrant = pickRandomQuadrant(takenQuadrants);

  const assignment: DrawingAssignment = {
    id: `assignment-${user.id}-${theme.id}`,
    userId: user.id,
    roomId: weeklyCanvasId,
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

/**
 * localStorage 기반 mock 구현. 나중에 실제 서버 API 클라이언트로 교체할 때는
 * 이 클래스와 같은 모양(AssignmentRepository)으로 새 구현체만 만들면 화면 코드는 그대로 쓸 수 있다.
 * 지금은 클라이언트에만 데이터가 있어, 요청한 participantId가 실제 로그인한 아이와 같을 때만 동작한다.
 */
export class LocalAssignmentRepository implements AssignmentRepository {
  async getAssignment(participantId: string, themeId: string): Promise<DrawingAssignment | null> {
    return readAssignment(participantId, themeId);
  }

  async assignRandomQuadrant(participantId: string, themeId: string): Promise<DrawingAssignment> {
    const existing = readAssignment(participantId, themeId);
    if (existing) return existing;

    const user = readJson<ChildUser>(STORAGE_KEYS.session);
    const theme = getActiveTheme();
    if (!user || user.id !== participantId || theme.id !== themeId) {
      throw new Error("이 mock 저장소는 지금 로그인한 아이의 배정만 만들 수 있어요.");
    }
    return getOrCreateAssignment(user, theme);
  }
}
