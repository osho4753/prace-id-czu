import type { LatLng } from "./zone";

export type ModelId = "yaris" | "corolla" | "chr";
export type Cleanliness = "Výborná" | "Dobrá" | "Průměrná";

export interface CarModel {
  id: ModelId;
  name: string;
  short: string;
  trunkL: number;
  seats: number;
  rangeKmFull: number;
  body: "hatch" | "combi" | "suv";
}

export const MODELS: Record<ModelId, CarModel> = {
  yaris: { id: "yaris", name: "Toyota Yaris Hybrid", short: "Yaris", trunkL: 286, seats: 5, rangeKmFull: 750, body: "hatch" },
  corolla: { id: "corolla", name: "Toyota Corolla Combi Hybrid", short: "Corolla Combi", trunkL: 598, seats: 5, rangeKmFull: 800, body: "combi" },
  chr: { id: "chr", name: "Toyota C-HR Hybrid", short: "C-HR", trunkL: 377, seats: 5, rangeKmFull: 700, body: "suv" },
};

export const BIG_TRUNK_L = 500;

export interface Car {
  id: string;
  model: ModelId;
  spz: string;
  fuel: number; // %
  cleanliness: Cleanliness;
  trunkL: number;
  seats: number;
  pos: LatLng;
  address: string;
}

type Row = [string, number, number, ModelId, number, Cleanliness];

// Hand-placed on streets in Praha 1–8 (none in the Vltava).
const ROWS: Row[] = [
  ["Korunní 12, Praha 2", 50.0752, 14.4398, "corolla", 82, "Výborná"],
  ["Vinohradská 48, Praha 2", 50.0778, 14.4460, "yaris", 64, "Dobrá"],
  ["Nám. Jiřího z Poděbrad 7, Praha 3", 50.0779, 14.4497, "chr", 15, "Dobrá"],
  ["Mánesova 31, Praha 2", 50.0782, 14.4412, "yaris", 91, "Výborná"],
  ["Slezská 20, Praha 2", 50.0739, 14.4441, "corolla", 47, "Průměrná"],
  ["Francouzská 4, Praha 2", 50.0733, 14.4425, "yaris", 18, "Dobrá"],
  ["Krymská 9, Praha 10", 50.0705, 14.4476, "chr", 73, "Výborná"],
  ["Ruská 15, Praha 10", 50.0691, 14.4560, "corolla", 55, "Dobrá"],
  ["Ve Smečkách 22, Praha 1", 50.0790, 14.4286, "yaris", 38, "Průměrná"],
  ["Žitná 40, Praha 2", 50.0766, 14.4256, "chr", 88, "Dobrá"],
  ["Ječná 18, Praha 2", 50.0750, 14.4236, "yaris", 12, "Průměrná"],
  ["Karlovo nám. 14, Praha 2", 50.0757, 14.4187, "corolla", 69, "Výborná"],
  ["Vyšehradská 33, Praha 2", 50.0701, 14.4196, "yaris", 77, "Dobrá"],
  ["Albertov 6, Praha 2", 50.0679, 14.4236, "chr", 42, "Dobrá"],
  ["Na Smetance 3, Praha 2", 50.0791, 14.4371, "corolla", 95, "Výborná"],
  ["Lublaňská 25, Praha 2", 50.0731, 14.4301, "yaris", 59, "Dobrá"],
  ["Bělehradská 70, Praha 2", 50.0721, 14.4331, "chr", 19, "Průměrná"],
  ["Seifertova 45, Praha 3", 50.0851, 14.4431, "yaris", 66, "Dobrá"],
  ["Husitská 22, Praha 3", 50.0868, 14.4451, "corolla", 84, "Výborná"],
  ["Koněvova 80, Praha 3", 50.0889, 14.4602, "chr", 51, "Dobrá"],
  ["Táboritská 12, Praha 3", 50.0846, 14.4551, "yaris", 29, "Průměrná"],
  ["Kubelíkova 27, Praha 3", 50.0818, 14.4401, "chr", 71, "Výborná"],
  ["Bořivojova 60, Praha 3", 50.0826, 14.4481, "corolla", 16, "Dobrá"],
  ["Sokolovská 98, Praha 8", 50.0925, 14.4511, "yaris", 80, "Dobrá"],
  ["Křižíkova 44, Praha 8", 50.0936, 14.4421, "corolla", 62, "Výborná"],
  ["Thámova 11, Praha 8", 50.0947, 14.4511, "chr", 35, "Dobrá"],
  ["Pernerova 28, Praha 8", 50.0930, 14.4541, "yaris", 90, "Výborná"],
  ["Revoluční 8, Praha 1", 50.0905, 14.4296, "chr", 58, "Dobrá"],
  ["Dlouhá 17, Praha 1", 50.0899, 14.4256, "yaris", 44, "Průměrná"],
  ["Opletalova 25, Praha 1", 50.0839, 14.4321, "corolla", 76, "Dobrá"],
  ["Hybernská 10, Praha 1", 50.0871, 14.4331, "yaris", 13, "Dobrá"],
  ["Karmelitská 20, Praha 1", 50.0855, 14.4040, "chr", 67, "Výborná"],
  ["Újezd 40, Praha 1", 50.0819, 14.4046, "yaris", 53, "Dobrá"],
  ["Dukelských hrdinů 30, Praha 7", 50.0990, 14.4321, "corolla", 87, "Výborná"],
  ["Milady Horákové 60, Praha 7", 50.1000, 14.4251, "chr", 24, "Průměrná"],
  ["Čechova 15, Praha 7", 50.1001, 14.4171, "yaris", 70, "Dobrá"],
  ["Na Žertvách 20, Praha 8", 50.1035, 14.4791, "corolla", 41, "Dobrá"],
  ["Zenklova 10, Praha 8", 50.1041, 14.4741, "yaris", 93, "Výborná"],
  ["Kodaňská 50, Praha 10", 50.0686, 14.4601, "corolla", 17, "Průměrná"],
  ["Korunovační 8, Praha 7", 50.1021, 14.4141, "chr", 79, "Dobrá"],
];

const LETTERS = "ABCEHKLMPSTUZ";
function spz(i: number): string {
  const region = ["A", "AB", "AC", "AE", "AH"][i % 5];
  const l = LETTERS[(i * 7) % LETTERS.length];
  const n = String(1000 + ((i * 7919) % 9000)).padStart(4, "0");
  return `${(i % 9) + 1}${region.length === 1 ? region + l : region} ${n}`;
}

export const CARS: Car[] = ROWS.map(([address, lat, lng, model, fuel, cleanliness], i) => ({
  id: `car-${String(i + 1).padStart(2, "0")}`,
  model,
  spz: spz(i),
  fuel,
  cleanliness,
  trunkL: MODELS[model].trunkL,
  seats: MODELS[model].seats,
  pos: [lat, lng],
  address,
}));

export const carById = (id: string | null | undefined) => CARS.find((c) => c.id === id);

/** Simulated user position: Náměstí Míru. */
export const USER_POS: LatLng = [50.0755, 14.437];

/** Walking time in minutes (street factor 1.3, 80 m/min). */
export function walkMinutes(m: number) {
  return Math.max(1, Math.round((m * 1.3) / 80));
}

export const rangeKm = (car: Car) => Math.round((MODELS[car.model].rangeKmFull * car.fuel) / 100);

// ---------- Tarify ----------

export type TariffId = "minute" | "3h" | "24h";

export interface Tariff {
  id: TariffId;
  name: string;
  kind: "minute" | "package";
  perMin?: number;
  fixed?: number;
  includedKm: number;
  perKmOver: number;
  durationMin?: number;
}

export const PARKING_PER_MIN = 2.9;

export const TARIFFS: Record<TariffId, Tariff> = {
  minute: { id: "minute", name: "Minutový", kind: "minute", perMin: 7.9, includedKm: 100, perKmOver: 4.9 },
  "3h": { id: "3h", name: "Balíček 3 hodiny", kind: "package", fixed: 499, includedKm: 100, perKmOver: 4.9, durationMin: 180 },
  "24h": { id: "24h", name: "Balíček 24 hodin", kind: "package", fixed: 1290, includedKm: 250, perKmOver: 4.9, durationMin: 1440 },
};

export function tripPrice(t: Tariff, driveMin: number, parkMin: number, km: number): number {
  const kmOver = Math.max(0, km - t.includedKm) * t.perKmOver;
  if (t.kind === "minute") return driveMin * (t.perMin ?? 0) + parkMin * PARKING_PER_MIN + kmOver;
  const over = Math.max(0, driveMin + parkMin - (t.durationMin ?? 0));
  return (t.fixed ?? 0) + over * 7.9 + kmOver;
}

export const kc = (n: number, decimals = 0) =>
  n.toLocaleString("cs-CZ", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + " Kč";

// ---------- Jízda (simulace) ----------

/** Waypoints after the car's start position. Leaves the zone east of Strašnice and returns. */
export const ROUTE_TAIL: LatLng[] = [
  [50.0779, 14.4555],
  [50.0786, 14.4740],
  [50.0782, 14.4950],
  [50.0772, 14.5120],
  [50.0760, 14.5300],
  [50.0742, 14.5345],
  [50.0752, 14.5160],
  [50.0770, 14.5020],
  [50.0784, 14.4880],
];

/** Sim seconds the car needs for the whole route at ×1. */
export const ROUTE_DURATION_S = 240;

/** Point ~350 m outside the zone (used by "Auto mimo zónu"). */
export const OUT_OF_ZONE_POS: LatLng = [50.0745, 14.5245];

export const DEMO_DRIVE_KM = 14.6; // km the simulated route represents

// ---------- Historie ----------

export interface Ride {
  id: string;
  date: string; // ISO
  model: ModelId;
  spz: string;
  from: string;
  to: string;
  minutes: number;
  km: number;
  tariff: string;
  price: number;
}

export const PAST_RIDES: Ride[] = [
  { id: "r1", date: "2026-10-09T17:42:00", model: "yaris", spz: "2AB 4410", from: "Korunní 12, Praha 2", to: "Sokolovská 98, Praha 8", minutes: 24, km: 6.8, tariff: "Minutový", price: 190 },
  { id: "r2", date: "2026-10-04T09:15:00", model: "corolla", spz: "5AE 7731", from: "Slezská 20, Praha 2", to: "Kodaňská 50, Praha 10", minutes: 168, km: 82.4, tariff: "Balíček 3 hodiny", price: 499 },
  { id: "r3", date: "2026-09-27T21:03:00", model: "chr", spz: "1AH 2093", from: "Revoluční 8, Praha 1", to: "Krymská 9, Praha 10", minutes: 17, km: 4.1, tariff: "Minutový", price: 134 },
  { id: "r4", date: "2026-09-18T07:50:00", model: "yaris", spz: "3AC 5582", from: "Ječná 18, Praha 2", to: "Dukelských hrdinů 30, Praha 7", minutes: 21, km: 5.6, tariff: "Minutový", price: 166 },
];

export const CCS_PIN = "4821";
export const SUPPORT_PHONE = "+420 800 000 000";
export const SUPPORT_TEL = "tel:+420800000000";
export const PROTOTYPE_NOTE = "Studentský prototyp – ČZU PEF, Interakční design. Nejde o skutečnou službu.";
