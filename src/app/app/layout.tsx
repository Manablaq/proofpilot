import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";

export default function ProductAppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
