"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { motorOilsApi, productsApi } from "@/lib/api/endpoints";
import { mapOil, mapProduct, type CatalogItem } from "@/lib/catalog";

export function OilsPreview() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setItems(merged.slice(0, 8));
      if (
        merged.length === 0 &&
        productsRes.status === "rejected" &&
        oilsRes.status === "rejected"
      ) {
        setError("Kataloq yüklənmədi.");
      }
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
              Məhsul <span className="text-gradient">kataloqu</span>.
            </h2>
            <p className="mt-5 text-lg text-ink-300 max-w-xl leading-relaxed">
              Avtomobilin üçün uyğun məhsulları kataloqdan seç. Sifariş üçün WhatsApp və ya zəng.
            </p>
          </div>
          <Link
            href="/shop"
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
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <ProductCard key={item.key} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
