"use client";

import { Archive, Sparkles, X, ZoomIn } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import TabletShell from "@/components/common/TabletShell";
import CompletionAnimation from "@/components/result/CompletionAnimation";
import CompositeCanvas from "@/components/result/CompositeCanvas";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { createTransparentLineArt } from "@/lib/drawing/quadrant-crop";
import { fetchActiveTheme } from "@/lib/mock/theme";
import { readRoom } from "@/lib/mock/room";
import { readSubmissions } from "@/lib/mock/submissions";
import { useSessionStore } from "@/lib/store/session-store";
import type { Quadrant } from "@/types/assignment";
import type { CollaborationRoom } from "@/types/room";
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

export default function ResultPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const sessionTheme = useSessionStore((state) => state.theme);
  const setTheme = useSessionStore((state) => state.setTheme);

  const [room, setRoom] = useState<CollaborationRoom | null>(null);
  const [theme, setLocalTheme] = useState<WeeklyTheme | null>(sessionTheme);
  const [transparentLineArtSrc, setTransparentLineArtSrc] = useState<string | null>(null);
  const [quadrantImages, setQuadrantImages] = useState<Partial<Record<Quadrant, string>>>({});
  const [phase, setPhase] = useState<Phase>("animating");
  const [showLargeView, setShowLargeView] = useState(false);

  useEffect(() => {
    // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 달라지지 않도록 마운트된 뒤에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setRoom(readRoom(params.roomId));
    const submissions = readSubmissions(params.roomId);
    const images: Partial<Record<Quadrant, string>> = {};
    submissions.forEach((submission) => {
      images[submission.quadrant] = submission.imageDataUrl;
    });
    setQuadrantImages(images);
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

  if (!room || !theme) {
    return (
      <TabletShell background="sky">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell background="sky">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-6">
        {phase === "animating" ? (
          <CompletionAnimation
            quadrantImages={quadrantImages}
            lineArtOverlaySrc={transparentLineArtSrc}
            onLanded={() => setPhase("done")}
          />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="text-accent-yellow-dark" />
              <h1 className="text-3xl font-extrabold text-text-primary">{UI_TEXT.result.heading}</h1>
              <Sparkles aria-hidden="true" className="text-accent-yellow-dark" />
            </div>

            <CompositeCanvas roomId={room.id} transparentLineArtSrc={transparentLineArtSrc} />

            <dl className="grid w-full max-w-md grid-cols-2 gap-3 rounded-[24px] bg-white/90 p-5 shadow-soft text-sm">
              <div>
                <dt className="font-semibold text-text-secondary">{UI_TEXT.result.participants}</dt>
                <dd className="text-lg font-extrabold text-text-primary">{room.participants.length}명</dd>
              </div>
              <div>
                <dt className="font-semibold text-text-secondary">{UI_TEXT.result.theme}</dt>
                <dd className="text-lg font-extrabold text-text-primary">{theme.title}</dd>
              </div>
              <div>
                <dt className="font-semibold text-text-secondary">{UI_TEXT.result.hospital}</dt>
                <dd className="truncate text-lg font-extrabold text-text-primary">
                  {user?.hospitalName ?? "-"}
                </dd>
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
            <CompositeCanvas roomId={room.id} transparentLineArtSrc={transparentLineArtSrc} />
          </div>
        </div>
      )}
    </TabletShell>
  );
}
