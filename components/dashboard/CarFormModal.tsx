"use client";

import { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";

import { userCarsApi } from "@/lib/api/endpoints";
import { ApiError, type CarPayload, type UserCar } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { normalizePlate } from "@/lib/plate";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

interface CarFormModalProps {
  open: boolean;
  editing: UserCar | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

function toPayload(c: UserCar | null): CarPayload {
  if (!c) {
    return {
      plateNumber: "",
      vinCode: "",
      carBrand: "",
      brandModel: "",
      year: new Date().getFullYear(),
      firstRegisteredKm: 0,
      currentKm: 0,
      oilBrand: null,
      oilType: null,
      lastServiceDate: null
    };
  }
  return {
    plateNumber: c.plateNumber,
    vinCode: c.vinCode ?? "",
    carBrand: c.carBrand,
    brandModel: c.brandModel,
    year: c.year,
    firstRegisteredKm: c.firstRegisteredKm,
    currentKm: c.currentKm,
    oilBrand: c.oilBrand,
    oilType: c.oilType,
    lastServiceDate: c.lastServiceDate
  };
}

export function CarFormModal({ open, editing, onClose, onSaved }: CarFormModalProps) {
  const [form, setForm] = useState<CarPayload>(() => toPayload(editing));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function update<K extends keyof CarPayload>(key: K, value: CarPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: CarPayload = {
      ...form,
      plateNumber: normalizePlate(form.plateNumber),
      vinCode: form.vinCode.trim(),
      carBrand: form.carBrand.trim(),
      brandModel: form.brandModel.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      firstRegisteredKm: Number(form.firstRegisteredKm) || 0,
      currentKm: Number(form.currentKm) || 0,
      oilBrand: form.oilBrand?.trim() || null,
      oilType: form.oilType?.trim() || null,
      lastServiceDate: form.lastServiceDate || null
    };
    if (!payload.plateNumber || !payload.carBrand || !payload.brandModel) {
      setError("DQN, marka və model tələb olunur.");
      return;
    }
    setSaving(true);
    try {
      if (editing) await userCarsApi.update(editing.id, payload);
      else await userCarsApi.add(payload);
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yadda saxlamaq mümkün olmadı.");
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
            {editing ? "Avtomobili redaktə et" : "Yeni avtomobil əlavə et"}
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
              placeholder="Toyota"
            />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input
              required
              className={fieldClass}
              value={form.brandModel}
              onChange={(e) => update("brandModel", e.target.value)}
              placeholder="Camry"
            />
          </div>
          <div>
            <label className={labelClass}>Buraxılış ili</label>
            <input
              type="number"
              min={1950}
              max={2100}
              required
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
              required
              className={fieldClass}
              value={form.firstRegisteredKm}
              onChange={(e) => update("firstRegisteredKm", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Hazırkı km</label>
            <input
              type="number"
              min={0}
              required
              className={fieldClass}
              value={form.currentKm}
              onChange={(e) => update("currentKm", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Yağ markası (ixtiyari)</label>
            <input
              className={fieldClass}
              value={form.oilBrand ?? ""}
              onChange={(e) => update("oilBrand", e.target.value || null)}
              placeholder="Mobil 1"
            />
          </div>
          <div>
            <label className={labelClass}>Yağ tipi (ixtiyari)</label>
            <input
              className={fieldClass}
              value={form.oilType ?? ""}
              onChange={(e) => update("oilType", e.target.value || null)}
              placeholder="5W-30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Son servis tarixi (ixtiyari)</label>
            <input
              type="date"
              className={cn(fieldClass, "[color-scheme:dark]")}
              value={form.lastServiceDate ?? ""}
              onChange={(e) => update("lastServiceDate", e.target.value || null)}
            />
          </div>

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
