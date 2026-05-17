"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Wrench
} from "lucide-react";

import { carServiceAuth } from "@/lib/api/endpoints";
import { ApiError, type AuthResponse } from "@/lib/api/types";
import { cn } from "@/lib/cn";

type Mode = "login" | "register";

interface AdminAuthProps {
  onAuthenticated: (tokens: AuthResponse) => void;
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setConfirm("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "register") {
      if (password.length < 6) {
        setError("Parol ən az 6 simvol olmalıdır.");
        return;
      }
      if (password !== confirm) {
        setError("Parol təkrarı uyğun gəlmir.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = { username: username.trim(), password };
      const tokens =
        mode === "login"
          ? await carServiceAuth.login(payload)
          : await carServiceAuth.register(payload);
      onAuthenticated(tokens);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : mode === "login"
            ? "Daxil olmaq mümkün olmadı."
            : "Qeydiyyat alınmadı."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
  const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

  return (
    <main className="relative min-h-screen grid lg:grid-cols-2 bg-ink-950 text-ink-100 overflow-hidden">
      {/* Left: visual panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-brand-900/40 via-ink-950 to-ink-900" />
        <div className="absolute inset-0 grid-bg radial-fade opacity-50" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
              <Wrench className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-base font-semibold tracking-tight">
              VIP <span className="text-ink-300">Motors</span>
            </span>
          </Link>
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Servis paneli
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight leading-[1.1]">
            Müştəri axtarışı və{" "}
            <span className="text-gradient">servis qeydlərini</span> bir nöqtədən idarə et.
          </h2>
          <p className="mt-5 text-ink-300 leading-relaxed max-w-md">
            Plaka ilə müştərini tap, yağ və servis məlumatlarını bir kliklə əlavə et.
            Operator komandası üçün xüsusi olaraq hazırlanıb.
          </p>
        </div>

        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana səhifə
          </Link>
        </div>
      </aside>

      {/* Right: form */}
      <section className="relative flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-10">
        <div className="lg:hidden mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
              <Wrench className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              VIP <span className="text-ink-300">Motors</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-ink-300 hover:text-white">
            ← Ana səhifə
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            {mode === "login"
              ? "Operator kabinetinə daxil ol"
              : "Yeni operator hesabı yarat"}
          </h1>
          <p className="mt-3 text-ink-300 leading-relaxed">
            {mode === "login"
              ? "Müştəri axtarışı və servis qeydləri operatorlar üçün açıqdır."
              : "Komandan üçün istənilən sayda operator hesabı aça bilərsən."}
          </p>

          {/* Tabs */}
          <div className="mt-8 inline-flex rounded-xl bg-ink-900/60 border-hairline p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  mode === m
                    ? "bg-brand-500 text-white shadow-glow"
                    : "text-ink-300 hover:text-white"
                )}
              >
                {m === "login" ? "Daxil ol" : "Qeydiyyat"}
              </button>
            ))}
          </div>

          <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className={labelClass}>İstifadəçi adı</span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vip-service"
                required
                minLength={3}
                spellCheck={false}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Parol</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={cn(fieldClass, "pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:text-white hover:bg-white/5"
                  aria-label={showPassword ? "Parolu gizlət" : "Parolu göstər"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {mode === "register" && (
              <label className="block">
                <span className={labelClass}>Parol təkrarı</span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className={fieldClass}
                />
              </label>
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

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  {mode === "login" ? "Daxil olunur…" : "Yaradılır…"}
                </>
              ) : (
                <>
                  {mode === "login" ? "Daxil ol" : "Operator hesabını yarat"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm">
              <span className="text-ink-400">Sürücüsən?</span>
              <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
                Sürücü kabineti →
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
