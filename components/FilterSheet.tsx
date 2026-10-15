"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Sheet, Btn, Switch, toast } from "./ui";
import { CarSide } from "./CarArt";
import { MODELS, type ModelId } from "@/lib/mock-data";
import { EMPTY_FILTER, filterIsEmpty, useApp, type Filter } from "@/lib/store";
import { applyFilter } from "@/lib/filter";

const FUEL_OPTS = [0, 25, 50, 75];

export default function FilterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <FilterBody onClose={onClose} />;
}

function FilterBody({ onClose }: { onClose: () => void }) {
  const { activeFilter, savedFilter, set } = useApp();
  const [draft, setDraft] = useState<Filter>(activeFilter ?? EMPTY_FILTER);
  const [save, setSave] = useState<boolean>(!!savedFilter);
  const count = applyFilter(draft).length;

  const toggleModel = (m: ModelId) =>
    setDraft((d) => ({ ...d, models: d.models.includes(m) ? d.models.filter((x) => x !== m) : [...d.models, m] }));

  const apply = () => {
    const f = filterIsEmpty(draft) ? null : draft;
    if (save && f) {
      set({ activeFilter: f, savedFilter: f });
      toast("Filtr uložen – použije se i při příštím otevření");
    } else {
      set({ activeFilter: f, savedFilter: save ? savedFilter : null });
      if (!save && savedFilter) toast("Uložený filtr odstraněn");
    }
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title="Filtr" z={1200}>
      <h3 className="mt-1 mb-2 text-[15px] font-semibold text-muted">Model</h3>
      <div className="grid grid-cols-3 gap-2.5">
        {(Object.keys(MODELS) as ModelId[]).map((m) => {
          const on = draft.models.includes(m);
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => toggleModel(m)}
              className={`relative flex flex-col items-center rounded-2xl border-2 px-1.5 pt-2 pb-2.5 transition ${
                on ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"
              }`}
            >
              {on && (
                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
              <CarSide model={m} className="h-12 w-full" />
              <span className="mt-1 text-[14px] leading-tight font-bold">{MODELS[m].short}</span>
              <span className="text-[12px] text-muted">kufr {MODELS[m].trunkL} l</span>
            </button>
          );
        })}
      </div>

      <h3 className="mt-5 mb-2 text-[15px] font-semibold text-muted">Min. palivo</h3>
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-gray-100 p-1" role="radiogroup" aria-label="Minimální palivo">
        {FUEL_OPTS.map((v) => (
          <button
            key={v}
            role="radio"
            aria-checked={draft.minFuel === v}
            onClick={() => setDraft((d) => ({ ...d, minFuel: v }))}
            className={`min-h-11 rounded-xl text-[15px] font-semibold ${draft.minFuel === v ? "bg-white shadow" : "text-muted"}`}
          >
            {v === 0 ? "Vše" : `${v} %+`}
          </button>
        ))}
      </div>

      <div className="mt-5 flex min-h-12 items-center justify-between gap-3">
        <div>
          <div className="text-[17px] font-semibold">Velký kufr</div>
          <div className="text-[14px] text-muted">500 l a více (Corolla Combi)</div>
        </div>
        <Switch label="Velký kufr" checked={draft.bigTrunk} onChange={(v) => setDraft((d) => ({ ...d, bigTrunk: v }))} />
      </div>

      <div className="mt-4 flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-brand-50 px-4 py-3">
        <div>
          <div className="text-[17px] font-semibold">Uložit filtr</div>
          <div className="text-[14px] text-muted">Použije se automaticky při příštím otevření</div>
        </div>
        <Switch label="Uložit filtr" checked={save} onChange={(v) => { setSave(v); }} />
      </div>

      <div className="sticky bottom-0 mt-5 flex gap-3 bg-white pt-1 pb-1">
        <Btn variant="outline" className="flex-1" onClick={() => setDraft(EMPTY_FILTER)}>
          Vymazat
        </Btn>
        <Btn className="flex-[2]" onClick={apply} disabled={count === 0}>
          Použít filtr ({count})
        </Btn>
      </div>
    </Sheet>
  );
}
