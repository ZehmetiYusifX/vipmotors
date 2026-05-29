"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Car,
  Droplet,
  Gauge,
  LogOut,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Wrench
} from "lucide-react";

import { CarFormModal } from "@/components/dashboard/CarFormModal";
import { userCarsApi } from "@/lib/api/endpoints";
import { ApiError, type UserCar } from "@/lib/api/types";
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
  const { status, user, refresh, logout } = useUserAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<UserCar | null>(null);
  const [carError, setCarError] = useState<string | null>(null);

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

  const cars: UserCar[] = user.cars ?? [];
  const primaryCar: UserCar | null =
    cars[0] ??
    (user.carBrand || user.brandModel
      ? {
          id: 0,
          plateNumber: user.plateNumber,
          vinCode: user.vinCode,
          carBrand: user.carBrand ?? "",
          brandModel: user.brandModel ?? "",
          year: user.year ?? new Date().getFullYear(),
          firstRegisteredKm: user.firstRegisteredKm ?? 0,
          currentKm: user.currentKm ?? 0,
          oilBrand: user.oilBrand,
          oilType: user.oilType,
          lastServiceDate: user.lastServiceDate
        }
      : null);

  function openAdd() {
    setEditingCar(null);
    setCarError(null);
    setModalOpen(true);
  }

  function openEdit(car: UserCar) {
    if (car.id === 0) {
      setCarError("Bu avtomobil hələ profilə əlavə edilməyib. Yeni avtomobil kimi əlavə edin.");
      return;
    }
    setEditingCar(car);
    setCarError(null);
    setModalOpen(true);
  }

  async function deleteCar(car: UserCar) {
    if (car.id === 0) return;
    if (!confirm(`${car.carBrand} ${car.brandModel} (${car.plateNumber}) silinsin?`)) return;
    setCarError(null);
    try {
      await userCarsApi.remove(car.id);
      await refresh();
    } catch (err) {
      setCarError(err instanceof ApiError ? err.message : "Silmək mümkün olmadı.");
    }
  }

  const displayName = user.fullName?.trim() || user.plateNumber || user.email || "Sürücü";
  const firstName =
    user.fullName?.trim().split(" ")[0] || user.plateNumber || user.email || "Sürücü";
  const initials = (user.fullName ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const currentKm = primaryCar?.currentKm ?? 0;
  const firstRegisteredKm = primaryCar?.firstRegisteredKm ?? 0;
  const kmSinceFirst = currentKm - firstRegisteredKm;
  const usedRatio = Math.min(
    100,
    Math.max(
      0,
      Math.round(((kmSinceFirst % NEXT_SERVICE_INTERVAL_KM) / NEXT_SERVICE_INTERVAL_KM) * 100)
    )
  );
  const nextServiceKm =
    currentKm + (NEXT_SERVICE_INTERVAL_KM - (kmSinceFirst % NEXT_SERVICE_INTERVAL_KM));
  const kmLeft = nextServiceKm - currentKm;

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
                <strong className="text-xs text-white">{displayName}</strong>
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
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
              Salam, {firstName}{" "}
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
            { label: "Hazırkı yürüş", value: primaryCar ? formatKm(primaryCar.currentKm) : "—", Icon: Gauge },
            { label: "Növbəti servisə", value: primaryCar ? formatKm(Math.max(0, kmLeft)) : "—", Icon: Wrench },
            { label: "Son servis", value: formatDate(primaryCar?.lastServiceDate ?? null), Icon: Calendar },
            { label: "Avtomobil sayı", value: String(cars.length), Icon: Car }
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
                  {primaryCar
                    ? `${primaryCar.carBrand} ${primaryCar.brandModel}`.trim() || "Avtomobil"
                    : "Avtomobil əlavə edilməyib"}
                </h2>
              </div>
              <div className="flex items-stretch rounded-xl border-hairline bg-ink-950 overflow-hidden shadow-card">
                <span className="grid place-items-center px-2.5 bg-brand-500/15 text-brand-300 text-[10px] font-mono font-bold border-r border-white/5">
                  AZ
                </span>
                <span className="px-3 py-1.5 text-sm font-mono font-bold tracking-wider text-white">
                  {primaryCar?.plateNumber || user.plateNumber}
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-5">
              {[
                { dt: "Buraxılış ili", dd: primaryCar?.year ?? "—" },
                { dt: "İlk qeydiyyat", dd: primaryCar ? formatKm(primaryCar.firstRegisteredKm) : "—" },
                { dt: "Hazırkı yürüş", dd: primaryCar ? formatKm(primaryCar.currentKm) : "—" },
                { dt: "Telefon", dd: user.phoneNumber, Icon: Phone, href: `tel:${user.phoneNumber}` },
                { dt: "Email", dd: user.email, Icon: Mail, href: `mailto:${user.email}` },
                { dt: "Son servis", dd: formatDate(primaryCar?.lastServiceDate ?? null) }
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
                { dt: "Marka", dd: primaryCar?.oilBrand || "—" },
                { dt: "Tip", dd: primaryCar?.oilType || "—" },
                { dt: "Növbəti", dd: primaryCar ? formatKm(nextServiceKm) : "—" }
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

            {primaryCar?.lastServiceDate ? (
              <ol className="relative space-y-4">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-white/5" />
                <li className="relative flex items-start gap-4 pl-10">
                  <span className="absolute left-0 grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
                    <Droplet className="h-3.5 w-3.5 text-white" />
                  </span>
                  <div className="flex-1 rounded-xl border-hairline bg-ink-900/60 p-4">
                    <strong className="block text-white">
                      Yağ dəyişimi · {primaryCar.oilBrand || "Yağ"}{" "}
                      {primaryCar.oilType ? `(${primaryCar.oilType})` : ""}
                    </strong>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(primaryCar.lastServiceDate)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {formatKm(primaryCar.currentKm)}
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
                  İlk dəfə servisə getdiyiniz zaman usta dövlət qeydiyyat nişanınız
                  üzərindən qeyd yaradacaq və bu sahə avtomatik dolacaq.
                </p>
              </div>
            )}
          </article>

          {/* My cars */}
          <article className="lg:col-span-3 rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  Avtomobillərim
                </span>
                <h2 className="text-lg font-semibold mt-0.5">
                  {cars.length > 0 ? `${cars.length} avtomobil` : "Hələ avtomobil əlavə edilməyib"}
                </h2>
              </div>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors"
              >
                <Plus className="h-4 w-4" /> Yeni
              </button>
            </div>

            {carError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{carError}</span>
              </div>
            )}

            {cars.length === 0 ? (
              <div className="rounded-xl border-hairline border-dashed bg-ink-900/40 p-8 text-center">
                <Car className="h-8 w-8 text-ink-500 mx-auto" />
                <strong className="mt-3 block text-white">Avtomobil əlavə et</strong>
                <p className="mt-1.5 text-sm text-ink-400 max-w-md mx-auto">
                  Profilinə avtomobil əlavə etsən, servis tarixçəsi və yağ izləmə avtomatik
                  o avtomobilə bağlanacaq.
                </p>
              </div>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-4">
                {cars.map((car) => (
                  <li
                    key={car.id}
                    className="rounded-xl border-hairline bg-ink-900/60 p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                          {car.year}
                        </div>
                        <strong className="block text-white truncate text-base mt-0.5">
                          {car.carBrand} {car.brandModel}
                        </strong>
                      </div>
                      <span className="inline-flex items-stretch rounded-lg border-hairline bg-ink-950 overflow-hidden shrink-0">
                        <span className="grid place-items-center px-1.5 bg-brand-500/15 text-brand-300 text-[9px] font-mono font-bold border-r border-white/5">
                          AZ
                        </span>
                        <span className="px-2 py-1 text-xs font-mono font-bold tracking-wider text-white">
                          {car.plateNumber}
                        </span>
                      </span>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div>
                        <dt className="text-ink-500">Yürüş</dt>
                        <dd className="text-white font-medium">{formatKm(car.currentKm)}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Yağ</dt>
                        <dd className="text-white font-medium truncate">
                          {car.oilBrand || "—"}
                          {car.oilType ? ` · ${car.oilType}` : ""}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-ink-500">Son servis</dt>
                        <dd className="text-white font-medium">{formatDate(car.lastServiceDate)}</dd>
                      </div>
                    </dl>
                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => openEdit(car)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-200 hover:bg-white/5 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Redaktə
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCar(car)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Sil
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>

      <CarFormModal
        open={modalOpen}
        editing={editingCar}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
      />
    </main>
  );
}
