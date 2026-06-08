import { AlertTriangle, Car, Pencil, Plus, Trash2 } from "lucide-react";

import type { UserCar } from "@/lib/api/types";
import { AddToWalletButtons } from "../AddToWalletButtons";
import { formatDate, formatKm } from "../format";
import { SectionHeader } from "./SectionHeader";

interface CarsSectionProps {
  cars: UserCar[];
  error: string | null;
  onAdd: () => void;
  onEdit: (car: UserCar) => void;
  onDelete: (car: UserCar) => void;
}

export function CarsSection({
  cars,
  error,
  onAdd,
  onEdit,
  onDelete
}: CarsSectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Avtomobillərim"
        title={
          cars.length > 0
            ? `${cars.length} avtomobil`
            : "Hələ avtomobil əlavə edilməyib"
        }
        description="Avtomobillərini idarə et, Wallet-ə əlavə et və ya redaktə et."
        action={
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-400"
          >
            <Plus className="h-4 w-4" /> Yeni
          </button>
        }
      />

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {cars.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-ink-900/40 p-10 text-center">
          <Car className="mx-auto h-8 w-8 text-ink-500" />
          <strong className="mt-3 block text-white">Avtomobil əlavə et</strong>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-400">
            Profilinə avtomobil əlavə etsən, servis tarixçəsi və yağ izləmə
            avtomatik o avtomobilə bağlanacaq.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-400"
          >
            <Plus className="h-4 w-4" /> Avtomobil əlavə et
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cars.map((car) => (
            <li
              key={car.id}
              className="flex flex-col gap-3 rounded-2xl border-hairline bg-ink-900/40 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">
                    {car.year}
                  </div>
                  <strong className="mt-0.5 block truncate text-base text-white">
                    {car.carBrand} {car.brandModel}
                  </strong>
                </div>
                <span className="inline-flex shrink-0 items-stretch overflow-hidden rounded-lg border-hairline bg-ink-950">
                  <span className="grid place-items-center border-r border-white/5 bg-brand-500/15 px-1.5 font-mono text-[9px] font-bold text-brand-300">
                    AZ
                  </span>
                  <span className="px-2 py-1 font-mono text-xs font-bold tracking-wider text-white">
                    {car.plateNumber}
                  </span>
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt className="text-ink-500">Yürüş</dt>
                  <dd className="font-medium text-white">
                    {formatKm(car.currentKm)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">Yağ</dt>
                  <dd className="truncate font-medium text-white">
                    {car.oilBrand || "—"}
                    {car.oilType ? ` · ${car.oilType}` : ""}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-ink-500">Son servis</dt>
                  <dd className="font-medium text-white">
                    {formatDate(car.lastServiceDate)}
                  </dd>
                </div>
              </dl>
              <AddToWalletButtons
                plateNumber={car.plateNumber}
                brandModel={car.brandModel}
                className="pt-1"
              />
              <div className="flex items-center justify-end gap-1 border-t border-white/5 pt-2">
                <button
                  type="button"
                  onClick={() => onEdit(car)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-200 hover:bg-white/5 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" /> Redaktə
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(car)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
