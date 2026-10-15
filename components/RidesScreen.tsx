"use client";

import { ArrowDown } from "lucide-react";
import { ScreenHeader } from "./ui";
import { CarSide } from "./CarArt";
import { kc, MODELS, PAST_RIDES } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

export default function RidesScreen() {
  const rides = useApp((s) => s.rides);
  const all = [...rides, ...PAST_RIDES];
  return (
    <div className="absolute inset-x-0 top-0 bottom-[68px] z-[700] flex flex-col bg-gray-50">
      <ScreenHeader title="Jízdy" />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {all.map((r) => (
          <article key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[13px] text-muted">
                  {new Date(r.date).toLocaleDateString("cs-CZ", { day: "numeric", month: "long" })} ·{" "}
                  {new Date(r.date).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-[16px] font-bold">
                  {MODELS[r.model].short} · {r.spz}
                </div>
              </div>
              <CarSide model={r.model} className="h-10 w-20" />
            </div>
            <div className="mt-2 text-[14px]">
              <div className="truncate">{r.from}</div>
              <ArrowDown size={14} className="my-0.5 text-muted" />
              <div className="truncate">{r.to}</div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-[14px] text-muted">
              <span>
                {r.minutes} min · {r.km.toLocaleString("cs-CZ")} km · {r.tariff}
              </span>
              <span className="text-[17px] font-bold text-ink">{kc(r.price, r.price % 1 ? 2 : 0)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
