"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/app/AuthShell";
import { ResetPasswordForm } from "@/components/app/ResetPasswordForm";

function ResetPasswordInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  return (
    <AuthShell
      title="Parolu sıfırla"
      subtitle="Email-ə göndərilən kodu daxil et və yeni parol qoy."
    >
      <ResetPasswordForm initialEmail={email} redirectTo="/login" />
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen grid place-items-center bg-ink-950">
          <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-brand-500 animate-spin" />
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
