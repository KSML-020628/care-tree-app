"use client";

import { useAiStore } from "@/lib/store/ai-store";
import type { DrawingContribution } from "@/types/room";
import ArtworkMotion from "./ArtworkMotion";

interface ContributionGalleryProps {
  contributions: DrawingContribution[];
}

/** 지금까지 공유된 사분면들을 카드 형태로 보여준다. AI 캡션이 있으면 카드 아래에 함께 보여준다. */
export default function ContributionGallery({ contributions }: ContributionGalleryProps) {
  const analyses = useAiStore((state) => state.analyses);

  if (contributions.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {contributions.map((contribution) => {
        const analysis = analyses[contribution.id]?.analysis;
        const imageSrc = contribution.thumbnail ?? contribution.imageDataUrl;
        return (
          <div key={contribution.id} className="overflow-hidden rounded-2xl bg-white p-3 shadow-soft">
            <ArtworkMotion
              preset={analysis?.motionPreset ?? "NONE"}
              className="aspect-square overflow-hidden rounded-xl bg-[#F5F8FF]"
            >
              {imageSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSrc} alt="" className="h-full w-full object-contain" />
              )}
            </ArtworkMotion>
            {analysis?.caption && (
              <p className="mt-2 text-center text-xs font-semibold text-text-secondary">{analysis.caption}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
