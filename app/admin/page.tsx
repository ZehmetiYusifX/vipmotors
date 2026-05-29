"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  Car,
  CheckCircle2,
  Droplet,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Package,
  Phone,
  Plus,
  Search,
  Users,
  Wrench
} from "lucide-react";

import { AdminAuth } from "@/components/app/AdminAuth";
import { InventoryPanel } from "@/components/admin/InventoryPanel";
import { OilCatalogPanel } from "@/components/admin/OilCatalogPanel";
import { carServiceOps } from "@/lib/api/endpoints";
import { ApiError, type MaintenanceRecord, type UserProfile } from "@/lib/api/types";
import { useServiceAuth } from "@/lib/auth/ServiceAuthProvider";
import { cn } from "@/lib/cn";

type AdminSection = "search" | "inventory" | "oils" | "customers" | "records" | "stats";

type SearchState =
  | { status: "idle" }
  | { status: "loading"; plate: string }
  | { status: "found"; customer: UserProfile }
  | { status: "not_found"; plate: string }
  | { status: "error"; message: string };

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

const NAV: Array<{ id: AdminSection; label: string; Icon: typeof Search; soon?: boolean }> = [
  { id: "search", label: "Müştəri axtarışı", Icon: Search },
  { id: "inventory", label: "Anbar", Icon: Package },
  { id: "oils", label: "Yağ kataloqu", Icon: Droplet },
  { id: "customers", label: "Müştərilər", Icon: Users, soon: true },
  { id: "records", label: "Servis qeydləri", Icon: FileText, soon: true },
  { id: "stats", label: "Statistika", Icon: Gauge, soon: true }
];

const SECTION_TITLE: Record<AdminSection, { eyebrow: string; title: string }> = {
  search: { eyebrow: "Servis əməliyyatları", title: "Müştəri axtarışı" },
  inventory: { eyebrow: "Anbar idarəsi", title: "Məhsullar" },
  oils: { eyebrow: "Kataloq idarəsi", title: "Motor yağları" },
  customers: { eyebrow: "Servis əməliyyatları", title: "Müştərilər" },
  records: { eyebrow: "Servis əməliyyatları", title: "Servis qeydləri" },
  stats: { eyebrow: "Servis əməliyyatları", title: "Statistika" }
};

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

export default function AdminPage() {
  const { status: authStatus, saveSession, logout } = useServiceAuth();

  const [activeSection, setActiveSection] = useState<AdminSection>("search");
  const [plate, setPlate] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });

  const [oilBrand, setOilBrand] = useState("");
  const [oilType, setOilType] = useState("");
  const [serviceKm, setServiceKm] = useState("");
  const [serviceDate, setServiceDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<MaintenanceRecord | null>(null);

  if (authStatus === "loading") {
    return (
      <main className="min-h-screen grid place-items-center bg-ink-950">
        <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-brand-500 animate-spin" />
      </main>
    );
  }

  if (authStatus === "anonymous") {
    return <AdminAuth onAuthenticated={saveSession} />;
  }

  async function runSearch(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmed = plate.trim().toUpperCase();
    if (!trimmed) return;
    setSearch({ status: "loading", plate: trimmed });
    setLastCreated(null);
    setCreateError(null);
    try {
      const customer = await carServiceOps.findCustomerByPlate(trimmed);
      setSearch({ status: "found", customer });
      setOilBrand(customer.oilBrand || "");
      setOilType(customer.oilType || "");
      setServiceKm(String(customer.currentKm || ""));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setSearch({ status: "not_found", plate: trimmed });
      } else if (err instanceof ApiError && err.status === 401) {
        logout();
      } else {
        setSearch({
          status: "error",
          message: err instanceof ApiError ? err.message : "Axtarış uğursuz oldu."
        });
      }
    }
  }

  async function createMaintenance(event: React.FormEvent) {
    event.preventDefault();
    if (search.status !== "found") return;
    setCreateError(null);
    setCreating(true);
    try {
      const record = await carServiceOps.createMaintenance({
        plateNumber: search.customer.plateNumber,
        oilBrand: oilBrand.trim(),
        oilType: oilType.trim(),
        serviceKm: Number(serviceKm),
        serviceDate
      });
      setLastCreated(record);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setCreateError(
        err instanceof ApiError ? err.message : "Servis qeydi yaradıla bilmədi."
      );
    } finally {
      setCreating(false);
    }
  }

  const customer = search.status === "found" ? search.customer : null;
  const customerDisplayName = customer
    ? customer.fullName?.trim() || customer.plateNumber || customer.email || "—"
    : "";
  const initials = customer
    ? (customer.fullName ?? "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "";

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-white/5 bg-ink-900/40 h-screen sticky top-0">
        <div className="px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
              <Wrench className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-semibold tracking-tight">
                VIP <span className="text-ink-300">Motors</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-brand-400">
                Operator paneli
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">
            İdarəetmə
          </div>
          {NAV.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => !item.soon && setActiveSection(item.id)}
                disabled={item.soon}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-500/10 text-brand-200 border border-brand-500/20"
                    : item.soon
                      ? "text-ink-400 cursor-not-allowed"
                      : "text-ink-300 hover:text-white hover:bg-white/5"
                )}
              >
                <item.Icon className="h-4 w-4" />
                {item.label}
                {item.soon && (
                  <span className="ml-auto text-[10px] text-ink-500 font-mono">soon</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-300 hover:bg-brand-500/10"
          >
            <LogOut className="h-4 w-4" />
            Çıxış
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 glass-strong border-b border-white/5">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="lg:hidden flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700">
                  <Wrench className="h-4 w-4 text-white" strokeWidth={2.5} />
                </span>
              </Link>
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  {SECTION_TITLE[activeSection].eyebrow}
                </div>
                <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                  {SECTION_TITLE[activeSection].title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-lg border-hairline bg-white/5 hover:bg-white/10 text-ink-300 hover:text-white"
                aria-label="Bildirişlər"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2.5 rounded-full border-hairline bg-white/5 pl-1.5 pr-3 py-1.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white">
                  VM
                </span>
                <div className="hidden sm:flex flex-col leading-tight">
                  <strong className="text-xs text-white">Operator</strong>
                  <span className="text-[10px] text-ink-400">Servis paneli</span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="lg:hidden grid h-10 w-10 place-items-center rounded-lg border-hairline bg-white/5 hover:bg-white/10 text-brand-300"
                aria-label="Çıxış"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-8 py-8 space-y-6">
          {activeSection === "inventory" && (
            <InventoryPanel onUnauthorized={logout} />
          )}

          {activeSection === "oils" && (
            <OilCatalogPanel onUnauthorized={logout} />
          )}

          {activeSection === "search" && (
          <>
          {/* Hero / lead */}
          <section className="rounded-2xl border-hairline bg-linear-to-br from-ink-900/80 to-ink-900/40 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                Müştərini dövlət qeydiyyat nişanı ilə tap, servis qeydini bir kliklə yarat.
              </h2>
              <p className="mt-3 text-ink-300">
                DQN-ni daxil edin, avtomobil profilini yoxlayın və yağ/servis
                qeydini əlavə edin.
              </p>
            </div>
          </section>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Search + Customer */}
            <section className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl border-hairline bg-ink-900/40 p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                      DQN ilə axtarış
                    </span>
                    <h3 className="text-lg font-semibold mt-0.5">Müştəri tap</h3>
                  </div>
                  <Search className="h-5 w-5 text-ink-400" />
                </div>

                <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-stretch rounded-xl border-hairline bg-ink-900/60 focus-within:border-brand-500/50 transition-colors overflow-hidden">
                    <span className="grid place-items-center px-3 text-xs font-mono font-semibold text-brand-300 bg-brand-500/10 border-r border-white/5">
                      AZ
                    </span>
                    <input
                      type="text"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      placeholder="10-AA-001"
                      aria-label="Dövlət qeydiyyat nişanı"
                      spellCheck={false}
                      className="w-full bg-transparent px-4 py-3 text-white font-mono tracking-wider placeholder:text-ink-500 outline-none"
                    />
                    {search.status === "loading" && (
                      <span className="grid place-items-center px-3">
                        <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-brand-400 animate-spin" />
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={search.status === "loading" || !plate.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all"
                  >
                    <Search className="h-4 w-4" />
                    Axtar
                  </button>
                </form>

                <div className="mt-5">
                  {search.status === "idle" && (
                    <div className="rounded-xl border-hairline border-dashed bg-ink-900/40 p-6 text-center">
                      <Car className="h-8 w-8 text-ink-500 mx-auto" />
                      <div className="mt-3 font-medium text-white">
                        Başlamaq üçün DQN daxil edin
                      </div>
                      <p className="mt-1 text-sm text-ink-400">
                        Müştərinin avtomobil profili və yağ məlumatları burada görünəcək.
                      </p>
                    </div>
                  )}

                  {search.status === "not_found" && (
                    <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-brand-300 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-brand-200">Tapılmadı</strong>
                          <p className="mt-1 text-sm text-brand-100/80">
                            <code className="font-mono px-1.5 py-0.5 rounded bg-black/30">
                              {search.plate}
                            </code>{" "}
                            nömrəsi üçün qeyd yoxdur. Sürücüdən tətbiqdə qeydiyyatdan keçməsini xahiş et.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {search.status === "error" && (
                    <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-brand-300 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-brand-200">Xəta</strong>
                          <p className="mt-1 text-sm text-brand-100/80">{search.message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {customer && (
                    <div className="rounded-xl border-hairline bg-ink-900/60 overflow-hidden">
                      <div className="flex items-center gap-4 p-5 border-b border-white/5">
                        <span className="grid h-12 w-12 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-glow">
                          {initials}
                        </span>
                        <div className="flex-1 min-w-0">
                          <strong className="block text-white truncate">
                            {customerDisplayName}
                          </strong>
                          <a
                            href={`tel:${customer.phoneNumber}`}
                            className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-brand-300"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {customer.phoneNumber}
                          </a>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Tapıldı
                        </span>
                      </div>

                      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 p-5">
                        {[
                          { dt: "DQN", dd: customer.plateNumber, mono: true },
                          {
                            dt: "Avtomobil",
                            dd: customer.carBrand || customer.brandModel
                              ? `${customer.carBrand ?? ""} ${customer.brandModel ?? ""}`.trim()
                              : "—"
                          },
                          { dt: "İl", dd: customer.year ?? "—" },
                          { dt: "Yürüş", dd: customer.currentKm == null ? "—" : formatKm(customer.currentKm) },
                          {
                            dt: "Yağ",
                            dd:
                              (customer.oilBrand || "—") +
                              (customer.oilType ? ` · ${customer.oilType}` : "")
                          },
                          {
                            dt: "Son servis",
                            dd: formatDate(customer.lastServiceDate)
                          }
                        ].map((row) => (
                          <div key={row.dt}>
                            <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                              {row.dt}
                            </dt>
                            <dd
                              className={cn(
                                "mt-1 text-sm text-white",
                                row.mono && "font-mono tracking-wider"
                              )}
                            >
                              {row.dd}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              </div>

              {lastCreated && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <strong className="text-emerald-200">Servis qeydi yaradıldı</strong>
                      <p className="text-sm text-emerald-100/70">
                        ID #{lastCreated.id} · @{lastCreated.carServiceUsername}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-4">
                    {[
                      { dt: "DQN", dd: lastCreated.customerPlateNumber, mono: true },
                      {
                        dt: "Yağ",
                        dd: `${lastCreated.oilBrand} · ${lastCreated.oilType}`
                      },
                      { dt: "Km", dd: formatKm(lastCreated.serviceKm) },
                      { dt: "Tarix", dd: formatDate(lastCreated.serviceDate) }
                    ].map((row) => (
                      <div key={row.dt}>
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/70">
                          {row.dt}
                        </dt>
                        <dd
                          className={cn(
                            "mt-1 text-sm text-white",
                            row.mono && "font-mono tracking-wider"
                          )}
                        >
                          {row.dd}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>

            {/* Maintenance form */}
            <section className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 rounded-2xl border-hairline bg-ink-900/40 p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                      Yeni servis qeydi
                    </span>
                    <h3 className="text-lg font-semibold mt-0.5">Servis əlavə et</h3>
                  </div>
                  <Plus className="h-5 w-5 text-ink-400" />
                </div>

                <form onSubmit={createMaintenance}>
                  <fieldset
                    disabled={search.status !== "found" || creating}
                    className="flex flex-col gap-4 disabled:opacity-60"
                  >
                    <label className="block">
                      <span className={labelClass}>DQN</span>
                      <input
                        type="text"
                        value={customer ? customer.plateNumber : ""}
                        readOnly
                        placeholder="Əvvəl müştərini tapın"
                        className={cn(fieldClass, "font-mono tracking-wider")}
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className={labelClass}>
                          <Droplet className="inline h-3 w-3 mr-1 text-brand-400" />
                          Yağ markası
                        </span>
                        <input
                          type="text"
                          value={oilBrand}
                          onChange={(e) => setOilBrand(e.target.value)}
                          placeholder="Mobil 1"
                          required
                          list="oil-brands"
                          className={fieldClass}
                        />
                        <datalist id="oil-brands">
                          {["Mobil 1", "Castrol", "Shell Helix", "Total", "Liqui Moly", "Motul"].map((b) => (
                            <option key={b} value={b} />
                          ))}
                        </datalist>
                      </label>
                      <label className="block">
                        <span className={labelClass}>Yağ tipi</span>
                        <input
                          type="text"
                          value={oilType}
                          onChange={(e) => setOilType(e.target.value)}
                          placeholder="5W-30"
                          required
                          list="oil-types"
                          className={fieldClass}
                        />
                        <datalist id="oil-types">
                          {["0W-20", "5W-30", "5W-40", "10W-40", "15W-40"].map((t) => (
                            <option key={t} value={t} />
                          ))}
                        </datalist>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className={labelClass}>
                          <Gauge className="inline h-3 w-3 mr-1 text-brand-400" />
                          Servis km
                        </span>
                        <input
                          type="number"
                          value={serviceKm}
                          onChange={(e) => setServiceKm(e.target.value)}
                          placeholder="50000"
                          min={0}
                          required
                          className={fieldClass}
                        />
                      </label>
                      <label className="block">
                        <span className={labelClass}>
                          <Calendar className="inline h-3 w-3 mr-1 text-brand-400" />
                          Tarix
                        </span>
                        <input
                          type="date"
                          value={serviceDate}
                          onChange={(e) => setServiceDate(e.target.value)}
                          required
                          className={cn(fieldClass, "scheme-dark")}
                        />
                      </label>
                    </div>

                    {createError && (
                      <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3 text-sm text-brand-200"
                      >
                        <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                        <span>{createError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={creating || search.status !== "found"}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
                    >
                      {creating ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          Yaradılır…
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Servis qeydini yarat
                        </>
                      )}
                    </button>

                    {search.status !== "found" && (
                      <p className="text-xs text-ink-400 text-center">
                        Yeni qeyd əlavə etmək üçün əvvəlcə müştərini tap.
                      </p>
                    )}
                  </fieldset>
                </form>
              </div>
            </section>
          </div>
          </>
          )}
        </div>
      </div>
    </main>
  );
}
