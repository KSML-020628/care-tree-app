"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import ParticipantSlot from "@/components/waiting/ParticipantSlot";
import RoomProgress from "@/components/waiting/RoomProgress";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { readRoom, startMockFriendProgress } from "@/lib/mock/room";
import { useSessionStore } from "@/lib/store/session-store";
import type { CollaborationRoom } from "@/types/room";

const COMPLETE_REDIRECT_DELAY_MS = 1600;

export default function WaitingRoomPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const [room, setRoom] = useState<CollaborationRoom | null>(null);

  useEffect(() => {
    // localStorage는 브라우저에만 있으므로, 서버 렌더링과 다른 내용이 그려지지 않도록
    // 방 정보는 항상 마운트된 뒤(useEffect 안)에만 읽어 온다.
    const loaded = readRoom(params.roomId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setRoom(loaded);
  }, [params.roomId]);

  useEffect(() => {
    if (!room) return;
    const stop = startMockFriendProgress(room.id, (nextRoom) => setRoom(nextRoom));
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  useEffect(() => {
    if (room?.status !== "COMPLETED") return;
    const timer = window.setTimeout(() => {
      router.push(`/result/${room.id}`);
    }, COMPLETE_REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [room?.status, room?.id, router]);

  if (!room) {
    return (
      <TabletShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  const submittedCount = room.participants.filter((participant) => participant.status === "SUBMITTED").length;

  return (
    <TabletShell background="sky">
      <PageHeader title={UI_TEXT.waitingRoom.heading} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 pb-8">
        <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
          {room.participants.map((participant) => (
            <ParticipantSlot
              key={participant.userId}
              participant={participant}
              isMe={participant.userId === user?.id}
            />
          ))}
        </div>

        <div className="w-full max-w-md">
          <RoomProgress submittedCount={submittedCount} totalCount={room.participants.length} />
        </div>
      </div>
    </TabletShell>
  );
}
