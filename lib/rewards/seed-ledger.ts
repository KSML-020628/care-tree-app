import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";
import { SEED_AMOUNTS, type SeedEvent } from "./seed-config";

export interface SeedLedgerEntry {
  id: string;
  participantId: string;
  event: SeedEvent;
  amount: number;
  createdAt: string;
  /** 같은 사건(예: 같은 사분면 제출)에 씨앗이 중복 지급되지 않도록 막는 참조 id. */
  refId?: string;
}

/** append-only 원장. 기존 항목을 수정·삭제하지 않고 항상 새 항목만 더한다. */
export function readSeedLedger(participantId: string): SeedLedgerEntry[] {
  return readJson<SeedLedgerEntry[]>(STORAGE_KEYS.seedLedger(participantId)) ?? [];
}

export function appendSeedEntry(participantId: string, event: SeedEvent, refId?: string): SeedLedgerEntry | null {
  const existing = readSeedLedger(participantId);
  if (refId && existing.some((entry) => entry.event === event && entry.refId === refId)) {
    return null;
  }

  const entry: SeedLedgerEntry = {
    id: `seed-${participantId}-${event}-${Date.now()}`,
    participantId,
    event,
    amount: SEED_AMOUNTS[event],
    createdAt: new Date().toISOString(),
    refId,
  };
  writeJson(STORAGE_KEYS.seedLedger(participantId), [...existing, entry]);
  return entry;
}

export function getTotalSeeds(participantId: string): number {
  return readSeedLedger(participantId).reduce((sum, entry) => sum + entry.amount, 0);
}
