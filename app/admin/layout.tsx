import type { ReactNode } from "react";

import { ServiceAuthProvider } from "@/lib/auth/ServiceAuthProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ServiceAuthProvider>{children}</ServiceAuthProvider>;
}
