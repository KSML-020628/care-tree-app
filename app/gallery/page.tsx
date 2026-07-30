"use client";

import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import { UI_TEXT } from "@/lib/constants/ui-text";
import type { CollaborationRoom } from "@/types/room";

/** localStorage에 저장된 완성된 방 목록을 찾는다. 나중에는 Supabase 조회로 바꾸면 된다. */
function findCompletedRooms(): CollaborationRoom[] {
  if (typeof window === "undefined") return [];
  const rooms: CollaborationRoom[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith("care-tree:room:")) continue;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const room = JSON.parse(raw) as CollaborationRoom;
      if (room.status === "COMPLETED") rooms.push(room);
    } catch {
      // 손상된 데이터는 그냥 건너뛴다.
    }
  }
  return rooms;
}

export default function GalleryPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<CollaborationRoom[] | null>(null);

  useEffect(() => {
    // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 달라지지 않도록 마운트된 뒤에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setRooms(findCompletedRooms());
  }, []);

  return (
    <TabletShell>
      <PageHeader onBack={() => router.back()} title={UI_TEXT.gallery.heading} />

      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-8 py-6">
        {!rooms ? (
          <p className="text-lg font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        ) : rooms.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <TreePine aria-hidden="true" size={56} className="text-primary-blue-light" />
            <p className="text-xl font-bold text-text-secondary">{UI_TEXT.gallery.empty}</p>
            <ChildButton variant="primary" size="medium" onClick={() => router.push("/")}>
              {UI_TEXT.gallery.backHome}
            </ChildButton>
          </div>
        ) : (
          <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => router.push(`/result/${room.id}`)}
                className="flex flex-col items-center gap-2 rounded-[24px] bg-white p-6 text-center shadow-soft"
              >
                <TreePine aria-hidden="true" size={40} className="text-primary-blue" />
                <span className="font-extrabold text-text-primary">{UI_TEXT.weeklyTheme.eyebrow}</span>
                <span className="text-sm font-semibold text-text-secondary">
                  {room.participants.length}명이 함께 완성했어요
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </TabletShell>
  );
}
