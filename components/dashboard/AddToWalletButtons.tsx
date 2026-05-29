"use client";

import { Smartphone, Wallet } from "lucide-react";

import { API_BASE_URL } from "@/lib/api/client";
import { cn } from "@/lib/cn";

function passUrl(plateNumber: string, wallet: "apple" | "google") {
  const params = new URLSearchParams({ plateNumber, wallet });
  return `${API_BASE_URL}/wallet/pass?${params.toString()}`;
}

interface AddToWalletButtonsProps {
  plateNumber: string;
  className?: string;
}

export function AddToWalletButtons({ plateNumber, className }: AddToWalletButtonsProps) {
  if (!plateNumber) return null;

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      <a
        href={passUrl(plateNumber, "apple")}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-ink-950 hover:bg-ink-100 px-5 py-3 text-sm font-semibold transition-colors"
      >
        <Wallet className="h-4 w-4" />
        Apple Wallet-ə əlavə et
      </a>
      <a
        href={passUrl(plateNumber, "google")}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl border-hairline bg-white/5 hover:bg-white/10 text-white px-5 py-3 text-sm font-semibold transition-colors"
      >
        <Smartphone className="h-4 w-4" />
        Google Wallet-ə əlavə et
      </a>
    </div>
  );
}
