"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { CarFormModal } from "@/components/dashboard/CarFormModal";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { DashboardSection } from "@/components/dashboard/nav";
import { CarsSection } from "@/components/dashboard/sections/CarsSection";
import { HistorySection } from "@/components/dashboard/sections/HistorySection";
import { OverviewSection } from "@/components/dashboard/sections/OverviewSection";
import { ProfileSection } from "@/components/dashboard/sections/ProfileSection";
import { userCarsApi } from "@/lib/api/endpoints";
import { ApiError, type UserCar } from "@/lib/api/types";
import { useUserAuth } from "@/lib/auth/UserAuthProvider";

const NEXT_SERVICE_INTERVAL_KM = 10000;

export default function DashboardPage() {
  const router = useRouter();
  const { status, user, refresh, logout } = useUserAuth();
  const reduce = useReducedMotion();

  const [section, setSection] = useState<DashboardSection>("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<UserCar | null>(null);
  const [carError, setCarError] = useState<string | null>(null);
  const [deleteCarTarget, setDeleteCarTarget] = useState<UserCar | null>(null);
  const [deletingCar, setDeletingCar] = useState(false);

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-brand-500" />
      </main>
    );
  }

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
          nextServiceKm: user.nextServiceKm ?? null,
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
      setCarError(
        "Bu avtomobil hələ profilə əlavə edilməyib. Yeni avtomobil kimi əlavə edin."
      );
      return;
    }
    setEditingCar(car);
    setCarError(null);
    setModalOpen(true);
  }

  function deleteCar(car: UserCar) {
    if (car.id === 0) return;
    setDeleteCarTarget(car);
  }

  async function confirmDeleteCar() {
    if (!deleteCarTarget) return;
    setDeletingCar(true);
    setCarError(null);
    try {
      await userCarsApi.remove(deleteCarTarget.id);
      setDeleteCarTarget(null);
      await refresh();
    } catch (err) {
      setDeleteCarTarget(null);
      setCarError(err instanceof ApiError ? err.message : "Silmək mümkün olmadı.");
    } finally {
      setDeletingCar(false);
    }
  }

  const displayName =
    user.fullName?.trim() || user.plateNumber || user.email || "Sürücü";
  const firstName =
    user.fullName?.trim().split(" ")[0] ||
    user.plateNumber ||
    user.email ||
    "Sürücü";
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
  // Prefer the backend's authoritative next-service mileage; fall back to a
  // fixed-interval estimate only when the API doesn't supply one.
  const computedNextServiceKm =
    currentKm + (NEXT_SERVICE_INTERVAL_KM - (kmSinceFirst % NEXT_SERVICE_INTERVAL_KM));
  const nextServiceKm =
    primaryCar?.nextServiceKm ?? user.nextServiceKm ?? computedNextServiceKm;
  const kmLeft = nextServiceKm - currentKm;
  const usedRatio = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((NEXT_SERVICE_INTERVAL_KM - kmLeft) / NEXT_SERVICE_INTERVAL_KM) * 100
      )
    )
  );
  const ringColor =
    usedRatio < 60
      ? "text-emerald-400"
      : usedRatio < 85
        ? "text-amber-400"
        : "text-brand-400";

  const metrics = { usedRatio, nextServiceKm, kmLeft, ringColor };

  return (
    <DashboardShell
      active={section}
      onNavigate={setSection}
      user={user}
      onLogout={logout}
      displayName={displayName}
      initials={initials}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {section === "overview" && (
            <OverviewSection
              firstName={firstName}
              user={user}
              primaryCar={primaryCar}
              cars={cars}
              metrics={metrics}
            />
          )}
          {section === "cars" && (
            <CarsSection
              cars={cars}
              error={carError}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={deleteCar}
            />
          )}
          {section === "history" && <HistorySection primaryCar={primaryCar} />}
          {section === "profile" && (
            <ProfileSection
              user={user}
              displayName={displayName}
              initials={initials}
              onLogout={logout}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <CarFormModal
        open={modalOpen}
        editing={editingCar}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={!!deleteCarTarget}
        danger
        title="Avtomobili sil"
        message={
          deleteCarTarget
            ? `${deleteCarTarget.carBrand} ${deleteCarTarget.brandModel} (${deleteCarTarget.plateNumber}) silinsin?`
            : undefined
        }
        confirmLabel="Sil"
        loading={deletingCar}
        onConfirm={confirmDeleteCar}
        onCancel={() => setDeleteCarTarget(null)}
      />
    </DashboardShell>
  );
}
