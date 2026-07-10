import type { MotorOil, Product } from "@/lib/api/types";
import { resolveImageUrl } from "@/lib/media";

const PHONE_TEL = "+994552440646";
const WHATSAPP_BASE = `https://wa.me/${PHONE_TEL.replace(/\D/g, "")}`;

export type CatalogKind = "oil" | "product";

/**
 * Unified shape that both motor oils and general products are mapped into so the
 * storefront can render a single grid regardless of the backend source.
 */
export interface CatalogItem {
  key: string;
  kind: CatalogKind;
  name: string;
  category: string;
  /** Secondary line — oil type or product brand. */
  subtitle: string | null;
  /** Corner badge — viscosity for oils, part number for products. */
  badge: string | null;
  /** Compact spec text shown on the card. */
  spec: string | null;
  description: string | null;
  price: number | null;
  image: string | null;
  inStock: boolean;
  /** Stock count for products; null for oils (made-to-order). */
  count: number | null;
}

export const OIL_CATEGORY = "Motor yağları";
export const TRANSMISSION_CATEGORY = "Transmissiya yağları";
const OTHER_CATEGORY = "Digər";

export function mapOil(o: MotorOil): CatalogItem {
  return {
    key: `oil-${o.id}`,
    kind: "oil",
    name: o.productName,
    category: o.oilType === "Transmissiya yağı" ? TRANSMISSION_CATEGORY : OIL_CATEGORY,
    subtitle: o.oilType || null,
    badge: o.viscosity || null,
    spec: o.standardApproval || o.specification || null,
    description: o.description || null,
    price: o.oilPrice,
    image: resolveImageUrl(o.oilImage),
    inStock: true,
    count: null
  };
}

export function mapProduct(p: Product): CatalogItem {
  return {
    key: `product-${p.id}`,
    kind: "product",
    name: p.product,
    category: p.category?.trim() || OTHER_CATEGORY,
    subtitle: p.brand || null,
    badge: p.partNumber || null,
    spec: p.model?.length ? p.model.join(", ") : null,
    description: null,
    // Admin-hidden prices never reach the storefront card or the WhatsApp text.
    price: p.hidePrice ? null : (p.price ?? null),
    image: resolveImageUrl(p.images?.[0] ?? null),
    inStock: (p.count ?? 0) + (p.aftermarketCount ?? 0) > 0,
    count: (p.count ?? 0) + (p.aftermarketCount ?? 0)
  };
}

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

/** Ordered, de-duplicated category list with "Hamısı" pinned first. */
export function buildCategories(items: CatalogItem[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name);
  return ["Hamısı", ...sorted];
}

export function whatsappLink(item: CatalogItem) {
  const lines = [
    "Salam! Bu məhsulla maraqlanıram:",
    "",
    item.name,
    item.subtitle ? `Növ: ${item.subtitle}` : null,
    item.badge ? `Kod: ${item.badge}` : null,
    item.price !== null ? `Qiymət: ${item.price.toFixed(2)} ₼` : null
  ].filter(Boolean);
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(lines.join("\n"))}`;
}
