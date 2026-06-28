"use client";

import { useEffect, useRef, useState } from "react";
import {
  Droplet,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  ImageIcon
} from "lucide-react";

import { motorOilsApi } from "@/lib/api/endpoints";
import { ApiError, type MotorOil, type MotorOilPayload } from "@/lib/api/types";
import { resolveImageUrl } from "@/lib/media";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { NumberInput } from "@/components/ui/NumberInput";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

const EMPTY_FORM: MotorOilPayload = {
  productName: "",
  viscosity: "",
  oilType: "",
  standardApproval: "",
  specification: "",
  description: "",
  oilPrice: 0
};

function toFormState(o: MotorOil | null): MotorOilPayload {
  if (!o) return { ...EMPTY_FORM };
  return {
    productName: o.productName,
    viscosity: o.viscosity,
    oilType: o.oilType,
    standardApproval: o.standardApproval,
    specification: o.specification,
    description: o.description,
    oilPrice: o.oilPrice ?? 0
  };
}

function formatPrice(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

export function OilCatalogPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [items, setItems] = useState<MotorOil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MotorOil | null>(null);
  const [form, setForm] = useState<MotorOilPayload>({ ...EMPTY_FORM });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<MotorOil | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await motorOilsApi.getAll();
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Yağ kataloqu yüklənmədi.");
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
    setImage(null);
    setImagePreview(null);
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(o: MotorOil) {
    setEditing(o);
    setForm(toFormState(o));
    setImage(null);
    setImagePreview(resolveImageUrl(o.oilImage));
    setSaveError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setImage(null);
    setImagePreview(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const payload: MotorOilPayload = {
      ...form,
      oilPrice: Number(form.oilPrice) || 0
    };
    setSaving(true);
    try {
      if (editing) {
        if (image) {
          await motorOilsApi.updateWithImage(editing.id, payload, image);
        } else {
          await motorOilsApi.update(editing.id, payload);
        }
      } else if (image) {
        await motorOilsApi.createWithImage(payload, image);
      } else {
        await motorOilsApi.create(payload);
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
      await motorOilsApi.remove(deleteTarget.id);
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
        text: err instanceof ApiError ? err.message : "Silmək mümkün olmadı."
      });
    } finally {
      setDeleting(false);
    }
  }

  const filtered = query.trim()
    ? items.filter((o) => {
        const q = query.trim().toLowerCase();
        return (
          o.productName.toLowerCase().includes(q) ||
          o.viscosity.toLowerCase().includes(q) ||
          o.oilType.toLowerCase().includes(q)
        );
      })
    : items;

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Droplet className="h-5 w-5 text-brand-400" />
            Yağ kataloqu
          </h2>
          <p className="mt-1 text-sm text-ink-400">Motor yağlarının spesifikasiyası və qiymətləri</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad / viskozite / tip"
            className="rounded-xl border-hairline bg-ink-900/60 px-3 py-2.5 text-sm text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 flex-1 sm:flex-none sm:w-72"
          />
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors shrink-0"
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

      {loading ? (
        <div className="p-10 grid place-items-center text-ink-400 rounded-2xl border-hairline bg-ink-900/40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-hairline bg-ink-900/40 p-10 text-center text-ink-400">
          {items.length === 0 ? "Kataloq boşdur." : "Axtarış üçün nəticə yoxdur."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <article
              key={o.id}
              className="rounded-2xl border-hairline bg-ink-900/50 overflow-hidden hover:bg-ink-900 hover:border-brand-500/30 transition-all"
            >
              <div className="aspect-[4/3] bg-ink-950/70 grid place-items-center overflow-hidden">
                {o.oilImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImageUrl(o.oilImage) ?? ""}
                    alt={o.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-ink-500" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{o.productName}</div>
                    <div className="text-xs text-ink-400 mt-0.5">
                      {o.viscosity} · {o.oilType}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-brand-300 whitespace-nowrap">
                    {formatPrice(o.oilPrice)} ₼
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-white/[0.03] p-2">
                    <div className="text-ink-500">Standart</div>
                    <div className="text-ink-200 mt-0.5 truncate">{o.standardApproval || "—"}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] p-2">
                    <div className="text-ink-500">Spec.</div>
                    <div className="text-ink-200 mt-0.5 truncate">{o.specification || "—"}</div>
                  </div>
                </div>
                {o.description && (
                  <p className="mt-3 text-xs text-ink-300 line-clamp-2">{o.description}</p>
                )}
                <div className="mt-3 flex items-center justify-end gap-1 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => openEdit(o)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-white/5 hover:text-white"
                    aria-label="Redaktə"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(o)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-red-300 hover:bg-red-500/10"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

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
                {editing ? "Yağı redaktə et" : "Yeni yağ"}
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
                <label className={labelClass}>Şəkil</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative grid h-24 w-24 place-items-center rounded-xl border-hairline bg-ink-900/60 overflow-hidden hover:border-brand-500/40 transition-colors"
                  >
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-ink-400" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="text-xs text-ink-400">
                    {editing
                      ? "Yeni şəkil seçsəniz, mövcud şəkil əvəzlənəcək. Dəyişməsən, köhnə şəkil qalır."
                      : "Yağ qabının şəkli (opsional). Şəkilsiz də yarada bilərsiniz."}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Məhsul adı</label>
                <input
                  required
                  className={fieldClass}
                  value={form.productName}
                  onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                  placeholder="Castrol EDGE 5W-30"
                />
              </div>
              <div>
                <label className={labelClass}>Viskozite</label>
                <input
                  required
                  className={fieldClass}
                  value={form.viscosity}
                  onChange={(e) => setForm((f) => ({ ...f, viscosity: e.target.value }))}
                  placeholder="5W-30"
                />
              </div>
              <div>
                <label className={labelClass}>Tip</label>
                <input
                  required
                  className={fieldClass}
                  value={form.oilType}
                  onChange={(e) => setForm((f) => ({ ...f, oilType: e.target.value }))}
                  placeholder="Full Synthetic"
                />
              </div>
              <div>
                <label className={labelClass}>Standart</label>
                <input
                  className={fieldClass}
                  value={form.standardApproval}
                  onChange={(e) => setForm((f) => ({ ...f, standardApproval: e.target.value }))}
                  placeholder="API SP"
                />
              </div>
              <div>
                <label className={labelClass}>Spesifikasiya</label>
                <input
                  className={fieldClass}
                  value={form.specification}
                  onChange={(e) => setForm((f) => ({ ...f, specification: e.target.value }))}
                  placeholder="ACEA C3"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Təsvir</label>
                <textarea
                  rows={3}
                  className={fieldClass}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Yüksək performanslı motor yağı."
                />
              </div>
              <div>
                <label className={labelClass}>Qiymət (₼)</label>
                <NumberInput
                  decimal
                  required
                  className={fieldClass}
                  value={form.oilPrice}
                  onValueChange={(v) => setForm((f) => ({ ...f, oilPrice: v ?? 0 }))}
                  placeholder="0"
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

      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title="Yağı sil"
        message={
          deleteTarget ? `"${deleteTarget.productName}" silinsin?` : undefined
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
