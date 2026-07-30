"use client";

import { useEffect, useState } from "react";
import ArtworkPreviewCard from "./ArtworkPreviewCard";
import PraiseOverlay from "./PraiseOverlay";
import RewardActionButton from "./RewardActionButton";
import SeedDropAnimation from "./SeedDropAnimation";
import SeedJar from "./SeedJar";
import { UI_TEXT } from "@/lib/constants/ui-text";
import type { Quadrant } from "@/types/assignment";

interface SubmissionCelebrationProps {
  weeklyCanvasId: string;
  transparentLineArtSrc: string | null;
  userQuadrant: Quadrant;
  praiseMessage: string;
  totalSeedsBefore: number;
  totalSeedsAfter: number;
  onViewSharedCanvas: () => void;
}

/** 각 요소가 등장하는 시점(ms). 화면에 다 모이면 멈추고, 아이가 직접 버튼을 눌러야 다음으로 넘어간다. */
const TIMING_MS = { bubble: 250, mascot: 500, seedDrop: 900, jarCaption: 1500, ctaReady: 1900 } as const;
const REDUCED_TIMING_MS = { bubble: 40, mascot: 80, seedDrop: 140, jarCaption: 200, ctaReady: 260 } as const;

/**
 * 제출 직후 연출: 공동 그림 미리보기 -> 칭찬 말풍선 -> 케어햄 -> 해바라씨 드롭 -> 항아리 설명 -> 버튼.
 * AI 분석 결과를 기다리지 않는다(항상 사전 검수된 기본 칭찬을 즉시 보여준다).
 * reduced-motion에서는 각 단계가 거의 동시에 나타나고, 버튼도 거의 바로 눌릴 수 있다.
 */
export default function SubmissionCelebration({
  weeklyCanvasId,
  transparentLineArtSrc,
  userQuadrant,
  praiseMessage,
  totalSeedsBefore,
  totalSeedsAfter,
  onViewSharedCanvas,
}: SubmissionCelebrationProps) {
  const [showBubble, setShowBubble] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [showSeedDrop, setShowSeedDrop] = useState(false);
  const [showJarCaption, setShowJarCaption] = useState(false);
  const [ctaReady, setCtaReady] = useState(false);
  const [seedCount, setSeedCount] = useState(totalSeedsBefore);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = reducedMotion ? REDUCED_TIMING_MS : TIMING_MS;

    const timers = [
      window.setTimeout(() => setShowBubble(true), timing.bubble),
      window.setTimeout(() => setShowMascot(true), timing.mascot),
      window.setTimeout(() => setShowSeedDrop(true), timing.seedDrop),
      window.setTimeout(() => setSeedCount(totalSeedsAfter), timing.jarCaption),
      window.setTimeout(() => setShowJarCaption(true), timing.jarCaption),
      window.setTimeout(() => setCtaReady(true), timing.ctaReady),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleViewSharedCanvas() {
    if (navigating) return;
    setNavigating(true);
    onViewSharedCanvas();
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <ArtworkPreviewCard
        weeklyCanvasId={weeklyCanvasId}
        transparentLineArtSrc={transparentLineArtSrc}
        userQuadrant={userQuadrant}
      />

      {showBubble && <PraiseOverlay mascotType="COURAGE" message={praiseMessage} reaction="CHEER" showMascot={showMascot} />}

      {showSeedDrop && (
        <div className="flex flex-col items-center gap-2">
          <SeedDropAnimation />
          <SeedJar totalSeeds={seedCount} />
          {showJarCaption && <p className="text-sm font-bold text-text-secondary">{UI_TEXT.seeds.gained}</p>}
        </div>
      )}

      <RewardActionButton
        label={UI_TEXT.submit.cta}
        ready={ctaReady}
        navigating={navigating}
        onClick={handleViewSharedCanvas}
      />
    </div>
  );
}
