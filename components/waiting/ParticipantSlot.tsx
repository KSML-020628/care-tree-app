import { CheckCircle2, PenLine } from "lucide-react";
import { UI_TEXT } from "@/lib/constants/ui-text";
import type { ParticipantStatus, RoomParticipant } from "@/types/room";

interface ParticipantSlotProps {
  participant: RoomParticipant;
  isMe: boolean;
}

const STATUS_LABEL: Record<ParticipantStatus, string> = {
  WAITING: UI_TEXT.waitingRoom.statusWaiting,
  DRAWING: UI_TEXT.waitingRoom.statusDrawing,
  SUBMITTED: UI_TEXT.waitingRoom.statusSubmitted,
};

const STATUS_STYLE: Record<ParticipantStatus, string> = {
  WAITING: "bg-[#F0F3FF] text-text-secondary",
  DRAWING: "bg-primary-blue-light/25 text-primary-blue-dark",
  SUBMITTED: "bg-[#E4F8EC] text-success",
};

/** 대기실의 한 칸. 닉네임·아바타·상태를 아이콘과 글자로 함께 보여줘서 색만으로 구분하지 않는다. */
export default function ParticipantSlot({ participant, isMe }: ParticipantSlotProps) {
  return (
    <div
      className={[
        "flex flex-1 items-center gap-4 rounded-[24px] bg-white p-5 shadow-soft transition-transform",
        participant.status === "SUBMITTED" ? "scale-[1.01]" : "",
      ].join(" ")}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F0F3FF] text-3xl">
        {participant.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={participant.thumbnail} alt="" className="h-full w-full rounded-2xl object-cover" />
        ) : (
          <span aria-hidden="true">{participant.avatar}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-extrabold text-text-primary">
          {participant.nickname}
          {isMe && <span className="ml-1 text-sm font-bold text-primary-blue">(나)</span>}
        </p>
        <span
          className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${STATUS_STYLE[participant.status]}`}
        >
          {participant.status === "SUBMITTED" ? (
            <CheckCircle2 aria-hidden="true" size={16} />
          ) : participant.status === "DRAWING" ? (
            <PenLine aria-hidden="true" size={16} />
          ) : null}
          {STATUS_LABEL[participant.status]}
        </span>
      </div>
    </div>
  );
}
