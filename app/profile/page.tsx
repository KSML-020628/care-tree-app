"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { WEEKLY_THEMES } from "@/lib/config/themes";
import { readContributionsByParticipant } from "@/lib/mock/weekly-canvas";
import { useProfileStore } from "@/lib/store/profile-store";
import { useSessionStore } from "@/lib/store/session-store";

interface RecentCanvasEntry {
  weeklyCanvasId: string;
  themeTitle: string;
  sharedAt: string;
}

function themeTitleFor(themeId: string): string {
  return WEEKLY_THEMES.find((theme) => theme.id === themeId)?.title ?? UI_TEXT.weeklyTheme.eyebrow;
}

export default function ProfilePage() {
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const profileLoaded = useProfileStore((state) => state.loaded);
  const loadProfile = useProfileStore((state) => state.loadProfile);

  const [recentCanvases, setRecentCanvases] = useState<RecentCanvasEntry[] | null>(null);
  const [totalContributionCount, setTotalContributionCount] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    loadProfile(user.id);
  }, [hydrated, user, router, loadProfile]);

  useEffect(() => {
    if (!user) return;
    readContributionsByParticipant(user.id).then((contributions) => {
      const byCanvas = new Map<string, RecentCanvasEntry>();
      for (const contribution of contributions) {
        const existing = byCanvas.get(contribution.weeklyCanvasId);
        const sharedAt = contribution.sharedAt ?? "";
        if (!existing || sharedAt > existing.sharedAt) {
          byCanvas.set(contribution.weeklyCanvasId, {
            weeklyCanvasId: contribution.weeklyCanvasId,
            themeTitle: themeTitleFor(contribution.weeklyCanvasId.replace(/^canvas-/, "")),
            sharedAt,
          });
        }
      }
      const sorted = [...byCanvas.values()].sort((a, b) => (a.sharedAt < b.sharedAt ? 1 : -1));
      setTotalContributionCount(byCanvas.size);
      setRecentCanvases(sorted.slice(0, 3));
    });
  }, [user]);

  if (!user || !profileLoaded || !profile) {
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
      <PageHeader onBack={() => router.back()} title={UI_TEXT.profileHub.heading} />

      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-8 py-6">
        <ProfileAvatar avatarImageUrl={profile.avatarImageUrl} artistName={profile.artistName} size="lg" />
        <p className="text-xl font-extrabold text-text-primary">{profile.artistName} 화가</p>

        <div className="rounded-2xl bg-white px-6 py-4 text-center shadow-soft">
          <p className="text-sm font-semibold text-text-secondary">{UI_TEXT.profileHub.contributionsLabel}</p>
          <p className="text-2xl font-extrabold text-text-primary">
            {totalContributionCount === null ? "-" : totalContributionCount}
          </p>
        </div>

        {recentCanvases && recentCanvases.length > 0 && (
          <div className="w-full max-w-md">
            <p className="mb-2 text-sm font-bold text-text-secondary">{UI_TEXT.profileHub.recentWorksLabel}</p>
            <div className="flex flex-col gap-2">
              {recentCanvases.map((entry) => (
                <button
                  key={entry.weeklyCanvasId}
                  type="button"
                  onClick={() => router.push(`/result/${entry.weeklyCanvasId}`)}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-left shadow-soft"
                >
                  <span className="font-bold text-text-primary">{entry.themeTitle}</span>
                  <span className="text-sm font-semibold text-primary-blue">{UI_TEXT.profileHub.viewMine}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 w-full max-w-md rounded-[24px] bg-white p-5 text-center shadow-soft">
          <p className="font-bold text-text-primary">{UI_TEXT.profileHub.redrawQuestion}</p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <ChildButton
              variant="accent"
              size="medium"
              fullWidth
              onClick={() => router.push("/profile/draw?mode=edit")}
            >
              {UI_TEXT.profileHub.redraw}
            </ChildButton>
            <ChildButton variant="ghost" size="medium" fullWidth onClick={() => router.back()}>
              {UI_TEXT.profileHub.keepCurrent}
            </ChildButton>
          </div>
        </div>
      </div>
    </TabletShell>
  );
}
