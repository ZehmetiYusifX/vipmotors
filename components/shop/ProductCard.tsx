"use client";

import { Droplet, MessageCircle, Package } from "lucide-react";

import { formatPrice, whatsappLink, type CatalogItem } from "@/lib/catalog";

export function ProductCard({ item }: { item: CatalogItem }) {
  const Icon = item.kind === "oil" ? Droplet : Package;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border-hairline bg-ink-900/50 transition-all hover:-translate-y-0.5 hover:border-brand-500/30 hover:bg-ink-900">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-ink-950/70">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-brand-500/20 bg-linear-to-br from-brand-500/20 to-brand-700/10 text-brand-300">
            <Icon className="h-7 w-7" />
          </div>
        )}

        {item.badge && (
          <span className="absolute right-3 top-3 rounded-full border border-brand-500/20 bg-ink-950/80 px-2.5 py-1 text-[11px] font-semibold text-brand-300 backdrop-blur">
            {item.badge}
          </span>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-300 backdrop-blur">
          {item.category}
        </span>

        {!item.inStock && (
          <span className="absolute bottom-3 left-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
            Stokda yoxdur
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-base font-semibold leading-snug text-white">{item.name}</div>
        {item.subtitle && <div className="mt-1 text-xs text-ink-400">{item.subtitle}</div>}

        {item.spec && (
          <div className="mt-4 rounded-lg bg-white/[0.03] p-2.5 text-[11px]">
            <div className="text-ink-500">
              {item.kind === "oil" ? "Standart" : "Uyğun modellər"}
            </div>
            <div className="mt-0.5 line-clamp-2 text-ink-200">{item.spec}</div>
          </div>
        )}

        {item.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-300">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="text-xl font-semibold text-white">
            {formatPrice(item.price)} <span className="text-sm text-ink-400">₼</span>
          </div>
          <a
            href={whatsappLink(item)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-400"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Sifariş et
          </a>
        </div>
      </div>
    </article>
  );
}
