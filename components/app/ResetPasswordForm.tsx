"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { OtpInput } from "@/components/app/OtpInput";
import { AuthAlert } from "@/components/app/auth/AuthAlert";
import { AuthButton } from "@/components/app/auth/AuthButton";
import { AuthField } from "@/components/app/auth/AuthField";
import { PasswordField } from "@/components/app/auth/PasswordField";
import { labelClass } from "@/components/app/auth/fieldStyles";
import { userAuth } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/types";

const RESEND_COOLDOWN = 30;

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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMessage, setResentMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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
      setError(err instanceof ApiError ? err.message : "Parol sıfırlanmadı.");
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
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kod göndərilmədi.");
    } finally {
      setResending(false);
    }
  }

  const resendDisabled = resending || submitting || done || cooldown > 0;
  const resendLabel = resending
    ? "Göndərilir…"
    : cooldown > 0
      ? `Yenidən göndər (${cooldown}s)`
      : "Yenidən göndər";

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <AuthField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        readOnly={emailReadOnly}
        autoComplete="email"
        hint="Təsdiq kodu bu email ünvanına göndərilib"
        className={emailReadOnly ? "opacity-70 cursor-not-allowed" : undefined}
      />

      <div>
        <span className={labelClass}>Təsdiq kodu</span>
        <OtpInput value={otp} onChange={setOtp} disabled={submitting || done} />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-ink-500">Email-ə göndərilən 6 rəqəmli kod</span>
          <button
            type="button"
            onClick={resendCode}
            disabled={resendDisabled}
            className="font-medium text-brand-300 hover:text-brand-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resendLabel}
          </button>
        </div>
        {resentMessage && (
          <div className="mt-2 text-xs text-emerald-300">{resentMessage}</div>
        )}
      </div>

      <PasswordField
        label="Yeni parol"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Ən az 8 simvol"
        hint="Ən az 8 simvol"
      />

      <PasswordField
        label="Parolu təkrarla"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Yenidən daxil et"
        error={
          confirm.length > 0 && confirm !== password
            ? "Parollar uyğun gəlmir."
            : undefined
        }
      />

      {done && (
        <AuthAlert variant="success">Parol qoyuldu. Yönləndirilirsən…</AuthAlert>
      )}

      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <AuthButton loading={submitting} loadingText="Yoxlanılır…" disabled={done}>
        Parolu qoy
      </AuthButton>

      <div className="text-center text-xs text-ink-500">
        <Link href="/login" className="hover:text-ink-200">
          Login-ə qayıt
        </Link>
      </div>
    </form>
  );
}
