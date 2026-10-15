'use client'

import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  CreditCard,
  Gift,
  SlidersHorizontal,
  Info,
  CircleHelp,
  Headset,
  Trash2,
  LogOut,
} from 'lucide-react'
import { Sheet, ScreenHeader, toast, notInPrototype } from './ui'
import SupportSheet from './SupportSheet'
import { useApp } from '@/lib/store'
import { describeFilter } from '@/lib/filter'
import { PROTOTYPE_NOTE } from '@/lib/mock-data'

const FAQ: [string, string][] = [
  [
    'Kde mohu pronájem ukončit?',
    'Kdekoli v Domácí zóně (zelená plocha na mapě) na místě, kde je parkování povoleno. Během jízdy vám to ukazuje indikátor P nahoře – zelená znamená, že zde můžete ukončit.',
  ],
  [
    'Jak dlouho platí rezervace?',
    'Rezervace je zdarma na 20 minut. Zrušit ji můžete jedním klepnutím.',
  ],
  [
    'Auto po odemknutí nevydává zvuk. Je v pořádku?',
    'Ano. Hybridní vozy startují potichu. Sešlápněte brzdu, stiskněte START a sledujte kontrolku READY.',
  ],
  [
    'Jak natankuji?',
    'V aplikaci zvolte Natankovat – zobrazí se PIN ke kartě CCS. Po nahrání účtenky získáte 30 minut zdarma.',
  ],
  [
    'Co dělat při nehodě?',
    'Během jízdy stiskněte červené tlačítko SOS – zavoláte podporu 24/7 jedním klepnutím.',
  ],
  [
    'Proč nejde jízda ukončit?',
    'Aplikace vždy napíše konkrétní důvod – např. vůz mimo zónu, chybí GPS signál nebo jsou otevřené dveře – a ukáže, co udělat.',
  ],
]

export function HelpSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  return (
    <Sheet open={open} onClose={onClose} title="Nápověda" full z={1250}>
      <div className="flex flex-col gap-2 pb-2">
        {FAQ.map(([q, a], i) => (
          <div key={q} className="rounded-2xl bg-gray-50">
            <button
              type="button"
              aria-expanded={openIdx === i}
              onClick={() => {
                setOpenIdx(openIdx === i ? null : i)
              }}
              className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left text-[16px] font-semibold"
            >
              {q}
              <ChevronDown
                size={20}
                className={`shrink-0 transition ${openIdx === i ? 'rotate-180' : ''}`}
              />
            </button>
            {openIdx === i && (
              <p className="px-4 pb-4 text-[15px] text-muted">{a}</p>
            )}
          </div>
        ))}
      </div>
    </Sheet>
  )
}

export function AboutSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="O aplikaci">
      <div className="pb-4">
        <div className="text-[26px] font-extrabold">
          Poje<span className="text-brand-600">ď</span>
        </div>
        <div className="text-[15px] text-muted">
          sdílená auta · verze prototypu 1.0
        </div>
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-[15px] text-amber-900">
          {PROTOTYPE_NOTE}
        </p>
        <p className="mt-3 text-[14px] text-muted">
          Všechna data jsou smyšlená. Mapové podklady © přispěvatelé
          OpenStreetMap.
        </p>
      </div>
    </Sheet>
  )
}

export default function AccountScreen() {
  const { savedFilter, bonusMinutes, card, set } = useApp()
  const [help, setHelp] = useState(false)
  const [about, setAbout] = useState(false)
  const [filters, setFilters] = useState(false)
  const [support, setSupport] = useState(false)

  const Row = ({
    icon,
    label,
    value,
    onClick,
  }: {
    icon: React.ReactNode
    label: string
    value?: string
    onClick: () => void
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 px-4 text-left active:bg-gray-50"
    >
      <span className="text-brand-700">{icon}</span>
      <span className="flex-1 text-[16px] font-semibold">{label}</span>
      {value && <span className="text-[15px] text-muted">{value}</span>}
      <ChevronRight size={20} className="text-muted" />
    </button>
  )

  return (
    <div className="absolute inset-x-0 top-0 bottom-[68px] z-[700] flex flex-col bg-gray-50">
      <ScreenHeader title="Účet" />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-[20px] font-bold text-brand-700">
            JN
          </span>
          <div>
            <div className="text-[19px] font-bold">Ramazan Mamanov</div>
            <div className="text-[14px] text-muted">
              ramazan.mamanov@example.cz
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <Gift size={22} className="text-brand-700" />
            <div className="mt-1 text-[24px] font-extrabold">
              {bonusMinutes} min
            </div>
            <div className="text-[13px] text-muted">bonusové minuty</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <CreditCard size={22} className="text-brand-700" />
            <div className="mt-1 text-[20px] font-extrabold">•••• {card}</div>
            <div className="text-[13px] text-muted">
              {card === '4242' ? 'Visa' : 'Mastercard'} · výchozí
            </div>
          </div>
        </div>
        <div className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm">
          <Row
            icon={<SlidersHorizontal size={20} />}
            label="Uložené filtry"
            value={savedFilter ? '1' : 'žádný'}
            onClick={() => {
              setFilters(true)
            }}
          />
          <Row
            icon={<CreditCard size={20} />}
            label="Platební karty"
            onClick={() => notInPrototype()}
          />
          <Row
            icon={<CircleHelp size={20} />}
            label="Nápověda"
            onClick={() => {
              setHelp(true)
            }}
          />
          <Row
            icon={<Headset size={20} />}
            label="Podpora"
            onClick={() => {
              setSupport(true)
            }}
          />
          <Row
            icon={<Info size={20} />}
            label="O aplikaci"
            onClick={() => {
              setAbout(true)
            }}
          />
          <Row
            icon={<LogOut size={20} />}
            label="Odhlásit se"
            onClick={() => notInPrototype()}
          />
        </div>
        <p className="mt-4 text-center text-[12px] text-muted">
          {PROTOTYPE_NOTE}
        </p>
      </div>

      <HelpSheet open={help} onClose={() => setHelp(false)} />
      <AboutSheet open={about} onClose={() => setAbout(false)} />
      <SupportSheet open={support} onClose={() => setSupport(false)} />
      <Sheet
        open={filters}
        onClose={() => setFilters(false)}
        title="Uložené filtry"
      >
        <div className="pb-4">
          {savedFilter ? (
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
              <SlidersHorizontal size={20} className="text-brand-700" />
              <div className="flex-1">
                <div className="text-[16px] font-semibold">
                  {describeFilter(savedFilter)}
                </div>
                <div className="text-[13px] text-muted">
                  Použije se automaticky při otevření aplikace
                </div>
              </div>
              <button
                type="button"
                aria-label="Smazat uložený filtr"
                onClick={() => {
                  set({ savedFilter: null, activeFilter: null })
                  toast('Uložený filtr smazán')
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full text-sos hover:bg-red-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ) : (
            <p className="text-[15px] text-muted">
              Zatím nemáte uložený filtr. Na mapě otevřete Filtr a zapněte
              „Uložit filtr“.
            </p>
          )}
        </div>
      </Sheet>
    </div>
  )
}
