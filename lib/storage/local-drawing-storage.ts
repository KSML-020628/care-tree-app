import { STORAGE_KEYS, readJson, removeItem, writeJson } from "@/lib/storage/local-storage";
import type { SavedDrawingState, Stroke } from "@/types/drawing";

/** 새로고침해도 그림이 사라지지 않도록 stroke 목록을 저장한다. */
export function saveDrawingProgress(assignmentId: string, strokes: Stroke[]): boolean {
  const payload: SavedDrawingState = {
    assignmentId,
    strokes,
    savedAt: new Date().toISOString(),
  };
  return writeJson(STORAGE_KEYS.drawing(assignmentId), payload);
}

export function loadDrawingProgress(assignmentId: string): Stroke[] {
  const saved = readJson<SavedDrawingState>(STORAGE_KEYS.drawing(assignmentId));
  return saved?.strokes ?? [];
}

export function clearDrawingProgress(assignmentId: string): void {
  removeItem(STORAGE_KEYS.drawing(assignmentId));
}
