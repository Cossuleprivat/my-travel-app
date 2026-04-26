# Auth Guard Approach (Travel Scorer)

## AKTUELLER STATUS: AUTH BYPASS AKTIV

> **Entscheidung (Sprint 1):** Auth ist bewusst deaktiviert, um Feature-First-Development zu ermöglichen.
> Alle App-Routen sind ohne Login erreichbar. Die Landing-Page und `/auth` leiten direkt zum `/dashboard`.
> Die echte Auth wird am Ende implementiert, sobald alle App-Features fertig und validiert sind.

### Bypass-Signale im Code (nach echter Auth entfernen)
- `app/(public)/page.tsx` — Buttons linken zu `/dashboard` statt `/auth`
- `app/(public)/auth/page.tsx` — "Sign In"-Button linkt zu `/dashboard`, Dev-Banner sichtbar
- `app/(app)/layout.tsx` — Kein Session-Check, kein Redirect

### Reactivation Checklist (wenn alle Features fertig)
- [ ] Supabase-Client in `lib/supabase/server.ts` und `lib/supabase/client.ts` implementieren
- [ ] `app/(app)/layout.tsx` Guard aktivieren (Code unten)
- [ ] `/auth` Seite mit echten Formularen ersetzen (T2.1)
- [ ] Landing-Page-Links auf `/auth` zurückstellen
- [ ] Dev-Banner aus `/auth` entfernen
- [ ] `.env.local` mit echten Supabase-Credentials befüllen (nie committen)

---

## Guard-Strategie (wenn aktiviert)

Route-Schutz erfolgt auf zwei Ebenen:

1. **Server-side layout guard** (primär) — `app/(app)/layout.tsx` liest die Supabase-Session server-seitig und redirectet nicht-authentifizierte User zu `/auth` bevor Content gerendert wird.
2. **Middleware guard** (sekundär, optional) — `middleware.ts` kann Requests am Edge abfangen. Sinnvoll als zusätzliche Absicherung.

## Implementierung (nach Feature-Freeze aktivieren)

```ts
// app/(app)/layout.tsx — Guard-Version
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return <AppShell>{children}</AppShell>;
}
```

## Route Access Matrix

| Route            | Guard required | Redirect target | Bypass aktiv? |
|------------------|----------------|-----------------|---------------|
| `/`              | Nein           | —               | —             |
| `/auth`          | Nein           | —               | Ja (→ /dashboard) |
| `/onboarding`    | Ja             | `/auth`         | Ja (offen)    |
| `/dashboard`     | Ja             | `/auth`         | Ja (offen)    |
| `/map`           | Ja             | `/auth`         | Ja (offen)    |
| `/cities/[slug]` | Ja             | `/auth`         | Ja (offen)    |
| `/trips`         | Ja             | `/auth`         | Ja (offen)    |
| `/trips/[id]`    | Ja             | `/auth`         | Ja (offen)    |
| `/profile`       | Ja             | `/auth`         | Ja (offen)    |
| `/admin/data`    | Ja + Rolle     | `/auth`         | Ja (offen)    |
