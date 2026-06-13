"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search as SearchIcon,
  Pencil,
  Trash2,
  X,
  ShoppingCart,
  AlertTriangle,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle2
} from "lucide-react";

import { productsApi } from "@/lib/api/endpoints";
import { ApiError, type Product, type ProductPayload } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastState } from "@/components/ui/Toast";
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

const EMPTY_FORM: ProductPayload = {
  product: "",
  partNumber: "",
  brand: "",
  category: null,
  price: 0,
  count: 0,
  shelf: null,
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
    count: p.count,
    shelf: p.shelf,
    model: p.model ?? [],
    similarProducts: p.similarProducts ?? [],
    crossReferenceOemEquivalents: p.crossReferenceOemEquivalents ?? []
  };
}

function StockBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        count > 5
          ? "bg-emerald-500/15 text-emerald-300"
          : count > 0
            ? "bg-amber-500/15 text-amber-300"
            : "bg-red-500/15 text-red-300"
      )}
    >
      {count}
    </span>
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
  const [modelInput, setModelInput] = useState("");
  const [similarInput, setSimilarInput] = useState("");
  const [crossRefInput, setCrossRefInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    setModelInput("");
    setSimilarInput("");
    setCrossRefInput("");
    setSaveError(null);
    setLookupMsg(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm(toFormState(p));
    setModelInput((p.model ?? []).join(", "));
    setSimilarInput((p.similarProducts ?? []).join(", "));
    setCrossRefInput((p.crossReferenceOemEquivalents ?? []).join(", "));
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
        count: typeof found.count === "number" ? found.count : 0,
        shelf: found.shelf ?? null,
        model: found.model ?? [],
        similarProducts: found.similarProducts ?? [],
        crossReferenceOemEquivalents: found.crossReferenceOemEquivalents ?? []
      });
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
      count: Number(form.count) || 0,
      shelf:
        form.shelf == null || Number.isNaN(Number(form.shelf))
          ? null
          : Number(form.shelf),
      category: form.category?.trim() || null,
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
      if (editing) {
        await productsApi.update(editing.id, payload);
      } else {
        await productsApi.create(payload);
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
        return (
          p.partNumber.toLowerCase().includes(q) ||
          p.product.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      })
    : items;

  const rowActions = (p: Product) => (
    <>
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
                      <td className="px-4 py-3 text-white font-medium">{p.product}</td>
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
                      <td className="px-4 py-3 text-right text-white">{p.price.toFixed(2)} ₼</td>
                      <td className="px-4 py-3 text-right text-ink-300">
                        {p.shelf ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StockBadge count={p.count} />
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
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm leading-snug">
                        {p.product}
                      </div>
                      <div className="mt-1 font-mono text-xs text-ink-300">
                        {p.partNumber}
                      </div>
                    </div>
                    <StockBadge count={p.count} />
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
                      <span>
                        <span className="text-ink-500">Qiymət </span>
                        <span className="text-white font-medium">{p.price.toFixed(2)} ₼</span>
                      </span>
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
                  placeholder="Toyota"
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
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={fieldClass}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className={labelClass}>Stok sayı</label>
                <input
                  type="number"
                  min="0"
                  required
                  className={fieldClass}
                  value={form.count}
                  onChange={(e) => setForm((f) => ({ ...f, count: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className={labelClass}>Rəf № (anbar)</label>
                <input
                  type="number"
                  min="0"
                  className={fieldClass}
                  value={form.shelf ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shelf: e.target.value === "" ? null : Number(e.target.value)
                    }))
                  }
                  placeholder="3"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Uyğun modellər (vergüllə ayır)</label>
                <input
                  className={fieldClass}
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder="Corolla, Camry"
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
                <input
                  type="number"
                  min="1"
                  max={sellOpenFor.count}
                  className={fieldClass}
                  value={sellCount}
                  onChange={(e) => setSellCount(e.target.value)}
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
