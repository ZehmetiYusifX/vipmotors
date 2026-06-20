"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Car, Loader2, X } from "lucide-react";

import { carServiceOps } from "@/lib/api/endpoints";
import {
  ApiError,
  type CustomerPayload,
  type UserProfile
} from "@/lib/api/types";
import { cn } from "@/lib/cn";
import {
  AZ_DIAL_CODE,
  normalizeLocalPhone,
  toFullPhone
} from "@/lib/phone";
import { normalizePlate } from "@/lib/plate";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

interface CustomerFormModalProps {
  open: boolean;
  /** When set, the modal updates this customer; otherwise it creates a new one. */
  editing: UserProfile | null;
  onClose: () => void;
  onSaved: (customer: UserProfile) => void | Promise<void>;
}

/** Local form shape. Phone is kept as the local part; +994 is prefixed on submit. */
interface FormState {
  fullName: string;
  localPhone: string;
  email: string;
  password: string;
  plateNumber: string;
  vinCode: string;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string;
  oilType: string;
  lastServiceDate: string;
  enabled: boolean;
}

function toFormState(c: UserProfile | null): FormState {
  const car = c?.cars?.[0] ?? null;
  return {
    fullName: c?.fullName ?? "",
    localPhone: normalizeLocalPhone(c?.phoneNumber ?? ""),
    email: c?.email ?? "",
    password: "",
    plateNumber: c?.plateNumber ?? car?.plateNumber ?? "",
    vinCode: c?.vinCode ?? car?.vinCode ?? "",
    carBrand: c?.carBrand ?? car?.carBrand ?? "",
    brandModel: c?.brandModel ?? car?.brandModel ?? "",
    year: c?.year ?? car?.year ?? new Date().getFullYear(),
    firstRegisteredKm: c?.firstRegisteredKm ?? car?.firstRegisteredKm ?? 0,
    currentKm: c?.currentKm ?? car?.currentKm ?? 0,
    oilBrand: c?.oilBrand ?? car?.oilBrand ?? "",
    oilType: c?.oilType ?? car?.oilType ?? "",
    lastServiceDate: c?.lastServiceDate ?? car?.lastServiceDate ?? "",
    enabled: true
  };
}

export function CustomerFormModal({
  open,
  editing,
  onClose,
  onSaved
}: CustomerFormModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(editing));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed the form each time it opens (the modal stays mounted, so the
  // useState initializer only runs once).
  useEffect(() => {
    if (open) {
      setForm(toFormState(editing));
      setError(null);
    }
  }, [open, editing]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const plateNumber = normalizePlate(form.plateNumber);
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const localPhone = normalizeLocalPhone(form.localPhone);

    if (!fullName || !email || localPhone.length < 9) {
      setError("Ad, e-poçt və düzgün telefon nömrəsi tələb olunur.");
      return;
    }
    if (!plateNumber || !form.carBrand.trim() || !form.brandModel.trim()) {
      setError("DQN, marka və model tələb olunur.");
      return;
    }
    if (!editing && form.password.length < 8) {
      setError("Yeni müştəri üçün ən az 8 simvollu parol tələb olunur.");
      return;
    }
    if (editing && form.password && form.password.length < 8) {
      setError("Parol ən az 8 simvol olmalıdır (dəyişmək istəmirsinizsə boş saxlayın).");
      return;
    }

    const payload: CustomerPayload = {
      phoneNumber: toFullPhone(localPhone),
      fullName,
      email,
      plateNumber,
      vinCode: form.vinCode.trim(),
      carBrand: form.carBrand.trim(),
      brandModel: form.brandModel.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      firstRegisteredKm: Number(form.firstRegisteredKm) || 0,
      currentKm: Number(form.currentKm) || 0,
      oilBrand: form.oilBrand.trim() || null,
      oilType: form.oilType.trim() || null,
      lastServiceDate: form.lastServiceDate || null,
      enabled: form.enabled
    };
    // Only send a password when one was typed (blank = keep current on update).
    if (form.password) payload.password = form.password;

    setSaving(true);
    try {
      const saved = editing
        ? await carServiceOps.updateCustomer(editing.id, payload)
        : await carServiceOps.createCustomer(payload);
      await onSaved(saved);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Yadda saxlamaq mümkün olmadı."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="text-base font-semibold text-white">
            {editing ? "Müştərini redaktə et" : "Yeni müştəri əlavə et"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {editing && (editing.cars?.length ?? 0) > 1 && (
            <div className="sm:col-span-2 rounded-xl border-hairline bg-ink-900/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-400">
                <Car className="h-3.5 w-3.5" />
                Bu müştərinin avtomobilləri ({editing.cars!.length})
              </div>
              <ul className="mt-3 space-y-2">
                {editing.cars!.map((car) => {
                  const isPrimary = car.plateNumber === editing.plateNumber;
                  return (
                    <li
                      key={car.id}
                      className="flex items-center gap-2.5 rounded-lg bg-ink-950/50 px-3 py-2 text-sm"
                    >
                      <span className="font-mono font-semibold tracking-wider text-white">
                        {car.plateNumber}
                      </span>
                      <span className="text-ink-400 truncate">
                        {[car.carBrand, car.brandModel].filter(Boolean).join(" ")}
                      </span>
                      {isPrimary && (
                        <span className="ml-auto shrink-0 rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[10px] text-brand-200">
                          Əsas
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[11px] text-ink-500">
                Aşağıdakı forma yalnız <strong className="text-ink-300">əsas</strong>{" "}
                avtomobili redaktə edir. Digər avtomobillər müştərinin öz tətbiqindən
                idarə olunur.
              </p>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className={labelClass}>Ad Soyad</label>
            <input
              required
              className={fieldClass}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Vüqar Əliyev"
            />
          </div>

          <div>
            <label className={labelClass}>Telefon</label>
            <div className="flex items-stretch rounded-xl border-hairline bg-ink-900/60 focus-within:border-brand-500/50 overflow-hidden transition-colors">
              <span className="grid place-items-center px-3 text-sm font-medium text-brand-300 bg-brand-500/10 border-r border-white/5">
                {AZ_DIAL_CODE}
              </span>
              <input
                required
                inputMode="numeric"
                className="w-full bg-transparent px-4 py-3 text-white placeholder:text-ink-500 outline-none"
                value={form.localPhone}
                onChange={(e) => update("localPhone", normalizeLocalPhone(e.target.value))}
                placeholder="501234567"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>E-poçt</label>
            <input
              required
              type="email"
              className={fieldClass}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="musteri@example.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Parol {editing && <span className="text-ink-500 normal-case tracking-normal">(dəyişmək üçün doldurun)</span>}
            </label>
            <input
              type="password"
              className={fieldClass}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder={editing ? "••••••••" : "Ən az 8 simvol"}
              autoComplete="new-password"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>DQN</label>
            <input
              required
              className={cn(fieldClass, "font-mono tracking-wider")}
              value={form.plateNumber}
              onChange={(e) => update("plateNumber", normalizePlate(e.target.value))}
              placeholder="10AA123"
            />
          </div>
          <div>
            <label className={labelClass}>Marka</label>
            <input
              required
              className={fieldClass}
              value={form.carBrand}
              onChange={(e) => update("carBrand", e.target.value)}
              placeholder="BMW"
            />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input
              required
              className={fieldClass}
              value={form.brandModel}
              onChange={(e) => update("brandModel", e.target.value)}
              placeholder="320i"
            />
          </div>
          <div>
            <label className={labelClass}>Buraxılış ili</label>
            <input
              type="number"
              min={1950}
              max={2100}
              className={fieldClass}
              value={form.year}
              onChange={(e) => update("year", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>VIN kod (ixtiyari)</label>
            <input
              className={cn(fieldClass, "font-mono")}
              value={form.vinCode}
              onChange={(e) => update("vinCode", e.target.value.toUpperCase())}
              placeholder="WVWZZZ1JZXW000001"
            />
          </div>
          <div>
            <label className={labelClass}>İlk qeydiyyat km</label>
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.firstRegisteredKm}
              onChange={(e) => update("firstRegisteredKm", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Cari km</label>
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.currentKm}
              onChange={(e) => update("currentKm", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Yağ markası (ixtiyari)</label>
            <input
              className={fieldClass}
              value={form.oilBrand}
              onChange={(e) => update("oilBrand", e.target.value)}
              placeholder="Mobil 1"
            />
          </div>
          <div>
            <label className={labelClass}>Yağ tipi (ixtiyari)</label>
            <input
              className={fieldClass}
              value={form.oilType}
              onChange={(e) => update("oilType", e.target.value)}
              placeholder="5W-30"
            />
          </div>
          <div>
            <label className={labelClass}>Son servis tarixi (ixtiyari)</label>
            <input
              type="date"
              className={cn(fieldClass, "scheme-dark")}
              value={form.lastServiceDate ?? ""}
              onChange={(e) => update("lastServiceDate", e.target.value)}
            />
          </div>

          <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border-hairline bg-ink-900/60 px-4 py-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => update("enabled", e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-ink-900 accent-brand-500"
            />
            <span className="text-sm text-white">Hesab aktivdir</span>
          </label>

          {error && (
            <div className="sm:col-span-2 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
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
  );
}
