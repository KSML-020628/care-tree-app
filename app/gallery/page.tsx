"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import LogoutButton from "@/components/common/LogoutButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import CareHam from "@/components/mascot/CareHam";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { readContributions } from "@/lib/mock/weekly-canvas";
import type { WeeklyCanvas } from "@/types/room";

interface GalleryEntry {
  canvas: WeeklyCanvas;
  sharedCount: number;
}

/** localStorage에 저장된 주간 캔버스 목록을 찾는다. 나중에는 Supabase 조회로 바꾸면 된다. */
function findGalleryEntries(): GalleryEntry[] {
  if (typeof window === "undefined") return [];
  const entries: GalleryEntry[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith("care-tree:weekly-canvas:")) continue;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const canvas = JSON.parse(raw) as WeeklyCanvas;
      const sharedCount = readContributions(canvas.id).filter((item) => item.status === "SHARED").length;
      if (sharedCount > 0) entries.push({ canvas, sharedCount });
    } catch {
      // 손상된 데이터는 그냥 건너뛴다.
    }
  }
  return entries;
}

export default function GalleryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<GalleryEntry[] | null>(null);

  useEffect(() => {
    // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 달라지지 않도록 마운트된 뒤에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setEntries(findGalleryEntries());
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
            {entries.map(({ canvas, sharedCount }) => (
              <button
                key={canvas.id}
                type="button"
                onClick={() => router.push(`/result/${canvas.id}`)}
                className="flex flex-col items-center gap-2 rounded-[24px] bg-white p-6 text-center shadow-soft"
              >
                <CareHam type="TOGETHER" size="SMALL" />
                <span className="font-extrabold text-text-primary">{UI_TEXT.weeklyTheme.eyebrow}</span>
                <span className="text-sm font-semibold text-text-secondary">{sharedCount}명이 함께 만들고 있어요</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </TabletShell>
  );
}
