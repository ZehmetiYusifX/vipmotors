import type { ReactNode } from "react";

import { UserAuthProvider } from "@/lib/auth/UserAuthProvider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <UserAuthProvider>{children}</UserAuthProvider>;
}
