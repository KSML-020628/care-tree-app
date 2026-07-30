"use client";

import { useRouter } from "next/navigation";
import CareHam from "@/components/mascot/CareHam";

interface CareHamHomeButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
}

const BOX_SIZE_CLASS: Record<NonNullable<CareHamHomeButtonProps["size"]>, string> = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-16 w-16",
};

/**
 * 예전 나무 로고 자리에 쓰는 케어햄 버튼. 상단 헤더·로그인 화면 등에서 "메인으로 가기" 용도로 쓴다.
 * onClick을 안 주면 기본적으로 /home(진짜 홈 화면)으로 이동한다.
 */
export default function CareHamHomeButton({ onClick, ariaLabel = "메인으로 가기", size = "md" }: CareHamHomeButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }
    router.push("/home");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#DDE4FF] shadow-[0_4px_0_rgba(97,112,154,0.18)] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(97,112,154,0.18)] ${BOX_SIZE_CLASS[size]}`}
    >
      <CareHam type="GUIDE" size="XS" className="pointer-events-none" />
    </button>
  );
}
