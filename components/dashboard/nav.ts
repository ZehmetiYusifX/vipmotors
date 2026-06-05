import type { ComponentType, SVGProps } from "react";
import { Car, Gauge, History, User } from "lucide-react";

export type DashboardSection = "overview" | "cars" | "history" | "profile";

export interface SectionDef {
  key: DashboardSection;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const SECTIONS: SectionDef[] = [
  { key: "overview", label: "Ümumi baxış", Icon: Gauge },
  { key: "cars", label: "Avtomobillərim", Icon: Car },
  { key: "history", label: "Servis tarixçəsi", Icon: History },
  { key: "profile", label: "Profil & əlaqə", Icon: User }
];
