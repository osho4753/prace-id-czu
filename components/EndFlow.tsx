"use client";

import { useEffect, useState } from "react";
import { Camera, Check, LoaderCircle, MapPin, X, CreditCard, ImagePlus, RotateCcw, Lock } from "lucide-react";
import { Btn, ScreenHeader, Sheet, toast } from "./ui";
import { CarTop, DOOR_LABEL } from "./CarArt";
import SlideToConfirm from "./SlideToConfirm";
import { useApp } from "@/lib/store";
import { tripStats, tripAddress, fmtClock } from "@/lib/trip";
import { nearestZonePoint } from "@/lib/zone";
import { useMapUi } from "@/lib/map-ui";
import { kc, MODELS, TARIFFS } from "@/lib/mock-data";
import { placeholderPhoto } from "@/lib/placeholder";

type Side = "front" | "left" | "right" | "back";
const SIDES: Record<Side, string> = { front: "Přední část", left: "Levý bok", right: "Pravý bok", back: "Zadní část" };

type Step =
  | { s: "slide" }
  | { s: "checking"; idx: number }
  | { s: "err_zone"; dist: number }
  | { s: "err_door" }
  | { s: "photos" }
  | { s: "paying" }
  | { s: "err_declined" };

const CHECKS = ["Poloha v povolené zóně", "Signál GPS", "Dveře a kufr zavřené"];

export default function EndFlow() {
  const { trip, scenarios, setScenario, set, card, finishTrip } = useApp();
  const [step, setStep] = useState<Step>({ s: "slide" });
  const [photos, setPhotos] = useState<Partial<Record<Side, string>>>({});
  const [note, setNote] = useState("");

  const stats = trip ? tripStats(trip, scenarios) : null;

  // ---- lock checks (zone → GPS → doors) ----
  useEffect(() => {
    if (step.s !== "checking" || !stats) return;
    const t = setTimeout(() => {
      const sc = useApp.getState().scenarios;
      if (step.idx === 0 && !stats.inZone) {
        const d = Math.round(nearestZonePoint(stats.pos).distance / 10) * 10;
        return setStep({ s: "err_zone", dist: d });
      }
      if (step.idx === 2 && sc.door) {
        return setStep({ s: "err_door" });
      }
      if (step.idx < CHECKS.length - 1) setStep({ s: "checking", idx: step.idx + 1 });
      else setStep({ s: "photos" });
    }, 750);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (!trip || !stats) return null;
  const totalSec = trip.simSec + trip.parkSec;

  const pay = () => {
    setStep({ s: "paying" });
    setTimeout(() => {
      const sc = useApp.getState().scenarios;
      const c = useApp.getState().card;
      if (sc.paymentDeclined && c === "4242") {
        return setStep({ s: "err_declined" });
      }
      const endedAt = Date.now();
      const address = tripAddress(trip, scenarios);
      const price = Math.round(stats.price * 100) / 100;
      finishTrip(
        {
          carId: trip.carId,
          tariffId: trip.tariffId,
          startedAt: trip.startedAt,
          endedAt,
          driveMin: stats.driveMin,
          parkMin: stats.parkMin,
          km: stats.km,
          price,
          card: c,
          address,
        },
        {
          id: `u${endedAt}`,
          date: new Date(endedAt).toISOString(),
          model: stats.car.model,
          spz: stats.car.spz,
          from: stats.car.address,
          to: address,
          minutes: Math.max(1, Math.round(totalSec / 60)),
          km: Math.round(stats.km * 10) / 10,
          tariff: TARIFFS[trip.tariffId].name,
          price,
        },
      );
    }, 1800);
  };

  const backToTrip = () => set({ phase: "trip" });

  return (
    <div className="anim-fade absolute inset-0 z-[950] flex flex-col bg-white">
      <ScreenHeader
        title={step.s === "photos" ? "Kontrola vozu – Foto" : "Ukončení pronájmu"}
        onBack={step.s === "paying" || step.s === "checking" ? undefined : () => { step.s === "photos" ? setStep({ s: "slide" }) : backToTrip(); }}
      />

      {step.s === "slide" && (
        <div className="flex flex-1 flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <div className="text-[15px] text-muted">
              {MODELS[stats.car.model].name} · {stats.car.spz}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <Stat k="Čas" v={fmtClock(totalSec)} />
              <Stat k="Vzdálenost" v={`${stats.km.toFixed(1).replace(".", ",")} km`} />
              <Stat k="Cena" v={kc(stats.price, 2)} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[15px]">
              <MapPin size={18} className="text-brand-700" /> {tripAddress(trip, scenarios)}
            </div>
            <div className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-semibold ${stats.inZone ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
              {stats.inZone ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
              {stats.inZone ? "V povolené zóně – zde lze ukončit" : "Mimo zónu – zde nelze ukončit"}
            </div>
          </div>
          <h3 className="mt-5 text-[17px] font-bold">Než ukončíte:</h3>
          <ul className="mt-2 space-y-2 text-[16px]">
            {["Zaparkujte v povolené zóně, ne v podzemní garáži", "Zavřete všechny dveře, kufr a okna", "Vezměte si své věci a klíčky nechte ve voze", "Připravte se vyfotit vůz ze 4 stran"].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check size={20} className="mt-0.5 shrink-0 text-brand-700" /> {t}
              </li>
            ))}
          </ul>
          <div className="flex-1" />
          <SlideToConfirm
            label="Posuňte pro ukončení pronájmu"
            onComplete={() => {
              setStep({ s: "checking", idx: 0 });
            }}
          />
          <Btn variant="ghost" className="mt-2 w-full" onClick={backToTrip}>
            Zpět k jízdě
          </Btn>
        </div>
      )}

      {step.s === "checking" && (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <LoaderCircle size={72} className="animate-spin text-brand-600" strokeWidth={1.6} />
          <h2 className="mt-4 text-[22px] font-bold">Kontroluji vůz…</h2>
          <ol className="mt-5 w-full max-w-xs space-y-2.5 text-[16px]">
            {CHECKS.map((c, i) => (
              <li key={c} className={`flex items-center gap-3 ${i > step.idx ? "text-gray-400" : ""}`}>
                {i < step.idx ? (
                  <Check size={20} className="text-green-700" strokeWidth={3} />
                ) : i === step.idx ? (
                  <LoaderCircle size={20} className="animate-spin text-brand-700" />
                ) : (
                  <span className="mx-1.5 h-2 w-2 rounded-full bg-gray-300" />
                )}
                {c}
              </li>
            ))}
          </ol>
        </div>
      )}

      {step.s === "err_zone" && (
        <ErrorPanel
          icon={<MapPin size={44} />}
          title="Zde nelze ukončit"
          text={`Vůz stojí mimo Domácí zónu. Nejbližší povolená zóna je ${step.dist} m.`}
        >
          <Btn
            size="lg"
            className="w-full"
           
            onClick={() => {
              const n = nearestZonePoint(stats.pos);
              const ui = useMapUi.getState();
              ui.setTarget(n.point);
              backToTrip();
              setTimeout(() => ui.map?.flyToBounds([stats.pos, n.point], { paddingTopLeft: [100, 260], paddingBottomRight: [100, 360], maxZoom: 16, duration: 0.6 }), 80);
            }}
          >
            Ukázat na mapě
          </Btn>
          <Btn variant="outline" className="mt-2.5 w-full" onClick={backToTrip}>
            Zpět k jízdě
          </Btn>
        </ErrorPanel>
      )}

      {step.s === "err_door" && scenarios.door && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center" role="alert">
          <CarTop open={scenarios.door} className="h-64" />
          <h2 className="mt-4 text-[24px] font-extrabold">Nelze zamknout.</h2>
          <p className="mt-1 text-[19px]">{DOOR_LABEL[scenarios.door].close}</p>
          <p className="mt-2 text-[14px] text-muted">Otevřené místo je na schématu vyznačeno červeně.</p>
          <Btn
            size="lg"
            className="mt-6 w-full"
           
            onClick={() => {
              setScenario("door", null); // the user closed the door
              setStep({ s: "checking", idx: 2 });
            }}
          >
            <RotateCcw size={20} /> Zkusit znovu
          </Btn>
        </div>
      )}

      {step.s === "photos" && (
        <PhotoStep
          photos={photos}
          setPhotos={setPhotos}
          note={note}
          setNote={setNote}
          onSend={() => {
            pay();
          }}
        />
      )}

      {step.s === "paying" && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center" role="status">
          <LoaderCircle size={72} className="animate-spin text-brand-600" strokeWidth={1.6} />
          <h2 className="mt-4 text-[22px] font-bold">Zamykám vůz a zpracovávám platbu…</h2>
          <p className="mt-2 flex items-center gap-2 text-[16px] text-muted">
            <CreditCard size={20} /> Platba kartou •••• {card}
          </p>
          <p className="mt-1 text-[22px] font-extrabold">{kc(stats.price, 2)}</p>
        </div>
      )}

      {step.s === "err_declined" && <DeclinedPanel onRetry={pay} />}

    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[13px] text-muted">{k}</div>
      <div className="text-[17px] font-bold tabular-nums">{v}</div>
    </div>
  );
}

function ErrorPanel({ icon, title, text, tone = "err", children }: { icon: React.ReactNode; title: string; text: string; tone?: "err" | "warn"; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col px-6 pb-[max(20px,env(safe-area-inset-bottom))]" role="alert">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className={`flex h-24 w-24 items-center justify-center rounded-full ${tone === "err" ? "bg-red-100 text-sos" : "bg-amber-100 text-amber-700"}`}>{icon}</span>
        <h2 className="mt-5 text-[24px] leading-tight font-extrabold">{title}</h2>
        <p className="mt-3 text-[17px] text-muted">{text}</p>
      </div>
      {children}
    </div>
  );
}

function DeclinedPanel({ onRetry }: { onRetry: () => void }) {
  const { card, set } = useApp();
  return (
    <ErrorPanel icon={<CreditCard size={44} />} title="Platba zamítnuta bankou" text={`Karta •••• ${card} byla zamítnuta – zkuste jinou kartu. Vůz je zamčený, pronájem se ukončí po úspěšné platbě.`}>
      <div className="mb-3 flex flex-col gap-2">
        {[
          ["4242", "Visa •••• 4242"],
          ["1881", "Mastercard •••• 1881"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={card === id}
            onClick={() => {
              set({ card: id });
            }}
            className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 text-left text-[16px] font-semibold ${card === id ? "border-brand-600 bg-brand-50" : "border-gray-200"}`}
          >
            <CreditCard size={20} /> {label}
            {id === "4242" && <span className="ml-auto text-[13px] font-medium text-sos">zamítnuta</span>}
            {card === id && id !== "4242" && <Check size={20} className="ml-auto text-brand-700" />}
          </button>
        ))}
      </div>
      <Btn size="lg" className="w-full" onClick={onRetry}>
        Zaplatit kartou •••• {card}
      </Btn>
    </ErrorPanel>
  );
}

function PhotoStep({
  photos,
  setPhotos,
  note,
  setNote,
  onSend,
}: {
  photos: Partial<Record<Side, string>>;
  setPhotos: (p: Partial<Record<Side, string>>) => void;
  note: string;
  setNote: (s: string) => void;
  onSend: () => void;
}) {
  const [active, setActive] = useState<Side | null>(null);
  const done = Object.keys(photos).length;

  const take = (side: Side, url: string) => {
    setPhotos({ ...photos, [side]: url });
    setActive(null);
  };

  const Tile = ({ side, className = "" }: { side: Side; className?: string }) => {
    const p = photos[side];
    return (
      <button
        type="button"
        onClick={() => {
          setActive(side);
        }}
        aria-label={p ? `${SIDES[side]} – vyfoceno, klepnutím vyfotíte znovu` : `Vyfotit: ${SIDES[side]}`}
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 text-[13px] font-bold tracking-wide uppercase ${p ? "border-brand-600" : "border-ink/70 bg-white"} ${className}`}
      >
        {p ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
              <Check size={15} strokeWidth={3} />
            </span>
            <span className="absolute inset-x-0 bottom-0 flex flex-col bg-black/60 py-1 leading-tight text-white normal-case">
              <span className="text-[12px]">{SIDES[side]}</span>
              <span className="flex items-center justify-center gap-1 text-[11px] font-medium"><Camera size={12} /> Vyfotit znovu</span>
            </span>
          </>
        ) : (
          <>
            <Camera size={28} strokeWidth={1.8} />
            <span className="mt-1">{SIDES[side]}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pb-3">
        <p className="mt-3 text-center text-[15px] text-muted">Vyfoťte vůz ze všech 4 stran. Klepnutím na fotku ji můžete pořídit znovu.</p>
        <div className="mt-3 grid grid-cols-[1fr_118px_1fr] grid-rows-[96px_220px_96px] gap-2.5">
          <Tile side="front" className="col-start-2 row-start-1 col-span-1 -mx-8" />
          <Tile side="left" className="col-start-1 row-start-2 my-8" />
          <div className="col-start-2 row-start-2 flex items-center justify-center">
            <CarTop className="h-full" />
          </div>
          <Tile side="right" className="col-start-3 row-start-2 my-8" />
          <Tile side="back" className="col-start-2 row-start-3 -mx-8" />
        </div>
        <div className="mt-3 text-center text-[15px] font-semibold" aria-live="polite">
          {done === 4 ? "Všechny fotky pořízeny ✓" : `Pořízeno ${done} ze 4`}
        </div>
      </div>
      <div className="flex gap-2 border-t border-gray-100 px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Poznámka…"
          aria-label="Poznámka"
          className="min-h-12 flex-1 rounded-2xl border-2 border-gray-200 px-4 text-[16px] outline-none focus:border-brand-600"
        />
        <Btn size="md" disabled={done < 4} onClick={onSend} className="px-5">
          <Lock size={18} /> Odeslat
        </Btn>
      </div>

      <Sheet open={!!active} onClose={() => setActive(null)} title={active ? SIDES[active] : ""} z={1200}>
        {active && (
          <div className="flex flex-col gap-2.5 pb-2">
            {photos[active] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[active]} alt={`Současná fotka: ${SIDES[active]}`} className="h-40 w-full rounded-2xl object-cover" />
            )}
            <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand text-[17px] font-semibold">
              <Camera size={20} /> {photos[active] ? "Vyfotit znovu" : "Vyfotit"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) take(active, URL.createObjectURL(f));
                }}
              />
            </label>
            <Btn variant="outline" onClick={() => { take(active, placeholderPhoto(SIDES[active])); toast("Simulovaný snímek uložen"); }}>
              <ImagePlus size={20} /> Simulovat snímek
            </Btn>
            {photos[active] && (
              <Btn variant="ghost" onClick={() => setActive(null)}>
                <X size={18} /> Ponechat současnou fotku
              </Btn>
            )}
          </div>
        )}
      </Sheet>
    </>
  );
}
