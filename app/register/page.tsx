"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  User,
  Car,
  Eye,
  EyeOff,
  Check
} from "lucide-react";

import { AuthShell } from "@/components/app/AuthShell";
import { userAuth } from "@/lib/api/endpoints";
import { setTokens } from "@/lib/api/tokens";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/cn";

interface FormState {
  fullName: string;
  email: string;
  password: string;
  plateNumber: string;
  phoneNumber: string;
  carBrand: string;
  brandModel: string;
  year: string;
  firstRegisteredKm: string;
  currentKm: string;
  lastServiceDate: string;
}

const initialState: FormState = {
  fullName: "",
  email: "",
  password: "",
  plateNumber: "",
  phoneNumber: "",
  carBrand: "",
  brandModel: "",
  year: "",
  firstRegisteredKm: "",
  currentKm: "",
  lastServiceDate: ""
};

const STEPS = [
  { id: 1, label: "Şəxsi məlumat", Icon: User },
  { id: 2, label: "Avtomobil", Icon: Car }
];

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setError(null);
    if (!form.fullName.trim() || !form.email.trim() || !form.phoneNumber.trim() || form.password.length < 6) {
      setError("Bütün şəxsi məlumat sahələrini doldur (parol ən az 6 simvol).");
      return;
    }
    setStep(2);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const tokens = await userAuth.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        plateNumber: form.plateNumber.trim().toUpperCase(),
        phoneNumber: form.phoneNumber.trim(),
        carBrand: form.carBrand.trim(),
        brandModel: form.brandModel.trim(),
        year: Number(form.year),
        firstRegisteredKm: Number(form.firstRegisteredKm),
        currentKm: Number(form.currentKm),
        lastServiceDate: form.lastServiceDate
      });
      setTokens("USER", tokens);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Qeydiyyat alınmadı. Məlumatları yoxla."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Sürücü qeydiyyatı"
      title="Avtomobilini platformaya əlavə et"
      subtitle="Profil, yağ izləmə və bütün servis tarixçəsi tək yerdə saxlanacaq."
      footer={
        <span>
          Artıq hesabın var?{" "}
          <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Daxil ol
          </Link>
        </span>
      }
    >
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-7">
        {STEPS.map((s, idx) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active && "bg-brand-500/15 text-brand-200 border border-brand-500/30",
                  done && "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
                  !active && !done && "bg-white/5 text-ink-400 border-hairline"
                )}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-black/30">
                  {done ? <Check className="h-3 w-3" /> : <s.Icon className="h-3 w-3" />}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <span className={cn("h-px w-6", done ? "bg-emerald-500/40" : "bg-white/10")} />
              )}
            </div>
          );
        })}
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {step === 1 && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={labelClass}>Ad və soyad</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Adınız Soyadınız"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Telefon</span>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                  placeholder="+994 50 123 45 67"
                  required
                  autoComplete="tel"
                  className={fieldClass}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                autoComplete="email"
                placeholder="email@example.com"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Parol</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Ən az 6 simvol"
                  className={cn(fieldClass, "pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:text-white hover:bg-white/5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={labelClass}>Plaka nömrəsi</span>
                <div className="flex items-stretch rounded-xl border-hairline bg-ink-900/60 focus-within:border-brand-500/50 focus-within:bg-ink-900 transition-colors overflow-hidden">
                  <span className="grid place-items-center px-3 text-xs font-mono font-semibold text-brand-300 bg-brand-500/10 border-r border-white/5">
                    AZ
                  </span>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => update("plateNumber", e.target.value.toUpperCase())}
                    placeholder="10-AA-001"
                    required
                    spellCheck={false}
                    className="w-full bg-transparent px-4 py-3 text-white font-mono tracking-wider placeholder:text-ink-500 outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className={labelClass}>Buraxılış ili</span>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  placeholder="2020"
                  min={1950}
                  max={2100}
                  required
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={labelClass}>Marka</span>
                <input
                  type="text"
                  value={form.carBrand}
                  onChange={(e) => update("carBrand", e.target.value)}
                  placeholder="Mercedes-Benz"
                  required
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Model</span>
                <input
                  type="text"
                  value={form.brandModel}
                  onChange={(e) => update("brandModel", e.target.value)}
                  placeholder="E-Class"
                  required
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={labelClass}>İlk qeydiyyat km</span>
                <input
                  type="number"
                  value={form.firstRegisteredKm}
                  onChange={(e) => update("firstRegisteredKm", e.target.value)}
                  placeholder="15000"
                  min={0}
                  required
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Hazırkı yürüş km</span>
                <input
                  type="number"
                  value={form.currentKm}
                  onChange={(e) => update("currentKm", e.target.value)}
                  placeholder="45000"
                  min={0}
                  required
                  className={fieldClass}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>Son servis tarixi</span>
              <input
                type="date"
                value={form.lastServiceDate}
                onChange={(e) => update("lastServiceDate", e.target.value)}
                required
                className={cn(fieldClass, "[color-scheme:dark]")}
              />
            </label>
          </>
        )}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3.5 text-sm text-brand-200"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-hairline bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-medium text-ink-200 hover:text-white transition-colors"
            >
              Geri
            </button>
          )}
          {step === 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
            >
              Davam et <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Yaradılır…
                </>
              ) : (
                <>
                  Hesabı yarat <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </AuthShell>
  );
}
