"use client";

import { useRef, useState } from "react";
import { ChevronsRight } from "lucide-react";

export default function SlideToConfirm({ label, onComplete }: { label: string; onComplete: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const start = useRef(0);
  const KNOB = 60;

  const max = () => (track.current ? track.current.clientWidth - KNOB - 8 : 1);

  const end = () => {
    setDrag(false);
    if (x >= max() * 0.88) {
      setX(max());
      onComplete();
    } else setX(0);
  };

  return (
    <div
      ref={track}
      className="relative h-[68px] w-full touch-none overflow-hidden rounded-full bg-brand-100 select-none"
      onPointerMove={(e) => {
        if (!drag) return;
        setX(Math.max(0, Math.min(max(), e.clientX - start.current)));
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: x + KNOB + 8, transition: drag ? "none" : "width .2s" }} />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center pl-14 text-[16px] font-bold text-ink">{label}</span>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((x / max()) * 100)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "End") {
            setX(max());
            onComplete();
          }
        }}
        onPointerDown={(e) => {
          (e.currentTarget.parentElement as HTMLElement).setPointerCapture(e.pointerId);
          start.current = e.clientX - x;
          setDrag(true);
        }}
        className="absolute top-1 left-1 flex h-[60px] w-[60px] cursor-grab items-center justify-center rounded-full bg-white shadow-md active:cursor-grabbing"
        style={{ transform: `translateX(${x}px)`, transition: drag ? "none" : "transform .2s" }}
      >
        <ChevronsRight size={30} className="text-brand-700" />
      </div>
    </div>
  );
}
