"use client";

import { useState } from "react";
import { Camera, Check, ImagePlus, Gift } from "lucide-react";
import { Btn, ScreenHeader } from "./ui";
import { CCS_PIN } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { placeholderPhoto } from "@/lib/placeholder";

export default function RefuelScreen({ onClose }: { onClose: () => void }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [state, setState] = useState<"form" | "sending" | "done">("form");

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setPhoto(URL.createObjectURL(f));
  };

  const submit = () => {
    setState("sending");
    setTimeout(() => {
      useApp.setState((s) => ({ bonusMinutes: s.bonusMinutes + 30 }));
      setState("done");
    }, 1400);
  };

  return (
    <div className="anim-fade absolute inset-0 z-[1100] flex flex-col bg-white">
      <ScreenHeader title="Tankování" onBack={onClose} />
      {state === "done" ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center" role="status">
          <span className="anim-pop flex h-24 w-24 items-center justify-center rounded-full bg-brand">
            <Gift size={48} />
          </span>
          <h2 className="mt-5 text-[26px] font-extrabold">Bonus +30 min připsán</h2>
          <p className="mt-2 text-[16px] text-muted">Děkujeme za natankování. Bonusové minuty najdete v sekci Účet.</p>
          <Btn size="lg" className="mt-8 w-full" onClick={onClose}>
            Zpět k jízdě
          </Btn>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <div className="mt-4 rounded-2xl bg-ink p-4 text-white">
              <div className="text-[14px] opacity-80">PIN k tankovací kartě CCS (ve slunečníku řidiče)</div>
              <div className="mt-1 font-mono text-[40px] font-black tracking-[.3em]" aria-label={`PIN ${CCS_PIN.split("").join(" ")}`}>
                {CCS_PIN}
              </div>
            </div>
            <ol className="mt-5 space-y-4">
              {[
                ["Natankujte benzín Natural 95", "Tankujte do plna na kterékoli čerpací stanici akceptující CCS."],
                ["Zaplaťte kartou CCS", "Při platbě zadejte PIN výše. Nic neplatíte ze svého."],
                ["Vyfoťte účtenku", "Po nahrání účtenky vám připíšeme 30 minut zdarma."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{i + 1}</span>
                  <div>
                    <div className="text-[17px] font-bold">{t}</div>
                    <div className="text-[15px] text-muted">{d}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5">
              {photo ? (
                <div className="relative overflow-hidden rounded-2xl border-2 border-brand-600">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="Fotka účtenky" className="h-44 w-full object-cover" />
                  <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-[13px] font-bold text-white">
                    <Check size={14} /> Účtenka nahrána
                  </span>
                  <label className="absolute right-2 bottom-2 flex min-h-11 cursor-pointer items-center gap-1 rounded-xl bg-white px-3 text-[14px] font-semibold shadow">
                    <Camera size={16} /> Vyfotit znovu
                    <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-600 bg-brand-50 text-[15px] font-semibold">
                    <Camera size={26} /> Vyfotit účtenku
                    <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(placeholderPhoto("Účtenka"));
                    }}
                    className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-gray-300 text-[15px] font-semibold text-muted"
                  >
                    <ImagePlus size={26} /> Simulovat snímek
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-100 px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
            <Btn size="lg" className="w-full" disabled={!photo || state === "sending"} onClick={submit}>
              {state === "sending" ? "Odesílám účtenku…" : photo ? "Odeslat účtenku" : "Nejdřív vyfoťte účtenku"}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
