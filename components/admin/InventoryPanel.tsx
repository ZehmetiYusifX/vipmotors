"use client";

import { useEffect, useRef, useState } from "react";
import {
  Package,
  Plus,
  Search as SearchIcon,
  Pencil,
  Trash2,
  X,
  Percent,
  ShoppingCart,
  AlertTriangle,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle2,
  ImagePlus,
  ImageIcon,
  EyeOff
} from "lucide-react";

import { resolveImageUrl } from "@/lib/media";
import { productsApi } from "@/lib/api/endpoints";
import { ApiError, type Product, type ProductPayload } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { NumberInput } from "@/components/ui/NumberInput";
import { PendingSalesPanel } from "./PendingSalesPanel";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

const COMMON_CATEGORIES = [
  "ENGINE_OIL",
  "OIL_FILTER",
  "AIR_FILTER",
  "FUEL_FILTER",
  "CABIN_FILTER",
  "BRAKE_PAD",
  "BRAKE_DISC",
  "SPARK_PLUG",
  "BATTERY",
  "TIRE",
  "ACCESSORY",
  "OTHER"
];

// Discount rate applied when the operator toggles the % action on a row.
const DISCOUNT_RATE = 0.11;

const EMPTY_FORM: ProductPayload = {
  product: "",
  partNumber: "",
  brand: "",
  category: null,
  price: 0,
  aftermarketPrice: null,
  hidePrice: false,
  count: 0,
  aftermarketCount: null,
  shelf: null,
  engineCode: [],
  model: [],
  similarProducts: [],
  crossReferenceOemEquivalents: []
};

function toFormState(p: Product | null): ProductPayload {
  if (!p) return { ...EMPTY_FORM };
  return {
    product: p.product,
    partNumber: p.partNumber,
    brand: p.brand,
    category: p.category,
    price: p.price,
    aftermarketPrice: p.aftermarketPrice ?? null,
    hidePrice: p.hidePrice ?? false,
    count: p.count,
    aftermarketCount: p.aftermarketCount ?? null,
    shelf: p.shelf,
    engineCode: p.engineCode ?? [],
    model: p.model ?? [],
    similarProducts: p.similarProducts ?? [],
    crossReferenceOemEquivalents: p.crossReferenceOemEquivalents ?? []
  };
}

/** Turns a stored /uploads/products/... path into an absolute URL. */
function imageUrl(path: string) {
  return resolveImageUrl(path) ?? path;
}

/**
 * Renders the standard price and, when stocked, the aftermarket variant price.
 * With `discounted` the 11%-off value is shown and the original struck through.
 */
function PriceView({
  product,
  discounted,
  align = "right"
}: {
  product: Product;
  discounted: boolean;
  align?: "left" | "right";
}) {
  const hasAftermarket = product.aftermarketPrice != null;
  const line = (value: number, label: string | null) => (
    <div
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap",
        align === "right" && "justify-end"
      )}
    >
      {label && (
        <span className="text-[10px] uppercase tracking-wide text-ink-500">
          {label}
        </span>
      )}
      {discounted ? (
        <>
          <span className="text-xs text-ink-500 line-through">
            {value.toFixed(2)}
          </span>
          <span className="font-semibold text-amber-300">
            {(value * (1 - DISCOUNT_RATE)).toFixed(2)} ₼
          </span>
        </>
      ) : (
        <span className="text-white">{value.toFixed(2)} ₼</span>
      )}
    </div>
  );

  return (
    <div className="space-y-0.5">
      {line(product.price, hasAftermarket ? "Orij." : null)}
      {hasAftermarket && line(product.aftermarketPrice!, "Q/orij.")}
      {product.hidePrice && (
        <div
          className={cn(
            "flex items-center gap-1 text-[10px] text-amber-300/80",
            align === "right" && "justify-end"
          )}
          title="Qiymət müştəriyə göstərilmir"
        >
          <EyeOff className="h-3 w-3" /> Gizli
        </div>
      )}
    </div>
  );
}

function StockBadge({ count, label }: { count: number; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        count > 5
          ? "bg-emerald-500/15 text-emerald-300"
          : count > 0
            ? "bg-amber-500/15 text-amber-300"
            : "bg-red-500/15 text-red-300"
      )}
    >
      {label && (
        <span className="text-[9px] uppercase tracking-wide opacity-70">
          {label}
        </span>
      )}
      {count}
    </span>
  );
}

/** Original stock badge plus, when stocked, the aftermarket variant badge. */
function StockView({ product, align = "right" }: { product: Product; align?: "left" | "right" }) {
  const hasAftermarket = product.aftermarketCount != null;
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        align === "right" ? "items-end" : "items-start"
      )}
    >
      <StockBadge count={product.count} label={hasAftermarket ? "Orij." : undefined} />
      {hasAftermarket && (
        <StockBadge count={product.aftermarketCount!} label="Q/orij." />
      )}
    </div>
  );
}

/** Small clickable thumbnail of the first product photo, with a +N counter. */
function ProductThumb({ product }: { product: Product }) {
  const images = product.images ?? [];
  if (images.length === 0) {
    return (
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-hairline bg-ink-900/60 text-ink-500">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }
  return (
    <a
      href={imageUrl(images[0])}
      target="_blank"
      rel="noreferrer"
      className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-lg border-hairline"
      title="Şəkli aç"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl(images[0])}
        alt={product.product}
        className="h-full w-full object-cover"
      />
      {images.length > 1 && (
        <span className="absolute bottom-0 right-0 rounded-tl bg-ink-950/80 px-1 text-[9px] font-semibold text-white">
          +{images.length - 1}
        </span>
      )}
    </a>
  );
}

export function InventoryPanel({
  onUnauthorized,
  isOwner = false
}: {
  onUnauthorized: () => void;
  isOwner?: boolean;
}) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductPayload>({ ...EMPTY_FORM });
  const [engineCodeInput, setEngineCodeInput] = useState("");
  const [modelInput, setModelInput] = useState("");
  const [similarInput, setSimilarInput] = useState("");
  const [crossRefInput, setCrossRefInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Photos already stored on the product being edited, and new files picked
  // in the modal (uploaded after create/update succeeds).
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sellOpenFor, setSellOpenFor] = useState<Product | null>(null);
  const [sellCount, setSellCount] = useState("1");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellNotice, setSellNotice] = useState<
    { kind: "pending" | "done"; text: string } | null
  >(null);

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMsg, setLookupMsg] = useState<{ kind: "ok" | "warn" | "err"; text: string } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Rows the operator toggled into 11%-discount view via the % action.
  const [discountedIds, setDiscountedIds] = useState<Set<number>>(new Set());

  function toggleDiscount(id: number) {
    setDiscountedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await productsApi.getAll();
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Məhsullar yüklənmədi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setEngineCodeInput("");
    setModelInput("");
    setSimilarInput("");
    setCrossRefInput("");
    setExistingImages([]);
    setNewImages([]);
    setSaveError(null);
    setLookupMsg(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm(toFormState(p));
    setEngineCodeInput((p.engineCode ?? []).join(", "));
    setModelInput((p.model ?? []).join(", "));
    setSimilarInput((p.similarProducts ?? []).join(", "));
    setCrossRefInput((p.crossReferenceOemEquivalents ?? []).join(", "));
    setExistingImages(p.images ?? []);
    setNewImages([]);
    setSaveError(null);
    setLookupMsg(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setLookupMsg(null);
  }

  async function runLookup() {
    const pn = form.partNumber.trim();
    if (!pn) {
      setLookupMsg({ kind: "warn", text: "Əvvəlcə Part Number daxil edin." });
      return;
    }
    setLookupLoading(true);
    setLookupMsg(null);
    try {
      const found = await productsApi.lookup(pn);
      setForm({
        product: found.product ?? "",
        partNumber: found.partNumber ?? pn,
        brand: found.brand ?? "",
        category: found.category ?? null,
        price: typeof found.price === "number" ? found.price : 0,
        aftermarketPrice:
          typeof found.aftermarketPrice === "number" ? found.aftermarketPrice : null,
        hidePrice: found.hidePrice ?? false,
        count: typeof found.count === "number" ? found.count : 0,
        aftermarketCount:
          typeof found.aftermarketCount === "number" ? found.aftermarketCount : null,
        shelf: found.shelf ?? null,
        engineCode: found.engineCode ?? [],
        model: found.model ?? [],
        similarProducts: found.similarProducts ?? [],
        crossReferenceOemEquivalents: found.crossReferenceOemEquivalents ?? []
      });
      setEngineCodeInput((found.engineCode ?? []).join(", "));
      setModelInput((found.model ?? []).join(", "));
      setSimilarInput((found.similarProducts ?? []).join(", "));
      setCrossRefInput((found.crossReferenceOemEquivalents ?? []).join(", "));
      setLookupMsg({ kind: "ok", text: "Məlumat dolduruldu. Lazımi sahələri yoxlayın." });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        setLookupMsg({ kind: "warn", text: "Bu part number bazada tapılmadı." });
      } else {
        setLookupMsg({
          kind: "err",
          text: err instanceof ApiError ? err.message : "Axtarış uğursuz oldu."
        });
      }
    } finally {
      setLookupLoading(false);
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const payload: ProductPayload = {
      ...form,
      price: Number(form.price) || 0,
      aftermarketPrice:
        form.aftermarketPrice == null || Number.isNaN(Number(form.aftermarketPrice))
          ? null
          : Number(form.aftermarketPrice),
      count: Number(form.count) || 0,
      aftermarketCount:
        form.aftermarketCount == null || Number.isNaN(Number(form.aftermarketCount))
          ? null
          : Number(form.aftermarketCount),
      shelf:
        form.shelf == null || Number.isNaN(Number(form.shelf))
          ? null
          : Number(form.shelf),
      category: form.category?.trim() || null,
      engineCode: engineCodeInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      model: modelInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      similarProducts: similarInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      crossReferenceOemEquivalents: crossRefInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    };
    setSaving(true);
    try {
      const saved = editing
        ? await productsApi.update(editing.id, payload)
        : await productsApi.create(payload);
      if (newImages.length > 0) {
        try {
          await productsApi.uploadImages(saved.id, newImages);
        } catch (imgErr) {
          setToast({
            kind: "error",
            text:
              imgErr instanceof ApiError
                ? `Məhsul yadda saxlanıldı, amma şəkillər yüklənmədi: ${imgErr.message}`
                : "Məhsul yadda saxlanıldı, amma şəkillər yüklənmədi."
          });
        }
      }
      closeModal();
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setSaveError(err instanceof ApiError ? err.message : "Yadda saxlamaq mümkün olmadı.");
    } finally {
      setSaving(false);
    }
  }

  function onPickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length > 0) {
      setNewImages((prev) => [...prev, ...files]);
    }
    // Reset so the same file can be re-picked after removal.
    e.target.value = "";
  }

  async function removeExistingImage(path: string) {
    if (!editing) return;
    setRemovingImage(path);
    try {
      const updated = await productsApi.removeImage(editing.id, path);
      setExistingImages(updated.images ?? []);
      setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setSaveError(err instanceof ApiError ? err.message : "Şəkli silmək mümkün olmadı.");
    } finally {
      setRemovingImage(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setDeleteTarget(null);
      setToast({
        kind: "error",
        text:
          err instanceof ApiError && err.status === 500
            ? "Məhsulu silmək mümkün olmadı — ehtimal ki, onun satış tarixçəsi var."
            : err instanceof ApiError
              ? err.message
              : "Silmək mümkün olmadı."
      });
    } finally {
      setDeleting(false);
    }
  }

  function openSell(p: Product) {
    setSellOpenFor(p);
    setSellCount("1");
    setSellError(null);
    setSellNotice(null);
  }

  async function confirmSell(e: React.FormEvent) {
    e.preventDefault();
    if (!sellOpenFor) return;
    const count = Number(sellCount);
    if (!count || count < 1) {
      setSellError("Say düzgün deyil.");
      return;
    }
    setSellLoading(true);
    setSellError(null);
    try {
      const sale = await productsApi.sell({
        partNumber: sellOpenFor.partNumber,
        count
      });
      setSellOpenFor(null);
      setSellNotice(
        sale?.status === "PENDING"
          ? {
              kind: "pending",
              text: "Satış qeydə alındı. Adminin təsdiqini gözləyin."
            }
          : { kind: "done", text: "Satış tamamlandı." }
      );
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setSellError(err instanceof ApiError ? err.message : "Satış uğursuz oldu.");
    } finally {
      setSellLoading(false);
    }
  }

  const filtered = query.trim()
    ? items.filter((p) => {
        const q = query.trim().toLowerCase();
        // Similar-product and OEM cross-reference part numbers also match, so
        // typing an equivalent code still surfaces the stocked product.
        return (
          p.partNumber.toLowerCase().includes(q) ||
          p.product.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.similarProducts ?? []).some((code) => code.toLowerCase().includes(q)) ||
          (p.crossReferenceOemEquivalents ?? []).some((code) =>
            code.toLowerCase().includes(q)
          )
        );
      })
    : items;

  const rowActions = (p: Product) => (
    <>
      <button
        type="button"
        onClick={() => toggleDiscount(p.id)}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg transition-colors",
          discountedIds.has(p.id)
            ? "bg-amber-500/15 text-amber-300"
            : "text-amber-300 hover:bg-amber-500/10"
        )}
        aria-label="Endirimli qiyməti göstər"
        aria-pressed={discountedIds.has(p.id)}
        title="Endirimli qiyməti göstər"
      >
        <Percent className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openSell(p)}
        disabled={p.count === 0}
        className="grid h-9 w-9 place-items-center rounded-lg text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Sat"
        title="Sat"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openEdit(p)}
        className="grid h-9 w-9 place-items-center rounded-lg text-ink-300 hover:bg-white/5 hover:text-white"
        aria-label="Redaktə"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setDeleteTarget(p)}
        className="grid h-9 w-9 place-items-center rounded-lg text-red-300 hover:bg-red-500/10"
        aria-label="Sil"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-400" />
            Anbar
          </h2>
          <p className="mt-1 text-sm text-ink-400">Ehtiyat hissələri və məhsulların idarəsi</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Part number / ad / marka"
              className="rounded-xl border-hairline bg-ink-900/60 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 w-full sm:w-72"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" /> Yeni
          </button>
        </div>
      </div>

      {sellNotice && (
        <div
          role="status"
          className={cn(
            "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
            sellNotice.kind === "pending"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          )}
        >
          {sellNotice.kind === "pending" ? (
            <Clock className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{sellNotice.text}</span>
          <button
            type="button"
            onClick={() => setSellNotice(null)}
            className="shrink-0 rounded-lg p-0.5 opacity-70 hover:opacity-100 hover:bg-white/5"
            aria-label="Bağla"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isOwner && (
        <PendingSalesPanel onUnauthorized={onUnauthorized} onConfirmed={load} />
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="rounded-2xl border-hairline bg-ink-900/40 overflow-hidden">
        {loading ? (
          <div className="p-10 grid place-items-center text-ink-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-ink-400">
            {items.length === 0 ? "Anbar boşdur. \"Yeni\" düyməsi ilə məhsul əlavə edin." : "Axtarış üçün nəticə yoxdur."}
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-[11px] uppercase tracking-[0.14em] text-ink-400">
                  <tr>
                    <th className="px-4 py-3">Məhsul</th>
                    <th className="px-4 py-3">Part №</th>
                    <th className="px-4 py-3">Marka</th>
                    <th className="px-4 py-3">Kateqoriya</th>
                    <th className="px-4 py-3 text-right">Qiymət</th>
                    <th className="px-4 py-3 text-right">Rəf</th>
                    <th className="px-4 py-3 text-right">Stok</th>
                    <th className="px-4 py-3 text-right">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductThumb product={p} />
                          <span className="text-white font-medium">{p.product}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-200">{p.partNumber}</td>
                      <td className="px-4 py-3 text-ink-300">{p.brand}</td>
                      <td className="px-4 py-3">
                        {p.category ? (
                          <span className="inline-flex items-center rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-brand-300">
                            {p.category}
                          </span>
                        ) : (
                          <span className="text-ink-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PriceView product={p} discounted={discountedIds.has(p.id)} />
                      </td>
                      <td className="px-4 py-3 text-right text-ink-300">
                        {p.shelf ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StockView product={p} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {rowActions(p)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="md:hidden divide-y divide-white/5">
              {filtered.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <ProductThumb product={p} />
                      <div className="min-w-0">
                        <div className="text-white font-medium text-sm leading-snug">
                          {p.product}
                        </div>
                        <div className="mt-1 font-mono text-xs text-ink-300">
                          {p.partNumber}
                        </div>
                      </div>
                    </div>
                    <StockView product={p} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-ink-300">{p.brand}</span>
                    {p.category && (
                      <span className="inline-flex items-center rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-brand-300">
                        {p.category}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-4 text-xs">
                      <PriceView
                        product={p}
                        discounted={discountedIds.has(p.id)}
                        align="left"
                      />
                      <span>
                        <span className="text-ink-500">Rəf </span>
                        <span className="text-ink-200">{p.shelf ?? "—"}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 -mr-1">
                      {rowActions(p)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <form
            onSubmit={submitForm}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="text-base font-semibold text-white">
                {editing ? "Məhsulu redaktə et" : "Yeni məhsul"}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-white hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="sm:col-span-2">
                <label className={labelClass}>Məhsul adı</label>
                <input
                  required
                  className={fieldClass}
                  value={form.product}
                  onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                  placeholder="Oil Filter"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Part Number</label>
                <div className="flex items-stretch gap-2">
                  <input
                    required
                    className={fieldClass}
                    value={form.partNumber}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, partNumber: e.target.value }));
                      if (lookupMsg) setLookupMsg(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        runLookup();
                      }
                    }}
                    placeholder="OF-12345"
                  />
                  <button
                    type="button"
                    onClick={runLookup}
                    disabled={lookupLoading || !form.partNumber.trim()}
                    title="Part number ilə bazada axtar və fieldləri doldur"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 px-4 text-sm font-semibold text-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {lookupLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Axtar
                  </button>
                </div>
                {lookupMsg && (
                  <div
                    className={cn(
                      "mt-2 rounded-lg px-3 py-2 text-xs border",
                      lookupMsg.kind === "ok" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
                      lookupMsg.kind === "warn" && "bg-amber-500/10 border-amber-500/30 text-amber-200",
                      lookupMsg.kind === "err" && "bg-red-500/10 border-red-500/30 text-red-200"
                    )}
                  >
                    {lookupMsg.text}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Marka</label>
                <input
                  required
                  className={fieldClass}
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="BMW"
                />
              </div>
              <div>
                <label className={labelClass}>Kateqoriya</label>
                <input
                  list="product-categories"
                  className={fieldClass}
                  value={form.category ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value.toUpperCase() || null }))
                  }
                  placeholder="ENGINE_OIL"
                />
                <datalist id="product-categories">
                  {COMMON_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Qiymət (₼)</label>
                <NumberInput
                  decimal
                  required
                  className={fieldClass}
                  value={form.price}
                  onValueChange={(v) => setForm((f) => ({ ...f, price: v ?? 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Qeyri-orijinal qiymət (₼, ixtiyari)</label>
                <NumberInput
                  decimal
                  className={fieldClass}
                  value={form.aftermarketPrice}
                  onValueChange={(v) => setForm((f) => ({ ...f, aftermarketPrice: v }))}
                  placeholder="0"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border-hairline px-3 py-2.5 text-sm cursor-pointer select-none transition-colors",
                    form.hidePrice
                      ? "border-amber-500/40 bg-amber-500/10 text-white"
                      : "bg-ink-900/60 text-ink-300 hover:bg-ink-900"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={form.hidePrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hidePrice: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-white/20 bg-ink-900 accent-brand-500"
                  />
                  <EyeOff className="h-4 w-4 text-amber-300" />
                  <span>
                    Qiyməti müştəriyə göstərmə
                    <span className="block text-xs text-ink-500">
                      Seçilsə, məhsulun qiyməti landing və mağaza səhifəsində
                      görünməyəcək.
                    </span>
                  </span>
                </label>
              </div>
              <div>
                <label className={labelClass}>Orijinal say</label>
                <NumberInput
                  required
                  className={fieldClass}
                  value={form.count}
                  onValueChange={(v) => setForm((f) => ({ ...f, count: v ?? 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Qeyri-orijinal say (ixtiyari)</label>
                <NumberInput
                  className={fieldClass}
                  value={form.aftermarketCount}
                  onValueChange={(v) => setForm((f) => ({ ...f, aftermarketCount: v }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Rəf № (anbar)</label>
                <NumberInput
                  className={fieldClass}
                  value={form.shelf}
                  onValueChange={(v) => setForm((f) => ({ ...f, shelf: v }))}
                  placeholder="3"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Mühərrik nömrəsi / kodu (vergüllə ayır)</label>
                <input
                  className={fieldClass}
                  value={engineCodeInput}
                  onChange={(e) => setEngineCodeInput(e.target.value)}
                  placeholder="N20, EA888, 2.0 TDI"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Uyğun modellər (vergüllə ayır)</label>
                <input
                  className={fieldClass}
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder="320i, 520d"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Bənzər məhsullar (part №-lər, vergüllə)</label>
                <input
                  className={fieldClass}
                  value={similarInput}
                  onChange={(e) => setSimilarInput(e.target.value)}
                  placeholder="OF-54321"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>OEM ekvivalent kodlar (vergüllə)</label>
                <input
                  className={fieldClass}
                  value={crossRefInput}
                  onChange={(e) => setCrossRefInput(e.target.value)}
                  placeholder="90915-YZZF1, 04152-YZZA1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Şəkillər</label>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((path) => (
                    <div
                      key={path}
                      className="relative h-20 w-20 overflow-hidden rounded-xl border-hairline"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl(path)}
                        alt="Məhsul şəkli"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(path)}
                        disabled={removingImage === path}
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink-950/80 text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                        aria-label="Şəkli sil"
                        title="Şəkli sil"
                      >
                        {removingImage === path ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                  {newImages.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="relative h-20 w-20 overflow-hidden rounded-xl border border-dashed border-brand-500/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setNewImages((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink-950/80 text-red-300 hover:bg-red-500/20"
                        aria-label="Seçilmiş şəkli çıxar"
                        title="Seçilmiş şəkli çıxar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-white/15 text-ink-400 hover:border-brand-500/50 hover:text-brand-300 transition-colors"
                    aria-label="Şəkil əlavə et"
                    title="Şəkil əlavə et"
                  >
                    <ImagePlus className="h-6 w-6" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onPickImages}
                  />
                </div>
                <p className="mt-2 text-xs text-ink-500">
                  Yeni seçilən şəkillər &quot;
                  {editing ? "Yadda saxla" : "Əlavə et"}&quot; basılanda yüklənəcək.
                </p>
              </div>

              {saveError && (
                <div className="sm:col-span-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-200">
                  {saveError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink-300 hover:text-white hover:bg-white/5"
              >
                Ləğv et
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Yadda saxla" : "Əlavə et"}
              </button>
            </div>
          </form>
        </div>
      )}

      {sellOpenFor && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
          onClick={() => setSellOpenFor(null)}
        >
          <form
            onSubmit={confirmSell}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="text-sm font-semibold text-white">Satış</div>
              <button
                type="button"
                onClick={() => setSellOpenFor(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-white hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl border-hairline bg-white/[0.03] p-3">
                <div className="text-xs text-ink-400">{sellOpenFor.partNumber}</div>
                <div className="text-sm font-medium text-white mt-0.5">{sellOpenFor.product}</div>
                <div className="text-xs text-ink-400 mt-1">Stok: {sellOpenFor.count}</div>
              </div>
              <div>
                <label className={labelClass}>Satılacaq say</label>
                <NumberInput
                  className={fieldClass}
                  value={sellCount}
                  onValueChange={(v) => setSellCount(v === null ? "" : String(v))}
                  placeholder="0"
                />
              </div>
              {sellError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-200">
                  {sellError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setSellOpenFor(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink-300 hover:text-white hover:bg-white/5"
              >
                Ləğv
              </button>
              <button
                type="submit"
                disabled={sellLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                {sellLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sat
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title="Məhsulu sil"
        message={
          deleteTarget ? `"${deleteTarget.product}" silinsin?` : undefined
        }
        confirmLabel="Sil"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}
