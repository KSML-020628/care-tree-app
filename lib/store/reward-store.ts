import { create } from "zustand";
import type { CareHamType } from "@/lib/mascot/mascot-config";
import type { SeedEvent } from "@/lib/rewards/seed-config";
import { appendSeedEntry, getTotalSeeds, readSeedLedger, type SeedLedgerEntry } from "@/lib/rewards/seed-ledger";
import { STORAGE_KEYS, readJson } from "@/lib/storage/local-storage";

interface RewardState {
  participantId: string | null;
  seedLedger: SeedLedgerEntry[];
  unlockedCareHams: CareHamType[];
  totalSeeds: number;
  loadForParticipant: (participantId: string) => void;
  grantSeeds: (event: SeedEvent, refId?: string) => void;
}

/** 해바라씨 원장과 해금된 케어햄 목록을 화면에서 바로 쓸 수 있게 감싸는 스토어. */
export const useRewardStore = create<RewardState>((set, get) => ({
  participantId: null,
  seedLedger: [],
  unlockedCareHams: [],
  totalSeeds: 0,

  loadForParticipant: (participantId) => {
    const ledger = readSeedLedger(participantId);
    const unlocked = readJson<CareHamType[]>(STORAGE_KEYS.unlockedCareHams(participantId)) ?? [];
    set({
      participantId,
      seedLedger: ledger,
      unlockedCareHams: unlocked,
      totalSeeds: ledger.reduce((sum, entry) => sum + entry.amount, 0),
    });
  },

  grantSeeds: (event, refId) => {
    const { participantId } = get();
    if (!participantId) return;
    const entry = appendSeedEntry(participantId, event, refId);
    if (!entry) return; // 이미 지급된 사건이면 중복으로 더하지 않는다.
    set({ seedLedger: readSeedLedger(participantId), totalSeeds: getTotalSeeds(participantId) });
  },
}));
