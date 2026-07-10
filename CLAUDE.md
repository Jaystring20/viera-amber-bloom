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

```
vieraamber.com              ← Main hub (THIS REPO)
  ├── /                     ← Chapter-scroll immersive single page
  ├── #hero
  ├── #ecosystem            ← 5-arm ecosystem map
  ├── #illustrations        ← Portfolio preview + story overlays
  ├── #vagin                ← Girls' Initiative + impact numbers
  ├── #viva                 ← Fashion brand teaser
  ├── #vam                  ← Masterclass waitlist
  ├── #shop                 ← VASH link-out (external store)
  ├── #founder              ← Faith Adigwe bio
  └── #contact              ← Contact form

illustrations.vieraamber.com  ← Phase 2 (separate project/repo)
vagin.vieraamber.com          ← Phase 2 (separate project/repo)
  └── /admin                  ← PAD KOLO Admin Dashboard (VAGIN team only)
viva.vieraamber.com           ← Phase 2 (separate project/repo)
```

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | React + Vite + TypeScript | Lovable-scaffolded, shadcn/ui available |
| Styling | Tailwind CSS v3 | Custom tokens in tailwind.config.ts |
| Animation | Framer Motion v12 | All animations via this — NO CSS keyframes |
| Database | Supabase (external account) | NOT Lovable-managed |
| Auth | Supabase Auth + Google SSO | Admin dashboard only |
| i18n | react-i18next | English base, geo-detect regional switch |
| Routing | react-router-dom v6 | Single page on hub |

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
├── lib/
│   ├── animations.ts          ← ALL Framer Motion variants (source of truth)
│   └── utils.ts
├── components/
│   ├── NavBar.tsx             ← Sticky, transparent→solid, mobile overlay
│   ├── NavLink.tsx
│   ├── Footer.tsx             ← 3-col, gold rule, all contact details
│   ├── sections/
│   │   ├── HeroSection.tsx        ✅ built
│   │   ├── EcosystemSection.tsx   ✅ built
│   │   ├── IllustrationsSection.tsx  ✅ built
│   │   ├── VAGINSection.tsx          ✅ built
│   │   ├── VIVASection.tsx           ✅ built
│   │   ├── VAMSection.tsx            ✅ built
│   │   ├── FounderSection.tsx        ✅ built
│   │   └── ContactSection.tsx        ✅ built
│   └── ui/                    ← shadcn/ui components
├── pages/
│   ├── Index.tsx              ← Main hub page ✅ wired
│   └── NotFound.tsx
├── index.css                  ← Design tokens + global styles
└── main.tsx
```

---

## Current Build State

### Phase 1 — Hub Shell ✅ COMPLETE

**All 9 sections built and wired:**
- ✅ NavBar
- ✅ HeroSection
- ✅ EcosystemSection
- ✅ IllustrationsSection
- ✅ VAGINSection
- ✅ VIVASection
- ✅ VAMSection
- ✅ FounderSection
- ✅ ContactSection
- ✅ Footer
- ✅ src/lib/animations.ts (all Framer Motion variants)
- ✅ src/pages/Index.tsx (fully wired)

### Phase 2 — Sub-Domain Sites (NOT STARTED)
- `illustrations.vieraamber.com` — full illustration gallery with story overlays
- `vagin.vieraamber.com` — VAGIN full site + PAD KOLO Admin Dashboard
- `viva.vieraamber.com` — VIVA editorial fashion site

### Phase 3 — Integration (NOT STARTED)
- Supabase schema (7 tables — see PAD KOLO section below)
- WhatsApp Bot API wiring (mock layer first)
- Regional i18n content
- Performance audit + SEO

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

## PAD KOLO Admin Dashboard Spec

**Access:** VAGIN team only via Google SSO (Supabase Auth)
**Purpose:** Track pad distribution, student micro-savings, fund balance

### Supabase Schema (7 tables)

```sql
schools         (id, name, address, state, country, matron_name, matron_phone, active_term, created_at)
students        (id, student_uid UNIQUE, school_id→schools, class, enrolled_at, is_active)
pad_transactions(id, student_id→students, transaction_type ENUM(free|subsidized), amount_paid, pads_issued, matron_id, created_at)
fund_balances   (school_id→schools, term, total_collected, total_spent, balance, last_updated)
donors          (id, name, organization, email, amount, type ENUM(cash|in-kind), date, export_ready)
bot_sync_log    (id, event_type, student_uid, payload_json JSONB, status ENUM(pending|synced|error), created_at)
```

Student UID format: first 2 letters of firstname + first 2 of lastname + class (e.g. `FAADSS2`)

### Dashboard Modules (8)
1. Overview — summary cards with count-up animation
2. School List — add/remove schools, matron details
3. Student Records — per-school drill-down, add/deactivate students
4. Pad Transactions — log, filter by school/term/type, CSV export
5. Fund Balance — per school per term, chart view
6. Donor Management — list, export CSV/PDF
7. Bot Sync Status — Phase 1 mock, Phase 2 live webhook
8. Reports — monthly PDF generator

### Public Sponsor Section (on VAGIN site — NOT the dashboard)
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

---

## Next Steps (IMMEDIATE)

1. ✅ **Integrate all 8 section components** — DONE
2. ✅ **Wire Index.tsx** — DONE
3. 🔄 **Commit and push to GitHub** — IN PROGRESS
4. 🔄 **Connect Vercel** — NEXT
5. 🔄 **Set up Supabase** — AFTER VERCEL

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
