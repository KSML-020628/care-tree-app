"use client";

import { Archive, Sparkles, X, ZoomIn } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import TabletShell from "@/components/common/TabletShell";
import ContributionGallery from "@/components/artwork/ContributionGallery";
import CareHam from "@/components/mascot/CareHam";
import CompletionAnimation from "@/components/result/CompletionAnimation";
import CompositeCanvas from "@/components/result/CompositeCanvas";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { createTransparentLineArt } from "@/lib/drawing/quadrant-crop";
import { fetchActiveTheme } from "@/lib/mock/theme";
import { readContributions, readWeeklyCanvas } from "@/lib/mock/weekly-canvas";
import { useSessionStore } from "@/lib/store/session-store";
import type { Quadrant } from "@/types/assignment";
import type { DrawingContribution, WeeklyCanvas } from "@/types/room";
import type { WeeklyTheme } from "@/types/theme";

type Phase = "animating" | "done";

function koreanDateToday(): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

/**
 * 우리 그림 크게 보기 화면. 예전에는 4명이 다 끝나야만 볼 수 있었지만,
 * 지금은 일부 사분면만 채워져 있어도 언제든 볼 수 있다("완성/미완성" 상태가 없다).
 */
export default function ResultPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const sessionTheme = useSessionStore((state) => state.theme);
  const setTheme = useSessionStore((state) => state.setTheme);

  const [canvas, setCanvas] = useState<WeeklyCanvas | null>(null);
  const [contributions, setContributions] = useState<DrawingContribution[]>([]);
  const [theme, setLocalTheme] = useState<WeeklyTheme | null>(sessionTheme);
  const [transparentLineArtSrc, setTransparentLineArtSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("animating");
  const [showLargeView, setShowLargeView] = useState(false);

  useEffect(() => {
    // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 달라지지 않도록 마운트된 뒤에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setCanvas(readWeeklyCanvas(params.roomId));
    setContributions(readContributions(params.roomId));
  }, [params.roomId]);

  useEffect(() => {
    if (theme) return;
    fetchActiveTheme().then((activeTheme) => {
      setTheme(activeTheme);
      setLocalTheme(activeTheme);
    });
  }, [theme, setTheme]);

  useEffect(() => {
    if (!theme) return;
    createTransparentLineArt(theme.fullImagePath).then(setTransparentLineArtSrc);
  }, [theme]);

  if (!canvas || !theme) {
    return (
      <TabletShell background="sky">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  const sharedContributions = contributions.filter((item) => item.status === "SHARED");
  const quadrantImages = sharedContributions.reduce<Partial<Record<Quadrant, string>>>((acc, item) => {
    if (item.imageDataUrl) acc[item.quadrant] = item.imageDataUrl;
    return acc;
  }, {});

  return (
    <TabletShell background="sky">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-8 py-6">
        {phase === "animating" ? (
          <CompletionAnimation
            quadrantImages={quadrantImages}
            lineArtOverlaySrc={transparentLineArtSrc}
            onLanded={() => setPhase("done")}
          />
        ) : (
          <>
            <CareHam type="TOGETHER" size="MEDIUM" reaction="CHEER" />
            <div className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="text-accent-yellow-dark" />
              <h1 className="text-3xl font-extrabold text-text-primary">{UI_TEXT.result.heading}</h1>
              <Sparkles aria-hidden="true" className="text-accent-yellow-dark" />
            </div>

            <CompositeCanvas weeklyCanvasId={canvas.id} transparentLineArtSrc={transparentLineArtSrc} />

            <dl className="grid w-full max-w-md grid-cols-2 gap-3 rounded-[24px] bg-white/90 p-5 text-sm shadow-soft">
              <div>
                <dt className="font-semibold text-text-secondary">{UI_TEXT.result.participants}</dt>
                <dd className="text-lg font-extrabold text-text-primary">{sharedContributions.length}명</dd>
              </div>
              <div>
                <dt className="font-semibold text-text-secondary">{UI_TEXT.result.theme}</dt>
                <dd className="text-lg font-extrabold text-text-primary">{theme.title}</dd>
              </div>
              <div>
                <dt className="font-semibold text-text-secondary">{UI_TEXT.result.hospital}</dt>
                <dd className="truncate text-lg font-extrabold text-text-primary">{user?.hospitalName ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-text-secondary">{UI_TEXT.result.date}</dt>
                <dd className="text-lg font-extrabold text-text-primary">{koreanDateToday()}</dd>
              </div>
            </dl>

            <div className="grid w-full max-w-md grid-cols-1 gap-3">
              <ChildButton variant="accent" size="large" icon={ZoomIn} fullWidth onClick={() => setShowLargeView(true)}>
                {UI_TEXT.result.viewLarge}
              </ChildButton>
              <div className="grid grid-cols-2 gap-3">
                <ChildButton variant="ghost" size="medium" icon={Archive} onClick={() => router.push("/gallery")}>
                  {UI_TEXT.result.gallery}
                </ChildButton>
                <ChildButton variant="ghost" size="medium" onClick={() => router.push("/")}>
                  {UI_TEXT.result.nextWeek}
                </ChildButton>
              </div>
            </div>

            <div className="w-full max-w-md">
              <ContributionGallery contributions={sharedContributions} />
            </div>
          </>
        )}
      </div>

      {showLargeView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B234A]/80 p-8">
          <button
            type="button"
            onClick={() => setShowLargeView(false)}
            aria-label={UI_TEXT.common.back}
            className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-text-primary"
          >
            <X aria-hidden="true" size={26} />
          </button>
          <div className="aspect-square w-full max-w-[720px] overflow-hidden rounded-[32px] bg-white">
            <CompositeCanvas weeklyCanvasId={canvas.id} transparentLineArtSrc={transparentLineArtSrc} />
          </div>
        </div>
      )}
    </TabletShell>
  );
}
