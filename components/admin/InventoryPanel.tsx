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
  Sparkles
} from "lucide-react";

import { productsApi } from "@/lib/api/endpoints";
import { ApiError, type Product, type ProductPayload } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

const EMPTY_FORM: ProductPayload = {
  product: "",
  partNumber: "",
  brand: "",
  price: 0,
  count: 0,
  model: [],
  similarProducts: []
};

function toFormState(p: Product | null): ProductPayload {
  if (!p) return { ...EMPTY_FORM };
  return {
    product: p.product,
    partNumber: p.partNumber,
    brand: p.brand,
    price: p.price,
    count: p.count,
    model: p.model ?? [],
    similarProducts: p.similarProducts ?? []
  };
}

export function InventoryPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductPayload>({ ...EMPTY_FORM });
  const [modelInput, setModelInput] = useState("");
  const [similarInput, setSimilarInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [sellOpenFor, setSellOpenFor] = useState<Product | null>(null);
  const [sellCount, setSellCount] = useState("1");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMsg, setLookupMsg] = useState<{ kind: "ok" | "warn" | "err"; text: string } | null>(null);

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
    setSaveError(null);
    setLookupMsg(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm(toFormState(p));
    setModelInput((p.model ?? []).join(", "));
    setSimilarInput((p.similarProducts ?? []).join(", "));
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
        price: typeof found.price === "number" ? found.price : 0,
        count: typeof found.count === "number" ? found.count : 0,
        model: found.model ?? [],
        similarProducts: found.similarProducts ?? []
      });
      setModelInput((found.model ?? []).join(", "));
      setSimilarInput((found.similarProducts ?? []).join(", "));
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
      model: modelInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      similarProducts: similarInput
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

  async function handleDelete(p: Product) {
    if (!confirm(`"${p.product}" silinsin?`)) return;
    try {
      await productsApi.remove(p.id);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      alert(err instanceof ApiError ? err.message : "Silmək mümkün olmadı.");
    }
  }

  function openSell(p: Product) {
    setSellOpenFor(p);
    setSellCount("1");
    setSellError(null);
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
      await productsApi.sell({ partNumber: sellOpenFor.partNumber, count });
      setSellOpenFor(null);
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
        <div className="flex items-center gap-2">
          <div className="relative">
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
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors"
          >
            <Plus className="h-4 w-4" /> Yeni
          </button>
        </div>
      </div>

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-[11px] uppercase tracking-[0.14em] text-ink-400">
                <tr>
                  <th className="px-4 py-3">Məhsul</th>
                  <th className="px-4 py-3">Part №</th>
                  <th className="px-4 py-3">Marka</th>
                  <th className="px-4 py-3 text-right">Qiymət</th>
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
                    <td className="px-4 py-3 text-right text-white">{p.price.toFixed(2)} ₼</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          p.count > 5
                            ? "bg-emerald-500/15 text-emerald-300"
                            : p.count > 0
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-red-500/15 text-red-300"
                        )}
                      >
                        {p.count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openSell(p)}
                          disabled={p.count === 0}
                          className="grid h-8 w-8 place-items-center rounded-lg text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Sat"
                          title="Sat"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-white/5 hover:text-white"
                          aria-label="Redaktə"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-red-300 hover:bg-red-500/10"
                          aria-label="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </section>
  );
}
