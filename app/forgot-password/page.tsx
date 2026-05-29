"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

import { AuthShell } from "@/components/app/AuthShell";
import { userAuth } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/types";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Email daxil edin.");
      return;
    }
    setSubmitting(true);
    try {
      await userAuth.forgotPassword({ email: email.trim() });
      setSent(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Email göndərilmədi. Zəhmət olmasa yenidən yoxlayın."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Parolu sıfırla"
      subtitle="Email-ini yaz — sənə təsdiq kodu göndərək."
      footer={
        <span>
          <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Login-ə qayıt
          </Link>
        </span>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <label className="block">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="email@example.com"
            className={fieldClass}
            disabled={sent}
          />
        </label>

        {sent && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-200"
          >
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>Email-i yoxla. Növbəti səhifəyə yönləndirilirsən…</span>
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
          disabled={submitting || sent}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Göndərilir…
            </>
          ) : (
            <>
              Kodu göndər <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
