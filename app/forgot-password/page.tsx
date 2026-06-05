"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { AuthShell } from "@/components/app/AuthShell";
import { AuthAlert } from "@/components/app/auth/AuthAlert";
import { AuthButton } from "@/components/app/auth/AuthButton";
import { AuthField } from "@/components/app/auth/AuthField";
import { userAuth } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/types";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetHref = `/reset-password?email=${encodeURIComponent(email.trim())}`;

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
      setTimeout(() => router.push(resetHref), 1500);
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
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="email@example.com"
          disabled={sent}
        />

        {sent && (
          <AuthAlert variant="success">
            <span className="block">
              Təsdiq kodu{" "}
              <span className="font-semibold text-white">{email.trim()}</span>{" "}
              ünvanına göndərildi. Növbəti səhifəyə yönləndirilirsən…
            </span>
            <Link
              href={resetHref}
              className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-100 hover:text-white"
            >
              Reset-ə keç <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </AuthAlert>
        )}

        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <AuthButton loading={submitting} loadingText="Göndərilir…" disabled={sent}>
          Kodu göndər
        </AuthButton>
      </form>
    </AuthShell>
  );
}
