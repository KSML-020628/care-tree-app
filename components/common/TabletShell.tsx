import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { UI_TEXT } from "@/lib/constants/ui-text";

interface TabletShellProps {
  children: ReactNode;
  background?: "default" | "sky";
}

const BACKGROUND_CLASSES: Record<NonNullable<TabletShellProps["background"]>, string> = {
  default: "bg-background",
  sky: "bg-gradient-to-b from-[#DCE9FF] via-[#EFF4FF] to-[#F5F8FF]",
};

/**
 * 태블릿 가로형 화면을 기준으로 하는 공통 레이아웃.
 * 세로로 들고 있으면 화면을 돌려 달라는 안내만 보여주고, 실제 내용은 가로일 때만 노출한다.
 */
export default function TabletShell({ children, background = "default" }: TabletShellProps) {
  return (
    <div className={`min-h-dvh w-full ${BACKGROUND_CLASSES[background]}`}>
      <div className="hidden min-h-dvh w-full flex-col landscape:flex">{children}</div>

      <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-10 text-center landscape:hidden">
        <RotateCcw aria-hidden="true" size={64} className="text-primary-blue" />
        <p className="text-2xl font-extrabold text-text-primary">{UI_TEXT.common.orientationTitle}</p>
        <p className="text-lg text-text-secondary">{UI_TEXT.common.orientationBody}</p>
      </div>
    </div>
  );
}
