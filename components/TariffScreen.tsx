"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import { Btn, ScreenHeader } from "./ui";
import { CarSide } from "./CarArt";
import { carById, MODELS, TARIFFS, kc, PARKING_PER_MIN, type TariffId } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

const DURATIONS = [10, 20, 30, 60];

export default function TariffScreen() {
  const { tariffFor, set, reserve } = useApp();
  const car = carById(tariffFor)!;
  const [mode, setMode] = useState<"minute" | "package">("minute");
  const [pkg, setPkg] = useState<TariffId>("3h");
  const [dur, setDur] = useState(20);
  const minute = TARIFFS.minute;
  const selected: TariffId = mode === "minute" ? "minute" : pkg;

  return (
    <div className="anim-fade absolute inset-0 z-[900] flex flex-col bg-white">
      <ScreenHeader title="Výběr tarifu" onBack={() => { set({ tariffFor: null }); }} />
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
          <CarSide model={car.model} className="h-12 w-24 shrink-0" />
          <div className="min-w-0">
            <div className="truncate text-[16px] font-bold">{MODELS[car.model].name}</div>
            <div className="text-[14px] text-muted">
              {car.spz} · {car.address}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-gray-100 p-1" role="tablist">
          {(["minute", "package"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
              }}
              className={`min-h-12 rounded-xl text-[16px] font-semibold ${mode === m ? "bg-white shadow" : "text-muted"}`}
            >
              {m === "minute" ? "Minutový" : "Balíčky"}
            </button>
          ))}
        </div>

        {mode === "minute" ? (
          <div className="mt-4 rounded-2xl border-2 border-brand-600 p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[18px] font-bold">Minutový</h3>
              <div className="text-[22px] font-extrabold">
                {kc(minute.perMin!, 2)}
                <span className="text-[15px] font-semibold text-muted"> / min</span>
              </div>
            </div>
            <ul className="mt-2 space-y-1 text-[15px] text-muted">
              <li>0 Kč/km do {minute.includedKm} km, poté {kc(minute.perKmOver, 2)}/km</li>
              <li>Parkování během jízdy {kc(PARKING_PER_MIN, 2)}/min</li>
            </ul>
            <div className="mt-4 text-[14px] font-semibold text-muted">Odhad ceny – jak dlouho pojedete?</div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  aria-pressed={dur === d}
                  onClick={() => setDur(d)}
                  className={`min-h-11 rounded-xl border-2 text-[15px] font-semibold ${dur === d ? "border-brand-600 bg-brand-50" : "border-gray-200"}`}
                >
                  {d} min
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-[18px]" aria-live="polite">
              Cesta {dur} min ≈ <strong>{kc(Math.round(dur * minute.perMin!))}</strong>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3" role="radiogroup" aria-label="Balíčky">
            {(["3h", "24h"] as const).map((id) => {
              const t = TARIFFS[id];
              const on = pkg === id;
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setPkg(id);
                  }}
                  className={`relative rounded-2xl border-2 p-4 text-left ${on ? "border-brand-600 bg-brand-50" : "border-gray-200"}`}
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-[18px] font-bold">{id === "3h" ? "3 hodiny" : "24 hodin"}</h3>
                    <div className="text-[22px] font-extrabold">{kc(t.fixed!)}</div>
                  </div>
                  <p className="mt-1 text-[15px] text-muted">
                    Fixní cena · {t.includedKm} km v ceně, každý další km {kc(t.perKmOver, 2)}
                  </p>
                  <p className="mt-1 text-[15px]">
                    Např. {id === "3h" ? "120 km" : "300 km"} ≈{" "}
                    <strong>{kc(t.fixed! + Math.max(0, (id === "3h" ? 120 : 300) - t.includedKm) * t.perKmOver)}</strong>
                  </p>
                  {on && (
                    <span className="absolute top-3 right-3 hidden h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check size={16} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-4 flex gap-2 text-[14px] text-muted">
          <Info size={18} className="shrink-0" />
          Rezervace je zdarma. Platit začnete až po odemknutí vozu. Tarif nelze během jízdy změnit.
        </p>
      </div>
      <div className="border-t border-gray-100 px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="mb-2 text-center text-[14px] text-muted">
          Vybráno: <strong className="text-ink">{TARIFFS[selected].name}</strong>
        </div>
        <Btn size="lg" className="w-full" onClick={() => reserve(car.id, selected)}>
          Rezervovat zdarma na 20 min
        </Btn>
      </div>
    </div>
  );
}
