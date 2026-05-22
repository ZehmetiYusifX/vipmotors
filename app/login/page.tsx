"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";

import { AuthShell } from "@/components/app/AuthShell";
import { userAuth } from "@/lib/api/endpoints";
import { setTokens } from "@/lib/api/tokens";
import { ApiError } from "@/lib/api/types";

export default function LoginPage() {
  const router = useRouter();
  const [plateNumber, setPlateNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const tokens = await userAuth.login({
        plateNumber: plateNumber.trim().toUpperCase(),
        password
      });
      setTokens("USER", tokens);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Daxil olmaq mümkün olmadı. Yenidən yoxlayın."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Plaka nömrəsi ilə daxil ol"
      subtitle="Avtomobilinin servis tarixçəsini və yağ məlumatlarını izlə."
      footer={
        <span>
          Hesabın yoxdur?{" "}
          <Link href="/register" className="font-semibold text-brand-300 hover:text-brand-200">
            Qeydiyyatdan keç
          </Link>
        </span>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2">
            Plaka nömrəsi
          </span>
          <div className="flex items-stretch rounded-xl border-hairline bg-ink-900/60 focus-within:border-brand-500/50 focus-within:bg-ink-900 transition-colors overflow-hidden">
            <span className="grid place-items-center px-3 text-xs font-mono font-semibold text-brand-300 bg-brand-500/10 border-r border-white/5">
              AZ
            </span>
            <input
              type="text"
              autoComplete="username"
              placeholder="10-AA-001"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              required
              spellCheck={false}
              className="w-full bg-transparent px-4 py-3 text-white font-mono tracking-wider placeholder:text-ink-500 outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2">
            Parol
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 pr-12 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors"
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
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Daxil olunur…
            </>
          ) : (
            <>
              Daxil ol
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink-500">və ya</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 rounded-xl border-hairline bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-medium text-ink-200 hover:text-white transition-colors"
        >
          <ShieldAlert className="h-4 w-4 text-brand-400" />
          Servis operatoru girişi
        </Link>
      </form>
    </AuthShell>
  );
}
