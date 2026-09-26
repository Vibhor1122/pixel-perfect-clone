import type { ReactNode } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl bg-card/70 px-3.5 py-3 text-[14px] text-foreground ring-hairline outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring";

export function PrimaryButton({
  children,
  type = "button",
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full bg-primary py-3 text-[14px] font-medium text-primary-foreground shadow-frost-sm transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
