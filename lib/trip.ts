import { carById, ROUTE_TAIL, ROUTE_DURATION_S, OUT_OF_ZONE_POS, TARIFFS, tripPrice, MODELS } from "./mock-data";
import { pointAlong, routeLengthM, isInZone, type LatLng } from "./zone";
import type { Scenarios, Trip } from "./store";

export function tripRoute(trip: Trip): LatLng[] {
  const car = carById(trip.carId)!;
  return [car.pos, ...ROUTE_TAIL];
}

export function tripStats(trip: Trip, scenarios: Scenarios) {
  const car = carById(trip.carId)!;
  const route = tripRoute(trip);
  const t = Math.min(1, trip.simSec / ROUTE_DURATION_S);
  const pos: LatLng = scenarios.outOfZone ? OUT_OF_ZONE_POS : pointAlong(route, t);
  const km = (routeLengthM(route) * t) / 1000;
  const driveMin = trip.simSec / 60;
  const parkMin = trip.parkSec / 60;
  const tariff = TARIFFS[trip.tariffId];
  const price = tripPrice(tariff, driveMin, parkMin, km);
  const inZone = isInZone(pos);
  const fuel = Math.max(5, Math.round(car.fuel - km * 0.25));
  const range = Math.round((MODELS[car.model].rangeKmFull * fuel) / 100);
  return { car, pos, km, driveMin, parkMin, price, inZone, tariff, fuel, range, arrived: t >= 1 };
}

export const fmtClock = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

const ROUTE_STREETS = [
  "Vinohradská, Praha 3",
  "Vinohradská, Praha 3",
  "Vinohradská, Praha 10",
  "Černokostelecká, Praha 10",
  "Černokostelecká, Praha 10",
  "Průmyslová, Praha 10",
  "Průmyslová, Praha 10",
  "Černokostelecká, Praha 10",
  "Vinohradská, Praha 10",
];

/** Human-readable location of the moving car (mock reverse geocoding). */
export function tripAddress(trip: Trip, scenarios: Scenarios): string {
  const car = carById(trip.carId)!;
  if (scenarios.outOfZone) return "Průmyslová 1440, Praha 10";
  const t = trip.simSec / ROUTE_DURATION_S;
  if (t < 0.02) return car.address;
  const idx = Math.min(ROUTE_STREETS.length - 1, Math.floor(t * ROUTE_STREETS.length));
  return ROUTE_STREETS[idx];
}
