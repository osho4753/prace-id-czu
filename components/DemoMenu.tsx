"use client";

import { useRef } from "react";
import { RotateCcw, X } from "lucide-react";
import { Switch, toast } from "./ui";
import { useApp, type Scenarios } from "@/lib/store";
import { useMapUi } from "@/lib/map-ui";
import { USER_POS } from "@/lib/mock-data";

export const openDemo = () => useMapUi.setState({ demoOpen: true });

/** Long press (~0.8 s) handlers for a hidden trigger. */
export function useLongPress(onLongPress: () => void, ms = 800) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return {
    onPointerDown: () => {
      clear();
      timer.current = setTimeout(() => {
        timer.current = null;
        try {
          navigator.vibrate?.(30);
        } catch {
          /* not supported */
        }
        onLongPress();
      }, ms);
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}

const TOGGLES: [string, (s: Scenarios) => boolean, (on: boolean) => Partial<Scenarios>][] = [
  ["Auto mimo zónu", (s) => s.outOfZone, (on) => ({ outOfZone: on })],
  ["Otevřené dveře (levé zadní)", (s) => s.door === "rl", (on) => ({ door: on ? "rl" : null })],
  ["Platba zamítnuta", (s) => s.paymentDeclined, (on) => ({ paymentDeclined: on })],
];

export default function DemoMenu() {
  const open = useMapUi((s) => s.demoOpen);
  const { scenarios, set, resetPrototype } = useApp();
  if (!open) return null;
  const close = () => useMapUi.setState({ demoOpen: false });

  return (
    <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/50 p-6">
      <div role="dialog" aria-label="Demo menu" className="anim-pop w-full max-w-sm rounded-[24px] bg-slate-900 p-5 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold">Demo</h2>
          <button aria-label="Zavřít" onClick={close} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-800">
            <X size={22} />
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {TOGGLES.map(([label, get, patch]) => (
            <div key={label} className="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-slate-800 px-4">
              <span className="text-[15px]">{label}</span>
              <Switch label={label} checked={get(scenarios)} onChange={(on) => set({ scenarios: { ...scenarios, ...patch(on) } })} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            resetPrototype();
            const ui = useMapUi.getState();
            ui.setTarget(null);
            ui.setHint(false);
            ui.map?.setView(USER_POS, 14);
            close();
            toast("Prototyp resetován");
          }}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 font-semibold text-slate-900"
        >
          <RotateCcw size={18} /> Reset
        </button>
      </div>
    </div>
  );
}
