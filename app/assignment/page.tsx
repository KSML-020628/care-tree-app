"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QuadrantPreview from "@/components/assignment/QuadrantPreview";
import ChildButton from "@/components/common/ChildButton";
import TabletShell from "@/components/common/TabletShell";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { fetchActiveTheme } from "@/lib/mock/theme";
import { useSessionStore } from "@/lib/store/session-store";
import { getOrCreateAssignment } from "@/lib/utils/random-assignment";
import type { DrawingAssignment } from "@/types/assignment";
import type { WeeklyTheme } from "@/types/theme";

export default function AssignmentPage() {
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const storeTheme = useSessionStore((state) => state.theme);
  const setTheme = useSessionStore((state) => state.setTheme);
  const setAssignment = useSessionStore((state) => state.setAssignment);

  const [theme, setLocalTheme] = useState<WeeklyTheme | null>(storeTheme);
  const [assignment, setLocalAssignment] = useState<DrawingAssignment | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    async function ensureTheme() {
      if (theme) return theme;
      const activeTheme = await fetchActiveTheme();
      setTheme(activeTheme);
      setLocalTheme(activeTheme);
      return activeTheme;
    }

    ensureTheme().then((activeTheme) => {
      if (!user) return;
      const nextAssignment = getOrCreateAssignment(user, activeTheme);
      setAssignment(nextAssignment);
      setLocalAssignment(nextAssignment);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, router]);

  if (!user || !theme || !assignment) {
    return (
      <TabletShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell background="sky">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-text-primary">
            {UI_TEXT.assignment.heading(user.nickname)}
          </h1>
          <p className="mt-2 text-lg font-semibold text-text-secondary">{UI_TEXT.assignment.subtitle}</p>
        </div>

        <QuadrantPreview fullImagePath={theme.fullImagePath} assignedQuadrant={assignment.quadrant} />

        <ChildButton
          variant="accent"
          size="large"
          className="max-w-md"
          fullWidth
          onClick={() => router.push(`/draw/${assignment.id}`)}
          aria-label={UI_TEXT.assignment.cta}
        >
          {UI_TEXT.assignment.cta}
        </ChildButton>
      </div>
    </TabletShell>
  );
}
