import { create } from "zustand";
import { STORAGE_KEYS, readJson, removeItem, writeJson } from "@/lib/storage/local-storage";
import type { DrawingAssignment } from "@/types/assignment";
import type { WeeklyTheme } from "@/types/theme";
import type { ChildUser } from "@/types/user";

interface SessionState {
  user: ChildUser | null;
  theme: WeeklyTheme | null;
  assignment: DrawingAssignment | null;
  hydrated: boolean;
  hydrate: () => void;
  login: (user: ChildUser) => void;
  setTheme: (theme: WeeklyTheme) => void;
  setAssignment: (assignment: DrawingAssignment) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  theme: null,
  assignment: null,
  hydrated: false,
  hydrate: () => {
    const user = readJson<ChildUser>(STORAGE_KEYS.session);
    set({ user, hydrated: true });
  },
  login: (user) => {
    writeJson(STORAGE_KEYS.session, user);
    set({ user });
  },
  setTheme: (theme) => set({ theme }),
  setAssignment: (assignment) => set({ assignment }),
  logout: () => {
    removeItem(STORAGE_KEYS.session);
    set({ user: null, theme: null, assignment: null });
  },
}));
