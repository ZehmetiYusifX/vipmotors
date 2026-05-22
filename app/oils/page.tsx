"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Droplet,
  Loader2,
  MessageCircle,
  Phone,
  Search as SearchIcon
} from "lucide-react";

import { motorOilsApi } from "@/lib/api/endpoints";
import { ApiError, type MotorOil } from "@/lib/api/types";

const PHONE_DISPLAY = "+994 55 244 06 46";
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

export default function OilsPage() {
  const [items, setItems] = useState<MotorOil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [viscosityFilter, setViscosityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    motorOilsApi
      .getAll(ctrl.signal)
      .then((list) => {
        setItems(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Yağlar yüklənmədi.");
        setLoading(false);
      });
    return () => ctrl.abort();
  }, []);

  const viscosities = useMemo(() => {
    const set = new Set<string>();
    items.forEach((o) => o.viscosity && set.add(o.viscosity));
    return Array.from(set).sort();
  }, [items]);

  const types = useMemo(() => {
    const set = new Set<string>();
    items.forEach((o) => o.oilType && set.add(o.oilType));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((o) => {
      if (viscosityFilter && o.viscosity !== viscosityFilter) return false;
      if (typeFilter && o.oilType !== typeFilter) return false;
      if (!q) return true;
      return (
        o.productName.toLowerCase().includes(q) ||
        o.viscosity.toLowerCase().includes(q) ||
        o.oilType.toLowerCase().includes(q) ||
        o.standardApproval.toLowerCase().includes(q) ||
        o.specification.toLowerCase().includes(q)
      );
    });
  }, [items, query, viscosityFilter, typeFilter]);

  return (
    <main className="relative min-h-screen bg-ink-950 text-ink-100">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
              <Image
                src="/images/vip-motors-logo.png"
                alt="VIP Motors logo"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              VIP <span className="text-ink-300">Motors Baku</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${PHONE_TEL}`}
              className="hidden sm:inline-flex items-center gap-2 rounded-full border-hairline px-3.5 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors"
            >
              <Phone className="h-4 w-4 text-brand-400" />
              {PHONE_DISPLAY}
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-300 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" /> Geri
            </Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-white/5 bg-ink-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
            Motor yağları <span className="text-gradient">kataloqu</span>
          </h1>
          <p className="mt-5 text-lg text-ink-300 max-w-2xl leading-relaxed">
            Viskozite və spesifikasiyaya görə uyğun yağı seç. Sifariş üçün WhatsApp və ya zəng.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ad / viskozite / tip / standart"
              className="w-full rounded-xl border-hairline bg-ink-900/60 pl-10 pr-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={viscosityFilter}
              onChange={(e) => setViscosityFilter(e.target.value)}
              className="rounded-xl border-hairline bg-ink-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500/50"
            >
              <option value="">Bütün viskozitelər</option>
              {viscosities.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border-hairline bg-ink-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500/50"
            >
              <option value="">Bütün tiplər</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-ink-400">
          {loading ? "Yüklənir..." : `${filtered.length} yağ`}
        </div>

        {loading ? (
          <div className="mt-12 grid place-items-center py-20">
            <Loader2 className="h-6 w-6 text-ink-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-200/90">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border-hairline bg-ink-900/40 p-12 text-center text-ink-400">
            Heç bir yağ tapılmadı. Axtarış sözünü dəyişdirin və ya bizimlə əlaqə saxlayın.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((o) => (
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

                  {o.description && (
                    <p className="mt-3 text-xs text-ink-300 line-clamp-3">{o.description}</p>
                  )}

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
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-white/5 mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-xs text-ink-500 flex flex-col sm:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} VIP Motors Baku</div>
          <div>
            Sifariş əvvəli {PHONE_DISPLAY} ilə təsdiqləyin.
          </div>
        </div>
      </footer>
    </main>
  );
}
