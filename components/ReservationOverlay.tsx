"use client";

import { useEffect, useState } from "react";
import { Navigation, LockOpen, MapPin, Footprints } from "lucide-react";
import { Btn, ConfirmModal, Modal, toast } from "./ui";
import { CarSide } from "./CarArt";
import { carById, MODELS, TARIFFS, USER_POS, walkMinutes } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { distanceM } from "@/lib/zone";
import { useMapUi } from "@/lib/map-ui";
import { fmtClock } from "@/lib/trip";

export default function ReservationOverlay() {
  const { reservation, cancelReservation, set } = useApp();
  const map = useMapUi((s) => s.map);
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(false);
  const car = carById(reservation?.carId)!;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (map && car) map.flyToBounds([USER_POS, car.pos], { paddingTopLeft: [40, 120], paddingBottomRight: [40, 400], duration: 0.6, maxZoom: 16 });
  }, [map, car]);

  if (!reservation || !car) return null;
  const left = (reservation.expiresAt - now) / 1000;
  const expired = left <= 0;
  const urgent = left < 5 * 60;

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-4 pt-[max(14px,env(safe-area-inset-top))]">
        <div className="rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
          <div className="text-[14px] text-muted">Vůz je rezervován pro vás</div>
          <div className="text-[17px] font-bold">
            {MODELS[car.model].name} · {car.spz}
          </div>
        </div>
      </div>

      <div className="anim-sheet absolute inset-x-0 bottom-0 z-[600] rounded-t-[28px] bg-white px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] shadow-[var(--shadow-sheet)]">
        <CarSide model={car.model} className="mx-auto -mt-14 h-20 w-44" />
        <div className="text-center">
          <div className="text-[14px] font-medium text-muted">Rezervace zdarma vyprší za</div>
          <div
            className={`font-mono text-[46px] leading-none font-extrabold tabular-nums ${urgent ? "text-sos" : "text-ink"}`}
            role="timer"
            aria-live="off"
          >
            {fmtClock(left)}
          </div>
          <div className="mt-1 text-[14px] text-muted">Tarif: {TARIFFS[reservation.tariffId].name}</div>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-[15px]">
          <MapPin size={20} className="shrink-0 text-brand-700" />
          <span className="flex-1">{car.address}</span>
          <span className="flex items-center gap-1 font-semibold whitespace-nowrap">
            <Footprints size={16} /> {walkMinutes(distanceM(USER_POS, car.pos))} min
          </span>
        </div>
        <Btn size="lg" className="mt-3 w-full" onClick={() => set({ phase: "unlocking" })}>
          <LockOpen size={20} /> Odemknout
        </Btn>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Btn variant="outline" className="text-[15px]" onClick={() => toast("Navigace by se otevřela v mapové aplikaci telefonu")}>
            <Navigation size={18} /> Navigovat k autu
          </Btn>
          <button
            type="button"
            onClick={() => {
              setConfirm(true);
            }}
            className="min-h-12 rounded-2xl border-2 border-red-200 text-[15px] font-semibold text-sos active:bg-red-50"
          >
            Zrušit rezervaci
          </button>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          title="Opravdu zrušit rezervaci?"
          text="Vůz bude opět volný pro ostatní."
          yes="Ano, zrušit"
          no="Ne"
          danger
          onNo={() => {
            setConfirm(false);
          }}
          onYes={() => {
            cancelReservation();
            toast("Rezervace zrušena");
          }}
        />
      )}
      {expired && (
        <Modal>
          <h2 className="text-[20px] font-bold">Rezervace vypršela</h2>
          <p className="mt-2 text-[15px] text-muted">Vůz už není rezervován. Můžete si ho rezervovat znovu, pokud je stále volný.</p>
          <Btn className="mt-5 w-full" onClick={cancelReservation}>
            Rozumím
          </Btn>
        </Modal>
      )}
    </>
  );
}
