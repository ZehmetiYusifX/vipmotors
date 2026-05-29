"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

import { AuthShell } from "@/components/app/AuthShell";
import { userAuth } from "@/lib/api/endpoints";
import { setTokens } from "@/lib/api/tokens";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { normalizePlate } from "@/lib/plate";

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !plateNumber.trim() || !phoneNumber.trim()) {
      setError("Bütün sahələri doldurun.");
      return;
    }
    setSubmitting(true);
    try {
      const tokens = await userAuth.register({
        email: email.trim(),
        plateNumber: normalizePlate(plateNumber),
        phoneNumber: phoneNumber.trim()
      });
      setTokens("USER", tokens);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Qeydiyyat tamamlanmadı. Məlumatları yoxlayın."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Qeydiyyatdan keç"
      subtitle="Email, dövlət qeydiyyat nişanı və telefon ilə hesab yarat."
      footer={
        <span>
          Artıq hesabın var?{" "}
          <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Daxil ol
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
          />
        </label>

        <label className="block">
          <span className={labelClass}>Dövlət qeydiyyat nişanı (DQN)</span>
          <div className="flex items-stretch rounded-xl border-hairline bg-ink-900/60 focus-within:border-brand-500/50 focus-within:bg-ink-900 transition-colors overflow-hidden">
            <span className="grid place-items-center px-3 text-xs font-mono font-semibold text-brand-300 bg-brand-500/10 border-r border-white/5">
              AZ
            </span>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(normalizePlate(e.target.value))}
              placeholder="10AA123"
              required
              spellCheck={false}
              className="w-full bg-transparent px-4 py-3 text-white font-mono tracking-wider placeholder:text-ink-500 outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className={labelClass}>Telefon</span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+994 50 123 45 67"
            required
            autoComplete="tel"
            className={fieldClass}
          />
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
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
          )}
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Yaradılır…
            </>
          ) : (
            <>
              Davam et <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
