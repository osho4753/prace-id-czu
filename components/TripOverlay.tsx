"use client";

import { useEffect, useState } from "react";
import { Menu, RotateCw, Plus, Minus, LocateFixed, Fuel, Search, Phone, TriangleAlert, Check, X, ArrowRight, ChevronRight, CircleParking } from "lucide-react";
import { Btn, Chip, RoundBtn, Sheet, Modal, toast, notInPrototype } from "./ui";
import { CarSide } from "./CarArt";
import SupportSheet from "./SupportSheet";
import { useLongPress, openDemo } from "./DemoMenu";
import RefuelScreen from "./RefuelScreen";
import { HelpSheet } from "./AccountScreen";
import { MODELS, kc, PARKING_PER_MIN } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { useMapUi } from "@/lib/map-ui";
import { tripStats, tripAddress, fmtClock } from "@/lib/trip";
import { nearestZonePoint } from "@/lib/zone";

export default function TripOverlay() {
  const { trip, scenarios, set } = useApp();
  const { map, target, setTarget, hint, setHint } = useMapUi();
  const [sos, setSos] = useState(false);
  const [refuel, setRefuel] = useState(false);
  const [rules, setRules] = useState(false);
  const [report, setReport] = useState(false);
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const [follow, setFollow] = useState(true);
  const demoPress = useLongPress(openDemo);
  const stats = trip ? tripStats(trip, scenarios) : null;
  const posKey = stats ? stats.pos.join(",") : "";
  const inZone = stats?.inZone ?? true;

  // keep the moving car in view
  useEffect(() => {
    if (!map || !stats || !follow || target) return;
    map.panTo(stats.pos, { animate: true, duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, posKey, follow, target]);

  useEffect(() => {
    if (!map) return;
    const off = () => setFollow(false);
    map.on("dragstart", off);
    if (!target) map.setZoom(15);
    return () => {
      map.off("dragstart", off);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (!trip || !stats) return null;
  const { car, price, km, range, parkMin } = stats;
  const totalSec = trip.simSec + trip.parkSec;
  const nearest = !inZone ? nearestZonePoint(stats.pos) : null;

  return (
    <>
      {/* ---- top status card + zone indicator ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <div {...demoPress} className="pointer-events-auto overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] select-none [-webkit-touch-callout:none]">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className={`h-10 w-1.5 shrink-0 rounded-full ${trip.parking ? "bg-amber-400" : inZone ? "bg-green-500" : "bg-sos"}`} />
            <div className="min-w-0 flex-1 text-center">
              <div className="truncate text-[15px] font-semibold">
                {MODELS[car.model].short} {car.spz} – {trip.parking ? "Parkování" : "Užívání"}:
              </div>
              <div className="text-[19px] leading-tight font-extrabold tabular-nums">
                {kc(price, 2)} <span className="text-[14px] font-medium text-muted">· {fmtClock(totalSec)} · {km.toFixed(1).replace(".", ",")} km</span>
              </div>
            </div>
          </div>
          <div
            role="status"
            aria-live="polite"
            className={`flex min-h-12 items-center gap-2.5 px-4 py-2 text-[15px] leading-tight font-bold ${inZone ? "bg-green-600 text-white" : "bg-sos text-white"}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[18px] font-black text-ink">P</span>
            {inZone ? "Zde můžete zaparkovat a ukončit pronájem" : "Mimo zónu – zde nelze ukončit"}
          </div>
        </div>
        {target && (
          <div className="pointer-events-auto mt-2 flex items-center gap-2 rounded-2xl bg-ink py-1 pr-1 pl-4 text-[14px] text-white shadow-lg">
            <CircleParking size={20} className="shrink-0 text-brand" />
            <span className="flex-1">Zelený bod = nejbližší místo v povolené zóně</span>
            <button aria-label="Skrýt" onClick={() => { setTarget(null); setFollow(true); }} className="flex h-11 w-11 items-center justify-center">
              <X size={18} />
            </button>
          </div>
        )}
        {trip.parking && (
          <div className="mt-2 rounded-2xl bg-amber-100 px-4 py-2 text-[14px] font-semibold text-amber-900 shadow">
            Parkovací režim · vůz je zamčený · {kc(PARKING_PER_MIN, 2)}/min · {Math.floor(parkMin)} min
          </div>
        )}
      </div>

      {/* ---- right column ---- */}
      <div className="absolute top-[150px] right-4 bottom-[330px] z-[500] flex flex-col items-center justify-between">
        <div className="flex flex-col items-center gap-3">
          <RoundBtn label="Menu" onClick={() => setMenu(true)}>
            <Menu size={22} />
          </RoundBtn>
          <button
            type="button"
            aria-label={inZone ? "Parkovací zóna: zde lze ukončit" : "Mimo parkovací zónu"}
            onClick={() => {
              toast(inZone ? "Jste v Domácí zóně – zde můžete pronájem ukončit." : `Mimo zónu. Nejbližší povolená zóna je ${Math.round((nearest?.distance ?? 0) / 10) * 10} m.`);
            }}
            className={`relative flex h-14 w-14 items-center justify-center rounded-full border-4 bg-white text-[26px] font-black shadow-[var(--shadow-soft)] ${inZone ? "border-green-600 text-green-700" : "border-sos text-sos"}`}
          >
            P
            <span className={`absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white ${inZone ? "bg-green-600" : "bg-sos"}`}>
              {inZone ? <Check size={15} strokeWidth={3.5} /> : <X size={15} strokeWidth={3.5} />}
            </span>
          </button>
        </div>
        <div className="flex flex-col items-center gap-3">
          <RoundBtn label="Obnovit polohu" onClick={() => { setFollow(true); setTarget(null); toast("Poloha vozu aktualizována"); }}>
            <RotateCw size={22} />
          </RoundBtn>
          <RoundBtn label="Přiblížit" onClick={() => map?.zoomIn()}>
            <Plus size={22} />
          </RoundBtn>
          <RoundBtn label="Oddálit" onClick={() => map?.zoomOut()}>
            <Minus size={22} />
          </RoundBtn>
        </div>
        <RoundBtn label="Moje poloha" onClick={() => { setFollow(true); setTarget(null); map?.flyTo(stats.pos, 16, { duration: 0.5 }); }}>
          <LocateFixed size={22} />
        </RoundBtn>
      </div>

      {/* ---- left column: SOS, fuel, search ---- */}
      <div className="absolute top-[260px] left-4 z-[500] flex flex-col items-center gap-3">
        <button
          type="button"
          aria-label="SOS – nouzová pomoc"
          onClick={() => {
            setSos(true);
          }}
          className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-sos text-white shadow-[0_4px_16px_rgb(220_38_38_/_.45)] ring-4 ring-white active:scale-95"
        >
          <Phone size={16} strokeWidth={2.6} />
          <span className="text-[13px] leading-none font-black">SOS</span>
        </button>
        <RoundBtn label="Tankování" onClick={() => setRefuel(true)}>
          <Fuel size={22} />
        </RoundBtn>
        <RoundBtn label="Hledat místo" onClick={() => notInPrototype()}>
          <Search size={22} />
        </RoundBtn>
      </div>

      {/* ---- bottom sheet ---- */}
      <div className="absolute inset-x-0 bottom-0 z-[600] rounded-t-[28px] bg-white px-5 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] shadow-[var(--shadow-sheet)]">
        <CarSide model={car.model} className="mx-auto -mt-[62px] h-[78px] w-44" />
        <div className="mx-auto -mt-1 mb-2 h-1.5 w-10 rounded-full bg-gray-300" />
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[19px] font-bold">{MODELS[car.model].name.replace(" Hybrid", "")}</h2>
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-[16px] font-bold">{car.spz}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[14px]">
          <div className="text-[17px] leading-tight font-extrabold">
            {range}
            <br />
            km
          </div>
          <ArrowRight size={18} className="shrink-0" />
          <Fuel size={26} className="shrink-0" />
          <span className="text-muted">{tripAddress(trip, scenarios)}</span>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <Chip onClick={() => setRefuel(true)}>
            NATANKOVAT
          </Chip>
          <Chip onClick={() => setRules(true)}>
            PRAVIDLA
          </Chip>
          <Chip onClick={() => setReport(true)}>
            <TriangleAlert size={16} className="text-amber-600" /> NAHLÁSIT
          </Chip>
        </div>
        <Btn
          variant="outline"
          size="lg"
          className="mt-3 w-full"
         
          onClick={() => {
            set({ trip: { ...trip, parking: !trip.parking } });
            toast(trip.parking ? "Jízda pokračuje – vůz je odemčený" : "Parkovací režim zapnut – vůz je zamčený");
          }}
        >
          {trip.parking ? "Pokračovat v jízdě" : "Přepnout do parkování"}
        </Btn>
        <Btn size="lg" className="mt-2.5 w-full" onClick={() => set({ phase: "ending" })}>
          Ukončit pronájem
        </Btn>
      </div>

      <SupportSheet open={sos} onClose={() => setSos(false)} sos />
      {refuel && <RefuelScreen onClose={() => setRefuel(false)} />}
      <RulesSheet open={rules} onClose={() => setRules(false)} />
      <ReportSheet open={report} onClose={() => setReport(false)} />
      <TripMenu
        open={menu}
        onClose={() => setMenu(false)}
        onRules={() => { setMenu(false); setRules(true); }}
        onHelp={() => { setMenu(false); setHelp(true); }}
        onSupport={() => { setMenu(false); setSos(true); }}
      />
      <HelpSheet open={help} onClose={() => setHelp(false)} />

      {hint && (
        <Modal z={1450}>
          <div className="mx-auto flex h-16 w-28 items-center justify-center rounded-xl bg-ink font-mono text-[20px] font-black tracking-widest text-green-400">READY</div>
          <h2 className="mt-4 text-center text-[20px] font-bold">Hybridní vůz startuje potichu</h2>
          <p className="mt-2 text-center text-[16px] text-muted">
            Sešlápněte brzdu a stiskněte START. Motor nemusí být slyšet – sledujte kontrolku <strong className="text-ink">READY</strong> na palubní desce.
          </p>
          <Btn size="lg" className="mt-5 w-full" onClick={() => setHint(false)}>
            Rozumím
          </Btn>
        </Modal>
      )}
    </>
  );
}

function RulesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Pravidla užívání">
      <ul className="list-disc space-y-2 pl-5 pb-2 text-[16px]">
        <li>Pronájem lze ukončit jen v Domácí zóně (zelená plocha na mapě) na místě, kde je parkování povoleno.</li>
        <li>Neukončujte jízdu v podzemních garážích – vůz tam nemá GPS signál.</li>
        <li>Před ukončením zavřete všechny dveře, kufr a okna a vyfoťte vůz ze 4 stran.</li>
        <li>Pokud palivo klesne pod 20 %, natankujte kartou CCS ve voze – získáte 30 min zdarma.</li>
        <li>Ve voze se nekouří a zvířata převážejte jen v přepravce.</li>
        <li>Maximální rychlost dle předpisů, pokuty jsou přeúčtovány řidiči.</li>
      </ul>
    </Sheet>
  );
}

function ReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = ["Poškození vozu", "Znečištěný interiér", "Chybí doklady / karta CCS", "Kontrolka na palubní desce", "Jiný problém"];
  return (
    <Sheet open={open} onClose={onClose} title="Nahlásit problém">
      <div className="flex flex-col gap-2 pb-2">
        {items.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              toast("Děkujeme, hlášení bylo odesláno podpoře");
              onClose();
            }}
            className="flex min-h-14 items-center justify-between rounded-2xl bg-gray-50 px-4 text-left text-[16px] font-semibold active:bg-gray-100"
          >
            {i} <ChevronRight size={20} className="text-muted" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function TripMenu({ open, onClose, onRules, onHelp, onSupport }: { open: boolean; onClose: () => void; onRules: () => void; onHelp: () => void; onSupport: () => void }) {
  const rows: [string, () => void][] = [
    ["Pravidla užívání", onRules],
    ["Nápověda a FAQ", onHelp],
    ["Kontaktovat podporu", onSupport],
    ["Nastavení", () => notInPrototype()],
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Menu">
      <div className="flex flex-col gap-2 pb-2">
        {rows.map(([label, fn]) => (
          <button key={label} type="button" onClick={() => { fn(); }} className="flex min-h-14 items-center justify-between rounded-2xl bg-gray-50 px-4 text-left text-[16px] font-semibold">
            {label} <ChevronRight size={20} className="text-muted" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}
