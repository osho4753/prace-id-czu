import { BIG_TRUNK_L, CARS, MODELS, type Car } from "./mock-data";
import type { Filter } from "./store";

export function applyFilter(f: Filter | null, cars: Car[] = CARS): Car[] {
  if (!f) return cars;
  return cars.filter(
    (c) =>
      (f.models.length === 0 || f.models.includes(c.model)) &&
      c.fuel >= f.minFuel &&
      (!f.bigTrunk || c.trunkL >= BIG_TRUNK_L),
  );
}

export function describeFilter(f: Filter): string {
  const parts: string[] = [];
  if (f.models.length) parts.push(f.models.map((m) => MODELS[m].short).join(", "));
  if (f.minFuel) parts.push(`palivo ≥ ${f.minFuel} %`);
  if (f.bigTrunk) parts.push("velký kufr");
  return parts.join(" · ") || "vše";
}
