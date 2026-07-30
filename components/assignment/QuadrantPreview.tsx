import Image from "next/image";
import { QUADRANT_GRID_ORDER, getQuadrantPercentRect } from "@/lib/config/quadrants";
import type { Quadrant } from "@/types/assignment";
import AssignmentHighlight from "./AssignmentHighlight";

interface QuadrantPreviewProps {
  fullImagePath: string;
  assignedQuadrant: Quadrant;
}

/**
 * 전체 도안 위에 4조각을 겹쳐 보여주고, 내 조각만 밝게 강조한다.
 * 위치·이름 대신 시각적인 강조만으로 어디를 맡았는지 알 수 있게 한다.
 */
export default function QuadrantPreview({ fullImagePath, assignedQuadrant }: QuadrantPreviewProps) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-soft">
      <Image
        src={fullImagePath}
        alt="이번 주 색칠 도안 전체"
        fill
        sizes="420px"
        className="object-contain"
        priority
      />

      {QUADRANT_GRID_ORDER.filter((quadrant) => quadrant !== assignedQuadrant).map((quadrant) => (
        <div
          key={quadrant}
          className="absolute bg-white/55"
          style={getQuadrantPercentRect(quadrant)}
          aria-hidden="true"
        />
      ))}

      <AssignmentHighlight style={getQuadrantPercentRect(assignedQuadrant)} />
    </div>
  );
}
