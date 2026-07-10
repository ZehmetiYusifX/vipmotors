"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Droplet,
  Gauge,
  KeyRound,
  Loader2,
  ScanLine,
  Smartphone,
  Wallet,
  X
} from "lucide-react";

import { walletApi } from "@/lib/api/endpoints";
import { ApiError, type WalletScanResult } from "@/lib/api/types";
import { NumberInput } from "@/components/ui/NumberInput";
import { cn } from "@/lib/cn";
import { normalizePlate } from "@/lib/plate";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

// The scan secret is optional (backend may run without WALLET_SCAN_SECRET).
// Remember it for the session so the operator types it once.
const SECRET_STORAGE_KEY = "vipmotors-wallet-scan-secret";

function readStoredSecret() {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(SECRET_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function WalletScanPanel() {
  const [plate, setPlate] = useState("");
  const [currentKm, setCurrentKm] = useState("");
  const [nextServiceKm, setNextServiceKm] = useState("");
  const [oilBrand, setOilBrand] = useState("");
  const [oilType, setOilType] = useState("");
  const [lastServiceDate, setLastServiceDate] = useState("");
  const [scanSecret, setScanSecret] = useState(readStoredSecret);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<WalletScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plateInputRef = useRef<HTMLInputElement | null>(null);
  const kmInputRef = useRef<HTMLInputElement | null>(null);

  function updateSecret(value: string) {
    setScanSecret(value);
    try {
      if (value) sessionStorage.setItem(SECRET_STORAGE_KEY, value);
      else sessionStorage.removeItem(SECRET_STORAGE_KEY);
    } catch {
      // Session storage unavailable — the secret just won't be remembered.
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedPlate = normalizePlate(plate);
    if (!trimmedPlate) {
      plateInputRef.current?.focus();
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await walletApi.scan(
        {
          plateNumber: trimmedPlate,
          currentKm: currentKm ? Number(currentKm) : undefined,
          nextServiceKm: nextServiceKm ? Number(nextServiceKm) : undefined,
          oilBrand: oilBrand.trim() || undefined,
          oilType: oilType.trim() || undefined,
          lastServiceDate: lastServiceDate || undefined
        },
        scanSecret.trim() || undefined
      );
      setResult(res);
      // Ready for the next car: clear everything except the remembered secret.
      setPlate("");
      setCurrentKm("");
      setNextServiceKm("");
      setOilBrand("");
      setOilType("");
      setLastServiceDate("");
      plateInputRef.current?.focus();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Skan parolu yanlışdır. Doğru parolu daxil edin.");
      } else {
        setError(
          err instanceof ApiError ? err.message : "Wallet yeniləməsi uğursuz oldu."
        );
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-brand-400" />
          Wallet skan
        </h2>
        <p className="mt-1 text-sm text-ink-400">
          DQN-ni skan et (və ya yaz), servis məlumatlarını doldur — kart müştərinin
          telefonunda Apple və Google Wallet-də avtomatik yenilənəcək. Yalnız DQN
          göndərsən, kart məlumat dəyişmədən təzələnir.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <form
          onSubmit={submit}
          className="lg:col-span-3 rounded-2xl border-hairline bg-ink-900/40 p-6 space-y-4"
        >
          <label className="block">
            <span className={labelClass}>
              <ScanLine className="inline h-3 w-3 mr-1 text-brand-400" />
              Nömrə (barkod)
            </span>
            <div className="flex items-stretch rounded-xl border-hairline bg-ink-900/60 focus-within:border-brand-500/50 transition-colors overflow-hidden">
              <span className="grid place-items-center px-3 text-xs font-mono font-semibold text-brand-300 bg-brand-500/10 border-r border-white/5">
                AZ
              </span>
              <input
                ref={plateInputRef}
                type="text"
                value={plate}
                onChange={(e) => setPlate(normalizePlate(e.target.value))}
                onKeyDown={(e) => {
                  // Hardware scanners type the plate then send Enter — jump to
                  // the km field instead of submitting half-filled data.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    kmInputRef.current?.focus();
                  }
                }}
                placeholder="10AA123"
                autoFocus
                spellCheck={false}
                className="w-full bg-transparent px-4 py-3 text-white font-mono tracking-wider placeholder:text-ink-500 outline-none"
              />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>
                <Gauge className="inline h-3 w-3 mr-1 text-brand-400" />
                Cari km
              </span>
              <NumberInput
                ref={kmInputRef}
                value={currentKm}
                onValueChange={(v) => setCurrentKm(v === null ? "" : String(v))}
                placeholder="152000"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>
                <Gauge className="inline h-3 w-3 mr-1 text-brand-400" />
                Növbəti servis km
              </span>
              <NumberInput
                value={nextServiceKm}
                onValueChange={(v) => setNextServiceKm(v === null ? "" : String(v))}
                placeholder="162000"
                className={fieldClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>
                <Droplet className="inline h-3 w-3 mr-1 text-brand-400" />
                Yağ markası
              </span>
              <input
                type="text"
                value={oilBrand}
                onChange={(e) => setOilBrand(e.target.value)}
                placeholder="Castrol"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>
                <Droplet className="inline h-3 w-3 mr-1 text-brand-400" />
                Yağ tipi
              </span>
              <input
                type="text"
                value={oilType}
                onChange={(e) => setOilType(e.target.value)}
                placeholder="5W-30"
                className={fieldClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>
                <Calendar className="inline h-3 w-3 mr-1 text-brand-400" />
                Son servis tarixi
              </span>
              <input
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className={cn(fieldClass, "scheme-dark")}
              />
            </label>
            <label className="block">
              <span className={labelClass}>
                <KeyRound className="inline h-3 w-3 mr-1 text-brand-400" />
                Skan parolu (lazım olduqda)
              </span>
              <input
                type="password"
                value={scanSecret}
                onChange={(e) => updateSecret(e.target.value)}
                placeholder="••••••"
                autoComplete="off"
                className={fieldClass}
              />
            </label>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !plate.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            Təsdiq et və kartı yenilə
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <strong className="text-emerald-200">Kart yeniləndi</strong>
                    <p className="text-sm font-mono tracking-wider text-emerald-100/70">
                      {result.plateNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="grid h-8 w-8 place-items-center rounded-full text-emerald-200/60 hover:text-emerald-100 hover:bg-white/5"
                  aria-label="Bağla"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-1.5 text-ink-300">
                    <Wallet className="h-3.5 w-3.5 text-ink-500" />
                    Apple Wallet
                  </dt>
                  <dd
                    className={
                      result.applePushesSent > 0 ? "text-white" : "text-amber-300"
                    }
                  >
                    {result.applePushesSent > 0
                      ? `${result.applePushesSent} cihaza push getdi`
                      : result.appleDevicesRegistered > 0
                        ? `${result.appleDevicesRegistered} cihaz qeydiyyatlıdır, push alınmadı (APNs xətası)`
                        : "qeydiyyatlı cihaz yoxdur — kart telefona yenidən əlavə olunmalıdır"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-1.5 text-ink-300">
                    <Smartphone className="h-3.5 w-3.5 text-ink-500" />
                    Google Wallet
                  </dt>
                  <dd className={result.googleUpdated ? "text-white" : "text-ink-400"}>
                    {result.googleUpdated ? "yeniləndi" : "yenilənmədi"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-300">Servis məlumatları</dt>
                  <dd className={result.dataChanged ? "text-white" : "text-ink-400"}>
                    {result.dataChanged ? "yazıldı" : "dəyişmədi"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-2xl border-hairline border-dashed bg-ink-900/40 p-6 text-sm text-ink-400 leading-relaxed">
              <ScanLine className="h-6 w-6 text-ink-500 mb-3" />
              Kursoru "Nömrə" xanasına qoyub barkodu oxut — skaner nömrəni yazıb
              Enter göndərəndə fokus avtomatik "Cari km" sahəsinə keçir. Məlumat
              sahələri ixtiyaridir: boş göndərsən, kart sadəcə təzələnir.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
