// Auth guard is enforced by middleware.ts at the project root.
// Unauthenticated requests to /(app) routes are redirected to /auth/login.

import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
