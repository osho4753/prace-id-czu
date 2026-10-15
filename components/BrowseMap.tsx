"use client";

import { useState } from "react";
import { SlidersHorizontal, Headset, X, LocateFixed, Footprints, Sparkles, Luggage, Users, Fuel } from "lucide-react";
import { Btn, RoundBtn, FuelBar, toast } from "./ui";
import { CarSide } from "./CarArt";
import FilterSheet from "./FilterSheet";
import SupportSheet from "./SupportSheet";
import { useApp, filterIsEmpty } from "@/lib/store";
import { carById, MODELS, USER_POS, walkMinutes, rangeKm } from "@/lib/mock-data";
import { describeFilter } from "@/lib/filter";
import { distanceM } from "@/lib/zone";
import { useMapUi } from "@/lib/map-ui";
import { useLongPress, openDemo } from "./DemoMenu";

export function Logo() {
  const lp = useLongPress(openDemo);
  return (
    <button
      type="button"
      aria-label="Pojeď – sdílená auta"
      {...lp}
      className="flex min-h-12 flex-col justify-center rounded-2xl bg-white px-4 text-left shadow-[var(--shadow-soft)] select-none [-webkit-touch-callout:none]"
    >
      <span className="text-[20px] leading-none font-extrabold tracking-tight">
        Poje<span className="text-brand-600">ď</span>
      </span>
      <span className="text-[11px] leading-tight text-muted">sdílená auta</span>
    </button>
  );
}

export default function BrowseMap() {
  const { activeFilter, savedFilter, selectedCarId, set } = useApp();
  const [filterOpen, setFilterOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const map = useMapUi((s) => s.map);
  const car = carById(selectedCarId);
  const isSaved = !!savedFilter && JSON.stringify(savedFilter) === JSON.stringify(activeFilter);

  return (
    <>
      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-4 pt-[max(14px,env(safe-area-inset-top))]">
        <div className="pointer-events-auto flex items-center gap-2">
          <Logo />
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => {
              setFilterOpen(true);
            }}
            className="flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 text-[16px] font-semibold shadow-[var(--shadow-soft)]"
          >
            <SlidersHorizontal size={20} /> Filtr
            {!filterIsEmpty(activeFilter) && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
          </button>
          <RoundBtn label="Podpora" onClick={() => setSupportOpen(true)}>
            <Headset size={22} />
          </RoundBtn>
        </div>
        {activeFilter && !filterIsEmpty(activeFilter) && (
          <div className="pointer-events-auto mt-2.5 inline-flex max-w-full items-center gap-1 rounded-full bg-ink py-1 pr-1 pl-4 text-[14px] font-medium text-white shadow-lg">
            <span className="truncate">
              {isSaved ? "Uložený filtr" : "Filtr"}: {describeFilter(activeFilter)}
            </span>
            <button
              type="button"
              aria-label="Zrušit filtr"
              onClick={() => {
                set({ activeFilter: null, savedFilter: null });
                toast(isSaved ? "Filtr zrušen a odstraněn z uložených" : "Filtr zrušen");
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* locate */}
      <div className={`absolute right-4 z-[500] transition-all ${car ? "bottom-[372px]" : "bottom-24"}`}>
        <RoundBtn label="Moje poloha" onClick={() => map?.flyTo(USER_POS, 15, { duration: 0.6 })}>
          <LocateFixed size={22} />
        </RoundBtn>
      </div>

      {car && <CarDetail key={car.id} carId={car.id} onClose={() => set({ selectedCarId: null })} />}

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}

function CarDetail({ carId, onClose }: { carId: string; onClose: () => void }) {
  const car = carById(carId)!;
  const m = MODELS[car.model];
  const walk = walkMinutes(distanceM(USER_POS, car.pos));
  const set = useApp((s) => s.set);

  return (
    <div className="anim-sheet absolute inset-x-0 bottom-[68px] z-[600] rounded-t-[28px] bg-white px-5 pt-3 pb-4 shadow-[var(--shadow-sheet)]" role="dialog" aria-label={`Detail vozu ${m.name}`}>
      <div className="flex items-start justify-between">
        <CarSide model={car.model} className="-mt-12 h-[88px] w-48" />
        <button aria-label="Zavřít detail" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100">
          <X size={22} />
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <h2 className="text-[21px] leading-tight font-bold">{m.name}</h2>
        <span className="shrink-0 rounded-lg border-2 border-ink px-2 py-0.5 font-mono text-[15px] font-bold">{car.spz}</span>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex items-center gap-1.5 text-[14px] text-muted">
          <Fuel size={16} /> Palivo · dojezd cca {rangeKm(car)} km
        </div>
        <FuelBar value={car.fuel} />
        {car.fuel < 20 && <p className="mt-1 text-[13px] font-medium text-amber-700">Nízká hladina paliva – za natankování získáte bonus 30 min.</p>}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[15px]">
        <Info icon={<Footprints size={18} />} k="Pěšky" v={`${walk} min`} />
        <Info icon={<Sparkles size={18} />} k="Čistota" v={car.cleanliness} />
        <Info icon={<Luggage size={18} />} k="Kufr" v={`${car.trunkL} l`} />
        <Info icon={<Users size={18} />} k="Míst" v={String(car.seats)} />
      </dl>
      <p className="mt-2 truncate text-[14px] text-muted">{car.address}</p>
      <Btn size="lg" className="mt-3 w-full" onClick={() => set({ tariffFor: car.id })}>
        Vybrat tarif a rezervovat
      </Btn>
    </div>
  );
}

function Info({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-brand-700">{icon}</span>
      <dt className="text-muted">{k}</dt>
      <dd className="ml-auto font-semibold">{v}</dd>
    </div>
  );
}
