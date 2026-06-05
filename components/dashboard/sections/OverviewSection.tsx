import { Calendar, Car, Droplet, Gauge, Wrench } from "lucide-react";

import type { UserCar, UserProfile } from "@/lib/api/types";
import { formatDate, formatKm } from "../format";
import { SectionHeader } from "./SectionHeader";

export interface OilMetrics {
  usedRatio: number;
  nextServiceKm: number;
  kmLeft: number;
  ringColor: string;
}

interface OverviewSectionProps {
  firstName: string;
  user: UserProfile;
  primaryCar: UserCar | null;
  cars: UserCar[];
  metrics: OilMetrics;
}

export function OverviewSection({
  firstName,
  user,
  primaryCar,
  cars,
  metrics
}: OverviewSectionProps) {
  const { usedRatio, nextServiceKm, kmLeft, ringColor } = metrics;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const stats = [
    {
      label: "Hazırkı yürüş",
      value: primaryCar ? formatKm(primaryCar.currentKm) : "—",
      Icon: Gauge
    },
    {
      label: "Növbəti servisə",
      value: primaryCar ? formatKm(Math.max(0, kmLeft)) : "—",
      Icon: Wrench
    },
    {
      label: "Son servis",
      value: formatDate(primaryCar?.lastServiceDate ?? null),
      Icon: Calendar
    },
    { label: "Avtomobil sayı", value: String(cars.length), Icon: Car }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Ümumi baxış"
        title={`Salam, ${firstName} 👋`}
        description="Avtomobilinin yağ vəziyyəti və servis xülasəsi bir baxışda."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border-hairline bg-ink-900/40 p-5 transition-colors hover:bg-ink-900/70"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                {s.label}
              </span>
              <s.Icon className="h-4 w-4 text-brand-400" />
            </div>
            <div className="mt-3 truncate text-2xl font-semibold text-white">
              {s.value}
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vehicle profile */}
        <article className="rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8 lg:col-span-2">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                Avtomobil profili
              </span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {primaryCar
                  ? `${primaryCar.carBrand} ${primaryCar.brandModel}`.trim() ||
                    "Avtomobil"
                  : "Avtomobil əlavə edilməyib"}
              </h2>
            </div>
            <div className="flex items-stretch overflow-hidden rounded-xl border-hairline bg-ink-950 shadow-card">
              <span className="grid place-items-center border-r border-white/5 bg-brand-500/15 px-2.5 font-mono text-[10px] font-bold text-brand-300">
                AZ
              </span>
              <span className="px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-white">
                {primaryCar?.plateNumber || user.plateNumber}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3">
            {[
              { dt: "Buraxılış ili", dd: primaryCar?.year ?? "—" },
              {
                dt: "İlk qeydiyyat",
                dd: primaryCar ? formatKm(primaryCar.firstRegisteredKm) : "—"
              },
              {
                dt: "Hazırkı yürüş",
                dd: primaryCar ? formatKm(primaryCar.currentKm) : "—"
              },
              {
                dt: "Son servis",
                dd: formatDate(primaryCar?.lastServiceDate ?? null)
              }
            ].map((row) => (
              <div key={row.dt}>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  {row.dt}
                </dt>
                <dd className="mt-1.5 truncate text-sm font-medium text-white">
                  {row.dd}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        {/* Oil tracking */}
        <article className="flex flex-col rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                Yağ izləmə
              </span>
              <h2 className="mt-0.5 text-lg font-semibold">
                Növbəti yağ dəyişiminə
              </h2>
            </div>
            <Droplet className="h-5 w-5 text-brand-400" />
          </div>

          <div
            className="relative mx-auto my-6"
            role="img"
            aria-label={`${usedRatio}% istifadə`}
          >
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
                  strokeDashoffset:
                    circumference - (circumference * usedRatio) / 100,
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
              <div
                key={row.dt}
                className="rounded-xl border-hairline bg-ink-900/60 p-3"
              >
                <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  {row.dt}
                </dt>
                <dd className="mt-1 truncate text-sm font-medium text-white">
                  {row.dd}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </div>
  );
}
