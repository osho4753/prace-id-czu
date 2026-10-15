"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Marker, useMap, useMapEvents } from "react-leaflet";
import type { Car } from "@/lib/mock-data";
import { USER_POS } from "@/lib/mock-data";
import { ZONE_RING, type LatLng } from "@/lib/zone";

const CAR_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#0f1d1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16h14v-4l-2-5H7l-2 5z" fill="#fff"/><circle cx="8" cy="16.5" r="1.8" fill="#0f1d1a"/><circle cx="16" cy="16.5" r="1.8" fill="#0f1d1a"/></svg>';

const userIcon = L.divIcon({ className: "", html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
const tripIcon = L.divIcon({ className: "trip-car", html: `<div>${CAR_SVG}</div>`, iconSize: [44, 44], iconAnchor: [22, 22] });
const targetIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:999px;background:#0f9e83;border:4px solid #fff;box-shadow:0 0 0 6px rgb(15 158 131 / .3)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function carIcon(car: Car, selected: boolean) {
  const cls = ["car-pin", car.fuel < 20 ? "low" : "", selected ? "sel" : ""].join(" ");
  return L.divIcon({ className: cls, html: `<div>${CAR_SVG}</div>`, iconSize: [40, 40], iconAnchor: [20, 20] });
}

function ClusterLayer({ cars, selectedId, onSelect }: { cars: Car[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 55,
      disableClusteringAtZoom: 16,
      iconCreateFunction: (c) =>
        L.divIcon({ html: String(c.getChildCount()), className: "pj-cluster", iconSize: [44, 44] }),
    });
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    const markers = cars.map((car) => {
      const m = L.marker(car.pos, {
        icon: carIcon(car, car.id === selectedId),
        keyboard: true,
        title: `${car.spz}`,
        zIndexOffset: car.id === selectedId ? 1000 : 0,
      });
      m.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current(car.id);
      });
      return m;
    });
    group.addLayers(markers);
  }, [cars, selectedId]);

  return null;
}

function Events({ onTap, onReady }: { onTap?: () => void; onReady?: (m: L.Map) => void }) {
  const map = useMapEvents({ click: () => onTap?.() });
  useEffect(() => {
    onReady?.(map);
    // the phone frame may finish layout after mount
    const t = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [map, onReady]);
  return null;
}

function Attribution() {
  const map = useMap();
  useEffect(() => {
    const c = L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
    return () => {
      c.remove();
    };
  }, [map]);
  return null;
}

export interface MapViewProps {
  cars?: Car[];
  selectedId?: string | null;
  onSelectCar?: (id: string) => void;
  onMapTap?: () => void;
  onReady?: (m: L.Map) => void;
  tripPos?: LatLng | null;
  target?: LatLng | null;
  showZone?: boolean;
  center?: LatLng;
  zoom?: number;
}

export default function MapView({
  cars,
  selectedId = null,
  onSelectCar,
  onMapTap,
  onReady,
  tripPos,
  target,
  showZone = true,
  center = USER_POS,
  zoom = 14,
}: MapViewProps) {
  return (
    <MapContainer center={center} zoom={zoom} zoomControl={false} attributionControl={false} className="h-full w-full" minZoom={11} maxZoom={18}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      {showZone && (
        <Polygon positions={ZONE_RING} pathOptions={{ color: "#0f9e83", weight: 2, fillColor: "#22d3b0", fillOpacity: 0.12 }} />
      )}
      {cars && onSelectCar && <ClusterLayer cars={cars} selectedId={selectedId} onSelect={onSelectCar} />}
      {!tripPos && <Marker position={USER_POS} icon={userIcon} interactive={false} />}
      {tripPos && (
        <>
          <Marker position={tripPos} icon={tripIcon} interactive={false} zIndexOffset={2000} />
        </>
      )}
      {target && <Marker position={target} icon={targetIcon} interactive={false} />}
      <Attribution />
      <Events onTap={onMapTap} onReady={onReady} />
    </MapContainer>
  );
}
