import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";
import type { DrawingSubmission } from "@/types/assignment";

/** 같은 사분면을 다시 제출하면 이전 것을 덮어쓴다. */
export function saveSubmission(roomId: string, submission: DrawingSubmission): DrawingSubmission[] {
  const existing = readJson<DrawingSubmission[]>(STORAGE_KEYS.submissions(roomId)) ?? [];
  const next = [...existing.filter((item) => item.quadrant !== submission.quadrant), submission];
  writeJson(STORAGE_KEYS.submissions(roomId), next);
  return next;
}

export function readSubmissions(roomId: string): DrawingSubmission[] {
  return readJson<DrawingSubmission[]>(STORAGE_KEYS.submissions(roomId)) ?? [];
}
