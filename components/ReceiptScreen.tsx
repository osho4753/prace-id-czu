"use client";

import { Check } from "lucide-react";
import { Btn } from "./ui";
import { carById, kc, MODELS, TARIFFS } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { fmtClock } from "@/lib/trip";

const time = (ts: number) => new Date(ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });

export default function ReceiptScreen() {
  const { receipt, set } = useApp();
  if (!receipt) return null;
  const car = carById(receipt.carId)!;
  const rows: [string, string][] = [
    ["Vůz", `${MODELS[car.model].name} · ${car.spz}`],
    ["Začátek", `${new Date(receipt.startedAt).toLocaleDateString("cs-CZ")} ${time(receipt.startedAt)}`],
    ["Konec", time(receipt.endedAt)],
    ["Doba jízdy", fmtClock(receipt.driveMin * 60)],
    ...(receipt.parkMin >= 1 ? ([["Parkování", fmtClock(receipt.parkMin * 60)]] as [string, string][]) : []),
    ["Ujeto", `${receipt.km.toFixed(1).replace(".", ",")} km`],
    ["Tarif", TARIFFS[receipt.tariffId].name],
    ["Zaparkováno", receipt.address],
    ["Platba", `Karta •••• ${receipt.card}`],
  ];
  return (
    <div className="anim-fade absolute inset-0 z-[950] flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto px-5 pt-[max(28px,env(safe-area-inset-top))]">
        <div className="flex flex-col items-center text-center">
          <span className="anim-pop flex h-20 w-20 items-center justify-center rounded-full bg-brand">
            <Check size={44} strokeWidth={3} />
          </span>
          <h1 className="mt-4 text-[26px] font-extrabold">Pronájem ukončen</h1>
          <p className="text-[16px] text-muted">Vůz je zamčený. Děkujeme, že jezdíte s Pojeď.</p>
        </div>
        <div className="mt-6 rounded-2xl border border-gray-200 p-4">
          <h2 className="text-[17px] font-bold">Účtenka</h2>
          <dl className="mt-2 divide-y divide-gray-100 text-[15px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink pt-3">
            <span className="text-[18px] font-bold">Celkem</span>
            <span className="text-[26px] font-extrabold">{kc(receipt.price, 2)}</span>
          </div>
          <p className="mt-1 text-right text-[13px] text-muted">vč. DPH 21 %</p>
        </div>
      </div>
      <div className="px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <Btn size="lg" className="w-full" onClick={() => set({ phase: "browse", tab: "map", receipt: null })}>
          Hotovo
        </Btn>
      </div>
    </div>
  );
}
