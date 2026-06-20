"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Car,
  ChevronRight,
  Loader2,
  Pencil,
  Phone,
  Search,
  Trash2,
  UserPlus,
  Users
} from "lucide-react";

import { carServiceOps } from "@/lib/api/endpoints";
import {
  ApiError,
  type CustomerSearchQuery,
  type UserProfile
} from "@/lib/api/types";
import { CustomerFormModal } from "@/components/admin/CustomerFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastState } from "@/components/ui/Toast";

function normalizeList(res: UserProfile | UserProfile[]): UserProfile[] {
  if (Array.isArray(res)) return res;
  return res ? [res] : [];
}

function displayName(c: UserProfile) {
  return c.fullName?.trim() || c.plateNumber || c.email || "—";
}

type CarEntry = {
  id?: number;
  plateNumber: string;
  carBrand: string | null;
  brandModel: string | null;
};

// All cars for a customer. Falls back to the flat top-level fields for legacy
// records that don't populate the `cars` array.
function carEntries(c: UserProfile): CarEntry[] {
  if (c.cars?.length) {
    return c.cars.map((car) => ({
      id: car.id,
      plateNumber: car.plateNumber,
      carBrand: car.carBrand,
      brandModel: car.brandModel
    }));
  }
  if (c.plateNumber) {
    return [
      {
        plateNumber: c.plateNumber,
        carBrand: c.carBrand,
        brandModel: c.brandModel
      }
    ];
  }
  return [];
}

// The backend `search` param matches name, phone, email AND plate, and always
// returns an array — so one box covers every lookup. Empty → whole base.
function queryFor(raw: string): CustomerSearchQuery {
  const trimmed = raw.trim();
  return trimmed ? { search: trimmed } : {};
}

export function CustomersPanel({
  onUnauthorized
}: {
  onUnauthorized: () => void;
}) {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function load(params: CustomerSearchQuery = {}, signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    try {
      const res = await carServiceOps.searchCustomers(params, signal);
      setCustomers(normalizeList(res));
    } catch (err) {
      if (signal?.aborted) return;
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setCustomers([]);
      setError(
        err instanceof ApiError ? err.message : "Müştəri bazası yüklənmədi."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  // Initial load — list the whole base (no filters).
  useEffect(() => {
    const controller = new AbortController();
    void load({}, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runSearch(event?: React.FormEvent) {
    event?.preventDefault();
    void load(queryFor(query));
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(c: UserProfile) {
    setEditing(c);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    void load(queryFor(query));
    setToast({ kind: "success", text: "Müştəri yadda saxlanıldı." });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await carServiceOps.deleteCustomer(deleteTarget.id);
      setDeleteTarget(null);
      void load(queryFor(query));
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
            <Users className="h-5 w-5 text-brand-400" />
            Müştəri bazası
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            Bütün müştəriləri ad, telefon və ya nömrə ilə axtar, yarat, redaktə
            et və sil.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors shrink-0"
        >
          <UserPlus className="h-4 w-4" /> Yeni müştəri
        </button>
      </div>

      <form
        onSubmit={runSearch}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 flex items-center gap-2 rounded-xl border-hairline bg-ink-900/60 px-3 focus-within:border-brand-500/50 transition-colors">
          <Search className="h-4 w-4 text-ink-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad, telefon və ya nömrə"
            className="w-full bg-transparent py-3 text-white placeholder:text-ink-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 disabled:opacity-50 px-6 py-3 text-sm font-semibold text-brand-200 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Axtar
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="p-10 grid place-items-center text-ink-400 rounded-2xl border-hairline bg-ink-900/40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border-hairline bg-ink-900/40 p-10 text-center text-ink-400">
          {query.trim()
            ? "Axtarışa uyğun müştəri tapılmadı."
            : "Müştəri bazası boşdur."}
        </div>
      ) : (
        <ul className="space-y-2">
          {customers.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 rounded-xl border-hairline bg-ink-900/50 p-3 hover:bg-ink-900 hover:border-brand-500/30 transition-all"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500/10 text-brand-300 text-xs font-semibold shrink-0">
                {displayName(c).slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {displayName(c)}
                  </span>
                  {(c.cars?.length ?? 0) > 1 && (
                    <span className="shrink-0 rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[10px] font-medium text-brand-200">
                      {c.cars!.length} avtomobil
                    </span>
                  )}
                </div>
                {c.phoneNumber && (
                  <a
                    href={`tel:${c.phoneNumber}`}
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-400 hover:text-brand-300"
                  >
                    <Phone className="h-3 w-3" />
                    {c.phoneNumber}
                  </a>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {carEntries(c).map((car, i) => (
                    <span
                      key={car.id ?? `${car.plateNumber}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border-hairline bg-ink-950/60 px-2 py-1 text-[11px]"
                    >
                      <Car className="h-3 w-3 text-brand-300 shrink-0" />
                      <span className="font-mono font-semibold tracking-wider text-white">
                        {car.plateNumber}
                      </span>
                      {(car.carBrand || car.brandModel) && (
                        <span className="text-ink-400 truncate max-w-37.5">
                          {[car.carBrand, car.brandModel].filter(Boolean).join(" ")}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 hover:bg-white/5 hover:text-white"
                  aria-label="Redaktə"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(c)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-red-300 hover:bg-red-500/10"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <ChevronRight className="h-4 w-4 text-ink-600 ml-1 hidden sm:block" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <CustomerFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title="Müştərini sil"
        message={
          deleteTarget
            ? `${displayName(deleteTarget)} (${deleteTarget.plateNumber}) müştərisi və bütün məlumatları silinsin?`
            : undefined
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
