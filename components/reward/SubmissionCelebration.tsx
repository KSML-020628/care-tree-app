"use client";

import { useEffect, useState } from "react";
import PraiseOverlay from "./PraiseOverlay";
import SeedDropAnimation from "./SeedDropAnimation";
import SeedJar from "./SeedJar";
import { UI_TEXT } from "@/lib/constants/ui-text";

interface SubmissionCelebrationProps {
  pieceImageSrc: string;
  praiseMessage: string;
  totalSeedsBefore: number;
  totalSeedsAfter: number;
  onFinished: () => void;
}

type Stage = "piece" | "praise" | "seed" | "done";

/**
 * 제출 직후 연출: 조각 등장 -> 용기 햄 + 칭찬 -> 해바라씨 -> 끝.
 * AI 분석 결과를 기다리지 않는다(항상 사전 검수된 기본 칭찬을 즉시 보여준다).
 * 전체 3~5초, 강한 깜빡임·화면 흔들림 없음. reduced-motion에서는 각 단계가 훨씬 빠르게(사실상 즉시) 전환된다.
 */
export default function SubmissionCelebration({
  pieceImageSrc,
  praiseMessage,
  totalSeedsBefore,
  totalSeedsAfter,
  onFinished,
}: SubmissionCelebrationProps) {
  const [stage, setStage] = useState<Stage>("piece");
  const [seedCount, setSeedCount] = useState(totalSeedsBefore);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pieceMs = reducedMotion ? 150 : 700;
    const praiseMs = reducedMotion ? 150 : 900;
    const seedMs = reducedMotion ? 150 : 1000;
    const doneMs = reducedMotion ? 300 : 1200;

    const timers = [
      window.setTimeout(() => setStage("praise"), pieceMs),
      window.setTimeout(() => setStage("seed"), pieceMs + praiseMs),
      window.setTimeout(() => setSeedCount(totalSeedsAfter), pieceMs + praiseMs + 150),
      window.setTimeout(() => {
        setStage("done");
        onFinished();
      }, pieceMs + praiseMs + seedMs + doneMs),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="h-40 w-40 overflow-hidden rounded-[24px] bg-white shadow-soft [animation:gentle-pop_500ms_ease-out]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pieceImageSrc} alt="" className="h-full w-full object-contain" />
      </div>

      {stage !== "piece" && <PraiseOverlay mascotType="COURAGE" message={praiseMessage} reaction="CHEER" />}

      {(stage === "seed" || stage === "done") && (
        <div className="flex flex-col items-center gap-2">
          <SeedDropAnimation />
          <SeedJar totalSeeds={seedCount} />
          <p className="text-sm font-bold text-text-secondary">{UI_TEXT.seeds.gained}</p>
        </div>
      )}
    </div>
  );
}
