"use client";

import { create } from "zustand";
import { useEffect, type ReactNode, type ButtonHTMLAttributes } from "react";
import { X } from "lucide-react";

// ---------- Toast ----------

interface ToastState {
  msg: string | null;
  id: number;
  show: (msg: string) => void;
}
export const useToast = create<ToastState>((set, get) => ({
  msg: null,
  id: 0,
  show: (msg) => set({ msg, id: get().id + 1 }),
}));
export const toast = (msg: string) => useToast.getState().show(msg);
export const notInPrototype = () => toast("Tato funkce není v prototypu dostupná");

export function Toaster() {
  const { msg, id } = useToast();
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => useToast.setState({ msg: null }), 2600);
    return () => clearTimeout(t);
  }, [msg, id]);
  if (!msg) return null;
  return (
    <div className="pointer-events-none absolute inset-x-4 top-[max(84px,env(safe-area-inset-top))] z-[2600] flex justify-center" role="status" aria-live="polite">
      <div key={id} className="anim-fade rounded-2xl bg-ink/90 px-4 py-3 text-center text-[15px] font-medium text-white shadow-lg">
        {msg}
      </div>
    </div>
  );
}

// ---------- Buttons ----------

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger" | "dark";
  size?: "md" | "lg";
};

export function Btn({ variant = "primary", size = "md", className = "", ...rest }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:active:scale-100 select-none";
  const sizes = { md: "min-h-12 px-4 text-[16px]", lg: "min-h-14 px-5 text-[18px]" };
  const variants = {
    primary: "bg-brand text-ink shadow-sm hover:brightness-95",
    outline: "border-2 border-brand bg-white text-ink hover:bg-brand-50",
    ghost: "bg-transparent text-brand-700 hover:bg-brand-50",
    danger: "bg-sos text-white hover:brightness-95",
    dark: "bg-ink text-white",
  };
  return (
    <button
      type="button"
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    />
  );
}

export function RoundBtn({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-[var(--shadow-soft)] transition active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

export function Chip({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-brand px-3.5 text-[13px] font-bold tracking-wide text-ink active:bg-brand-50"
    >
      {children}
    </button>
  );
}

// ---------- Sheet & modal ----------

export function Sheet({
  open,
  onClose,
  title,
  children,
  z = 1000,
  full,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  z?: number;
  full?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ zIndex: z }}>
      <button aria-label="Zavřít" className="anim-fade absolute inset-0 bg-black/35" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`anim-sheet relative flex flex-col rounded-t-[28px] bg-white shadow-[var(--shadow-sheet)] ${full ? "h-[92%]" : "max-h-[88%]"}`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-gray-300" />
        {title && (
          <div className="flex shrink-0 items-center justify-between px-5 pt-2 pb-1">
            <h2 className="text-[20px] font-bold">{title}</h2>
            <button aria-label="Zavřít" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100">
              <X size={22} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

export function Modal({ children, z = 1500, onBackdrop }: { children: ReactNode; z?: number; onBackdrop?: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6" style={{ zIndex: z }}>
      <div className="anim-fade absolute inset-0 bg-black/40" onClick={onBackdrop} />
      <div role="dialog" aria-modal="true" className="anim-pop relative w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({
  title,
  text,
  yes,
  no,
  onYes,
  onNo,
  danger,
}: {
  title: string;
  text?: string;
  yes: string;
  no: string;
  onYes: () => void;
  onNo: () => void;
  danger?: boolean;
}) {
  return (
    <Modal onBackdrop={onNo}>
      <h2 className="text-[20px] font-bold">{title}</h2>
      {text && <p className="mt-2 text-[15px] text-muted">{text}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Btn variant="outline" onClick={onNo}>
          {no}
        </Btn>
        <Btn variant={danger ? "danger" : "primary"} onClick={onYes}>
          {yes}
        </Btn>
      </div>
    </Modal>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? "bg-brand-600" : "bg-gray-300"}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? "left-7" : "left-1"}`} />
    </button>
  );
}

export function FuelBar({ value }: { value: number }) {
  const low = value < 20;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Palivo">
        <div className={`h-full rounded-full ${low ? "bg-amber-500" : "bg-brand-600"}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`w-11 text-right text-[15px] font-semibold ${low ? "text-amber-700" : ""}`}>{value} %</span>
    </div>
  );
}

export function ScreenHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex min-h-14 shrink-0 items-center gap-1 border-b border-gray-100 px-2 pt-[env(safe-area-inset-top)]">
      {onBack ? (
        <button onClick={onBack} aria-label="Zpět" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      ) : (
        <span className="w-3" />
      )}
      <h1 className="flex-1 text-[19px] font-bold">{title}</h1>
      {right}
    </div>
  );
}
