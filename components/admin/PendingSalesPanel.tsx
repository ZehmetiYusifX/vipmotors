"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  User,
  AlertTriangle,
  PackageCheck
} from "lucide-react";

import { productsApi } from "@/lib/api/endpoints";
import { ApiError, type ProductSale } from "@/lib/api/types";
import { formatAzDateTime as formatDateTime } from "@/lib/date";

interface PendingSalesPanelProps {
  onUnauthorized: () => void;
  onConfirmed?: () => void;
}

export function PendingSalesPanel({ onUnauthorized, onConfirmed }: PendingSalesPanelProps) {
  const [items, setItems] = useState<ProductSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await productsApi.pendingSales();
      const pending = (Array.isArray(list) ? list : []).filter(
        (s) => s.status === "PENDING"
      );
      setItems(pending);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Təsdiq gözləyən satışlar yüklənmədi."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirm(sale: ProductSale) {
    setConfirmingId(sale.id);
    setError(null);
    try {
      await productsApi.confirmSale(sale.id);
      setItems((prev) => prev.filter((s) => s.id !== sale.id));
      onConfirmed?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Təsdiq mümkün olmadı.");
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-amber-500/15">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
            <Clock className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Təsdiq gözləyən satışlar
              {items.length > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-200 text-[11px] font-semibold px-2 py-0.5 min-w-[1.5rem]">
                  {items.length}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-ink-400 mt-0.5">
              Operatorların satışları — təsdiqlədikdə anbardan çıxılır
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="grid h-9 w-9 place-items-center rounded-lg border-hairline bg-white/5 hover:bg-white/10 text-ink-300 hover:text-white disabled:opacity-50"
          aria-label="Yenilə"
          title="Yenilə"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 grid place-items-center text-ink-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <PackageCheck className="h-8 w-8 text-emerald-400/60 mx-auto" />
            <p className="mt-2 text-sm text-ink-400">
              Hazırda təsdiq gözləyən satış yoxdur.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((sale) => {
              const name = sale.product?.product || sale.partNumber;
              const insufficient = sale.count > sale.productCount;
              return (
                <li
                  key={sale.id}
                  className="rounded-xl border-hairline bg-ink-900/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-white text-sm truncate">{name}</strong>
                      <span className="font-mono text-[11px] text-ink-400 rounded bg-white/5 px-1.5 py-0.5">
                        {sale.partNumber}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-ink-400">
                      <span className="inline-flex items-center gap-1.5 text-ink-300">
                        <User className="h-3.5 w-3.5" />
                        {sale.requestedBy || "—"}
                      </span>
                      <span>{formatDateTime(sale.createdAt)}</span>
                      <span>
                        Anbarda: <span className="text-ink-200">{sale.productCount}</span>
                      </span>
                    </div>
                    {insufficient && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-red-300">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Anbarda kifayət qədər say yoxdur
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-ink-500">
                        Say
                      </div>
                      <div className="text-lg font-semibold text-amber-200 leading-none mt-0.5">
                        ×{sale.count}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => confirm(sale)}
                      disabled={confirmingId === sale.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                    >
                      {confirmingId === sale.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Təsdiqlə
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
