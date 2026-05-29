# VipMotors — Backend API ilə UI Sinxronizasiyası

**Tarix:** 2026-05-29
**Status:** Draft — review gözləyir
**Müəllif:** brainstorming sessiyası

## 1. Kontekst

`vipmotors-production.postman_collection.json` Postman kolleksiyası mövcud `lib/api/endpoints.ts` və UI səhifələri ilə bir sıra yerdə uyğunsuzdur. Bəzi uyğunsuzluqlar **fonksional sınıqdır** (register/login payload, profil strukturu) — yəni UI hal-hazırda backendlə canlı işləməyə bilər. Digərləri UI-da hələ qarşılığı olmayan yeni funksiyalardır (forgot/reset password, çoxlu avtomobil, Apple/Google Wallet, product/oil sahə zənginləşməsi).

Bu sənəd boşluqları qruplayır, fazalara bölür və **Faza 1 (auth/profil)** üçün detallı dizayn təqdim edir. Faza 2–5 yüksək səviyyəli xülasə kimi verilir; hər biri öz fazasına çatanda ayrıca spec-ə genişlənəcək.

## 2. Boşluqların tam siyahısı

### 2.1 Kritik (UI hazırda sınıq ola bilər)

| # | Endpoint / Sahə | Postman | UI (hazırkı) |
|---|---|---|---|
| K1 | `POST /api/v1/auth/register` body | `{email, plateNumber, phoneNumber}` (passwordsuz) | `{fullName, email, password, plateNumber, phoneNumber, carBrand, brandModel, year, firstRegisteredKm, currentKm, lastServiceDate}` |
| K2 | `POST /api/v1/auth/login` body | `{phoneNumber, password}` | `{plateNumber, password}` |
| K3 | `UserProfile` response | `cars: []` massivi qaytarır (+ flat fields hələ var) | Yalnız flat fields oxuyur |

### 2.2 UI-da hələ olmayan funksiyalar

| # | Endpoint | Təyinat |
|---|---|---|
| F1 | `POST /api/v1/auth/forgot-password` | Email-ə OTP göndərir |
| F2 | `POST /api/v1/auth/reset-password` | OTP + yeni parolla təsdiqləmə |
| F3 | `POST /api/v1/users/me/cars` | Profilə yeni avtomobil əlavə |
| F4 | `PUT /api/v1/users/me/cars/:carId` | Avtomobili yenilə |
| F5 | `DELETE /api/v1/users/me/cars/:carId` | Avtomobili sil |
| F6 | `GET /wallet/pass?plateNumber=...&wallet=apple\|google` | Apple/Google Wallet pkpass |
| F7 | `PUT /api/v1/motor-oils/:id` (multipart) | Şəkillə oil yeniləmə |

### 2.3 Yarımçıq mapping-lər

| # | Sahə / Endpoint | Status |
|---|---|---|
| Y1 | `Product.category` (ENGINE_OIL enum) | Tipdə də, formada da yoxdur |
| Y2 | `Product.shelf` (number) | Yoxdur |
| Y3 | `Product.crossReferenceOemEquivalents: string[]` | Yoxdur |
| Y4 | Müştəri lookup `cars[]` | Admin yalnız tək avtomobil göstərir |

### 2.4 Postman-də duplikat / qeyd

- `POST /api/v1/auth/forget-password` və `POST /api/v1/auth/forgot-password` eyni payload-la mövcuddur — köhnə alias kimi qəbul edirik; UI yalnız `forgot-password` çağıracaq.

## 3. Faza sıralaması

| Faza | Ad | Yaxınlıq | Niyə bu sırada |
|---|---|---|---|
| **1** | Auth/profil realignment | **Kritik** | K1, K2, F1, F2-ni həll edir. Bunsuz qalan fazalar canlı test edilə bilmir. K3 (cars[]) Faza 2-yə qədər sadəcə tipdə qəbul edilir, oxunmur. |
| **2** | Multi-car model | Yüksək | F3, F4, F5, Y4 + UserProfile.cars[]-a tam keçid. Dashboard və admin müştəri görünüşü yenidən qurulur. |
| **3** | Product/Oil sahə zənginləşməsi | Orta | Y1, Y2, Y3. Yalnız admin paneli (`InventoryPanel`, `OilCatalogPanel`). |
| **4** | Motor oil multipart update | Aşağı | F7. Lokal dəyişiklik, yalnız OilCatalogPanel. |
| **5** | Apple/Google Wallet | Aşağı | F6. Yeni feature, asılılıqsız. Dashboard-dan "Wallet-ə əlavə et" düyməsi. |

Hər faza tamamlandıqdan sonra növbəti fazaya keçməzdən əvvəl ayrıca detallı spec yazılır, plan çıxarılır, implementasiya olunur.

---

## 4. Faza 1 — Auth/Profil realignment (detallı)

### 4.1 Məqsəd

UI-ı backendin parol-az qeydiyyat + OTP ilə parol qoyma + phoneNumber-lə login modelinə uyğunlaşdır. Mövcud səhifələri (`/register`, `/login`) yenilə, yeni səhifələr (`/forgot-password`, `/reset-password`, `/set-password`) əlavə et. UserProfile tipini cars[]-i daşıyacaq şəkildə genişləndir, amma davranış Faza 2-yə qədər mövcud flat sahələrlə qalsın.

### 4.2 Axın diaqramı

```
Yeni istifadəçi:
  /register (email + plate + phone)
    └─ POST /auth/register → tokens saxla
    └─ redirect /set-password?email=…

  /set-password (avto açılışda /forgot-password çağırılır)
    └─ Status: OTP email-ə göndərildi
    └─ User: otpCode + newPassword daxil edir
    └─ POST /auth/reset-password → uğursa redirect /dashboard

Mövcud istifadəçi:
  /login (phone + parol)
    └─ POST /auth/login → tokens → /dashboard
    └─ "Parolu unutdum?" link → /forgot-password

  /forgot-password (email)
    └─ POST /auth/forgot-password → "Email-i yoxlayın" status
    └─ Continue → /reset-password?email=…

  /reset-password (email + otp + newPassword)
    └─ POST /auth/reset-password → uğursa /login
```

`/set-password` `/reset-password` komponentinin **wrapper-idir** — fərq: yüklənəndə `/forgot-password` avtomatik çağırılır (yeni qeydiyyatdan keçən üçün OTP göndərir).

### 4.3 Toxunulan fayllar

**Yenilənən:**
- `lib/api/types.ts` — `RegisterUserPayload`, `LoginUserPayload`, `UserProfile`, yeni `ForgotPasswordPayload`, `ResetPasswordPayload`
- `lib/api/endpoints.ts` — `userAuth.register`/`login` body, yeni `userAuth.forgotPassword`, `userAuth.resetPassword`
- `app/register/page.tsx` — 2-addımlı wizard → 1-addımlı sadə form
- `app/login/page.tsx` — plateNumber input → phoneNumber input; "Parolu unutdum?" link
- `lib/auth/UserAuthProvider.tsx` — uyğunluq yoxlanışı (yeni tiplərə uyğun)

**Yeni:**
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `app/set-password/page.tsx` (reset-password-un wrapper-i)
- `components/app/OtpInput.tsx` (6 rəqəmli OTP input — paylaşılan komponent)

**Toxunulmayan (Phase 2-yə qoyulur):**
- `app/dashboard/page.tsx` — flat sahələri oxumağa davam edir (backend hələ qaytarır)
- `app/admin/page.tsx` — eyni
- `components/admin/*` — eyni

### 4.4 Type dəyişiklikləri

`lib/api/types.ts` diff:

```ts
// Yenilənən
export interface RegisterUserPayload {
  email: string;
  plateNumber: string;
  phoneNumber: string;
}

export interface LoginUserPayload {
  phoneNumber: string;   // əvvəl plateNumber
  password: string;
}

// Yeni
export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otpCode: string;
  newPassword: string;
}

// UserProfile-ə cars[] əlavə (flat fields saxlanır — backend hələ qaytarır)
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

export interface UserProfile {
  id: number;
  plateNumber: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  // ↓ Flat car snapshot — backend "primary" car-ı bunlarda qaytarır.
  // Phase 2-də cars[]-a tam keçid olunacaq.
  vinCode: string | null;
  carBrand: string;
  brandModel: string;
  year: number;
  firstRegisteredKm: number;
  currentKm: number;
  oilBrand: string | null;
  oilType: string | null;
  lastServiceDate: string | null;
  cars: UserCar[];   // YENİ — Phase 2-də istifadə olunacaq
  role: Role;
}
```

### 4.5 Endpoint əlavələri

`lib/api/endpoints.ts` `userAuth` obyektinə:

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

`register`/`login` çağırışları öz tiplərinə uyğun olacaq — body field-ləri avtomatik düzəlir.

### 4.6 `/register` səhifəsi

**Prinsip:** Register backendlə **bire-bir** uyğun, **tək addımlı, tək məqsədli**. Yalnız identifikasiya üçün zəruri sahələr: email + plate + phone. `fullName`, `carBrand`, `brandModel`, `year`, `firstRegisteredKm`, `currentKm`, `lastServiceDate`, `vinCode`, `oilBrand`, `oilType` register-də **YOXDUR** — bunlar profilə sonradan, müvafiq səhifələrdən dolur (bax §4.6.1).

**Hazırkı 2-addımlı wizard tamamilə silinir.** Yeni form 3 sahə + submit:

| Sahə | Tip | Validasiya |
|---|---|---|
| Email | email | required, format |
| Dövlət qeydiyyat nişanı | text | required, uppercase, format `XX-XX-XXX` (yumşaq) |
| Telefon | tel | required, format `+994...` (yumşaq) |

Submit axını:
1. `userAuth.register({ email, plateNumber, phoneNumber })`
2. Cavabdan `accessToken`/`refreshToken` → `setTokens("USER", tokens)`
3. `router.push("/dashboard")` — istifadəçi token ilə avtomatik giriş edir; parolu sonradan "Parolu unutdum" axını ilə qoya bilər.

**Qərar (qeyd):** OTP axını yalnız `/forgot-password` və `/reset-password`-da qalır. Register sonrası OTP istəmək istifadəçi üçün artıq friction-dır; tokens-lə birbaşa dashboard-a girilir, parol opsional sonradan qoyulur.

Mövcud `AuthShell` reuse olunur. Stepper UI silinir. Password input, car sahələri silinir.

### 4.6.1 Register-dən kənar sahələr — haradan dolur?

Köhnə register formundakı sahələrin yeni mənbəyi:

| Sahə | Hal-hazırda (köhnə UI) | Yeni mənbə | Faza |
|---|---|---|---|
| `fullName` | register payload | **Profil edit səhifəsi** (yeni — Faza 2) və ya admin operator daxil edir | 2 |
| `carBrand`, `brandModel`, `year` | register payload | **`POST /users/me/cars`** (öz profilindən) və ya admin `createMaintenance` zamanı | 2 |
| `firstRegisteredKm`, `currentKm` | register payload | Eyni — `cars/:carId` CRUD | 2 |
| `lastServiceDate` | register payload | `createMaintenance` cavabından update olunur (backend mexanizmi) | 2 |
| `oilBrand`, `oilType` | register payload | `createMaintenance` zamanı admin daxil edir | 2 |
| `vinCode` | yox idi | `cars/:carId` CRUD | 2 |

Bu o deməkdir ki, **Faza 1-dən sonra istifadəçinin `cars[]` boş olacaq və profil yarımçıq görünəcək** — bu Faza 2-yə qədər keçici vəziyyətdir. Dashboard bu boş halı zərif idarə etməlidir (köhnə flat sahələr backend-də mövcud deyilsə "—" göstərir; artıq belə göstərir).

### 4.6.2 Backend gap (yeni risk)

Postman kolleksiyasında **`fullName` üçün set/update endpoint-i yoxdur**. Yalnız `cars/:carId` CRUD mövcuddur. Bu deməkdir ki:

- Ya backend-də `PUT /users/me` (və ya analoji) endpoint-i var, amma Postman-də göstərilməyib — backend təsdiq tələb olunur (yeni risk **R7**, bax §9)
- Ya da `fullName` register-dən sonra dəyişdirilə bilmir; o halda Faza 1 register-də backend `email`/`phoneNumber`-dan default fullName yaradır, sonra fullName immutable qalır — UI bu fərziyyəni göstərməlidir

Faza 2 spec-i hazırlanmamış R7 cavab tapmalıdır.

### 4.7 `/login` səhifəsi

**Dəyişikliklər:**
- `plateNumber` state → `phoneNumber` state
- Input: AZ prefix + monospace plate → standart phone input `+994 50 123 45 67`
- Title/subtitle: "Dövlət qeydiyyat nişanı ilə daxil ol" → "Telefon nömrən və parol ilə daxil ol"
- `userAuth.login({ phoneNumber, password })`
- **Yeni link:** form altında "Parolu unutmusan?" → `/forgot-password`

"Servis operatoru girişi" linki saxlanır.

### 4.8 `/forgot-password` səhifəsi (yeni)

`AuthShell` istifadə edən sadə tək sahə form:

| Sahə | Tip |
|---|---|
| Email | email, required |

Submit:
1. `userAuth.forgotPassword({ email })`
2. Uğurda: inline success banner "Email-ə təsdiq kodu göndərildi" + auto-redirect `/reset-password?email=...` (2 saniyə) və ya "Davam et" düyməsi.
3. Səhvdə: ApiError message göstərilir.

### 4.9 `/reset-password` səhifəsi (yeni)

| Sahə | Tip |
|---|---|
| Email | email, **prefilled** query-dən, redaktə oluna bilər |
| OTP | 6 rəqəmli (yeni `OtpInput` komponenti) |
| Yeni parol | password, min 8 simvol, show/hide toggle |
| Parolu təkrarla | password, eyni olmalı |

Submit:
1. Client-side validasiya (parollar uyğun, OTP 6 rəqəm)
2. `userAuth.resetPassword({ email, otpCode, newPassword })`
3. Uğurda: success message + `router.push("/login")` (2 saniyədən sonra)
4. Səhvdə: API mesajı + "Kodu yenidən göndər" düyməsi (`forgotPassword` çağırır)

### 4.10 `/set-password` səhifəsi (yeni)

`/reset-password`-un thin wrapper-i. Fərq:
- Mount-da avtomatik `userAuth.forgotPassword({ email })` çağırır (yalnız bir dəfə)
- Title: "Parolunu təyin et" (əvəzinə "Parolunu sıfırla")
- Subtitle: "Email-inə təsdiq kodu göndərdik. Daxil edin və parol qoyun."
- Uğurda: `/dashboard`-a yönləndirir (login-ə deyil, çünki tokens artıq register-dən sonra saxlanılıb)

### 4.11 `OtpInput` komponenti

Paylaşılan komponent, `components/app/OtpInput.tsx`:
- 6 ayrı kvadrat input, monospace, böyük
- Auto-focus növbəti boxa hər rəqəm yazıldıqda
- Backspace əvvəlki box-a qayıdır
- Paste dəstəyi (bütün 6-nı bir paste-də)
- Output: `value: string` (6 simvol) və `onChange(value: string)`

### 4.12 Səhvə davranış

- `ApiError` instance hallarında `err.message` göstərilir
- 401-də logout (token saxlanılırsa)
- Şəbəkə səhvi: "Şəbəkə problemi. Yenidən cəhd edin."
- Bütün form `aria-live="polite"` ilə inline alert (mövcud register/login stilinə uyğun)

### 4.13 Test ssenariləri

- [ ] Register yalnız 3 sahə qəbul edir; uğurda `/set-password?email=...` açılır
- [ ] `/set-password` mount-da forgot-password çağırır, OTP daxil ediləndən sonra reset-password çağırır, uğurda dashboard-a yönləndirir
- [ ] Login phone+password ilə işləyir
- [ ] "Parolu unutdum?" → forgot-password → reset-password → login
- [ ] OtpInput: paste 6 rəqəm avtomatik distribute edir
- [ ] Reset password "kodu yenidən göndər" yenidən forgot-password çağırır
- [ ] ApiError 400-də inline alert görünür

### 4.14 Backend assumption-ları (təsdiq tələb olunur)

1. `POST /auth/register` cavabında verilən token authenticated state üçün kifayət edir (set-password əməliyyatı edə bilmək üçün backend-də xüsusi rol/permission yoxdur deyə fərz edirik).
2. `forgot-password` OTP email-ə göndərir, SMS-ə yox (Postman komentariyası yoxdur).
3. OTP 6 rəqəmlidir (Postman sample: `"123456"`).
4. `reset-password` parolu uğurla yeniləyəndə tokens invalidate olunmur (əgər olunarsa, set-password axınında dashboard-a deyil, login-ə yönləndirməliyik).

Backend təsdiqindən sonra bu sənəd yenilənə bilər.

---

## 5. Faza 2 — Multi-car model (yüksək səviyyəli)

### 5.1 Məqsəd

`UserProfile.cars[]`-ı first-class data source-a çevir. Flat car sahələri (`carBrand`, `currentKm`, ...) UI-dan silinir. İstifadəçi çoxlu avtomobil saxlaya, hər birini idarə edə bilər.

### 5.2 Toxunulan fayllar

- `app/dashboard/page.tsx` — flat sahələrdən cars[]-a keçir
- `app/admin/page.tsx` — müştəri lookup-da cars[] siyahısı
- Yeni: car CRUD UI (modal və ya səhifə) — istifadəçinin **öz profilindən car əlavə/redaktə etmə**
- Yeni: profil edit səhifəsi (`/dashboard/profile` və ya modal) — `fullName` və digər immutable olmayan sahələri redaktə (R7 cavabından sonra)
- `lib/api/endpoints.ts` — `userApi.addCar`, `userApi.updateCar`, `userApi.removeCar`, (şərtlə) `userApi.updateProfile`
- `lib/api/types.ts` — `AddCarPayload`, `UpdateCarPayload`, (şərtlə) `UpdateProfilePayload`

### 5.3 UX qərarları (Faza 2 spec-ində dəqiqləşdiriləcək)

- **Aktiv car selector:** Dashboard-da əgər birdən çox car varsa, yuxarıda dropdown/segmented control. Bir car varsa, gizli.
- **Car list:** "Avtomobillərim" alt-səhifə (`/dashboard/cars`) — list + add/edit/remove.
- **Admin müştəri görünüşü:** plate axtarışı tək car qaytarır — backend hansını "primary" hesab edir, ya da bütün cars[] göstərilir; bu suala Faza 2-də cavab axtarılır.

### 5.4 Açıq suallar

- Faza 1-də yeni register-də car yaranmırsa, Faza 2-də "ilk girişdə car əlavə et" prompt-u lazımdır?
- Customer-in `cars[]` boş ola bilərmi? Backend təminatı?

---

## 6. Faza 3 — Product/Oil sahə zənginləşməsi (yüksək səviyyəli)

### 6.1 Məqsəd

Product modeli backendlə tam paralel olsun: `category`, `shelf`, `crossReferenceOemEquivalents`.

### 6.2 Toxunulan fayllar

- `lib/api/types.ts` — `Product`, `ProductPayload` genişləndirilir
- `components/admin/InventoryPanel.tsx` — form, cədvəl sütunları

### 6.3 Sahə xəritəsi

| Sahə | Tip | Form input | Cədvəldə |
|---|---|---|---|
| `category` | enum (ENGINE_OIL, ...) | select | filter chip + sütun |
| `shelf` | number | number input | sütun |
| `crossReferenceOemEquivalents` | string[] | comma-separated input (model/similarProducts-a uyğun) | hover/expand |

### 6.4 Açıq sual

- Tam `ProductCategory` enum dəyərləri Postman-də yalnız bir nümunə (`ENGINE_OIL`) göstərir — backend-dən tam siyahı tələb olunur.

---

## 7. Faza 4 — Motor oil multipart update (yüksək səviyyəli)

### 7.1 Məqsəd

`PUT /api/v1/motor-oils/:id` artıq JSON yox, multipart qəbul edir (Postman-də Content-Type yenə json göstərir, amma `createMultipart` analoqu deməli ki update də multipart-dır — bu Faza 4-də backend-dən təsdiqlənəcək).

### 7.2 Toxunulan fayllar

- `lib/api/endpoints.ts` — `motorOilsApi.update` multipart variant əlavə (`updateWithImage`)
- `components/admin/OilCatalogPanel.tsx` — edit modal-a şəkil dəyişdirmə imkanı

---

## 8. Faza 5 — Apple/Google Wallet pass (yüksək səviyyəli)

### 8.1 Məqsəd

İstifadəçi öz dashboard-undan plate-i Apple/Google Wallet-ə əlavə edə bilsin.

### 8.2 Toxunulan fayllar

- `app/dashboard/page.tsx` — yeni "Wallet-ə əlavə et" CTA bölməsi
- Yeni: `components/dashboard/AddToWalletButtons.tsx`

### 8.3 İmplementasiya qeydi

- Endpoint `GET /wallet/pass?plateNumber=...&wallet=apple|google` pkpass binary qaytarır
- UI sadəcə user-in browser-ində bu URL-ə yönləndirir (yeni tab) və ya `<a download>` istifadə edir
- Apple/Google iconları və rəsmi badge-lər (Apple Wallet badge guidelines)

### 8.4 Açıq sual

- User-in `cars[]` çox olarsa, hansı plate-i Wallet-ə əlavə edir? Hər car üçün ayrı düymə? (Faza 2-dən sonra cavab daha aydındır.)

---

## 9. Risklər və açıq suallar (xülasə)

| # | Risk / Sual | Faza |
|---|---|---|
| R1 | Backend register-də sürətlə tokenlər verir — set-password reset-password-dan istifadə edirsə, tokenlər invalidate olunarmı? | 1 |
| R2 | `forgot-password` və `forget-password` endpoint-ləri eynidirmi? Hansı rəsmidir? | 1 |
| R3 | UserProfile-ın flat sahələri Phase 2-dən sonra backend-də saxlanacaq, yoxsa silinəcək? | 2 |
| R4 | `ProductCategory` enum tam siyahısı nədir? | 3 |
| R5 | Motor oil update üçün multipart yoxsa JSON? | 4 |
| R6 | Wallet pass user-aware-dir? Authentication tələb edirmi? | 5 |
| R7 | `fullName` (və digər profil sahələri) backend-də necə update olunur? `PUT /users/me` Postman-də yoxdur — gizli endpoint, yoxsa immutable? | 1→2 |

## 10. Verifikasiya yolu

- TypeScript build-i sınqırı yoxlaması (`npm run build`)
- Hər səhifə üçün manual smoke test (lokal `npm run dev`)
- Browser-də end-to-end auth axını (Faza 1 üçün)
- `git diff` review hər faza bitəndə

## 11. Faza 1 dəyişiklik xülasəsi

- ~3 mövcud fayl yenilənir, ~4 yeni fayl yaranır
- Heç bir database schema migration tələb olunmur (yalnız UI/client tipləri)
- Backwards-compat shim YOX — köhnə UI-ın hazırda backendlə işləmədiyini fərz edirik
- Estimated diff: ~600 sətir əlavə, ~300 sətir silinmiş (köhnə wizard)
