# Pojeď – sdílená auta (prototyp)

Klikací prototyp carsharingové aplikace pro usability test (ČZU PEF, Interakční design).
Studentský prototyp – nejde o skutečnou službu. Vše běží v prohlížeči na smyšlených datech (bez backendu a bez API klíčů).

## Spuštění lokálně

Potřebujete Node.js 20 nebo novější.

```bash
npm install
npm run dev        # http://localhost:3000
```

Produkční build: `npm run build && npm start`.

Na telefonu otevřete adresu počítače ve stejné Wi-Fi (např. `http://192.168.1.20:3000`).
Na desktopu se aplikace zobrazí v rámečku telefonu 390×844.

## Deploy na Vercel

1. Nahrajte repozitář na GitHub.
2. Na [vercel.com/new](https://vercel.com/new) zvolte **Import** a vyberte repozitář. Vercel sám pozná Next.js, nic dalšího nenastavujte (žádné proměnné prostředí).
3. Klikněte na **Deploy**. Hotovou URL otevřete na testovacím telefonu.

Alternativa přes CLI: `npm i -g vercel` → `vercel` (náhled) → `vercel --prod`.

## Demo menu (pro vedoucího testu)

**Dlouhé podržení (~1 s) na logu „Pojeď“** (na mapě nebo na úvodní obrazovce) nebo na horní kartě během jízdy otevře skryté Demo menu:

| Přepínač | Co způsobí |
|---|---|
| Auto mimo zónu | Vůz stojí mimo Domácí zónu. Indikátor P je červený a ukončení skončí hláškou „Zde nelze ukončit…“ s tlačítkem „Ukázat na mapě“. |
| Otevřené dveře (levé zadní) | Při ukončení se zobrazí schéma vozu se zvýrazněnými dveřmi. Po „Zkusit znovu“ se přepínač sám vypne (dveře „zavřeny“). |
| Platba zamítnuta | Karta •••• 4242 je zamítnuta. Je potřeba vybrat jinou kartu (•••• 1881). |
| Reset | Vymaže stav aplikace (uložený filtr, rezervaci, jízdu, přepínače). Používá se mezi účastníky. |

Stav se ukládá do `localStorage`, takže obnovení stránky test nepřeruší.

## Scénáře v prototypu

- **Mapa:** 40 vozů v Praze, shlukování značek, detail vozu.
- **Filtr:** model, minimální palivo, velký kufr. Přepínač „Uložit filtr“ způsobí, že se filtr použije i při příštím otevření (štítek „Uložený filtr: … ✕“).
- **Výběr tarifu:** Minutový s odhadem ceny, nebo Balíčky 3 h / 24 h.
- **Rezervace:** odpočet 20:00. „Zrušit rezervaci“ stačí jedno klepnutí a potvrzení Ano/Ne.
- **Odemknutí:** „Ověřuji polohu…“ → „Navazuji spojení s vozem…“ → „Auto odemčeno!“, poté tip ke kontrolce READY.
- **Jízda:** vůz projede trasu, která na chvíli opustí zónu. Indikátor zóny P, tlačítka SOS, Tankování (PIN CCS + účtenka → bonus +30 min), Pravidla, Nahlásit a parkovací režim.
- **Ukončení:** posuvník → kontrola zóny a dveří → fotky ze 4 stran (fotoaparát nebo „Simulovat snímek“, klepnutím na fotku ji pořídíte znovu) → platba → účtenka.
- **Jízdy / Účet:** historie jízd, bonusové minuty, uložené filtry, Nápověda (FAQ), O aplikaci.

Funkce mimo rozsah testu (chat, WhatsApp, nastavení…) ukážou hlášku „Tato funkce není v prototypu dostupná“.

## Struktura

```
app/                 layout, stránka, globální styly
components/          obrazovky a UI komponenty
lib/mock-data.ts     vozy, tarify, trasa jízdy, historie
lib/zone.geojson     Domácí zóna (zjednodušený polygon)
lib/zone.ts          bod v polygonu, vzdálenost k zóně
lib/store.ts         stav aplikace (Zustand + localStorage)
screens/             referenční wireframy
```

Mapa: Leaflet + OpenStreetMap (© přispěvatelé OpenStreetMap).
