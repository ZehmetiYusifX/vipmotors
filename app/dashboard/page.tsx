"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Calendar,
  Car,
  Droplet,
  Gauge,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Wrench
} from "lucide-react";

import { useUserAuth } from "@/lib/auth/UserAuthProvider";

function formatKm(value: number) {
  return new Intl.NumberFormat("az-AZ").format(value) + " km";
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

const NEXT_SERVICE_INTERVAL_KM = 10000;

export default function DashboardPage() {
  const router = useRouter();
  const { status, user, logout } = useUserAuth();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen grid place-items-center bg-ink-950">
        <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-brand-500 animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const kmSinceFirst = user.currentKm - user.firstRegisteredKm;
  const usedRatio = Math.min(
    100,
    Math.max(
      0,
      Math.round(((kmSinceFirst % NEXT_SERVICE_INTERVAL_KM) / NEXT_SERVICE_INTERVAL_KM) * 100)
    )
  );
  const nextServiceKm =
    user.currentKm + (NEXT_SERVICE_INTERVAL_KM - (kmSinceFirst % NEXT_SERVICE_INTERVAL_KM));
  const kmLeft = nextServiceKm - user.currentKm;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const ringColor =
    usedRatio < 60 ? "text-emerald-400" : usedRatio < 85 ? "text-amber-400" : "text-brand-400";

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      {/* Topbar */}
      <header className="sticky top-0 z-30 glass-strong border-b border-white/5">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
              <Wrench className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </span>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[15px] font-semibold tracking-tight">
                VIP <span className="text-ink-300">Motors</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-brand-400">
                Sürücü kabineti
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 rounded-full border-hairline bg-white/5 pl-1.5 pr-3 py-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white">
                {initials || "U"}
              </span>
              <div className="hidden sm:flex flex-col leading-tight text-left">
                <strong className="text-xs text-white">{user.fullName}</strong>
                <span className="text-[10px] text-ink-400 font-mono">{user.plateNumber}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="grid h-10 w-10 place-items-center rounded-lg border-hairline bg-white/5 hover:bg-white/10 text-brand-300"
              aria-label="Çıxış"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero greeting */}
        <section className="rounded-3xl border-hairline bg-linear-to-br from-ink-900/80 via-ink-900/40 to-ink-900/80 p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-brand-700/15 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              Sürücü paneli
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
              Salam, {user.fullName.split(" ")[0] || user.fullName}{" "}
              <span className="text-gradient">👋</span>
            </h1>
            <p className="mt-4 text-ink-300 max-w-2xl leading-relaxed">
              Avtomobilinin profili, yağ vəziyyəti və servis tarixçəsi bu səhifədə.
              Bütün məlumatlar yalnız sənin üçün görünür.
            </p>
          </div>
        </section>

        {/* Quick stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Hazırkı yürüş", value: formatKm(user.currentKm), Icon: Gauge },
            { label: "Növbəti servisə", value: formatKm(Math.max(0, kmLeft)), Icon: Wrench },
            { label: "Son servis", value: formatDate(user.lastServiceDate), Icon: Calendar },
            { label: "Buraxılış", value: String(user.year), Icon: Car }
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border-hairline bg-ink-900/40 p-5 hover:bg-ink-900/70 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  {s.label}
                </span>
                <s.Icon className="h-4 w-4 text-brand-400" />
              </div>
              <div className="mt-3 text-2xl font-semibold text-white truncate">
                {s.value}
              </div>
            </div>
          ))}
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Vehicle profile */}
          <article className="lg:col-span-2 rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  Avtomobil profili
                </span>
                <h2 className="text-2xl font-semibold mt-1 tracking-tight">
                  {user.carBrand} {user.brandModel}
                </h2>
              </div>
              <div className="flex items-stretch rounded-xl border-hairline bg-ink-950 overflow-hidden shadow-card">
                <span className="grid place-items-center px-2.5 bg-brand-500/15 text-brand-300 text-[10px] font-mono font-bold border-r border-white/5">
                  AZ
                </span>
                <span className="px-3 py-1.5 text-sm font-mono font-bold tracking-wider text-white">
                  {user.plateNumber}
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-5">
              {[
                { dt: "Buraxılış ili", dd: user.year },
                { dt: "İlk qeydiyyat", dd: formatKm(user.firstRegisteredKm) },
                { dt: "Hazırkı yürüş", dd: formatKm(user.currentKm) },
                { dt: "Telefon", dd: user.phoneNumber, Icon: Phone, href: `tel:${user.phoneNumber}` },
                { dt: "Email", dd: user.email, Icon: Mail, href: `mailto:${user.email}` },
                { dt: "Son servis", dd: formatDate(user.lastServiceDate) }
              ].map((row) => (
                <div key={row.dt}>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {row.dt}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-white truncate">
                    {row.href ? (
                      <a
                        href={row.href}
                        className="inline-flex items-center gap-1.5 hover:text-brand-300"
                      >
                        {row.Icon && <row.Icon className="h-3.5 w-3.5 text-ink-400" />}
                        {row.dd}
                      </a>
                    ) : (
                      row.dd
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          {/* Oil tracking */}
          <article className="rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  Yağ izləmə
                </span>
                <h2 className="text-lg font-semibold mt-0.5">Növbəti yağ dəyişiminə</h2>
              </div>
              <Droplet className="h-5 w-5 text-brand-400" />
            </div>

            <div className="relative my-6 mx-auto" role="img" aria-label={`${usedRatio}% istifadə`}>
              <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="9"
                  className="text-white/5"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="9"
                  strokeLinecap="round"
                  className={ringColor}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: circumference - (circumference * usedRatio) / 100,
                    transition: "stroke-dashoffset 0.8s ease"
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-4xl font-semibold tracking-tight text-white">
                  {usedRatio}%
                </strong>
                <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  istifadə
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                { dt: "Marka", dd: user.oilBrand || "—" },
                { dt: "Tip", dd: user.oilType || "—" },
                { dt: "Növbəti", dd: formatKm(nextServiceKm) }
              ].map((row) => (
                <div key={row.dt} className="rounded-xl border-hairline bg-ink-900/60 p-3">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {row.dt}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white truncate">{row.dd}</dd>
                </div>
              ))}
            </dl>
          </article>

          {/* History */}
          <article className="lg:col-span-3 rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  Servis tarixçəsi
                </span>
                <h2 className="text-lg font-semibold mt-0.5">Avtomobilinin son servisləri</h2>
              </div>
              <a
                href="https://wa.me/994551234567"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Randevu yaz
              </a>
            </div>

            {user.lastServiceDate ? (
              <ol className="relative space-y-4">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-white/5" />
                <li className="relative flex items-start gap-4 pl-10">
                  <span className="absolute left-0 grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
                    <Droplet className="h-3.5 w-3.5 text-white" />
                  </span>
                  <div className="flex-1 rounded-xl border-hairline bg-ink-900/60 p-4">
                    <strong className="block text-white">
                      Yağ dəyişimi · {user.oilBrand || "Yağ"} {user.oilType ? `(${user.oilType})` : ""}
                    </strong>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.lastServiceDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {formatKm(user.currentKm)}
                      </span>
                    </div>
                  </div>
                </li>
              </ol>
            ) : (
              <div className="rounded-xl border-hairline border-dashed bg-ink-900/40 p-8 text-center">
                <Wrench className="h-8 w-8 text-ink-500 mx-auto" />
                <strong className="mt-3 block text-white">Hələ servis qeydi yoxdur.</strong>
                <p className="mt-1.5 text-sm text-ink-400 max-w-md mx-auto">
                  İlk dəfə servisə getdiyində usta plaka nömrən üzərindən qeyd
                  yaradacaq və bu sahə avtomatik dolacaq.
                </p>
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
