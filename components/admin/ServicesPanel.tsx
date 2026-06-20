"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Droplet,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  X
} from "lucide-react";

import { servicesApi } from "@/lib/api/endpoints";
import {
  ApiError,
  type ServiceItem,
  type ServiceItemPayload,
  type ServiceType
} from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { Toast, type ToastState } from "@/components/ui/Toast";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

const TYPE_OPTIONS = [
  { value: "OIL_CHANGE", label: "Yağ dəyişimi (OIL_CHANGE)" },
  { value: "GENERAL", label: "Ümumi servis (GENERAL)" }
];

const ICON_SUGGESTIONS = [
  "oil-change",
  "wrench",
  "filter",
  "brake",
  "battery",
  "tire",
  "engine",
  "ac"
];

const EMPTY_FORM: ServiceItemPayload = {
  type: "GENERAL",
  icon: "",
  title: "",
  description: ""
};

function toFormState(s: ServiceItem | null): ServiceItemPayload {
  if (!s) return { ...EMPTY_FORM };
  return {
    type: s.type,
    icon: s.icon,
    title: s.title,
    description: s.description
  };
}

export function ServicesPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServiceItemPayload>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await servicesApi.getAll(undefined, "CAR_SERVICE");
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Xidmətlər yüklənmədi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(s: ServiceItem) {
    setEditing(s);
    setForm(toFormState(s));
    setSaveError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const payload: ServiceItemPayload = {
      type: form.type,
      icon: form.icon.trim(),
      title: form.title.trim(),
      description: form.description.trim()
    };
    setSaving(true);
    try {
      if (editing) {
        await servicesApi.update(editing.id, payload);
      } else {
        await servicesApi.create(payload);
      }
      closeModal();
      await load();
      setToast({
        kind: "success",
        text: editing ? "Xidmət yeniləndi." : "Xidmət əlavə edildi."
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setSaveError(
        err instanceof ApiError ? err.message : "Yadda saxlamaq mümkün olmadı."
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await servicesApi.remove(deleteTarget.id);
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

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-brand-400" />
            Xidmət növləri
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            Servis qeydi yaradılarkən seçilən xidmətlər. OIL_CHANGE tipi yağ
            sahələrini aktiv edir.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Yeni
        </button>
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
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-hairline bg-ink-900/40 p-10 text-center text-ink-400">
          Hələ xidmət növü yoxdur. İlk xidməti əlavə edin.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl border-hairline bg-ink-900/50 p-4 hover:bg-ink-900 hover:border-brand-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300 shrink-0">
                    {s.type === "OIL_CHANGE" ? (
                      <Droplet className="h-5 w-5" />
                    ) : (
                      <Wrench className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {s.title}
                    </div>
                    <div className="text-[11px] text-ink-500 mt-0.5 font-mono">
                      {s.type}
                      {s.icon ? ` · ${s.icon}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-white/5 hover:text-white"
                    aria-label="Redaktə"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(s)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-red-300 hover:bg-red-500/10"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {s.description && (
                <p className="mt-3 text-xs text-ink-300 line-clamp-2">
                  {s.description}
                </p>
              )}
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
            className="glass-strong w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="text-base font-semibold text-white">
                {editing ? "Xidməti redaktə et" : "Yeni xidmət"}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-white hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={labelClass}>Tip</label>
                <Select
                  value={form.type}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, type: v as ServiceType }))
                  }
                  options={TYPE_OPTIONS}
                />
              </div>
              <div>
                <label className={labelClass}>Başlıq</label>
                <input
                  required
                  className={fieldClass}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Yağ dəyişimi"
                />
              </div>
              <div>
                <label className={labelClass}>İkon</label>
                <input
                  required
                  list="service-icons"
                  className={fieldClass}
                  value={form.icon}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, icon: e.target.value }))
                  }
                  placeholder="oil-change"
                />
                <datalist id="service-icons">
                  {ICON_SUGGESTIONS.map((ic) => (
                    <option key={ic} value={ic} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Təsvir</label>
                <textarea
                  required
                  rows={3}
                  className={fieldClass}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Tam sintetik yağ dəyişimi xidməti."
                />
              </div>

              {saveError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-200">
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
        title="Xidməti sil"
        message={deleteTarget ? `"${deleteTarget.title}" silinsin?` : undefined}
        confirmLabel="Sil"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}
