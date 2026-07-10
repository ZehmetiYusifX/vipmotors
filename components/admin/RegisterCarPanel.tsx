"use client";

import { useState } from "react";
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Plus
} from "lucide-react";

import { carServiceOps } from "@/lib/api/endpoints";
import { ApiError, type CarRegistrationPayload } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { NumberInput } from "@/components/ui/NumberInput";
import {
  AZ_DIAL_CODE,
  normalizeLocalPhone,
  toFullPhone
} from "@/lib/phone";
import { normalizePlate } from "@/lib/plate";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

interface RegisterCarPanelProps {
  onUnauthorized: () => void;
}

interface FormState {
  plateNumber: string;
  localPhone: string;
  vinCode: string;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string;
  oilType: string;
  lastServiceDate: string;
}

function emptyForm(): FormState {
  return {
    plateNumber: "",
    localPhone: "",
    vinCode: "",
    carBrand: "",
    brandModel: "",
    year: new Date().getFullYear(),
    firstRegisteredKm: 0,
    currentKm: 0,
    oilBrand: "",
    oilType: "",
    lastServiceDate: ""
  };
}

export function RegisterCarPanel({ onUnauthorized }: RegisterCarPanelProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const plateNumber = normalizePlate(form.plateNumber);
    const localPhone = normalizeLocalPhone(form.localPhone);
    const vinCode = form.vinCode.trim();
    const carBrand = form.carBrand.trim();
    const brandModel = form.brandModel.trim();

    if (!plateNumber || !carBrand || !brandModel) {
      setError("DQN, marka və model tələb olunur.");
      return;
    }
    if (localPhone.length < 9) {
      setError("Sahibin düzgün telefon nömrəsini daxil edin.");
      return;
    }

    const payload: CarRegistrationPayload = {
      plateNumber,
      ownerPhoneNumber: toFullPhone(localPhone),
      vinCode,
      carBrand,
      brandModel,
      year: Number(form.year) || new Date().getFullYear(),
      firstRegisteredKm: Number(form.firstRegisteredKm) || 0,
      currentKm: Number(form.currentKm) || 0,
      oilBrand: form.oilBrand.trim() || null,
      oilType: form.oilType.trim() || null,
      lastServiceDate: form.lastServiceDate || null
    };

    setSaving(true);
    try {
      const car = await carServiceOps.registerCar(payload);
      setSuccess(
        `${car.plateNumber} (${[car.carBrand, car.brandModel]
          .filter(Boolean)
          .join(" ")}) reyestrə əlavə edildi. Sahib bu nömrə ilə tətbiqdə avtomobili öz hesabına bağlaya bilər.`
      );
      setForm(emptyForm());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Avtomobili əlavə etmək mümkün olmadı."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border-hairline bg-linear-to-br from-ink-900/80 to-ink-900/40 p-6 sm:p-8 relative overflow-hidden max-w-2xl">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-glow shrink-0">
            <Car className="h-5 w-5 text-white" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Reyestrə avtomobil əlavə et
            </h2>
            <p className="text-xs text-ink-400 mt-0.5">
              Sahibin telefon nömrəsi ilə avtomobili qeyd et — o, tətbiqdə avtomobili
              öz hesabına bağlaya biləcək.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="sm:col-span-2">
            <label className={labelClass}>Sahibin telefonu</label>
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
            <label className={labelClass}>VIN kod (ixtiyari)</label>
            <input
              className={cn(fieldClass, "font-mono")}
              value={form.vinCode}
              onChange={(e) => update("vinCode", e.target.value.toUpperCase())}
              placeholder="WVWZZZ1JZXW000001"
            />
          </div>
          <div>
            <label className={labelClass}>Buraxılış ili</label>
            <NumberInput
              className={fieldClass}
              value={form.year}
              onValueChange={(v) => update("year", v ?? 0)}
              placeholder="2020"
            />
          </div>

          <div>
            <label className={labelClass}>İlk qeydiyyat km</label>
            <NumberInput
              className={fieldClass}
              value={form.firstRegisteredKm}
              onValueChange={(v) => update("firstRegisteredKm", v ?? 0)}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Cari km</label>
            <NumberInput
              className={fieldClass}
              value={form.currentKm}
              onValueChange={(v) => update("currentKm", v ?? 0)}
              placeholder="0"
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

          <div className="sm:col-span-2">
            <label className={labelClass}>Son servis tarixi (ixtiyari)</label>
            <input
              type="date"
              className={cn(fieldClass, "scheme-dark")}
              value={form.lastServiceDate}
              onChange={(e) => update("lastServiceDate", e.target.value)}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="sm:col-span-2 flex items-start gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3.5 text-sm text-brand-200"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="sm:col-span-2 flex items-start gap-2.5 rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-sm text-green-300"
            >
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Əlavə olunur…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Avtomobili əlavə et
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
