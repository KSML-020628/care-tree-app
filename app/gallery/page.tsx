"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import LogoutButton from "@/components/common/LogoutButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import CareHam from "@/components/mascot/CareHam";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { listWeeklyCanvases, readContributions } from "@/lib/mock/weekly-canvas";
import type { WeeklyCanvas } from "@/types/room";

interface GalleryEntry {
  canvas: WeeklyCanvas;
  /** placeholder(케어햄 자리표시자)는 빼고, 실제로 참여한 아이만 센다. */
  realParticipantCount: number;
}

/** Supabase에 있는 주간 캔버스 목록을 가져와서, 실제로 누군가 참여한 캔버스만 남긴다. */
async function findGalleryEntries(): Promise<GalleryEntry[]> {
  const canvases = await listWeeklyCanvases();
  const entries: GalleryEntry[] = [];
  for (const canvas of canvases) {
    const contributions = await readContributions(canvas.id);
    const realParticipantCount = contributions.filter(
      (item) => item.status === "SHARED" && !item.isPlaceholder,
    ).length;
    if (realParticipantCount > 0) entries.push({ canvas, realParticipantCount });
  }
  return entries;
}

export default function GalleryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<GalleryEntry[] | null>(null);

  useEffect(() => {
    findGalleryEntries().then(setEntries);
  }, []);

  return (
    <TabletShell>
      <PageHeader onBack={() => router.back()} title={UI_TEXT.gallery.heading} rightSlot={<LogoutButton />} />

      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-8 py-6">
        {!entries ? (
          <p className="text-lg font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        ) : entries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <CareHam type="SMILE" size="MEDIUM" />
            <p className="text-xl font-bold text-text-secondary">{UI_TEXT.gallery.empty}</p>
            <ChildButton variant="primary" size="medium" onClick={() => router.push("/home")}>
              {UI_TEXT.gallery.backHome}
            </ChildButton>
          </div>
        ) : (
          <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
            {entries.map(({ canvas, realParticipantCount }) => (
              <button
                key={canvas.id}
                type="button"
                onClick={() => router.push(`/result/${canvas.id}`)}
                className="flex flex-col items-center gap-2 rounded-[24px] bg-white p-6 text-center shadow-soft"
              >
                <CareHam type="TOGETHER" size="SMALL" />
                <span className="font-extrabold text-text-primary">{UI_TEXT.weeklyTheme.eyebrow}</span>
                <span className="text-sm font-semibold text-text-secondary">
                  {realParticipantCount}명이 함께 만들고 있어요
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </TabletShell>
  );
}
