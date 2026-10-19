"use client";

import { create } from "zustand";
import type L from "leaflet";
import type { LatLng } from "./zone";

/** Transient (non-persisted) UI state shared between overlays. */
export const useMapUi = create<{
  map: L.Map | null;
  target: LatLng | null;
  hint: boolean;
  demoOpen: boolean;
  /** trip bottom sheet swiped down */
  sheetDown: boolean;
  setMap: (m: L.Map) => void;
  setTarget: (t: LatLng | null) => void;
  setHint: (v: boolean) => void;
}>((set) => ({
  map: null,
  target: null,
  hint: false,
  demoOpen: false,
  sheetDown: false,
  setMap: (map) => set({ map }),
  setTarget: (target) => set({ target }),
  setHint: (hint) => set({ hint }),
}));
