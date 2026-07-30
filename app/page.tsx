"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/session-store";

/**
 * 첫 진입 화면. 로그인 여부만 보고 알맞은 다음 화면으로 보낸다.
 * 실제 홈 화면은 /home이다 — 여기서 /weekly-theme로 직접 보내면 로그인된 사용자가
 * "홈으로 가기"를 누를 때마다 매번 주제 소개 화면을 다시 보게 된다.
 */
export default function RootPage() {
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(user ? "/home" : "/login");
  }, [hydrated, user, router]);

  return null;
}
