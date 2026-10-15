import zone from "./zone.geojson";

export type LatLng = [number, number]; // [lat, lng]

/** Ring of the "Domácí zóna" polygon as [lat, lng] pairs (Leaflet order). */
export const ZONE_RING: LatLng[] = zone.features[0].geometry.coordinates[0].map(
  ([lng, lat]) => [lat, lng] as LatLng,
);

const M_PER_DEG_LAT = 111_320;
const mPerDegLng = (lat: number) => 111_320 * Math.cos((lat * Math.PI) / 180);

/** Ray-casting point-in-polygon test. */
export function isInZone([lat, lng]: LatLng): boolean {
  let inside = false;
  const ring = ZONE_RING;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i];
    const [yj, xj] = ring[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Haversine distance in metres. */
export function distanceM(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Nearest point on the zone boundary and its distance (local planar approximation). */
export function nearestZonePoint(p: LatLng): { point: LatLng; distance: number } {
  const ky = M_PER_DEG_LAT;
  const kx = mPerDegLng(p[0]);
  let best: { point: LatLng; distance: number } = { point: ZONE_RING[0], distance: Infinity };
  for (let i = 0; i < ZONE_RING.length - 1; i++) {
    const a = ZONE_RING[i];
    const b = ZONE_RING[i + 1];
    const ax = (a[1] - p[1]) * kx, ay = (a[0] - p[0]) * ky;
    const bx = (b[1] - p[1]) * kx, by = (b[0] - p[0]) * ky;
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy)));
    const cx = ax + t * dx, cy = ay + t * dy;
    const d = Math.hypot(cx, cy);
    if (d < best.distance) best = { point: [p[0] + cy / ky, p[1] + cx / kx], distance: d };
  }
  return best;
}

/** Point along a polyline at fraction t (0..1) of its length. */
export function pointAlong(route: LatLng[], t: number): LatLng {
  const segs = route.slice(1).map((p, i) => distanceM(route[i], p));
  const total = segs.reduce((s, d) => s + d, 0);
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const f = segs[i] === 0 ? 0 : target / segs[i];
      const a = route[i], b = route[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    target -= segs[i];
  }
  return route[route.length - 1];
}

export function routeLengthM(route: LatLng[]): number {
  return route.slice(1).reduce((s, p, i) => s + distanceM(route[i], p), 0);
}
