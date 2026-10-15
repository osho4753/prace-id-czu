"use client";

import { Phone, MessageCircle, Mail, TriangleAlert, ChevronRight, MessagesSquare } from "lucide-react";
import { Sheet, notInPrototype, toast } from "./ui";
import { SUPPORT_PHONE, SUPPORT_TEL } from "@/lib/mock-data";
import { useState } from "react";

export default function SupportSheet({ open, onClose, sos }: { open: boolean; onClose: () => void; sos?: boolean }) {
  const [accident, setAccident] = useState(false);

  const Row = ({
    icon,
    title,
    sub,
    onClick,
    href,
    strong,
  }: {
    icon: React.ReactNode;
    title: string;
    sub: string;
    onClick?: () => void;
    href?: string;
    strong?: boolean;
  }) => {
    const cls = `flex min-h-16 w-full items-center gap-4 rounded-2xl px-4 py-3 text-left ${
      strong ? "bg-sos text-white" : "bg-gray-50 active:bg-gray-100"
    }`;
    const inner = (
      <>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${strong ? "bg-white/20" : "bg-white shadow-sm"}`}>{icon}</span>
        <span className="flex-1">
          <span className="block text-[17px] font-bold">{title}</span>
          <span className={`block text-[14px] ${strong ? "text-white/90" : "text-muted"}`}>{sub}</span>
        </span>
        <ChevronRight size={20} className={strong ? "text-white" : "text-muted"} />
      </>
    );
    return href ? (
      <a href={href} className={cls}>
        {inner}
      </a>
    ) : (
      <button
        type="button"
        className={cls}
        onClick={() => {
          onClick?.();
        }}
      >
        {inner}
      </button>
    );
  };

  return (
    <>
      <Sheet open={open && !accident} onClose={onClose} title={sos ? "SOS – pomoc" : "Podpora"} z={1300}>
        <p className="mb-3 text-[15px] text-muted">Jsme tu nonstop. Vyberte, jak nás chcete kontaktovat.</p>
        <div className="flex flex-col gap-2.5">
          <Row strong icon={<Phone size={22} />} title="Zavolat podporu 24/7" sub={SUPPORT_PHONE} href={SUPPORT_TEL} />
          <Row icon={<MessagesSquare size={22} className="text-brand-700" />} title="Chat" sub="Odpověď obvykle do 2 minut" onClick={() => notInPrototype()} />
          <Row icon={<MessageCircle size={22} className="text-green-700" />} title="WhatsApp" sub="Napište nám zprávu" onClick={() => notInPrototype()} />
          <Row icon={<Mail size={22} className="text-brand-700" />} title="E-mail" sub="podpora@pojed.example" href="mailto:podpora@pojed.example" />
          <Row icon={<TriangleAlert size={22} className="text-amber-600" />} title="Nehoda / odtah" sub="Postup krok za krokem" onClick={() => setAccident(true)} />
        </div>
      </Sheet>
      <Sheet open={open && accident} onClose={() => setAccident(false)} title="Nehoda / odtah" z={1310}>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-[16px]">
          <li>Zajistěte bezpečí – zapněte výstražná světla a oblečte si reflexní vestu (v kufru).</li>
          <li>Při zranění volejte <a className="font-bold underline" href="tel:112">112</a>.</li>
          <li>Vyfoťte místo nehody a poškození obou vozů.</li>
          <li>Zavolejte nám – zajistíme odtah i náhradní vůz.</li>
        </ol>
        <div className="flex flex-col gap-2.5">
          <a href={SUPPORT_TEL} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sos text-[18px] font-bold text-white">
            <Phone size={20} /> Zavolat podporu 24/7
          </a>
          <button
            type="button"
            onClick={() => {
              toast("Hlášení odesláno. Ozveme se do 5 minut.");
              setAccident(false);
              onClose();
            }}
            className="min-h-12 rounded-2xl border-2 border-brand font-semibold"
          >
            Nahlásit nehodu bez volání
          </button>
        </div>
      </Sheet>
    </>
  );
}
