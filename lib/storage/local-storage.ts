/** localStorage를 안전하게 감싼 유틸. 서버 사이드 렌더링, 저장공간 부족, 접근 차단 상황에서도 앱이 죽지 않게 한다. */

const NAMESPACE = "care-tree";

export const STORAGE_KEYS = {
  session: `${NAMESPACE}:session`,
  assignment: (userId: string, themeId: string) => `${NAMESPACE}:assignment:${themeId}:${userId}`,
  weeklyCanvas: (weeklyCanvasId: string) => `${NAMESPACE}:weekly-canvas:${weeklyCanvasId}`,
  contributions: (weeklyCanvasId: string) => `${NAMESPACE}:contributions:${weeklyCanvasId}`,
  drawing: (assignmentId: string) => `${NAMESPACE}:drawing:${assignmentId}`,
  seedLedger: (participantId: string) => `${NAMESPACE}:seed-ledger:${participantId}`,
  unlockedCareHams: (participantId: string) => `${NAMESPACE}:unlocked-care-hams:${participantId}`,
  artworkAnalysis: (contributionId: string) => `${NAMESPACE}:artwork-analysis:${contributionId}`,
  autosaveMascotShown: (assignmentId: string) => `${NAMESPACE}:autosave-mascot-shown:${assignmentId}`,
} as const;

function isStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readJson<T>(key: string): T | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 저장공간 접근이 막혀 있어도 앱 흐름은 계속되어야 한다.
  }
}
