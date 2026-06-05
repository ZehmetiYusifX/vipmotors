import { Calendar, Droplet, Gauge, MessageCircle, Wrench } from "lucide-react";

import type { UserCar } from "@/lib/api/types";
import { formatDate, formatKm } from "../format";
import { SectionHeader } from "./SectionHeader";

interface HistorySectionProps {
  primaryCar: UserCar | null;
}

export function HistorySection({ primaryCar }: HistorySectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Servis tarixçəsi"
        title="Avtomobilinin son servisləri"
        description="Yağ dəyişimi və servis qeydləri usta tərəfindən avtomatik əlavə olunur."
        action={
          <a
            href="https://wa.me/994551234567"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-4 w-4" />
            Randevu yaz
          </a>
        }
      />

      {primaryCar?.lastServiceDate ? (
        <ol className="relative space-y-4 rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8">
          <div className="absolute bottom-8 left-9 top-8 w-px bg-white/5" />
          <li className="relative flex items-start gap-4 pl-10">
            <span className="absolute left-0 grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
              <Droplet className="h-3.5 w-3.5 text-white" />
            </span>
            <div className="flex-1 rounded-xl border-hairline bg-ink-900/60 p-4">
              <strong className="block text-white">
                Yağ dəyişimi · {primaryCar.oilBrand || "Yağ"}{" "}
                {primaryCar.oilType ? `(${primaryCar.oilType})` : ""}
              </strong>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(primaryCar.lastServiceDate)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  {formatKm(primaryCar.currentKm)}
                </span>
              </div>
            </div>
          </li>
        </ol>
      ) : (
        <div className="rounded-2xl border border-dashed border-hairline bg-ink-900/40 p-10 text-center">
          <Wrench className="mx-auto h-8 w-8 text-ink-500" />
          <strong className="mt-3 block text-white">Hələ servis qeydi yoxdur.</strong>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-400">
            İlk dəfə servisə getdiyiniz zaman usta dövlət qeydiyyat nişanınız
            üzərindən qeyd yaradacaq və bu sahə avtomatik dolacaq.
          </p>
        </div>
      )}
    </div>
  );
}
