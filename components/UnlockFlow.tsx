"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Satellite, Radio, LoaderCircle } from "lucide-react";
import { Btn } from "./ui";
import { carById, MODELS } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { useMapUi } from "@/lib/map-ui";

type Step = "gps" | "connect" | "done";

export default function UnlockFlow() {
  const { reservation, startTrip } = useApp();
  const car = carById(reservation?.carId);
  const [step, setStep] = useState<Step>("gps");
  const [autoLeft, setAutoLeft] = useState(3);
  const done = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep("connect"), 1100);
    const t2 = setTimeout(() => {
      setStep("done");
      try {
        navigator.vibrate?.([80, 60, 160]);
      } catch {
        /* not supported */
      }
    }, 1100 + 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    startTrip();
    useMapUi.getState().setHint(true);
  };

  // closes by itself after 3 s
  useEffect(() => {
    if (step !== "done") return;
    const iv = setInterval(() => setAutoLeft((s) => s - 1), 1000);
    const t = setTimeout(finish, 3000);
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (!car) return null;

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-4 pt-[max(14px,env(safe-area-inset-top))]">
        <div className="flex min-h-16 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
          <span className="h-9 w-1.5 rounded-full bg-amber-400" />
          <div className="text-[18px] font-bold">Odemknutí vozu</div>
        </div>
      </div>
      <div className="absolute inset-0 z-[1400] flex items-center justify-center bg-black/45 p-5">
        <div className="anim-pop w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl" role="alertdialog" aria-live="assertive">
          <div className="text-[14px] text-muted">
            {MODELS[car.model].name} · {car.spz}
          </div>

          {/* connection indicators – large and explicit */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
            <Indicator icon={<Satellite size={22} />} label="GPS" ok text="Silný signál" />
            <Indicator
              icon={<Radio size={22} />}
              label="Spojení s vozem"
              ok={step === "done"}
              text={step === "done" ? "Připojeno" : step === "gps" ? "Čeká" : "Připojuji…"}
            />
          </div>

          <div className="mt-6 flex h-28 items-center justify-center">
            {step === "done" ? (
              <span className="anim-pop flex h-24 w-24 items-center justify-center rounded-full bg-brand text-ink">
                <Check size={56} strokeWidth={3} />
              </span>
            ) : (
              <LoaderCircle size={88} className="animate-spin text-brand-600" strokeWidth={1.6} />
            )}
          </div>

          <ol className="mt-2 space-y-1 text-left text-[15px]">
            <StepRow label={step === "gps" ? "Ověřuji polohu…" : "Poloha ověřena"} state={step === "gps" ? "now" : "done"} />
            <StepRow
              label={step === "done" ? "Spojení s vozem navázáno" : "Navazuji spojení s vozem…"}
              state={step === "gps" ? "todo" : step === "connect" ? "now" : "done"}
            />
          </ol>

          <h2 className={`mt-4 ${step === "done" ? "text-[28px]" : "text-[21px]"} font-extrabold`}>
            {step === "done" ? "Auto odemčeno!" : step === "gps" ? "Ověřuji polohu…" : "Navazuji spojení s vozem…"}
          </h2>

          {step === "done" && (
            <Btn className="mt-4 w-full" size="lg" onClick={finish}>
              Pokračovat ({Math.max(0, autoLeft)})
            </Btn>
          )}
        </div>
      </div>
    </>
  );
}

function Indicator({ icon, label, ok, text }: { icon: React.ReactNode; label: string; ok: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 ${
        ok ? "border-green-600 bg-green-50 text-green-800" : "border-amber-500 bg-amber-50 text-amber-900"
      }`}
    >
      <span className={ok ? "" : "animate-pulse"}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold uppercase opacity-80">{label}</div>
        <div className="text-[15px] leading-tight font-bold">{text}</div>
      </div>
    </div>
  );
}

function StepRow({ label, state }: { label: string; state: "todo" | "now" | "done" }) {
  return (
    <li className={`flex items-center gap-2 ${state === "todo" ? "text-gray-400" : ""}`}>
      <span className="flex h-6 w-6 items-center justify-center">
        {state === "done" ? (
          <Check size={18} className="text-green-700" strokeWidth={3} />
        ) : state === "now" ? (
          <LoaderCircle size={18} className="animate-spin text-brand-700" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-gray-300" />
        )}
      </span>
      <span className={state === "now" ? "font-semibold" : ""}>{label}</span>
    </li>
  );
}
