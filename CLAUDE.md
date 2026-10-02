# CLAUDE.md — Viera Amber Project Context

> This file is the permanent memory for Claude Code on this project.
> Read it fully before touching any file. Update it when architecture changes.

---

## What We Are Building

**Viera Amber** is a creative & impact-driven ecosystem for feminine empowerment,
founded by Faith Adigwe (Lagos, Nigeria). The digital product is a group website:
one immersive hub + three distinct sub-brand sites + one admin dashboard.

**Motto:** "For her, by her."
**Founded:** 2013
**Contact:** admin@vieraamber.com | 18 Ajose Street, Maryland, Lagos

---

## Site Architecture

Everything lives in THIS repo as routes of one Vite SPA (see `src/App.tsx`).
The original plan of separate sub-domain repos was dropped.

```
vieraamber.com
  /                     ← Hub: chapter-scroll single page (src/pages/Index.tsx)
    #hero #ecosystem #illustrations #vagin #viva #vam #founder #contact
  /illustrations        ← Full illustration gallery (Illustrations.tsx)
  /collections/:id      ← Retired, redirects to /illustrations
  /vagin                ← VAGIN Girls' Initiative site
  /vagin-dashboard      ← PAD KOLO admin dashboard (VAGIN team, login required)
  /viva                 ← VIVA fashion site
  /viva/story           ← VIVA brand story
  /viva/try-on          ← Virtual try-on (Supabase function: virtual-tryon)
  /vam                  ← Masterclass page
  /vash                 ← Removed 2026-10-02 (client request); redirects to /
  /admin/products       ← VIVA product admin
  *                     ← NotFound
```

`MobileTabBar` renders on every route. On Vercel, all requests go through
`api/index.ts`, which injects per-route Open Graph tags into `index.html`
(see `vercel.json`).

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | React + Vite + TypeScript | Lovable-scaffolded, shadcn/ui available |
| Styling | Tailwind CSS v3 | Custom tokens in tailwind.config.ts |
| Animation | Framer Motion v12 | All animations via this — NO CSS keyframes |
| Database | Supabase (external account) | NOT Lovable-managed |
| Auth | Supabase Auth, email + password | Admin dashboard only (`VAGINAuth.tsx`). Google SSO not wired |
| i18n | react-i18next (planned) | NOT installed yet |
| Routing | react-router-dom v6 | Hub + sub-site routes, see Site Architecture |
| Data fetching | @tanstack/react-query | |
| Backend functions | Supabase Edge Functions | `supabase/functions/` |
| Hosting | Vercel | `vercel.json` + `api/index.ts` (OG tags) |
| Tests | Vitest | `npm test` |

---

## Design System

### Color Tokens (defined in src/index.css + tailwind.config.ts)

```
--bg-dark:           #0A0A0A   (primary dark background)
--bg-dark-secondary: #111111
--accent-gold:       #C8A96E   (Viera Amber brand gold)
--text-primary:      #FAFAFA
--text-secondary:    #888888
--border-subtle:     #2A2A2A
--vagin-purple:      #62017F
--vagin-pink:        #ED155D
--viva-wine:         #6E0025
--viva-gold:         #D4AF37
```

Tailwind classes: `bg-brand-dark`, `text-brand-gold`, `border-brand-borderSubtle`

### Typography

- **Display / headings:** `font-display` = Playfair Display (400, 700, italic)
- **Body / UI:** `font-body` = DM Sans (300, 400, 500)
- **VIVA wordmark only:** Cormorant Garamond (700, wide letter-spacing)
- **NEVER use:** Inter, Roboto, Arial, Space Grotesk, system-ui as primary

### Animation Rules (Framer Motion — enforced)

- Hardware-accelerated only: `x, y, scale, opacity` — NEVER `width, height, left, top`
- Spring physics as default: `{ type: "spring", stiffness: 300, damping: 22 }`
- Always use `useReducedMotion()` — fallback to `duration: 0` if true
- Scroll triggers: `useInView(ref, { once: true, amount: 0.15 })`
- All shared variants live in `src/lib/animations.ts` — import from there
- No inline animation objects cluttering JSX — use named variants

---

## Project File Structure

```
src/
├── App.tsx                    ← All routes
├── lib/
│   ├── animations.ts          ← ALL Framer Motion variants (source of truth)
│   ├── supabase.ts            ← Supabase client (VITE_SUPABASE_URL / _ANON_KEY)
│   ├── botEngine.ts (+ .test) ← WhatsApp bot conversation logic
│   ├── whatsapp/              ← Bot providers: Meta (live) + simulator (mock)
│   ├── gallery-data.ts, illustration-categories.ts, artwork-dimensions.ts
│   └── utils.ts
├── components/
│   ├── NavBar.tsx, NavLink.tsx, Footer.tsx, MobileTabBar.tsx
│   ├── BrandFilm.tsx, VivaLaunchModal.tsx, VAGINAuth.tsx
│   ├── sections/              ← Hub sections + gallery/dashboard building blocks
│   ├── admin/                 ← Dashboard tabs: Gallery CMS, VAGIN Images, Bot Activity
│   └── ui/                    ← shadcn/ui components
├── pages/                     ← One file per route (see Site Architecture)
├── hooks/                     ← useProducts, useVaginImages, useNotificationTriggers
├── services/                  ← notificationService.ts, notificationWorker.ts
├── config/contact.ts
├── styles/brand-colors.css
├── index.css                  ← Design tokens + global styles
└── main.tsx

supabase/migrations/           ← Numbered schema migrations (apply in order)
supabase/functions/            ← Edge functions: whatsapp-bot, whatsapp-webhook,
                                 notify-admin, process-notifications,
                                 vagin-notifications, virtual-tryon
sql/                           ← One-off setup scripts (gallery, storage buckets, bot)
api/index.ts                   ← Vercel function: per-route OG meta
scripts/                       ← OG image / PWA icon generators, VIVA product seeder
```

The root also holds many feature write-ups (`*_SETUP.md`, `*_SUMMARY.md`,
`*.sql`). Check the relevant one before changing a feature.

---

## Current Build State

_Last audited: 2026-10-01. `main` builds and all tests pass._

### Phase 1 — Hub ✅ COMPLETE
All hub sections built and wired in `src/pages/Index.tsx`.

### Phase 2 — Sub-sites ✅ BUILT (as routes in this repo)
- ✅ `/illustrations` gallery: hero carousel, category nav, full-screen viewer,
  mobile swipe strips, tablet tuning (most recent work)
- ✅ `/vagin` site + `/vagin-dashboard` admin
- ✅ `/viva`, `/viva/story`, `/viva/try-on`
- ✅ `/vam`, `/admin/products`
- ❌ VASH shop removed everywhere on 2026-10-02 at the client's request
  (page, nav, footer, tab bar, home chapter, ecosystem arm). Ecosystem is
  now four arms: Illustrations, VAGIN, VIVA, VAM. Each sells via WhatsApp.

### Phase 3 — Integration 🔄 PARTLY DONE
- ✅ Supabase schema: migrations `01`–`07` + two dated notification migrations
- ✅ WhatsApp bot: engine, simulator provider, Meta provider, edge functions
- ✅ Notification system: triggers, worker, dashboard Notification Center
- ⏳ Notification delivery stubs: `src/services/notificationWorker.ts`
  (WhatsApp send ~L248, Resend email ~L299)
- ⏳ i18n: not started
- ✅ Route code-splitting: main bundle 752 KB (222 KB gzip); dashboard chunk
  (955 KB) only loads for admins
- ✅ Lint: 0 errors (3 harmless warnings)
- ⏳ Typecheck: `npx tsc --noEmit -p tsconfig.app.json` reports ~31 errors
  (`vite build` does not typecheck). Some are real, e.g. `.group_by()` in
  `notificationWorker.ts` does not exist in supabase-js
- ⏳ SEO pass

### Known issues
- WhatsApp secrets were renamed from `VITE_WHATSAPP_*` to `WHATSAPP_APP_SECRET`
  / `WHATSAPP_PHONE_NUMBER_ID`. Edge functions still fall back to the old
  names; once the Supabase secrets are re-set under the new names, delete the
  old ones and the fallbacks. Never give a secret a `VITE_` prefix.
- `whatsapp-webhook` has a hardcoded fallback verify token. Make sure
  `WHATSAPP_WEBHOOK_TOKEN` is set in Supabase so the fallback is never used.
- VIVA catalogue lives in Supabase `products` (11 rows, loaded 2026-10-02 from
  the built-in list in `VIVA.tsx`, matched by `slug`). Writes are admin-only
  (migration `08_products_admin_only.sql`); `/admin/products` requires the
  shared admin login. Garments need `collection` set or they don't show on /viva.
- Unknown from the repo alone: whether Vercel deploys `main`, whether the
  migrations/functions are applied to the live Supabase project, and whether
  RLS is on for every admin table. Confirm with the owner.

---

## Brand Identity per Site

### Hub (vieraamber.com)
- Dark (#0A0A0A) with gold (#C8A96E) accents
- Chapter-scroll — each section is a "chapter" of the brand story
- Fonts: Playfair Display (headlines) + DM Sans (body)

### Illustrations & Designs
- Pure black (#000000) — gallery wall aesthetic
- Artwork cards with hover story overlays (Framer Motion variant propagation)
- Humanized narrative copy per artwork — first-person feminine voice
- Gold CTAs, minimal chrome

### VAGIN
- Deep purple-dark (#1A0025) base, #62017F + #ED155D accents
- Impact numbers are hero elements — count-up animation on scroll
- Left accent bar (gradient #62017F → #ED155D)
- Dense with data — numbers must inspire trust and urgency

### VIVA
- Velvet Wine (#6E0025) primary, Metallic Gold (#D4AF37) accent
- Quiet Luxury — typographic restraint, no loud logos
- VIVA wordmark: Cormorant Garamond, letter-spacing animates on entrance
- Alabaster White (#FAF9F6) for text blocks

### VAM (on hub)
- Light (#FAFAFA) — education credibility
- Gold (#C8A96E) accent, black text
- 3 pillar cards + AnimatePresence waitlist form

---

## PAD KOLO Admin Dashboard

**Route:** `/vagin-dashboard` · **File:** `src/pages/VAGINDashboard.tsx`
**Access:** VAGIN team only, Supabase email/password login (`VAGINAuth.tsx`)
**Purpose:** Track schools, students, pad distribution, micro-savings, impact

### Tabs (13)
Overview · Schools · Students · Matrons · PAD KOLO · VaginART · Transactions ·
Impact & Investment · Analytics · Notifications · Gallery CMS · VAGIN Images ·
VIVA Products

### Supabase tables (actual, from `supabase/migrations/` + `sql/`)
- **VAGIN core:** `vagin_schools`, `vagin_students`, `vagin_matrons`,
  `vagin_pad_distributions`, `vagin_savings`, `vagin_sessions`,
  `vagin_transactions`, `pad_kolo_tracking`, `teachers_matrons`,
  `matron_registration_requests`, `country_configs`
- **Learning / impact:** `vaginart_modules`, `user_module_progress`,
  `resources`, `impact_stories`, `sponsor_profiles`, `sponsorships`, `users`
- **Notifications:** `vagin_notifications`, `vagin_notification_triggers`,
  `vagin_notification_preferences`, `vagin_digest_queue`
- **WhatsApp bot:** `whatsapp_sessions`, `vagin_bot_config`,
  `vagin_bot_sessions`, `vagin_bot_logs`
- **Content:** `va_artworks`, `va_gallery_chapters`,
  `va_illustration_collections`, `va_vagin_images`, `viva_feedback`

Student IDs are generated per school as `<SCHOOL CODE>-<name part>-<seq>`
(see `computeStudentId` / `buildStudentId` in the dashboard). Admins can
override them manually.

### Public Sponsor Section (on /vagin, NOT the dashboard)
- Sponsor logo wall
- Live impact metrics (count-up)
- Named school list (no student PII)
- Donation CTA

---

## Workflow

```
Claude Code (local build)
    ↕ git push/pull
GitHub repo (source of truth)
    ↕ auto-sync
Lovable (preview only — no AI prompts, zero credits)
    ↕ build → Vercel + Supabase
Live site (vieraamber.com)
```

**Build here, push to GitHub, deploy to Vercel. That's the loop.**

---

## Quality Gates (non-negotiable)

- No Inter, Roboto, Arial, Space Grotesk as primary fonts
- No purple gradients on white backgrounds (AI slop)
- All Framer Motion: hardware-accelerated only (transform + opacity)
- `useReducedMotion()` on every animated component
- Supabase RLS enabled on all admin tables
- Student PII never surfaced on public pages
- WCAG AA contrast on all text/background combos
- Mobile-first — test at 375px minimum

---

## Key Reference Files

- Design tokens: `src/index.css` + `tailwind.config.ts`
- Animation variants: `src/lib/animations.ts`
- Brand assets: `src/assets/`
- Main page: `src/pages/Index.tsx`
- Routes: `src/App.tsx`
- Admin dashboard: `src/pages/VAGINDashboard.tsx`
- Supabase client: `src/lib/supabase.ts`

---

## Next Steps

1. ✅ Hub, sub-sites and dashboard built; pushed to GitHub
2. 🔄 **Confirm live setup** (owner): Vercel deploys `main`, Supabase
   migrations + edge functions applied, RLS on all admin tables
3. 🔄 **Wire notification delivery**: WhatsApp + Resend in `notificationWorker.ts`
4. 🔄 **Re-set WhatsApp secrets under new names** in Supabase (see Known issues)
5. 🔄 **Clean up**: fix the ~31 typecheck errors
6. ⏳ **Launch polish**: 375px QA pass, SEO, then i18n

---

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
