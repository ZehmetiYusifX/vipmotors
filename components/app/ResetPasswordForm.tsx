"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

import { OtpInput } from "@/components/app/OtpInput";
import { userAuth } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

interface ResetPasswordFormProps {
  initialEmail: string;
  redirectTo: string;
  emailReadOnly?: boolean;
}

export function ResetPasswordForm({
  initialEmail,
  redirectTo,
  emailReadOnly = false
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMessage, setResentMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Email daxil edin.");
    if (otp.length !== 6) return setError("Təsdiq kodu 6 rəqəm olmalıdır.");
    if (password.length < 8) return setError("Parol ən az 8 simvol olmalıdır.");
    if (password !== confirm) return setError("Parollar uyğun gəlmir.");
    setSubmitting(true);
    try {
      await userAuth.resetPassword({
        email: email.trim(),
        otpCode: otp,
        newPassword: password
      });
      setDone(true);
      setTimeout(() => router.push(redirectTo), 1500);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Parol sıfırlanmadı."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    if (!email.trim()) {
      setError("Əvvəlcə email daxil edin.");
      return;
    }
    setResending(true);
    setResentMessage(null);
    try {
      await userAuth.forgotPassword({ email: email.trim() });
      setResentMessage("Yeni kod göndərildi.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kod göndərilmədi.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          readOnly={emailReadOnly}
          autoComplete="email"
          className={cn(fieldClass, emailReadOnly && "opacity-70 cursor-not-allowed")}
        />
      </label>

      <div>
        <span className={labelClass}>Təsdiq kodu</span>
        <OtpInput value={otp} onChange={setOtp} disabled={submitting || done} />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-ink-500">Email-ə göndərilən 6 rəqəmli kod</span>
          <button
            type="button"
            onClick={resendCode}
            disabled={resending || submitting || done}
            className="font-medium text-brand-300 hover:text-brand-200 disabled:opacity-60"
          >
            {resending ? "Göndərilir…" : "Yenidən göndər"}
          </button>
        </div>
        {resentMessage && (
          <div className="mt-2 text-xs text-emerald-300">{resentMessage}</div>
        )}
      </div>

      <label className="block">
        <span className={labelClass}>Yeni parol</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Ən az 8 simvol"
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

      <label className="block">
        <span className={labelClass}>Parolu təkrarla</span>
        <input
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Yenidən daxil et"
          className={fieldClass}
        />
      </label>

      {done && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-200"
        >
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>Parol qoyuldu. Yönləndirilirsən…</span>
        </div>
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
        disabled={submitting || done}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Yoxlanılır…
          </>
        ) : (
          <>
            Parolu qoy <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="text-center text-xs text-ink-500">
        <Link href="/login" className="hover:text-ink-200">
          Login-ə qayıt
        </Link>
      </div>
    </form>
  );
}
