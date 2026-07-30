import CareHam, { type CareHamReactionType } from "@/components/mascot/CareHam";
import CareHamSpeechBubble from "@/components/mascot/CareHamSpeechBubble";
import type { ActiveCareHamType } from "@/lib/mascot/mascot-config";

interface PraiseOverlayProps {
  mascotType: ActiveCareHamType;
  message: string;
  reaction?: CareHamReactionType;
  className?: string;
}

/** 케어햄 + 사전 검수된 칭찬 문장을 함께 보여주는 연출용 조합. AI가 만든 자유 문장은 여기 들어가지 않는다. */
export default function PraiseOverlay({ mascotType, message, reaction = "CHEER", className = "" }: PraiseOverlayProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <CareHamSpeechBubble tone="accent">{message}</CareHamSpeechBubble>
      <CareHam type={mascotType} size="LARGE" reaction={reaction} />
    </div>
  );
}
