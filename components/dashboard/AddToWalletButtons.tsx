"use client";

import { Info, Smartphone, Wallet } from "lucide-react";

import { API_BASE_URL } from "@/lib/api/client";
import { cn } from "@/lib/cn";

function applePassUrl(plateNumber: string) {
  const params = new URLSearchParams({ plateNumber });
  return `${API_BASE_URL}/api/v1/wallet/pass?${params.toString()}`;
}

function googlePassUrl(plateNumber: string) {
  const params = new URLSearchParams({ plateNumber });
  // Backend ships a dedicated landing page (/link) with a card preview and the
  // official "Save to Google Wallet" button. /save is meant to be reached from
  // that page, not linked directly.
  return `${API_BASE_URL}/api/v1/wallet/google/link?${params.toString()}`;
}

interface AddToWalletButtonsProps {
  plateNumber: string;
  className?: string;
}

export function AddToWalletButtons({ plateNumber, className }: AddToWalletButtonsProps) {
  if (!plateNumber) return null;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={applePassUrl(plateNumber)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-ink-950 hover:bg-ink-100 px-5 py-3 text-sm font-semibold transition-colors"
        >
          <Wallet className="h-4 w-4" />
          Apple Wallet-ə əlavə et
        </a>
        <a
          href={googlePassUrl(plateNumber)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border-hairline bg-white/5 hover:bg-white/10 text-white px-5 py-3 text-sm font-semibold transition-colors"
        >
          <Smartphone className="h-4 w-4" />
          Google Wallet-ə əlavə et
        </a>
      </div>

      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Qeyd: Bu funksiya yalnız mobil telefondan daxil olduqda işləyir — Apple Wallet
          üçün iPhone (Safari), Google Wallet üçün Android cihaz lazımdır. Kompüter və ya
          masaüstü brauzerdən kartı əlavə etmək mümkün deyil.
        </span>
      </p>
    </div>
  );
}
