"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/app/AuthShell";
import { AuthAlert } from "@/components/app/auth/AuthAlert";
import { AuthButton } from "@/components/app/auth/AuthButton";
import { PasswordField } from "@/components/app/auth/PasswordField";
import { PhoneField } from "@/components/app/auth/PhoneField";
import { userAuth } from "@/lib/api/endpoints";
import { setTokens } from "@/lib/api/tokens";
import { ApiError } from "@/lib/api/types";
import { toFullPhone } from "@/lib/phone";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!phone) {
      setError("Telefon nömrəsini daxil edin.");
      return;
    }
    if (password.length < 8) {
      setError("Parol ən az 8 simvol olmalıdır.");
      return;
    }
    setSubmitting(true);
    try {
      const tokens = await userAuth.login({
        phoneNumber: toFullPhone(phone),
        password
      });
      setTokens("USER", tokens);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Daxil olmaq mümkün olmadı. Zəhmət olmasa yenidən yoxlayın."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Telefon nömrən və parol ilə daxil ol"
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
        <PhoneField
          label="Telefon"
          autoComplete="tel"
          placeholder="12 3456789"
          value={phone}
          onChange={setPhone}
          required
        />

        <div>
          <PasswordField
            label="Parol"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-300 hover:text-brand-200"
            >
              Parolu unutmusan?
            </Link>
          </div>
        </div>

        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <AuthButton loading={submitting} loadingText="Daxil olunur…">
          Daxil ol
        </AuthButton>
      </form>
    </AuthShell>
  );
}
