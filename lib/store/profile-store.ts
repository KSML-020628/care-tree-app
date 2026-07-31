import { create } from "zustand";
import { getProfile, saveProfile } from "@/lib/profile/profile-storage";
import type { ChildProfile } from "@/lib/profile/profile.types";

interface ProfileState {
  profile: ChildProfile | null;
  /** 아직 Supabase 조회가 끝나지 않았는지(로딩 중인지) 구분한다 — "프로필 없음"과 헷갈리면 안 된다. */
  loaded: boolean;
  loadProfile: (participantId: string) => Promise<ChildProfile | null>;
  setProfile: (profile: ChildProfile) => void;
  saveAndSetProfile: (profile: ChildProfile) => Promise<ChildProfile>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loaded: false,

  loadProfile: async (participantId) => {
    const profile = await getProfile(participantId);
    set({ profile, loaded: true });
    return profile;
  },

  setProfile: (profile) => set({ profile, loaded: true }),

  saveAndSetProfile: async (profile) => {
    const saved = await saveProfile(profile);
    set({ profile: saved, loaded: true });
    return saved;
  },

  reset: () => set({ profile: null, loaded: false }),
}));
