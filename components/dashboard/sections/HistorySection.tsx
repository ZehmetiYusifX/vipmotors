"use client";

import { useEffect, useState } from "react";
import { Calendar, Car, Droplet, Filter, Gauge, Loader2, MessageCircle, Wrench } from "lucide-react";

import { userAuth } from "@/lib/api/endpoints";
import type { MaintenanceRecord, UserCar } from "@/lib/api/types";
import { formatDate, formatKm } from "../format";
import { SectionHeader } from "./SectionHeader";

interface HistorySectionProps {
  primaryCar: UserCar | null;
}

export function HistorySection({ primaryCar }: HistorySectionProps) {
  // `null` means "fall back to the synthetic single entry" (endpoint failed or
  // is not available to this role); an array means real records were returned.
  const [records, setRecords] = useState<MaintenanceRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    userAuth
      .maintenanceHistory(controller.signal)
      .then((data) => {
        if (active) setRecords(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Supplementary data — on any failure keep the existing fallback view.
        if (active) setRecords(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const hasRecords = records != null && records.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Servis tarixçəsi"
        title="Avtomobilinin son servisləri"
        description="Yağ dəyişimi və servis qeydləri usta tərəfindən avtomatik əlavə olunur."
        action={
          <a
            href="https://wa.me/994552440646"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            <MessageCircle className="h-4 w-4" />
            Randevu yaz
          </a>
        }
      />

      {loading && records == null ? (
        <div className="grid place-items-center rounded-2xl border-hairline bg-ink-900/40 p-10">
          <Loader2 className="h-6 w-6 animate-spin text-ink-500" />
        </div>
      ) : hasRecords ? (
        <ol className="relative space-y-4 rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8">
          <div className="absolute bottom-8 left-9 top-8 w-px bg-white/5" />
          {records!.map((rec) => {
            const filters = [
              rec.oilFilterChanged && "Yağ filtri",
              rec.fuelFilterChanged && "Yanacaq filtri",
              rec.airFilterChanged && "Hava filtri",
              rec.cabinFilterChanged && "Salon filtri"
            ].filter(Boolean) as string[];
            return (
              <li key={rec.id} className="relative flex items-start gap-4 pl-10">
                <span className="absolute left-0 grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
                  <Wrench className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="flex-1 rounded-xl border-hairline bg-ink-900/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="block text-white">
                        {rec.serviceItemTitle || "Servis"}
                        {rec.serviceItemType === "OIL_CHANGE" && rec.oilBrand
                          ? ` · ${rec.oilBrand}${rec.oilType ? ` (${rec.oilType})` : ""}`
                          : ""}
                      </strong>
                      {rec.carName && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-400">
                          <Car className="h-3 w-3" />
                          {rec.carName}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-ink-400 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formatDate(rec.serviceDate)}
                    </span>
                  </div>

                  {rec.workDescription && (
                    <p className="mt-1.5 text-xs text-ink-300">{rec.workDescription}</p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {formatKm(rec.serviceKm)}
                    </span>
                    {rec.nextServiceKm != null && (
                      <span className="inline-flex items-center gap-1">
                        Növbəti: {formatKm(rec.nextServiceKm)}
                      </span>
                    )}
                  </div>

                  {filters.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {filters.map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[11px] text-brand-200"
                        >
                          <Filter className="h-2.5 w-2.5" />
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : primaryCar?.lastServiceDate ? (
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
