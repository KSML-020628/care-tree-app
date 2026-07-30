"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { useSessionStore } from "@/lib/store/session-store";
import ConfirmModal from "./ConfirmModal";

/** 헤더 rightSlot에 넣는 로그아웃 버튼. 실수로 눌러도 바로 나가지 않도록 확인창을 거친다. */
export default function LogoutButton() {
  const router = useRouter();
  const logout = useSessionStore((state) => state.logout);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={UI_TEXT.common.logout}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-text-secondary shadow-[0_4px_0_rgba(97,112,154,0.18)] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(97,112,154,0.18)]"
      >
        <LogOut aria-hidden="true" size={24} strokeWidth={2.6} />
      </button>

      <ConfirmModal
        open={open}
        title={UI_TEXT.common.logoutConfirmTitle}
        body={UI_TEXT.common.logoutConfirmBody}
        confirmLabel={UI_TEXT.common.logout}
        danger
        onConfirm={() => {
          logout();
          router.replace("/login");
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
