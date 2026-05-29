# Phase 1 — Auth/Profile Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the UI with the backend's password-less register + OTP/reset-password + phoneNumber login model. Simplify `/register` to 3 fields, switch `/login` to phoneNumber, add `/forgot-password`, `/reset-password`, `/set-password` pages.

**Architecture:** Minimal patch (Approach A from design doc). Register collects only the 3 fields backend accepts; password is set via OTP/reset flow on a follow-up page. Dashboard/admin remain untouched in Phase 1 — they keep reading flat `UserProfile` fields, which backend continues to return alongside the new `cars[]`. Defensive null guards prevent crashes when `fullName` is null for newly-registered users.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5, Tailwind 4, framer-motion (already in app), lucide-react icons.

**Spec:** [docs/superpowers/specs/2026-05-29-api-ui-sync-design.md](../specs/2026-05-29-api-ui-sync-design.md) §4 Faza 1

---

## Task 1: Update API types

**Files:**
- Modify: `lib/api/types.ts`

- [ ] **Step 1: Replace types**

Edit `lib/api/types.ts` — replace `RegisterUserPayload`, `LoginUserPayload`, `UserProfile`; add `ForgotPasswordPayload`, `ResetPasswordPayload`, `UserCar`:

```ts
export interface UserProfile {
  id: number;
  plateNumber: string;
  fullName: string | null;
  phoneNumber: string;
  email: string;
  vinCode: string | null;
  carBrand: string | null;
  brandModel: string | null;
  year: number | null;
  firstRegisteredKm: number | null;
  currentKm: number | null;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
  cars: UserCar[];
  role: Role;
}

export interface UserCar {
  id: number;
  plateNumber: string;
  vinCode: string | null;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
}

export interface RegisterUserPayload {
  email: string;
  plateNumber: string;
  phoneNumber: string;
}

export interface LoginUserPayload {
  phoneNumber: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otpCode: string;
  newPassword: string;
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: Errors in pages that use removed/changed fields (we'll fix them next).

- [ ] **Step 3: Commit**

```bash
git add lib/api/types.ts
git commit -m "types: align auth payloads + profile with backend"
```

---

## Task 2: Add forgot/reset password endpoints

**Files:**
- Modify: `lib/api/endpoints.ts`

- [ ] **Step 1: Add endpoints to `userAuth`**

In `lib/api/endpoints.ts`, extend the `userAuth` object after the `me()` entry:

```ts
forgotPassword(payload: ForgotPasswordPayload) {
  return apiRequest<{ message: string }>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: payload
  });
},
resetPassword(payload: ResetPasswordPayload) {
  return apiRequest<{ message: string }>("/api/v1/auth/reset-password", {
    method: "POST",
    body: payload
  });
}
```

Add to the import list at top:

```ts
import type {
  AuthResponse,
  CarServiceCredentials,
  CreateMaintenancePayload,
  ForgotPasswordPayload,
  LoginUserPayload,
  MaintenanceRecord,
  MotorOil,
  MotorOilPayload,
  MotorOilSearchQuery,
  Product,
  ProductPayload,
  RegisterUserPayload,
  ResetPasswordPayload,
  SellPayload,
  UserProfile
} from "./types";
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: same errors as before for register page (next task).

- [ ] **Step 3: Commit**

```bash
git add lib/api/endpoints.ts
git commit -m "api: add forgotPassword and resetPassword endpoints"
```

---

## Task 3: Simplify `/register` to 1 step

**Files:**
- Modify: `app/register/page.tsx`

- [ ] **Step 1: Replace file**

Replace entire `app/register/page.tsx` with a single-form page that collects email + plateNumber + phoneNumber, calls `userAuth.register`, stores tokens, and redirects to `/set-password?email=...`. See Step 2 below for full content.

- [ ] **Step 2: Full content**

```tsx
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
        plateNumber: plateNumber.trim().toUpperCase(),
        phoneNumber: phoneNumber.trim()
      });
      setTokens("USER", tokens);
      router.push(`/set-password?email=${encodeURIComponent(email.trim())}`);
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
      subtitle="Email, dövlət qeydiyyat nişanı və telefon ilə hesab yarat. Parolu növbəti addımda təyin edəcəksən."
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
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="10-AA-001"
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
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: register file errors gone; login still has errors (next task).

- [ ] **Step 4: Commit**

```bash
git add app/register/page.tsx
git commit -m "feat(register): simplify to single-step email/plate/phone form"
```

---

## Task 4: Switch `/login` to phoneNumber

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Replace state + input + payload + footer link**

Replace the `plateNumber` state with `phoneNumber`, change the input from a plate field to a tel field, update the title/subtitle, send `phoneNumber` to `userAuth.login`, and add a "Parolu unutmusan?" link.

Full file content:

```tsx
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!phoneNumber.trim()) {
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
        phoneNumber: phoneNumber.trim(),
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
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2">
            Telefon
          </span>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="+994 50 123 45 67"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors"
          />
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
              minLength={8}
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
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-300 hover:text-brand-200"
            >
              Parolu unutmusan?
            </Link>
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: login file errors gone.

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat(login): switch from plateNumber to phoneNumber + forgot link"
```

---

## Task 5: OtpInput component

**Files:**
- Create: `components/app/OtpInput.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = true,
  disabled = false,
  className
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function setDigit(index: number, digit: string) {
    const cleaned = digit.replace(/\D/g, "").slice(0, 1);
    const chars = value.split("");
    while (chars.length < length) chars.push("");
    chars[index] = cleaned;
    onChange(chars.join("").slice(0, length));
    if (cleaned && index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        refs.current[index - 1]?.focus();
      } else {
        const chars = value.split("");
        chars[index] = "";
        onChange(chars.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted.padEnd(length, "").slice(0, length).replace(/\s/g, ""));
    const next = Math.min(pasted.length, length - 1);
    refs.current[next]?.focus();
  }

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Rəqəm ${i + 1}`}
          className="h-12 w-10 sm:h-14 sm:w-12 text-center font-mono text-lg sm:text-xl text-white bg-ink-900/60 border-hairline rounded-xl outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/app/OtpInput.tsx
git commit -m "feat: add OtpInput shared component"
```

---

## Task 6: `/forgot-password` page

**Files:**
- Create: `app/forgot-password/page.tsx`

- [ ] **Step 1: Create file**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/forgot-password/page.tsx
git commit -m "feat: add /forgot-password page"
```

---

## Task 7: Shared `ResetPasswordForm` component

**Files:**
- Create: `components/app/ResetPasswordForm.tsx`

We share form logic between `/reset-password` and `/set-password`.

- [ ] **Step 1: Create file**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/app/ResetPasswordForm.tsx
git commit -m "feat: add shared ResetPasswordForm component"
```

---

## Task 8: `/reset-password` page

**Files:**
- Create: `app/reset-password/page.tsx`

- [ ] **Step 1: Create file**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/reset-password/page.tsx
git commit -m "feat: add /reset-password page"
```

---

## Task 9: `/set-password` page (post-register)

**Files:**
- Create: `app/set-password/page.tsx`

- [ ] **Step 1: Create file**

This page auto-triggers `forgotPassword` on mount so the just-registered user immediately receives an OTP. After password set, redirects to `/dashboard` (tokens already stored from register).

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/set-password/page.tsx
git commit -m "feat: add /set-password page (post-register OTP+password)"
```

---

## Task 10: Build & smoke test

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: success, all routes compile.

- [ ] **Step 3: Manual smoke test**

Run `npm run dev` and verify each route renders:
- `/register` — single form, 3 inputs
- `/login` — phone + password, "Parolu unutmusan?" link
- `/forgot-password` — email input
- `/reset-password` — OTP + new password
- `/set-password?email=foo@bar.com` — auto-triggers forgot-password, OTP+password form
- `/` — home renders without crash (AuthNav null-safe)

- [ ] **Step 4: Final commit if anything updated**

```bash
git status
# if changes:
git add -p && git commit -m "fix: smoke-test adjustments"
```

---

## Self-Review Checklist

- [ ] All spec §4 sections covered: register simplify (4.6), login phone (4.7), forgot-password (4.8), reset-password (4.9), set-password (4.10), OtpInput (4.11), error handling (4.12)
- [ ] Types updated for nullable fullName, new payloads, cars[] (4.4)
- [ ] Endpoints added: forgotPassword, resetPassword (4.5)
- [ ] Defensive null guards prevent AuthNav crash (already shipped pre-plan as bug-fix)
- [ ] Dashboard/admin untouched (Phase 2 territory)
- [ ] No `--no-verify`, no skipping hooks
