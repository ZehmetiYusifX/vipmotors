"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Droplet,
  Filter,
  Gauge,
  History,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Wrench
} from "lucide-react";

import { AdminAuth } from "@/components/app/AdminAuth";
import { CustomerFormModal } from "@/components/admin/CustomerFormModal";
import { InventoryPanel } from "@/components/admin/InventoryPanel";
import { OilCatalogPanel } from "@/components/admin/OilCatalogPanel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { carServiceAuth, carServiceOps, servicesApi } from "@/lib/api/endpoints";
import {
  ApiError,
  type MaintenanceRecord,
  type ServiceItem,
  type UserProfile
} from "@/lib/api/types";
import { useServiceAuth } from "@/lib/auth/ServiceAuthProvider";
import { cn } from "@/lib/cn";
import { formatAzDate } from "@/lib/date";
import { normalizePlate } from "@/lib/plate";

type AdminSection = "search" | "inventory" | "oils" | "register-service";

type SearchState =
  | { status: "idle" }
  | { status: "loading"; plate: string }
  | { status: "found"; customer: UserProfile }
  | { status: "not_found"; plate: string }
  | { status: "error"; message: string };

function formatKm(value: number) {
  return new Intl.NumberFormat("az-AZ").format(value) + " km";
}


const formatDate = formatAzDate;

const BASE_NAV: Array<{ id: AdminSection; label: string; Icon: typeof Search }> = [
  { id: "search", label: "Müştəri axtarışı", Icon: Search },
  { id: "inventory", label: "Anbar", Icon: Package },
  { id: "oils", label: "Kataloq", Icon: Droplet }
];

const OWNER_NAV: Array<{ id: AdminSection; label: string; Icon: typeof Search }> = [
  { id: "register-service", label: "Yeni Servis", Icon: ShieldCheck }
];

const SECTION_TITLE: Record<AdminSection, { eyebrow: string; title: string }> = {
  search: { eyebrow: "Servis əməliyyatları", title: "Müştəri axtarışı" },
  inventory: { eyebrow: "Anbar idarəsi", title: "Məhsullar" },
  oils: { eyebrow: "Kataloq idarəsi", title: "Kataloq" },
  "register-service": { eyebrow: "Owner idarəsi", title: "Yeni Servis Qeydiyyatı" }
};

// Short labels for the mobile bottom tab bar (the full nav labels are too long
// for tiny tab targets).
const NAV_SHORT: Record<AdminSection, string> = {
  search: "Axtarış",
  inventory: "Anbar",
  oils: "Kataloq",
  "register-service": "Servis"
};

const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors";
const labelClass = "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

export default function AdminPage() {
  const { status: authStatus, isOwner, saveSession, logout } = useServiceAuth();

  const [activeSection, setActiveSection] = useState<AdminSection>("search");
  const [plate, setPlate] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });

  const [oilBrand, setOilBrand] = useState("");
  const [oilType, setOilType] = useState("");
  const [serviceKm, setServiceKm] = useState("");
  const [nextServiceKm, setNextServiceKm] = useState("");
  const [oilFilterChanged, setOilFilterChanged] = useState(false);
  const [fuelFilterChanged, setFuelFilterChanged] = useState(false);
  const [airFilterChanged, setAirFilterChanged] = useState(false);
  const [cabinFilterChanged, setCabinFilterChanged] = useState(false);
  const [serviceDate, setServiceDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<MaintenanceRecord | null>(null);

  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerModalEditing, setCustomerModalEditing] =
    useState<UserProfile | null>(null);
  const [deleteCustomerTarget, setDeleteCustomerTarget] =
    useState<UserProfile | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState(false);
  const [customerActionError, setCustomerActionError] = useState<string | null>(
    null
  );

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [workDescription, setWorkDescription] = useState("");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const controller = new AbortController();
    servicesApi
      .getAll(controller.signal, "CAR_SERVICE")
      .then((items) => {
        const list = Array.isArray(items) ? items : [];
        setServices(list);
        // Default to an oil-change service if one exists, otherwise the first.
        const oil = list.find((s) => s.type === "OIL_CHANGE");
        setSelectedServiceId((prev) => prev ?? (oil ?? list[0])?.id ?? null);
      })
      .catch(() => {
        /* services optional; ignore */
      });
    return () => controller.abort();
  }, [authStatus]);

  const selectedService =
    services.find((s) => s.id === selectedServiceId) ?? null;
  const isOilChange = selectedService?.type === "OIL_CHANGE";

  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

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
    const trimmed = normalizePlate(plate);
    if (!trimmed) return;
    setSearch({ status: "loading", plate: trimmed });
    setLastCreated(null);
    setCreateError(null);
    setHistory([]);
    try {
      const customer = await carServiceOps.findCustomerByPlate(trimmed);
      setSearch({ status: "found", customer });
      setOilBrand(customer.oilBrand || "");
      setOilType(customer.oilType || "");
      setServiceKm(String(customer.currentKm || ""));
      setNextServiceKm(
        customer.nextServiceKm != null ? String(customer.nextServiceKm) : ""
      );
      setOilFilterChanged(false);
      setFuelFilterChanged(false);
      setAirFilterChanged(false);
      setCabinFilterChanged(false);
      void loadHistory(customer);
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
    if (selectedServiceId == null) {
      setCreateError("Zəhmət olmasa xidmət seçin.");
      return;
    }
    setCreateError(null);
    setCreating(true);
    try {
      const record = await carServiceOps.createMaintenance({
        plateNumber: search.customer.plateNumber,
        serviceItemId: selectedServiceId,
        workDescription: workDescription.trim(),
        oilBrand: isOilChange ? oilBrand.trim() : "",
        oilType: isOilChange ? oilType.trim() : "",
        serviceKm: Number(serviceKm),
        nextServiceKm: nextServiceKm ? Number(nextServiceKm) : undefined,
        oilFilterChanged,
        fuelFilterChanged,
        airFilterChanged,
        cabinFilterChanged,
        serviceDate
      });
      setLastCreated(record);
      void loadHistory(search.customer);
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

  async function loadHistory(forCustomer: UserProfile) {
    setHistoryLoading(true);
    try {
      const records = await carServiceOps.maintenanceHistory({
        plateNumber: forCustomer.plateNumber
      });
      setHistory(Array.isArray(records) ? records : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      // History is supplementary — never block the panel if it fails.
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function openCreateCustomer() {
    setCustomerActionError(null);
    setCustomerModalEditing(null);
    setCustomerModalOpen(true);
  }

  function openEditCustomer(target: UserProfile) {
    setCustomerActionError(null);
    setCustomerModalEditing(target);
    setCustomerModalOpen(true);
  }

  async function handleCustomerSaved(saved: UserProfile) {
    // Reflect the saved customer in the search view and refresh its history.
    setSearch({ status: "found", customer: saved });
    setPlate(saved.plateNumber);
    setOilBrand(saved.oilBrand || "");
    setOilType(saved.oilType || "");
    setServiceKm(String(saved.currentKm || ""));
    setNextServiceKm(saved.nextServiceKm != null ? String(saved.nextServiceKm) : "");
    setLastCreated(null);
    await loadHistory(saved);
  }

  async function confirmDeleteCustomer() {
    if (!deleteCustomerTarget) return;
    setDeletingCustomer(true);
    setCustomerActionError(null);
    try {
      await carServiceOps.deleteCustomer(deleteCustomerTarget.id);
      setDeleteCustomerTarget(null);
      setSearch({ status: "idle" });
      setHistory([]);
      setLastCreated(null);
      setPlate("");
    } catch (err) {
      setDeleteCustomerTarget(null);
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }
      setCustomerActionError(
        err instanceof ApiError ? err.message : "Müştərini silmək mümkün olmadı."
      );
    } finally {
      setDeletingCustomer(false);
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

  const mobileNav = isOwner ? [...BASE_NAV, ...OWNER_NAV] : BASE_NAV;

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
          {BASE_NAV.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-500/10 text-brand-200 border border-brand-500/20"
                    : "text-ink-300 hover:text-white hover:bg-white/5"
                )}
              >
                <item.Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
          {isOwner && (
            <>
              <div className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-400">
                Owner
              </div>
              {OWNER_NAV.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-500/10 text-brand-200 border border-brand-500/20"
                        : "text-ink-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </>
          )}
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

        <div className="flex-1 px-4 sm:px-8 py-8 pb-28 lg:pb-8 space-y-6">
          {activeSection === "inventory" && (
            <InventoryPanel onUnauthorized={logout} isOwner={isOwner} />
          )}

          {activeSection === "oils" && (
            <OilCatalogPanel onUnauthorized={logout} />
          )}

          {activeSection === "register-service" && isOwner && (
            <RegisterServicePanel
              username={regUsername}
              setUsername={setRegUsername}
              password={regPassword}
              setPassword={setRegPassword}
              confirm={regConfirm}
              setConfirm={setRegConfirm}
              submitting={regSubmitting}
              setSubmitting={setRegSubmitting}
              error={regError}
              setError={setRegError}
              success={regSuccess}
              setSuccess={setRegSuccess}
              fieldClass={fieldClass}
              labelClass={labelClass}
            />
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
                  <button
                    type="button"
                    onClick={openCreateCustomer}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-sm font-medium text-brand-200 hover:bg-brand-500/20 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Yeni müştəri</span>
                  </button>
                </div>

                <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-stretch rounded-xl border-hairline bg-ink-900/60 focus-within:border-brand-500/50 transition-colors overflow-hidden">
                    <span className="grid place-items-center px-3 text-xs font-mono font-semibold text-brand-300 bg-brand-500/10 border-r border-white/5">
                      AZ
                    </span>
                    <input
                      type="text"
                      value={plate}
                      onChange={(e) => setPlate(normalizePlate(e.target.value))}
                      placeholder="10AA123"
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Tapıldı
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditCustomer(customer)}
                            aria-label="Müştərini redaktə et"
                            className="grid h-9 w-9 place-items-center rounded-lg border-hairline bg-white/5 text-ink-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCustomerTarget(customer)}
                            aria-label="Müştərini sil"
                            className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                          Avtomobillər ({customer.cars?.length ?? 0})
                        </div>
                        {!customer.cars?.length ? (
                          <div className="rounded-xl border-hairline border-dashed bg-ink-900/40 p-5 text-sm text-ink-400 text-center">
                            Bu müştərinin profilində hələ avtomobil yoxdur.
                          </div>
                        ) : (
                          <ul className="space-y-3">
                            {customer.cars.map((car) => (
                              <li
                                key={car.id}
                                className="rounded-xl border-hairline bg-ink-900/60 p-4"
                              >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="min-w-0">
                                    <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                                      {car.year}
                                    </div>
                                    <strong className="block text-white truncate text-sm mt-0.5">
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
                                <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
                                  <div>
                                    <dt className="text-ink-500">Yürüş</dt>
                                    <dd className="text-white">{formatKm(car.currentKm)}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-ink-500">Yağ</dt>
                                    <dd className="text-white truncate">
                                      {car.oilBrand || "—"}
                                      {car.oilType ? ` · ${car.oilType}` : ""}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-ink-500">Son servis</dt>
                                    <dd className="text-white">
                                      {formatDate(car.lastServiceDate)}
                                    </dd>
                                  </div>
                                </dl>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {customerActionError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
                >
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{customerActionError}</span>
                </div>
              )}

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
                      { dt: "Xidmət", dd: lastCreated.serviceItemTitle || "—" },
                      ...(lastCreated.serviceItemType === "OIL_CHANGE" &&
                      (lastCreated.oilBrand || lastCreated.oilType)
                        ? [
                            {
                              dt: "Yağ",
                              dd: `${lastCreated.oilBrand} · ${lastCreated.oilType}`
                            }
                          ]
                        : []),
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

              {customer && (
                <div className="rounded-2xl border-hairline bg-ink-900/40 p-6">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <History className="h-5 w-5 text-brand-400" />
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                          Servis tarixçəsi
                        </span>
                        <h3 className="text-lg font-semibold mt-0.5">
                          Keçmiş servislər
                        </h3>
                      </div>
                    </div>
                    {historyLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
                    ) : (
                      <span className="rounded-full bg-white/5 border-hairline px-2.5 py-1 text-xs font-medium text-ink-300">
                        {history.length}
                      </span>
                    )}
                  </div>

                  {!historyLoading && history.length === 0 ? (
                    <div className="rounded-xl border-hairline border-dashed bg-ink-900/40 p-6 text-center text-sm text-ink-400">
                      Bu müştəri üçün hələ servis qeydi yoxdur.
                    </div>
                  ) : (
                    <ol className="space-y-3">
                      {history.map((rec) => {
                        const filters = [
                          rec.oilFilterChanged && "Yağ filtri",
                          rec.fuelFilterChanged && "Yanacaq filtri",
                          rec.airFilterChanged && "Hava filtri",
                          rec.cabinFilterChanged && "Salon filtri"
                        ].filter(Boolean) as string[];
                        return (
                          <li
                            key={rec.id}
                            className="rounded-xl border-hairline bg-ink-900/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <strong className="text-sm text-white">
                                {rec.serviceItemTitle || "Servis"}
                              </strong>
                              <span className="inline-flex items-center gap-1 text-xs text-ink-400 shrink-0">
                                <Calendar className="h-3 w-3" />
                                {formatDate(rec.serviceDate)}
                              </span>
                            </div>

                            {rec.workDescription && (
                              <p className="mt-1.5 text-xs text-ink-300">
                                {rec.workDescription}
                              </p>
                            )}

                            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                              <div className="inline-flex items-center gap-1.5">
                                <Gauge className="h-3 w-3 text-ink-500" />
                                <dt className="text-ink-500">Km:</dt>
                                <dd className="text-white">{formatKm(rec.serviceKm)}</dd>
                              </div>
                              {rec.nextServiceKm != null && (
                                <div className="inline-flex items-center gap-1.5">
                                  <dt className="text-ink-500">Növbəti:</dt>
                                  <dd className="text-white">
                                    {formatKm(rec.nextServiceKm)}
                                  </dd>
                                </div>
                              )}
                              {rec.serviceItemType === "OIL_CHANGE" &&
                                (rec.oilBrand || rec.oilType) && (
                                  <div className="inline-flex items-center gap-1.5">
                                    <Droplet className="h-3 w-3 text-ink-500" />
                                    <dd className="text-white">
                                      {rec.oilBrand}
                                      {rec.oilType ? ` · ${rec.oilType}` : ""}
                                    </dd>
                                  </div>
                                )}
                            </dl>

                            {filters.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {filters.map((f) => (
                                  <span
                                    key={f}
                                    className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-[11px] text-brand-200"
                                  >
                                    <Filter className="h-2.5 w-2.5" />
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}

                            {rec.carServiceUsername && (
                              <div className="mt-3 text-[11px] text-ink-500">
                                @{rec.carServiceUsername}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  )}
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

                    <label className="block">
                      <span className={labelClass}>
                        <Wrench className="inline h-3 w-3 mr-1 text-brand-400" />
                        Xidmət
                      </span>
                      <Select
                        value={
                          selectedServiceId != null ? String(selectedServiceId) : ""
                        }
                        onChange={(v) => setSelectedServiceId(Number(v) || null)}
                        options={services.map((s) => ({
                          value: String(s.id),
                          label: s.title
                        }))}
                        placeholder={
                          services.length === 0 ? "Yüklənir…" : "Xidmət seçin"
                        }
                      />
                    </label>

                    {isOilChange && (
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
                    )}

                    <label className="block">
                      <span className={labelClass}>İş təsviri (opsional)</span>
                      <textarea
                        rows={2}
                        value={workDescription}
                        onChange={(e) => setWorkDescription(e.target.value)}
                        placeholder="Görülən işin qısa təsviri"
                        maxLength={1000}
                        className={fieldClass}
                      />
                    </label>

                    <div>
                      <span className={labelClass}>
                        <Filter className="inline h-3 w-3 mr-1 text-brand-400" />
                        Dəyişdirilən filtrlər
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            label: "Yağ filtri",
                            checked: oilFilterChanged,
                            set: setOilFilterChanged
                          },
                          {
                            label: "Yanacaq filtri",
                            checked: fuelFilterChanged,
                            set: setFuelFilterChanged
                          },
                          {
                            label: "Hava filtri",
                            checked: airFilterChanged,
                            set: setAirFilterChanged
                          },
                          {
                            label: "Salon filtri",
                            checked: cabinFilterChanged,
                            set: setCabinFilterChanged
                          }
                        ].map((f) => (
                          <label
                            key={f.label}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl border-hairline px-3 py-2.5 text-sm cursor-pointer select-none transition-colors",
                              f.checked
                                ? "border-brand-500/40 bg-brand-500/10 text-white"
                                : "bg-ink-900/60 text-ink-300 hover:bg-ink-900"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={f.checked}
                              onChange={(e) => f.set(e.target.checked)}
                              className="h-4 w-4 rounded border-white/20 bg-ink-900 accent-brand-500"
                            />
                            {f.label}
                          </label>
                        ))}
                      </div>
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
                          <Gauge className="inline h-3 w-3 mr-1 text-brand-400" />
                          Növbəti servis km
                        </span>
                        <input
                          type="number"
                          value={nextServiceKm}
                          onChange={(e) => setNextServiceKm(e.target.value)}
                          placeholder="60000"
                          min={0}
                          className={fieldClass}
                        />
                      </label>
                    </div>

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

      {/* Mobile bottom tab bar — the sidebar nav is desktop-only, so this is the
          only way to switch sections on phones. */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 glass-strong border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${mobileNav.length}, minmax(0, 1fr))` }}
        >
          {mobileNav.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium tracking-tight transition-colors",
                  isActive ? "text-brand-300" : "text-ink-400 active:text-ink-100"
                )}
              >
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-9 rounded-full bg-brand-500 shadow-glow" />
                )}
                <item.Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "drop-shadow-[0_0_8px_rgba(239,42,58,0.55)]"
                  )}
                />
                <span className="leading-none">{NAV_SHORT[item.id]}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <CustomerFormModal
        open={customerModalOpen}
        editing={customerModalEditing}
        onClose={() => setCustomerModalOpen(false)}
        onSaved={handleCustomerSaved}
      />

      <ConfirmDialog
        open={!!deleteCustomerTarget}
        danger
        title="Müştərini sil"
        message={
          deleteCustomerTarget
            ? `${deleteCustomerTarget.fullName?.trim() || deleteCustomerTarget.plateNumber} (${deleteCustomerTarget.plateNumber}) müştərisi və bütün məlumatları silinsin?`
            : undefined
        }
        confirmLabel="Sil"
        loading={deletingCustomer}
        onConfirm={confirmDeleteCustomer}
        onCancel={() => setDeleteCustomerTarget(null)}
      />
    </main>
  );
}

interface RegisterServicePanelProps {
  username: string; setUsername: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  confirm: string; setConfirm: (v: string) => void;
  submitting: boolean; setSubmitting: (v: boolean) => void;
  error: string | null; setError: (v: string | null) => void;
  success: string | null; setSuccess: (v: string | null) => void;
  fieldClass: string; labelClass: string;
}

function RegisterServicePanel({
  username, setUsername,
  password, setPassword,
  confirm, setConfirm,
  submitting, setSubmitting,
  error, setError,
  success, setSuccess,
  fieldClass, labelClass
}: RegisterServicePanelProps) {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password.length < 8) {
      setError("Parol ən az 8 simvol olmalıdır.");
      return;
    }
    if (password !== confirm) {
      setError("Parol təkrarı uyğun gəlmir.");
      return;
    }
    setSubmitting(true);
    try {
      await carServiceAuth.register({ username: username.trim(), password });
      setSuccess(`"${username.trim()}" adlı operator hesabı uğurla yaradıldı.`);
      setUsername("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Qeydiyyat tamamlanmadı. Yenidən cəhd edin."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border-hairline bg-linear-to-br from-ink-900/80 to-ink-900/40 p-6 sm:p-8 relative overflow-hidden max-w-lg">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-glow shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Yeni Servis Qeydiyyatı</h2>
            <p className="text-xs text-ink-400 mt-0.5">Yeni operator hesabı yaradın</p>
          </div>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className={labelClass}>İstifadəçi adı</span>
            <input
              type="text"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yeni-servis"
              required
              minLength={3}
              spellCheck={false}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Parol</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Parol təkrarı</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className={fieldClass}
            />
          </label>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 p-3.5 text-sm text-brand-200"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-sm text-green-300"
            >
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Yaradılır…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Operator hesabını yarat
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
