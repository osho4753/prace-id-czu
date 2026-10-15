/** Generates a neutral placeholder "photo" as an SVG data URI (used by "Simulovat snímek"). */
export function placeholderPhoto(label: string): string {
  const hue = [160, 190, 200, 140][label.length % 4];
  const time = new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},35%,78%)"/><stop offset="1" stop-color="hsl(${hue},20%,52%)"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#g)"/>
<rect x="0" y="210" width="400" height="90" fill="hsl(${hue},10%,38%)"/>
<path d="M80 215 C78 185 95 175 120 172 L160 168 L190 140 C198 134 208 132 222 132 L270 132 C284 132 292 136 300 148 L314 168 C330 172 338 180 338 194 L338 215 Z" fill="#eef2f0" stroke="#1f2a27" stroke-width="4"/>
<circle cx="135" cy="216" r="20" fill="#1f2a27"/><circle cx="295" cy="216" r="20" fill="#1f2a27"/>
<rect x="12" y="12" rx="8" width="${label.length * 11 + 70}" height="30" fill="rgba(0,0,0,.55)"/>
<text x="24" y="33" font-family="sans-serif" font-size="16" font-weight="700" fill="#fff">${label} · ${time}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
