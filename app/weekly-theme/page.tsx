"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabletShell from "@/components/common/TabletShell";
import WeeklyThemeIntro from "@/components/theme/WeeklyThemeIntro";
import { fetchActiveTheme } from "@/lib/mock/theme";
import { useSessionStore } from "@/lib/store/session-store";
import type { WeeklyTheme } from "@/types/theme";

export default function WeeklyThemePage() {
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const setTheme = useSessionStore((state) => state.setTheme);
  const [theme, setLocalTheme] = useState<WeeklyTheme | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchActiveTheme().then((activeTheme) => {
      setTheme(activeTheme);
      setLocalTheme(activeTheme);
    });
  }, [hydrated, user, router, setTheme]);

  function goToAssignment() {
    router.push("/assignment");
  }

  return (
    <TabletShell>
      {theme && <WeeklyThemeIntro theme={theme} onFinished={goToAssignment} />}
    </TabletShell>
  );
}
