"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { AuthShell } from "@/components/app/AuthShell";
import { ResetPasswordForm } from "@/components/app/ResetPasswordForm";
import { userAuth } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/types";

function SetPasswordInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [status, setStatus] = useState<"sending" | "sent" | "error">("sending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    if (!email) {
      setStatus("error");
      setErrorMessage("Email tapılmadı. Qeydiyyatı yenidən başlat.");
      return;
    }
    userAuth
      .forgotPassword({ email })
      .then(() => setStatus("sent"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err instanceof ApiError ? err.message : "Kod göndərilmədi."
        );
      });
  }, [email]);

  return (
    <AuthShell
      title="Parolunu təyin et"
      subtitle={
        status === "sending"
          ? "Email-inə təsdiq kodu göndərilir…"
          : status === "sent"
            ? "Email-inə təsdiq kodu göndərdik. Daxil edin və parol qoyun."
            : errorMessage || "Xəta baş verdi."
      }
    >
      <ResetPasswordForm
        initialEmail={email}
        redirectTo="/dashboard"
        emailReadOnly
      />
    </AuthShell>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen grid place-items-center bg-ink-950">
          <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-brand-500 animate-spin" />
        </main>
      }
    >
      <SetPasswordInner />
    </Suspense>
  );
}
