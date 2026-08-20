import { PrimaryButton } from "./PrimaryButton";

interface SignupFormProps {
  submitted: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  className?: string;
}

export function SignupForm({
  submitted,
  onSubmit,
  placeholder = "Enter your email",
  className,
}: SignupFormProps) {
  return (
    <form
      className={`flex max-w-[510px] gap-2 mt-7 ${className ?? ""}`}
      onSubmit={onSubmit}
    >
      <input
        type="email"
        required
        placeholder={placeholder}
        aria-label="Email address"
        className="h-[53px] min-w-0 flex-1 rounded-full border border-white/[0.12] bg-white/[0.055] px-[19px] text-[13px] text-white outline-none transition duration-200 placeholder:text-[#617b89] focus:border-[rgba(34,211,238,0.55)] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.06)]"
      />

      <PrimaryButton submitted={submitted}>
        {submitted ? "You're on the list!" : "Claim your map pin"}
      </PrimaryButton>
    </form>
  );
}
