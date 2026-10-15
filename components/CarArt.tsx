import type { ModelId } from "@/lib/mock-data";
import type { DoorId } from "@/lib/store";

/** Neutral side-view illustrations (no livery, no logos). */
const BODIES: Record<ModelId, string> = {
  // hatchback
  yaris:
    "M18 62 C16 50 22 44 34 42 L60 40 L82 24 C88 20 94 19 104 19 L140 19 C150 19 156 22 162 30 L172 42 C182 44 188 48 188 56 L188 62 Z",
  // estate – long roof
  corolla:
    "M10 62 C8 52 14 46 26 44 L54 42 L78 26 C84 22 90 21 100 21 L170 21 C178 21 182 24 186 32 L190 44 C194 48 194 54 194 62 Z",
  // crossover – taller, raked
  chr:
    "M14 64 C12 50 18 42 30 40 L58 37 L82 20 C88 16 96 15 106 15 L142 16 C152 17 160 22 168 32 L178 40 C188 42 192 48 192 56 L192 64 Z",
};
const WINDOWS: Record<ModelId, string> = {
  yaris: "M66 40 L86 26 C90 24 94 23 100 23 L118 23 L118 40 Z M122 23 L140 23 C148 23 152 26 156 32 L162 40 L122 40 Z",
  corolla: "M60 42 L82 28 C86 26 90 25 98 25 L124 25 L124 42 Z M128 25 L168 25 C174 25 178 28 180 34 L182 42 L128 42 Z",
  chr: "M64 38 L86 23 C90 21 96 20 104 20 L120 20 L120 38 Z M124 20 L140 20 C148 21 154 25 160 32 L164 38 L124 38 Z",
};

export function CarSide({ model, className = "", color = "#e9eeec" }: { model: ModelId; className?: string; color?: string }) {
  const wheelY = model === "chr" ? 64 : 62;
  const wx = model === "corolla" ? [46, 160] : [48, 154];
  return (
    <svg viewBox="0 0 204 80" className={className} aria-hidden="true">
      <ellipse cx="102" cy="74" rx="92" ry="4" fill="rgb(0 0 0 / .12)" />
      <path d={BODIES[model]} fill={color} stroke="#1f2a27" strokeWidth="2.5" strokeLinejoin="round" />
      <path d={WINDOWS[model]} fill="#9fb5c0" stroke="#1f2a27" strokeWidth="1.5" />
      <path d={`M24 ${wheelY - 10} L192 ${wheelY - 10}`} stroke="#22d3b0" strokeWidth="3" opacity=".8" />
      {wx.map((x) => (
        <g key={x}>
          <circle cx={x} cy={wheelY} r="13" fill="#1f2a27" />
          <circle cx={x} cy={wheelY} r="6" fill="#cfd8d5" />
        </g>
      ))}
    </svg>
  );
}

export function CarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#0f1d1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 16h14v-4l-2-5H7l-2 5z" fill="#fff" />
      <circle cx="8" cy="16.5" r="1.8" fill="#0f1d1a" />
      <circle cx="16" cy="16.5" r="1.8" fill="#0f1d1a" />
    </svg>
  );
}

/**
 * Top-down car, front pointing up. Highlights an open door.
 * Doors (front up): fl = left front, rl = left rear, rr = right rear, trunk.
 */
export function CarTop({ open, className = "" }: { open?: DoorId | null; className?: string }) {
  const hi = "#ef4444";
  const doorFill = (d: DoorId) => (open === d ? hi : "#f4f7f6");
  return (
    <svg viewBox="0 0 160 260" className={className} role="img" aria-label="Schéma vozu shora">
      {/* body */}
      <rect x="35" y="15" width="90" height="230" rx="34" fill="#f4f7f6" stroke="#1f2a27" strokeWidth="3" />
      {/* windscreen / rear window / roof */}
      <path d="M45 78 Q80 62 115 78 L110 98 Q80 88 50 98 Z" fill="#b9cbd2" stroke="#1f2a27" strokeWidth="2" />
      <path d="M50 190 Q80 198 110 190 L114 206 Q80 216 46 206 Z" fill="#b9cbd2" stroke="#1f2a27" strokeWidth="2" />
      <rect x="52" y="104" width="56" height="80" rx="10" fill="#e3eae7" stroke="#1f2a27" strokeWidth="1.5" />
      {/* mirrors */}
      <rect x="24" y="88" width="12" height="8" rx="3" fill="#1f2a27" />
      <rect x="124" y="88" width="12" height="8" rx="3" fill="#1f2a27" />
      {/* door seams */}
      <g stroke="#1f2a27" strokeWidth="2">
        <line x1="35" y1="145" x2="50" y2="145" />
        <line x1="110" y1="145" x2="125" y2="145" />
      </g>
      {/* doors (strips along sides) */}
      <rect x="35" y="100" width="10" height="44" rx="3" fill={doorFill("fl")} stroke="#1f2a27" strokeWidth="1.5" />
      <rect x="115" y="100" width="10" height="44" rx="3" fill="#f4f7f6" stroke="#1f2a27" strokeWidth="1.5" />
      <rect x="35" y="146" width="10" height="42" rx="3" fill={doorFill("rl")} stroke="#1f2a27" strokeWidth="1.5" />
      <rect x="115" y="146" width="10" height="42" rx="3" fill={doorFill("rr")} stroke="#1f2a27" strokeWidth="1.5" />
      <rect x="50" y="222" width="60" height="20" rx="6" fill={doorFill("trunk")} stroke="#1f2a27" strokeWidth="1.5" />
      {/* open door drawn swung out */}
      {open === "fl" && <path d="M35 102 L6 128 L12 134 L35 142 Z" fill={hi} stroke="#7f1d1d" strokeWidth="2" />}
      {open === "rl" && <path d="M35 148 L6 174 L12 180 L35 186 Z" fill={hi} stroke="#7f1d1d" strokeWidth="2" />}
      {open === "rr" && <path d="M125 148 L154 174 L148 180 L125 186 Z" fill={hi} stroke="#7f1d1d" strokeWidth="2" />}
      {open === "trunk" && <path d="M50 244 L110 244 L104 258 L56 258 Z" fill={hi} stroke="#7f1d1d" strokeWidth="2" />}
      {/* front marker */}
      <text x="80" y="11" textAnchor="middle" fontSize="10" fill="#55635f" fontWeight="700">PŘEDEK</text>
    </svg>
  );
}

export const DOOR_LABEL: Record<DoorId, { name: string; close: string }> = {
  rr: { name: "pravé zadní dveře", close: "Zavřete prosím pravé zadní dveře." },
  rl: { name: "levé zadní dveře", close: "Zavřete prosím levé zadní dveře." },
  fl: { name: "levé přední dveře", close: "Zavřete prosím levé přední dveře." },
  trunk: { name: "kufr", close: "Zavřete prosím víko kufru." },
};
