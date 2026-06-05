"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/app/AuthShell";
import { AuthAlert } from "@/components/app/auth/AuthAlert";
import { AuthButton } from "@/components/app/auth/AuthButton";
import { AuthField } from "@/components/app/auth/AuthField";
import { PasswordField } from "@/components/app/auth/PasswordField";
import { PhoneField } from "@/components/app/auth/PhoneField";
import { userAuth } from "@/lib/api/endpoints";
import { setTokens } from "@/lib/api/tokens";
import { ApiError } from "@/lib/api/types";
import { toFullPhone } from "@/lib/phone";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !phone) {
      setError("Bütün sahələri doldurun.");
      return;
    }
    if (password.length < 8) {
      setError("Parol ən az 8 simvol olmalıdır.");
      return;
    }
    if (password !== confirm) {
      setError("Parollar uyğun gəlmir.");
      return;
    }
    setSubmitting(true);
    try {
      const tokens = await userAuth.register({
        email: email.trim(),
        phoneNumber: toFullPhone(phone),
        password
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
      subtitle="Email, telefon və parol ilə hesab yarat. Avtomobilini sonra profilindən əlavə edə bilərsən."
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
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="email@example.com"
        />

        <PhoneField
          label="Telefon"
          value={phone}
          onChange={setPhone}
          required
          autoComplete="tel"
          placeholder="12 3456789"
        />

        <PasswordField
          label="Parol"
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
          placeholder="Parolu yenidən daxil et"
          error={
            confirm.length > 0 && confirm !== password
              ? "Parollar uyğun gəlmir."
              : undefined
          }
        />

        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <AuthButton loading={submitting} loadingText="Yaradılır…">
          Davam et
        </AuthButton>
      </form>
    </AuthShell>
  );
}
