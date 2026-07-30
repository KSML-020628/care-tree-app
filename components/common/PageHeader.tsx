"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import CareHamHomeButton from "@/components/navigation/CareHamHomeButton";
import { UI_TEXT } from "@/lib/constants/ui-text";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
  showLogo?: boolean;
}

/** 로그인 이후 대부분의 화면에서 쓰는 공통 상단 바. 높이는 항상 72~84px 사이로 고정한다. */
export default function PageHeader({ title, subtitle, onBack, rightSlot, showLogo = true }: PageHeaderProps) {
  return (
    <header className="flex h-[76px] w-full shrink-0 items-center justify-between gap-4 px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={UI_TEXT.common.back}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-blue shadow-[0_4px_0_rgba(97,112,154,0.18)] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(97,112,154,0.18)]"
          >
            <ArrowLeft aria-hidden="true" size={26} strokeWidth={2.6} />
          </button>
        )}
        {showLogo && <CareHamHomeButton size="md" />}
      </div>

      {title && (
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-lg font-extrabold text-text-primary">{title}</p>
          {subtitle && <p className="truncate text-sm font-semibold text-text-secondary">{subtitle}</p>}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-3">{rightSlot}</div>
    </header>
  );
}
