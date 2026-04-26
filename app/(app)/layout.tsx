// AUTH BYPASS ACTIVE (intentional):
// Auth guard is deliberately disabled to allow feature-first development.
// Real auth (Supabase session check + redirect to /auth) will be added
// once all app features are built and validated.
// See docs/auth-guard-approach.md for the guard strategy and reactivation checklist.

import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
