# Auth set overhaul — login · register · forgot · reset

Date: 2026-06-02
Status: Approved (user confirmed register password gap; full overhaul of login/register/forgot/reset, dark theme elevated, manual verification)

## Context

The four user-facing auth pages (`/login`, `/register`, `/forgot-password`,
`/reset-password`) drifted: field/label class strings, the primary button, the
password show/hide toggle, and the error banner are copy-pasted across files
(and inlined in `login`). The `reset-password` and `forgot-password` API calls
already match the Postman "Prod Ready" collection. One real contract gap exists
on register.

## Goals

1. Make `register` match the Postman contract by collecting `password`.
2. Elevate all four pages on the existing dark red/ink theme + `AuthShell`,
   with consistent fields, buttons, alerts, and clearer OTP/step states.
3. Remove the cross-page duplication via a small shared primitive set.

## Non-goals

- No redesign of `AdminAuth` (`/admin` service-operator page keeps its split
  layout). It may keep its already-applied min-8 password tweak.
- No change to the backend, token storage, or routing structure.
- No automated browser test run (verification is manual per user choice).

## API alignment (vs Postman "Prod Ready")

| Endpoint | Postman body | Current code | Action |
|---|---|---|---|
| `POST /api/v1/auth/register` | `{ email, phoneNumber, password }` | `{ email, phoneNumber }` | **Add `password`** to type + form + call |
| `POST /api/v1/auth/login` | `{ phoneNumber, password }` | matches | none |
| `POST /api/v1/auth/forgot-password` | `{ email }` | matches | none |
| `POST /api/v1/auth/reset-password` | `{ email, otpCode, newPassword }` | matches | none |

Notes:
- Postman also lists a `/forget-password` typo-alias. We keep `/forgot-password`.
- `RegisterUserPayload` becomes `{ email: string; phoneNumber: string; password: string }`.
- Register flow stays "straight to dashboard": collect email + phone + password,
  call register, store tokens, push `/dashboard`.

## Architecture — shared auth primitives

New folder `components/app/auth/` (consumed by all four pages + `ResetPasswordForm`):

- `fieldStyles.ts` — exports the canonical `fieldClass` and `labelClass`
  strings (single source of truth; removes the per-file copies).
- `AuthField.tsx` — labeled `input` (text/email/tel). Props: `label`, `error?`,
  `hint?`, plus standard input props. Renders label, input, and an optional
  per-field error/hint line below.
- `PasswordField.tsx` — labeled password input with show/hide toggle (Eye /
  EyeOff), `min 8` hint, optional `error?`. Reused by login, register (x2), reset (x2).
- `AuthAlert.tsx` — inline banner with `variant: "error" | "success" | "info"`,
  icon, `role`/`aria-live` preserved, subtle `framer-motion` fade/slide-in that
  respects `prefers-reduced-motion`.
- `AuthButton.tsx` — primary submit button: idle (label + arrow with group-hover
  nudge) and loading (spinner + label) states. `loading`, `children` props.

These are small, single-purpose, independently understandable units. `cn`
(`lib/cn.ts`) is used for class merging.

## Page-by-page changes

### `/login` (`app/login/page.tsx`)
- Replace inline field/button/alert markup with `AuthField` (telefon),
  `PasswordField` (parol, with the "forgot password" link kept under it),
  `AuthAlert`, `AuthButton`. Keep the "servis operatoru girişi" link block.
- Behavior unchanged. Min password length stays 8.

### `/register` (`app/register/page.tsx`)
- Add `password` + `confirm` state. New `PasswordField` for "Parol" (min 8) and
  a confirm `PasswordField` ("Parolu təkrarla").
- Validation: all fields required; password ≥ 8; password === confirm. Error
  messages in Azerbaijani, consistent with reset.
- Submit sends `{ email, phoneNumber, password }`; on success store tokens →
  `/dashboard` (unchanged routing).
- Use `AuthField` (email, telefon), `AuthAlert`, `AuthButton`.

### `/forgot-password` (`app/forgot-password/page.tsx`)
- Use `AuthField` (email), `AuthButton`, `AuthAlert`.
- After a successful send: success `AuthAlert` that names the target email AND a
  visible manual "Reset-ə keç →" link to `/reset-password?email=…`, in addition
  to the existing 1.5s auto-redirect (so the user isn't stranded on redirect).

### `/reset-password` (`app/reset-password/page.tsx` + `components/app/ResetPasswordForm.tsx`)
- Keep the single-page form and the email-from-query behavior.
- Email field stays an editable `AuthField` (current behavior — user may
  correct it), but prefilled from the query string and visually marked as
  "kod bu email-ə göndərilib" via the field hint.
- OTP: keep `OtpInput`; tighten spacing. "Yenidən göndər" gets a ~30s cooldown
  countdown (button disabled with `Yenidən göndər (NNs)` until it elapses);
  reuses `userAuth.forgotPassword`.
- New password + confirm via `PasswordField` (replaces the bespoke toggle markup).
- Use `AuthAlert` for the success/error/resent states.

### `components/app/OtpInput.tsx`
- Minor: confirm focus-ring styling matches the new field focus treatment.
  No API change.

## Validation rules (consistent across pages)

- Email: required, non-empty (`type=email`).
- Phone: required, non-empty.
- Password: required, ≥ 8 chars.
- Confirm (register, reset): must equal password.
- OTP (reset): exactly 6 digits.

## Accessibility & motion

- Alerts keep `role="alert"` / `role="status"` and `aria-live="polite"`.
- Password toggle keeps `aria-label`.
- All entrance/transition animations gated behind `prefers-reduced-motion`.

## Verification (manual)

1. `npm run dev`, then exercise each page:
   - `/login`: empty submit → field errors; short password → min-8 error;
     valid → loading state → (live API) tokens/redirect.
   - `/register`: missing fields → error; mismatched confirm → error; valid →
     register call includes `password`, then `/dashboard`.
   - `/forgot-password`: valid email → success alert names email + manual
     "Reset-ə keç" link + auto-redirect.
   - `/reset-password?email=x@y.com`: email prefilled; 6-digit OTP enforced;
     resend shows 30s cooldown; mismatch/short password → errors; success state.
2. `npm run lint` and `npx tsc --noEmit` clean.

## Files touched

- `lib/api/types.ts` — `RegisterUserPayload` gains `password`.
- `app/register/page.tsx` — password + confirm fields, send password.
- `app/login/page.tsx`, `app/forgot-password/page.tsx`,
  `app/reset-password/page.tsx`, `components/app/ResetPasswordForm.tsx` —
  consume shared primitives + the noted elevations.
- New: `components/app/auth/fieldStyles.ts`, `AuthField.tsx`,
  `PasswordField.tsx`, `AuthAlert.tsx`, `AuthButton.tsx`.
- `components/app/OtpInput.tsx` — focus-ring polish only.
