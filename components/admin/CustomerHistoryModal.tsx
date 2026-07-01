"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Droplet,
  Filter,
  Gauge,
  Loader2,
  Wrench,
  X
} from "lucide-react";

import { carServiceOps } from "@/lib/api/endpoints";
import {
  ApiError,
  type MaintenanceRecord,
  type UserProfile
} from "@/lib/api/types";
import { formatDate, formatKm } from "@/components/dashboard/format";

interface CustomerHistoryModalProps {
  customer: UserProfile | null;
  onClose: () => void;
  onUnauthorized: () => void;
}

function recordFilters(rec: MaintenanceRecord): string[] {
  return [
    rec.oilFilterChanged && "Yağ filtri",
    rec.fuelFilterChanged && "Yanacaq filtri",
    rec.airFilterChanged && "Hava filtri",
    rec.cabinFilterChanged && "Salon filtri"
  ].filter(Boolean) as string[];
}

// Read-only service history for one customer. Fetches by customerId so it
// spans every car on the account.
export function CustomerHistoryModal({
  customer,
  onClose,
  onUnauthorized
}: CustomerHistoryModalProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setRecords([]);
    carServiceOps
      .maintenanceHistory({ customerId: customer.id }, "CAR_SERVICE", controller.signal)
      .then((res) => setRecords(Array.isArray(res) ? res : []))
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized();
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Servis tarixçəsi yüklənmədi."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [customer, onUnauthorized]);

  if (!customer) return null;

  const name =
    customer.fullName?.trim() || customer.plateNumber || customer.email || "—";

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="min-w-0">
            <div className="text-base font-semibold text-white truncate">
              {name}
            </div>
            <div className="text-xs text-ink-400">
              Servis tarixçəsi
              {!loading && ` · ${records.length} qeyd`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="grid place-items-center py-10 text-ink-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-2xl border-hairline bg-ink-900/40 p-10 text-center text-ink-400">
              Bu müştəri üçün hələ servis qeydi yoxdur.
            </div>
          ) : (
            <ul className="space-y-3">
              {records.map((rec) => {
                const filters = recordFilters(rec);
                return (
                  <li
                    key={rec.id}
                    className="rounded-2xl border-hairline bg-ink-900/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <strong className="flex items-center gap-2 text-sm text-white">
                        <Wrench className="h-4 w-4 text-brand-400" />
                        {rec.serviceItemTitle || "Servis"}
                      </strong>
                      <span className="inline-flex items-center gap-1.5 shrink-0 font-mono text-xs font-semibold tracking-wider text-white">
                        {rec.customerPlateNumber}
                      </span>
                    </div>
                    <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-300">
                      <div className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-ink-500" />
                        <dd className="text-white">{formatDate(rec.serviceDate)}</dd>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <Gauge className="h-3 w-3 text-ink-500" />
                        <dd className="text-white">{formatKm(rec.serviceKm)}</dd>
                      </div>
                      {rec.serviceItemType === "OIL_CHANGE" &&
                        (rec.oilBrand || rec.oilType) && (
                          <div className="inline-flex items-center gap-1.5">
                            <Droplet className="h-3 w-3 text-ink-500" />
                            <dd className="text-white">
                              {rec.oilBrand}
                              {rec.oilType ? ` · ${rec.oilType}` : ""}
                              {rec.oilLiters ? ` · ${rec.oilLiters} L` : ""}
                            </dd>
                          </div>
                        )}
                    </dl>
                    {rec.workDescription && (
                      <p className="mt-2 text-xs text-ink-400">
                        {rec.workDescription}
                      </p>
                    )}
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
