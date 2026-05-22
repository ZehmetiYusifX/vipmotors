"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Droplet, Loader2, ImageIcon } from "lucide-react";

import { motorOilsApi } from "@/lib/api/endpoints";
import { ApiError, type MotorOil } from "@/lib/api/types";

const PHONE_TEL = "+994552440646";
const WHATSAPP_BASE = `https://wa.me/${PHONE_TEL.replace(/\D/g, "")}`;

function formatPrice(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

function whatsappLink(o: MotorOil) {
  const priceLine = o.oilPrice !== null && o.oilPrice !== undefined
    ? `\nQiymət: ${o.oilPrice.toFixed(2)} ₼`
    : "";
  const msg = `Salam! Bu yağla maraqlanıram:\n\n${o.productName}\nViskozite: ${o.viscosity}\nTip: ${o.oilType}\nStandart: ${o.standardApproval}${priceLine}`;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`;
}

export function OilsPreview() {
  const [items, setItems] = useState<MotorOil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    motorOilsApi
      .getAll(ctrl.signal)
      .then((list) => {
        setItems(Array.isArray(list) ? list.slice(0, 6) : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Yağlar yüklənmədi.");
        setLoading(false);
      });
    return () => ctrl.abort();
  }, []);

  if (!loading && items.length === 0 && !error) {
    return null;
  }

  return (
    <section className="relative py-24 sm:py-32 bg-ink-900/20 border-y border-white/5" id="oils">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              Orijinal <span className="text-gradient">motor yağları</span>.
            </h2>
            <p className="mt-5 text-lg text-ink-300 max-w-xl leading-relaxed">
              Castrol, Mobil, Shell və digər brendlərdən viskozite və spesifikasiyalara uyğun seçim. Sifariş üçün WhatsApp.
            </p>
          </div>
          <Link
            href="/oils"
            className="inline-flex items-center gap-2 self-start rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Tam kataloq <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 grid place-items-center py-16">
            <Loader2 className="h-6 w-6 text-ink-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-200/90">
            {error}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((o) => (
              <article
                key={o.id}
                className="group rounded-2xl border-hairline bg-ink-900/50 overflow-hidden hover:bg-ink-900 hover:border-brand-500/30 transition-all flex flex-col"
              >
                <div className="aspect-[4/3] bg-ink-950/70 grid place-items-center overflow-hidden relative">
                  {o.oilImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.oilImage}
                      alt={o.productName}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-brand-500/20 to-brand-700/10 border border-brand-500/20 text-brand-300">
                      <Droplet className="h-7 w-7" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 rounded-full bg-ink-950/80 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-brand-300 border border-brand-500/20">
                    {o.viscosity}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-base font-semibold text-white">{o.productName}</div>
                  <div className="mt-1 text-xs text-ink-400">{o.oilType}</div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-white/[0.03] p-2">
                      <div className="text-ink-500">Standart</div>
                      <div className="text-ink-200 mt-0.5 truncate">
                        {o.standardApproval || "—"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] p-2">
                      <div className="text-ink-500">Spec.</div>
                      <div className="text-ink-200 mt-0.5 truncate">{o.specification || "—"}</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                    <div className="text-xl font-semibold text-white">
                      {formatPrice(o.oilPrice)}{" "}
                      <span className="text-sm text-ink-400">₼</span>
                    </div>
                    <a
                      href={whatsappLink(o)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white px-3.5 py-2 text-xs font-semibold transition-colors"
                    >
                      WhatsApp sifariş
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
