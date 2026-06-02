# Dashboard redesign — sidebar + section panels

Date: 2026-06-03
Status: Approved (tab-style sidebar; sections: Overview / Cars / History / Profile;
keep dark theme; verify via Playwright using the user's login).

## Context

`app/dashboard/page.tsx` is a single ~515-line client component rendering a
topbar, hero greeting, stat cards, vehicle profile, oil-tracking ring, service
history, and a cars CRUD grid as one long scroll. The user wants it to feel like
a real dashboard: a persistent left sidebar that switches between sections, so
tasks are easy to reach without scrolling the whole page.

## Goals

1. Add a persistent sidebar with tab-style navigation (panel swaps per section).
2. Split the monolith into focused, independently-understandable components.
3. Keep the existing dark ink/brand theme; elevate, don't replace.
4. Responsive: sidebar on desktop, slide-in drawer on mobile.

## Non-goals

- No API/data-model changes; `useUserAuth()` stays the data source.
- No new routes; section switching is client-side state (not URL-synced — YAGNI).
- No change to `CarFormModal` / `AddToWalletButtons` internals.

## Sections (sidebar items)

| Key | Label | Content |
|---|---|---|
| `overview` | Ümumi baxış | greeting + 4 stat cards + oil-tracking ring + car summary |
| `cars` | Avtomobillərim | car cards (add/edit/delete), "Yeni", empty state, errors, Wallet buttons |
| `history` | Servis tarixçəsi | service/oil-change timeline + "Randevu yaz" (WhatsApp) |
| `profile` | Profil & əlaqə | ad, telefon, email, DQN, VIN + contact links + Çıxış |

Default section: `overview`.

## Architecture

- **`app/dashboard/page.tsx`** (orchestrator) — auth gate (loading spinner,
  anonymous → `/login`), reads `user` via `useUserAuth()`, computes derived data
  (primaryCar, oil % used, next-service km, kmLeft), owns `activeSection` and
  modal/editing/error state, wires `openAdd/openEdit/deleteCar`, renders
  `DashboardShell` with the active section component.
- **`components/dashboard/DashboardShell.tsx`** — layout frame. Props:
  `active`, `onNavigate`, `user`, `onLogout`, `children`. Renders the sidebar
  (desktop), a mobile top bar with title + ☰, the drawer overlay, and the
  scrolling content region. Owns the mobile drawer open/close state.
- **`components/dashboard/DashboardSidebar.tsx`** — brand block → nav items
  (icon + label, active highlight: brand tint + left accent) → user chip +
  Çıxış pinned at the bottom. Props: `active`, `onNavigate`, `user`, `onLogout`.
- **`components/dashboard/sections/`** — presentational, prop-driven:
  - `OverviewSection` — greeting, `StatCard` grid, oil ring, compact car summary.
  - `CarsSection` — cars list/empty state, `onAdd/onEdit/onDelete`, `error`.
  - `HistorySection` — timeline from `primaryCar.lastServiceDate`, appointment CTA.
  - `ProfileSection` — user details, `tel:`/`mailto:` links, `onLogout`.
- **`components/dashboard/nav.ts`** — `SECTIONS` array (key, label, icon) and a
  `DashboardSection` union type, shared by shell + sidebar + page.

Each section receives only the data and callbacks it needs; none reaches into
auth or API directly (the page does that), so they stay testable in isolation.

## Layout & responsiveness

- Desktop (`lg+`): sticky `glass-strong` sidebar ~260px, content scrolls beside.
- Mobile (`<lg`): sidebar hidden; slim sticky top bar shows active-section title
  + ☰ button; tapping opens the sidebar as a left drawer over a dimmed overlay
  (closes on nav select / overlay click / Esc).
- Section change fades content in via framer-motion; gated by
  `prefers-reduced-motion`.

## Error handling

- Loading: centered spinner (unchanged). Anonymous: redirect to `/login`.
- Car delete/edit errors: surfaced inside `CarsSection` (same behavior as today).

## Verification

1. `npx tsc --noEmit` and `npx next build` clean.
2. Playwright (live API at `109.199.106.116:8080`): log in via `/login`
   (phone `+994554048181`), land on `/dashboard`, screenshot each section
   (Overview/Cars/History/Profile) and the mobile drawer. Credentials are used
   only in the browser session — never committed to code.

## Files

- New: `components/dashboard/DashboardShell.tsx`,
  `components/dashboard/DashboardSidebar.tsx`,
  `components/dashboard/nav.ts`,
  `components/dashboard/sections/{OverviewSection,CarsSection,HistorySection,ProfileSection}.tsx`.
- Rewritten: `app/dashboard/page.tsx` (orchestrator only).
- Unchanged: `CarFormModal.tsx`, `AddToWalletButtons.tsx`, `UserAuthProvider.tsx`.
