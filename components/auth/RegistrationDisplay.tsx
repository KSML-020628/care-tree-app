const REGISTRATION_LENGTH = 6;

interface RegistrationDisplayProps {
  value: string;
}

/** 입력한 등록번호를 큰 숫자 칸으로 보여준다. 아직 입력하지 않은 칸은 옅은 원으로 표시한다. */
export default function RegistrationDisplay({ value }: RegistrationDisplayProps) {
  const digits = value.split("");

  return (
    <div className="flex justify-center gap-3" role="status" aria-label={`등록번호 ${digits.length}자리 입력했어요`}>
      {Array.from({ length: REGISTRATION_LENGTH }).map((_, index) => {
        const digit = digits[index];
        return (
          <div
            key={index}
            className={[
              "flex h-16 w-14 items-center justify-center rounded-2xl text-3xl font-extrabold",
              digit
                ? "bg-primary-blue text-white shadow-[0_4px_0_rgba(56,84,216,0.5)]"
                : "bg-white text-primary-blue-light border-2 border-dashed border-[#C7D2FF]",
            ].join(" ")}
            aria-hidden="true"
          >
            {digit ?? ""}
          </div>
        );
      })}
    </div>
  );
}
