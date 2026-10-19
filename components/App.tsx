"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo } from "react";
import { Map as MapIcon, Route, CircleUser } from "lucide-react";
import { Toaster, Btn } from "./ui";
import BrowseMap, { Logo } from "./BrowseMap";
import TariffScreen from "./TariffScreen";
import ReservationOverlay from "./ReservationOverlay";
import UnlockFlow from "./UnlockFlow";
import TripOverlay from "./TripOverlay";
import EndFlow from "./EndFlow";
import ReceiptScreen from "./ReceiptScreen";
import RidesScreen from "./RidesScreen";
import AccountScreen from "./AccountScreen";
import DemoMenu from "./DemoMenu";
import { CarSide } from "./CarArt";
import { useApp, type Tab } from "@/lib/store";
import { useMapUi } from "@/lib/map-ui";
import { applyFilter } from "@/lib/filter";
import { carById, PROTOTYPE_NOTE, USER_POS } from "@/lib/mock-data";
import { tripStats } from "@/lib/trip";
import type L from "leaflet";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-full w-full bg-[#eef2f0]" /> });

export default function App() {
  const s = useApp();
  const { phase, tab, onboarded, tariffFor, trip, scenarios } = s;
  const { target, setMap, sheetDown } = useMapUi();

  // trip simulation ticker
  useEffect(() => {
    if (phase !== "trip") return;
    const iv = setInterval(() => {
      const st = useApp.getState();
      if (!st.trip) return;
      const t = st.trip;
      st.set({ trip: t.parking ? { ...t, parkSec: t.parkSec + 1 } : { ...t, simSec: t.simSec + 1 } });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const cars = useMemo(() => applyFilter(s.activeFilter), [s.activeFilter]);
  const resCar = carById(s.reservation?.carId);
  const tripPos = trip && (phase === "trip" || phase === "ending") ? tripStats(trip, scenarios).pos : null;

  const onReady = useCallback((m: L.Map) => setMap(m), [setMap]);
  const onSelectCar = useCallback((id: string) => {
    useApp.getState().set({ selectedCarId: id });
    const car = carById(id);
    const map = useMapUi.getState().map;
    if (car && map) map.panTo([car.pos[0] - 0.004 * Math.pow(2, 14 - map.getZoom()), car.pos[1]], { animate: true });
  }, []);
  const onMapTap = useCallback(() => {
    if (useApp.getState().phase === "browse" && useApp.getState().selectedCarId) useApp.getState().set({ selectedCarId: null });
  }, []);

  // recentre on the user when coming back to browsing
  useEffect(() => {
    if (phase === "browse") useMapUi.getState().map?.setView(USER_POS, 14);
  }, [phase]);

  const mapCars = phase === "browse" ? cars : (phase === "reserved" || phase === "unlocking") && resCar ? [resCar] : undefined;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 isolate"
        style={{ "--map-bottom": `${phase === "browse" ? 68 : phase === "reserved" ? 345 : phase === "trip" ? (sheetDown ? 96 : 318) : 0}px` } as React.CSSProperties}
      >
        <MapView
          cars={mapCars}
          selectedId={phase === "browse" ? s.selectedCarId : resCar?.id}
          onSelectCar={phase === "browse" ? onSelectCar : () => {}}
          onMapTap={onMapTap}
          onReady={onReady}
          tripPos={tripPos}
          target={phase === "trip" ? target : null}
        />
      </div>

      {phase === "browse" && tab === "map" && <BrowseMap />}
      {phase === "browse" && tab === "rides" && <RidesScreen />}
      {phase === "browse" && tab === "account" && <AccountScreen />}
      {phase === "browse" && <TabBar tab={tab} />}
      {phase === "browse" && tariffFor && <TariffScreen />}
      {phase === "reserved" && <ReservationOverlay />}
      {phase === "unlocking" && <UnlockFlow />}
      {(phase === "trip" || phase === "ending") && <TripOverlay />}
      {phase === "ending" && <EndFlow />}
      {phase === "receipt" && <ReceiptScreen />}
      {!onboarded && <StartScreen />}

      <Toaster />
      <DemoMenu />
    </div>
  );
}

function TabBar({ tab }: { tab: Tab }) {
  const set = useApp((s) => s.set);
  const items: [Tab, string, React.ReactNode][] = [
    ["map", "Mapa", <MapIcon key="m" size={24} />],
    ["rides", "Jízdy", <Route key="r" size={24} />],
    ["account", "Účet", <CircleUser key="a" size={24} />],
  ];
  return (
    <nav className="absolute inset-x-0 bottom-0 z-[800] grid h-[68px] grid-cols-3 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]" aria-label="Hlavní navigace">
      {items.map(([id, label, icon]) => (
        <button
          key={id}
          type="button"
          aria-current={tab === id ? "page" : undefined}
          onClick={() => set({ tab: id, selectedCarId: null })}
          className={`flex flex-col items-center justify-center gap-0.5 text-[12px] font-semibold ${tab === id ? "text-brand-700" : "text-muted"}`}
        >
          {icon}
          {label}
        </button>
      ))}
    </nav>
  );
}

function StartScreen() {
  const set = useApp((s) => s.set);
  return (
    <div className="absolute inset-0 z-[2000] flex flex-col bg-gradient-to-b from-brand-50 to-white px-6 pt-[max(48px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      <div className="flex justify-center">
        <Logo />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <CarSide model="chr" className="w-64" />
        <h1 className="mt-6 text-[30px] leading-tight font-extrabold">Auto za rohem. Kdykoli.</h1>
        <p className="mt-3 text-[17px] text-muted">Najděte vůz na mapě, rezervujte ho zdarma na 20 minut a odemkněte telefonem.</p>
      </div>
      <Btn size="lg" className="w-full" onClick={() => set({ onboarded: true })}>
        Začít
      </Btn>
      <p className="mt-4 text-center text-[12px] text-muted">{PROTOTYPE_NOTE}</p>
    </div>
  );
}
