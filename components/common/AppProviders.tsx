"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useSessionStore } from "@/lib/store/session-store";

/** 새로고침 후에도 로그인 상태를 복원할 수 있도록, 앱이 시작될 때 한 번 localStorage를 읽어 온다. */
export default function AppProviders({ children }: { children: ReactNode }) {
  const hydrate = useSessionStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return children;
}
