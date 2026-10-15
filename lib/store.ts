"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type ModelId, type Ride, type TariffId } from "./mock-data";

export type Phase = "browse" | "reserved" | "unlocking" | "trip" | "ending" | "receipt";
export type Tab = "map" | "rides" | "account";
export type DoorId = "rr" | "rl" | "fl" | "trunk";

export interface Filter {
  models: ModelId[];
  minFuel: number;
  bigTrunk: boolean;
}

export const EMPTY_FILTER: Filter = { models: [], minFuel: 0, bigTrunk: false };
export const filterIsEmpty = (f: Filter | null) =>
  !f || (f.models.length === 0 && f.minFuel === 0 && !f.bigTrunk);

/** Demo toggles (long-press on the logo). */
export interface Scenarios {
  outOfZone: boolean;
  door: DoorId | null;
  paymentDeclined: boolean;
}

export const NO_SCENARIOS: Scenarios = {
  outOfZone: false,
  door: null,
  paymentDeclined: false,
};

export interface Reservation {
  carId: string;
  tariffId: TariffId;
  expiresAt: number;
}

export interface Trip {
  carId: string;
  tariffId: TariffId;
  startedAt: number;
  simSec: number; // driving sim seconds (drives price + route progress)
  parkSec: number; // sim seconds in parking mode
  parking: boolean;
}

export interface Receipt {
  carId: string;
  tariffId: TariffId;
  startedAt: number;
  endedAt: number;
  driveMin: number;
  parkMin: number;
  km: number;
  price: number;
  card: string;
  address: string;
}

interface State {
  onboarded: boolean;
  phase: Phase;
  tab: Tab;
  selectedCarId: string | null;
  tariffFor: string | null;
  activeFilter: Filter | null;
  savedFilter: Filter | null;
  reservation: Reservation | null;
  trip: Trip | null;
  receipt: Receipt | null;
  bonusMinutes: number;
  rides: Ride[];
  card: string;
  scenarios: Scenarios;

  set: (p: Partial<State>) => void;
  setScenario: <K extends keyof Scenarios>(k: K, v: Scenarios[K]) => void;
  reserve: (carId: string, tariffId: TariffId) => void;
  cancelReservation: () => void;
  startTrip: () => void;
  finishTrip: (r: Receipt, ride: Ride) => void;
  resetPrototype: () => void;
}

const RES_MS = 20 * 60 * 1000;

const initial = {
  onboarded: false,
  phase: "browse" as Phase,
  tab: "map" as Tab,
  selectedCarId: null,
  tariffFor: null,
  activeFilter: null,
  savedFilter: null,
  reservation: null,
  trip: null,
  receipt: null,
  bonusMinutes: 15,
  rides: [] as Ride[],
  card: "4242",
  scenarios: NO_SCENARIOS,
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      set: (p) => set(p),
      setScenario: (k, v) => set({ scenarios: { ...get().scenarios, [k]: v } }),
      reserve: (carId, tariffId) =>
        set({
          reservation: { carId, tariffId, expiresAt: Date.now() + RES_MS },
          phase: "reserved",
          tariffFor: null,
          selectedCarId: carId,
        }),
      cancelReservation: () => set({ reservation: null, phase: "browse", tab: "map", selectedCarId: null }),
      startTrip: () => {
        const r = get().reservation;
        if (!r) return;
        set({
          trip: { carId: r.carId, tariffId: r.tariffId, startedAt: Date.now(), simSec: 0, parkSec: 0, parking: false },
          reservation: null,
          phase: "trip",
        });
      },
      finishTrip: (receipt, ride) =>
        set({ receipt, trip: null, phase: "receipt", rides: [ride, ...get().rides], selectedCarId: null }),
      resetPrototype: () => {
        set({ ...initial });
      },
    }),
    {
      name: "pojed-state",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // activeFilter is session-only: on next open the saved filter is re-applied.
      partialize: ({ activeFilter, set, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        if (state?.savedFilter) state.set({ activeFilter: state.savedFilter });
        if (state?.phase === "browse") state.set({ selectedCarId: null, tariffFor: null });
      },
    },
  ),
);
