"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Search, X } from "lucide-react";

import { carsApi } from "@/lib/api/endpoints";
import { ApiError, type UserCar } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { normalizePlate } from "@/lib/plate";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

interface ClaimCarModalProps {
  open: boolean;
  onClose: () => void;
  onClaimed: () => void | Promise<void>;
}

// Plate-first onboarding: the user looks up a car a service already registered
// and attaches it to their account. searchByPlate resolves only when the car is
// unowned (200); 404 = no such car, 409 = already owned by someone else.
export function ClaimCarModal({ open, onClose, onClaimed }: ClaimCarModalProps) {
  const [plate, setPlate] = useState("");
  const [found, setFound] = useState<UserCar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (open) {
      setPlate("");
      setFound(null);
      setError(null);
      setNotice(null);
      setSearching(false);
      setClaiming(false);
    }
  }, [open]);

  if (!open) return null;

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizePlate(plate);
    if (!normalized) {
      setError("DQN daxil edin.");
      return;
    }
    setSearching(true);
    setError(null);
    setNotice(null);
    setFound(null);
    try {
      const car = await carsApi.searchByPlate(normalized);
      setFound(car);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotice(
          "Bu DQN ilə maşın sistemdə tapılmadı. \"Yeni\" düyməsi ilə əlavə edə bilərsiniz."
        );
      } else if (err instanceof ApiError && err.status === 409) {
        setError("Bu maşın artıq başqa istifadəçiyə bağlıdır.");
      } else {
        setError(err instanceof ApiError ? err.message : "Axtarış mümkün olmadı.");
      }
    } finally {
      setSearching(false);
    }
  }

  async function claim() {
    if (!found) return;
    setClaiming(true);
    setError(null);
    try {
      await carsApi.claim({ plateNumber: found.plateNumber });
      await onClaimed();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sahiblənmək mümkün olmadı.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="text-base font-semibold text-white">
            DQN ilə maşını sahiblən
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={search} className="space-y-4">
            <div>
              <label className={labelClass}>DQN</label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  className={cn(fieldClass, "font-mono tracking-wider")}
                  value={plate}
                  onChange={(e) => setPlate(normalizePlate(e.target.value))}
                  placeholder="10AA123"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-60 px-4 py-3 text-sm font-semibold text-white transition-colors"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Axtar
                </button>
              </div>
            </div>
          </form>

          <p className="text-xs leading-relaxed text-ink-500">
            Servis maşınınızı əvvəlcədən qeyd edibsə, DQN ilə tapıb hesabınıza
            bağlaya bilərsiniz — bütün servis tarixçəsi hesabınıza düşəcək.
          </p>

          {notice && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-200">
              <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {found && (
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Maşın tapıldı
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-base text-white">
                    {found.carBrand} {found.brandModel}
                  </strong>
                  <span className="text-xs text-ink-400">{found.year}</span>
                </div>
                <span className="inline-flex shrink-0 items-stretch overflow-hidden rounded-lg border-hairline bg-ink-950">
                  <span className="grid place-items-center border-r border-white/5 bg-brand-500/15 px-1.5 font-mono text-[9px] font-bold text-brand-300">
                    AZ
                  </span>
                  <span className="px-2 py-1 font-mono text-xs font-bold tracking-wider text-white">
                    {found.plateNumber}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-300 hover:text-white hover:bg-white/5"
          >
            Bağla
          </button>
          <button
            type="button"
            onClick={claim}
            disabled={!found || claiming}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:hover:bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors"
          >
            {claiming && <Loader2 className="h-4 w-4 animate-spin" />}
            Sahiblən
          </button>
        </div>
      </div>
    </div>
  );
}
