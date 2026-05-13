# LiveOS: New Module Skill

Use this skill when creating a new LiveOS module/sub-page (Fitness, Gaming, Finance, Coaching, or any new module idea).

## What this skill does

1. **Validates the Sub-Page Contract** — ensures the new module is both standalone-capable and LiveOS-integrated
2. **Plans the roadmap** — produces a sprint plan covering standalone value AND hub integration
3. **Generates boilerplate** — creates the required files for a compliant module

---

## Sub-Page Contract Checklist

Every LiveOS module MUST have:

- [ ] **Module Manifest** — `modules/<name>/manifest.ts` exporting a `LiveOSModule` object
- [ ] **Profile Data API** — `app/api/modules/<name>/profile-data/route.ts` returning `ModuleProfileData`
- [ ] **Route Group** — pages live under `app/(<name>)/` route group with its own layout
- [ ] **Standalone Layout** — `app/(<name>)/layout.tsx` that works without the hub (no hub dependency)
- [ ] **Hub Back-Link** — entry point page has a visible "← LiveOS" navigation affordance (via BottomNav or header)
- [ ] **Shared Design Tokens** — uses Tailwind tokens from `tailwind.config.ts` (bg-bg-*, text-text-*, accent-*, border-border-*)
- [ ] **Registered in MODULE_REGISTRY** — added to `modules/registry.ts`
- [ ] **Middleware Protection** — entry route added to `PROTECTED_PREFIXES` in `middleware.ts`

---

## Steps to create a new module

### 1. Research & design (read-only)

- Understand what the module tracks (data model, key metrics)
- Identify which external APIs are needed (if any, e.g. Anilist for Gaming)
- Check `modules/types.ts` for `LiveOSModule` and `ModuleProfileData` interfaces
- Review `modules/travel/manifest.ts` as reference implementation

### 2. Plan the roadmap

For every new module, the roadmap must answer:

**Standalone value** (what does this do on its own?):
- Core data entry flow
- Primary display / dashboard
- Key metrics / stats

**LiveOS integration** (how does it enrich the hub?):
- What `headline` and `subline` does it show on the hub card?
- What 3-6 metrics does it export to `profile-data`?
- What color/icon represents it in the hub grid?

**Commercializability** (optional, for future):
- Can this standalone module be shared with friends / used independently?
- What would make it uniquely valuable enough to give to someone else?

### 3. Generate boilerplate

Create these files in order:

```
modules/<name>/manifest.ts          ← LiveOSModule object
modules/<name>/types.ts             ← module-specific types (optional)
app/api/modules/<name>/profile-data/route.ts   ← GET handler → ModuleProfileData
app/(<name>)/layout.tsx             ← standalone layout
app/(<name>)/<name>/page.tsx        ← entry point page
```

### 4. Register & protect

1. Add module to `modules/registry.ts` MODULE_REGISTRY array
2. Add route prefix to `PROTECTED_PREFIXES` in `middleware.ts`

### 5. Verify compliance

Run through the Sub-Page Contract Checklist above. All boxes must be checked before the module is considered "integrated."

---

## Module manifest template

```typescript
// modules/<name>/manifest.ts
import type { LiveOSModule } from '@/modules/types';

export const <name>Module: LiveOSModule = {
  id: '<name>',
  name: '<Display Name>',
  tagline: '<One-line description of what this module does>',
  icon: '<emoji>',
  color: 'green', // blue | green | amber | purple | indigo | red
  href: '/<name>',
  profileDataHref: '/api/modules/<name>/profile-data',
  status: 'active',
};
```

## Profile data API template

```typescript
// app/api/modules/<name>/profile-data/route.ts
import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth/current-user';
import type { ModuleProfileData } from '@/modules/types';

export async function GET() {
  const userId = await requireUserId();
  // fetch module-specific stats for userId
  
  const data: ModuleProfileData = {
    moduleId: '<name>',
    headline: '<primary status string>',
    subline: '<secondary context string>',
    metrics: [
      { label: '<metric>', value: <number or string> },
      // 3-6 metrics total
    ],
  };
  
  return NextResponse.json(data);
}
```

---

## Design principles

- **No cross-module imports** — modules must not import from each other; only from `@/shared/*`, `@/lib/*`, `@/modules/types`
- **Single Supabase project** — all modules share the same DB, auth, and storage
- **Additive, not required** — the hub works even if a module's profile-data API fails (graceful degradation)
- **Personal first, commercial optional** — build for your own use first; design so it CAN be standalone but don't over-engineer for that
