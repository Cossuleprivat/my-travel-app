// Auth guard is enforced by middleware.ts at the project root.
// Unauthenticated requests to /(app) routes are redirected to /auth/login.
// force-dynamic: all pages are authenticated and require runtime data.
export const dynamic = 'force-dynamic';

import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
