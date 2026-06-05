import { Hash, LogOut, Mail, Phone } from "lucide-react";

import type { UserProfile } from "@/lib/api/types";
import { SectionHeader } from "./SectionHeader";

interface ProfileSectionProps {
  user: UserProfile;
  displayName: string;
  initials: string;
  onLogout: () => void;
}

export function ProfileSection({
  user,
  displayName,
  initials,
  onLogout
}: ProfileSectionProps) {
  const contacts = [
    {
      Icon: Phone,
      label: "Telefon",
      value: user.phoneNumber,
      href: user.phoneNumber ? `tel:${user.phoneNumber}` : undefined
    },
    {
      Icon: Mail,
      label: "Email",
      value: user.email,
      href: user.email ? `mailto:${user.email}` : undefined
    },
    { Icon: Hash, label: "VIN", value: user.vinCode || "—" }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profil & əlaqə"
        title="Hesab məlumatların"
        description="Əlaqə məlumatların yalnız sənin üçün görünür."
      />

      <article className="rounded-2xl border-hairline bg-ink-900/40 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-700 text-lg font-semibold text-white shadow-glow">
            {initials || "U"}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-white">
              {displayName}
            </h2>
            <div className="mt-1 inline-flex items-stretch overflow-hidden rounded-lg border-hairline bg-ink-950">
              <span className="grid place-items-center border-r border-white/5 bg-brand-500/15 px-2 font-mono text-[9px] font-bold text-brand-300">
                AZ
              </span>
              <span className="px-2 py-1 font-mono text-xs font-bold tracking-wider text-white">
                {user.plateNumber}
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-white/5 pt-6 sm:grid-cols-2">
          {contacts.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 rounded-xl border-hairline bg-ink-900/60 p-4"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-brand-300">
                <row.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  {row.label}
                </dt>
                <dd className="truncate text-sm font-medium text-white">
                  {row.href ? (
                    <a href={row.href} className="hover:text-brand-300">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={onLogout}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border-hairline bg-white/5 px-4 py-2.5 text-sm font-medium text-brand-300 transition-colors hover:bg-white/10 hover:text-brand-200"
        >
          <LogOut className="h-4 w-4" /> Hesabdan çıxış
        </button>
      </article>
    </div>
  );
}
