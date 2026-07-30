const DECORATIONS = [
  { emoji: "🍃", top: "18%", left: "12%", duration: "7s", delay: "0s", size: "text-3xl" },
  { emoji: "⭐", top: "28%", left: "82%", duration: "8.5s", delay: "0.6s", size: "text-2xl" },
  { emoji: "☁️", top: "12%", left: "68%", duration: "9s", delay: "0.2s", size: "text-4xl" },
  { emoji: "☁️", top: "70%", left: "18%", duration: "10s", delay: "1s", size: "text-3xl" },
  { emoji: "🍃", top: "76%", left: "78%", duration: "7.5s", delay: "1.4s", size: "text-2xl" },
  { emoji: "⭐", top: "58%", left: "6%", duration: "8s", delay: "0.8s", size: "text-xl" },
] as const;

/** 배경에서 천천히 떠다니는 잎·별·구름 장식. 아이의 시선을 뺏지 않도록 아주 느리고 은은하게 움직인다. */
export default function FloatingDecoration() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {DECORATIONS.map((item, index) => (
        <span
          key={index}
          className={`absolute select-none opacity-70 ${item.size}`}
          style={{
            top: item.top,
            left: item.left,
            animation: `float-drift ${item.duration} ease-in-out ${item.delay} infinite`,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
