"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/session-store";

/** 첫 진입 화면. 로그인 여부만 보고 알맞은 다음 화면으로 보낸다. */
export default function RootPage() {
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(user ? "/weekly-theme" : "/login");
  }, [hydrated, user, router]);

  return null;
}
