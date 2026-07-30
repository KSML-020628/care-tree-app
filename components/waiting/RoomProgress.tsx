import { UI_TEXT } from "@/lib/constants/ui-text";

interface RoomProgressProps {
  submittedCount: number;
  totalCount: number;
}

/** 대기실 하단에서 지금 몇 명이 함께하고 있는지 보여준다. */
export default function RoomProgress({ submittedCount, totalCount }: RoomProgressProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="h-3 w-full max-w-md overflow-hidden rounded-full bg-[#E4E9FB]">
        <div
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${(submittedCount / totalCount) * 100}%` }}
        />
      </div>
      <p className="text-lg font-bold text-text-primary">{UI_TEXT.waitingRoom.footerCount(totalCount)}</p>
      <p className="text-sm font-semibold text-text-secondary">{UI_TEXT.waitingRoom.footerNote}</p>
    </div>
  );
}
