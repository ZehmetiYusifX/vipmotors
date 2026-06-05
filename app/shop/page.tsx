"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  ListFilter,
  Loader2,
  Phone,
  Search as SearchIcon
} from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { Select } from "@/components/shop/Select";
import { motorOilsApi, productsApi } from "@/lib/api/endpoints";
import {
  buildCategories,
  mapOil,
  mapProduct,
  type CatalogItem
} from "@/lib/catalog";

const PHONE_DISPLAY = "+994 55 244 06 46";
const PHONE_TEL = "+994552440646";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Tövsiyə olunan" },
  { key: "price-asc", label: "Ucuz → Baha" },
  { key: "price-desc", label: "Baha → Ucuz" },
  { key: "name", label: "Ad (A–Z)" }
];

export default function ShopPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Hamısı");
  const [sort, setSort] = useState<SortKey>("featured");

  useEffect(() => {
    const ctrl = new AbortController();
    Promise.allSettled([
      productsApi.getAll(ctrl.signal),
      motorOilsApi.getAll(ctrl.signal)
    ]).then((results) => {
      if (ctrl.signal.aborted) return;
      const [productsRes, oilsRes] = results;
      const products =
        productsRes.status === "fulfilled" && Array.isArray(productsRes.value)
          ? productsRes.value
          : [];
      const oils =
        oilsRes.status === "fulfilled" && Array.isArray(oilsRes.value)
          ? oilsRes.value
          : [];
      const merged = [...products.map(mapProduct), ...oils.map(mapOil)];
      setItems(merged);
      if (merged.length === 0 && productsRes.status === "rejected" && oilsRes.status === "rejected") {
        setError("Kataloq yüklənmədi. Bir azdan yenidən cəhd edin.");
      }
      setLoading(false);
    });
    return () => ctrl.abort();
  }, []);

  const categories = useMemo(() => buildCategories(items), [items]);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((i) => counts.set(i.category, (counts.get(i.category) ?? 0) + 1));
    return categories.map((c) => ({
      value: c,
      label: c,
      hint: String(c === "Hamısı" ? items.length : counts.get(c) ?? 0)
    }));
  }, [categories, items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((item) => {
      if (category !== "Hamısı" && item.category !== category) return false;
      if (!q) return true;
      return [item.name, item.subtitle, item.category, item.badge, item.spec]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(q));
    });

    const withPrice = (v: number | null) => (v === null ? Number.POSITIVE_INFINITY : v);
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => withPrice(a.price) - withPrice(b.price));
    else if (sort === "price-desc") sorted.sort((a, b) => withPrice(b.price) - withPrice(a.price));
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [items, query, category, sort]);

  return (
    <main className="relative min-h-screen bg-ink-950 text-ink-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(225,29,46,0.12),transparent_70%)]"
      />

      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
              className="hidden items-center gap-2 rounded-full border-hairline px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5 sm:inline-flex"
            >
              <Phone className="h-4 w-4 text-brand-400" />
              {PHONE_DISPLAY}
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Geri
            </Link>
          </div>
        </div>
      </header>

      <section className="relative border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
            VIP Motors Baku
          </span>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Məhsul <span className="text-gradient">kataloqu</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-300">
            Yağlar, ehtiyat hissələri və aksesuarlar — hamısı bir yerdə. Avtomobilinə uyğun
            məhsulu seç, WhatsApp və ya zənglə sifariş ver.
          </p>
          {!loading && !error && (
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-ink-400">
              <span className="rounded-full border-hairline bg-ink-900/50 px-3 py-1.5">
                {items.length} məhsul
              </span>
              <span className="rounded-full border-hairline bg-ink-900/50 px-3 py-1.5">
                {Math.max(categories.length - 1, 0)} kateqoriya
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-16 z-30 border-b border-white/5 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-xl flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Məhsul, marka, kod axtar…"
                className="w-full rounded-xl border-hairline bg-ink-900/60 py-3 pl-10 pr-4 text-white outline-none transition-colors placeholder:text-ink-500 focus:border-brand-500/50 focus:bg-ink-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                label="Kateqoriya"
                icon={<ListFilter className="h-4 w-4" />}
                className="flex-1 sm:w-52 sm:flex-none"
              />
              <Select
                value={sort}
                onChange={(v) => setSort(v as SortKey)}
                options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
                label="Sırala"
                icon={<ArrowDownUp className="h-4 w-4" />}
                className="flex-1 sm:w-48 sm:flex-none"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-xs text-ink-400">
          {loading ? "Yüklənir…" : `${filtered.length} nəticə`}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border-hairline bg-ink-900/40"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-200/90">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-hairline bg-ink-900/40 p-12 text-center text-ink-400">
            Heç bir məhsul tapılmadı. Axtarışı dəyişin və ya bizimlə əlaqə saxlayın.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <ProductCard key={item.key} item={item} />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-10 border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-8 text-xs text-ink-500 sm:flex-row sm:px-6 lg:px-8">
          <div>© 2026 VIP Motors Baku</div>
          <div>Sifariş əvvəli {PHONE_DISPLAY} ilə təsdiqləyin.</div>
        </div>
      </footer>
    </main>
  );
}
