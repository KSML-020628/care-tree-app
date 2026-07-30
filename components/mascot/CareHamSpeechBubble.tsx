import type { ReactNode } from "react";

interface CareHamSpeechBubbleProps {
  children: ReactNode;
  tone?: "default" | "accent";
  className?: string;
}

/** 케어햄 옆에 붙는 말풍선. 문구는 항상 호출하는 쪽에서 검수된 문장만 넣는다. */
export default function CareHamSpeechBubble({ children, tone = "default", className = "" }: CareHamSpeechBubbleProps) {
  const toneClass = tone === "accent" ? "bg-accent-yellow text-text-primary" : "bg-white text-text-primary";

  return (
    <div className={`relative max-w-[220px] rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-soft ${toneClass} ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className={`absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 ${
          tone === "accent" ? "bg-accent-yellow" : "bg-white"
        }`}
      />
    </div>
  );
}
