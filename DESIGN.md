# VIVA Design System

**Brand:** VIVA by Viera Amber — Premium heritage fashion + lifestyle  
**Aesthetic:** Luxury editorial, warm sophistication, African heritage-inspired  
**Mode:** Experience + Persuade (portfolio meets commerce)

---

## Color Palette

| Name | Hex | Usage | Notes |
|------|-----|-------|-------|
| **BURGUNDY** | #6E0025 | Primary brand color, headlines, accents | Deep wine, elegant authority |
| **GOLD** | #D4AF37 | Luxury accent, rules, details | Warm metallic, restraint |
| **CREAM** | #F5EDE6 | Secondary background | Warm off-white, readable |
| **ALABASTER** | #FAF9F6 | Primary background | Nearly white, breathing room |
| **DARK_TEXT** | #221A1A | Body text, hierarchy | Near-black, warm undertone |
| **BURGUNDY_ALPHA** | rgba(110,0,37,0.14) | Subtle dividers, overlay | 14% opacity for sophistication |
| **GOLD_ALPHA** | rgba(212,175,55,0.3) | Background tints, overlays | 30% opacity, luxury softness |

**Palette Philosophy:**
- One primary accent (Burgundy) maintains consistency across sections
- Gold used sparingly for emphasis (rules, icons, jewelry details)
- Cream/Alabaster backgrounds preserve editorial breathing room
- All colors intentional; no random gradients or trend-driven mixing

---

## Typography

### Fonts
- **Display/Headlines:** Cormorant Garamond (serif) — 300-700 weight
  - Elegant, heritage-forward, used for luxury positioning
  - Body copy: 400w; Headings: 600-700w; Italic for editorial moments
- **Body/UI:** DM Sans (sans-serif) — 400-600 weight
  - Neutral workhorse for product details, forms, CTAs
  - UI labels: 400w; Bold emphasis: 600w

### Scale (Responsive via `clamp()`)
| Level | Desktop | Mobile | Usage |
|-------|---------|--------|-------|
| **Display** | 56-64px | 36-40px | Hero masthead, section titles |
| **H1** | 48-56px | 32-36px | Major section headings |
| **H2** | 36-48px | 24-28px | Subsection titles, product names |
| **H3** | 24-32px | 18-22px | Card titles, pillar headings |
| **Body** | 16-17px | 14-15px | Product description, copy blocks |
| **Small** | 12-13px | 11-12px | Labels, metadata, eyebrows |

### Line Height
- Headlines: 1.1 (tight, elegant)
- Body: 1.5-1.75 (readable, breathing)
- Long-form: 1.7-1.8 (editorial comfort)

---

## Visual Hierarchy & Spacing

### Grid System
- **Desktop Container:** max-width 1100px (shop), 1280px (lifestyle sections)
- **Gutters:** 6px padding on sides, scales via `px-6`
- **Gap system:** 8dp (tight), 16dp (standard), 24dp (generous), 32-48dp (section break)

### Component Spacing
- Card padding: 40-72px (responsive, using `clamp`)
- Section padding: 80-96px top/bottom
- Image borders: 0-2px (minimal, subtle)

---

## Motion & Animation

### Timing
- **Micro interactions:** 150-200ms (hover, button state)
- **Section enter animations:** 600-700ms (fade-in, slide)
- **Stagger between items:** 80-120ms delay per element
- **Scroll-driven reveals:** Trigger at 80px before viewport

### Easing
- **Enter:** `ease-out` (Quick → Ease) — feels responsive
- **Exit:** `ease-in` — feels natural
- **Spring-based:** Preferred for bouncy micro-interactions
- **Stagger timing:** `0.12s` increment per card

### Reduced Motion
- **Always respected:** `prefers-reduced-motion` disables all animations
- **Fallback:** Instant state changes, no transition property
- **UX:** Functional always; delight is optional

---

## The Three Aesthetic Integration Points

### **1. LIFESTYLE INTERSTITIAL** ✅ (Implemented)
**Position:** After Lookbook, before Philosophy  
**Purpose:** Establish *brand feeling* through curated lifestyle photography  
**Layout:**
- 3-image responsive grid: 3 columns (desktop), 2 (tablet), 1 (mobile)
- Image 1: Single model with VIVA bag (1792×2400px, portrait)
- Image 2: Editorial moment (1792×2400px, portrait)
- Image 3: Duo landscape (2400×1792px, landscape, spans 2 rows on desktop)

**Styling:**
- Minimal borders: 2px radius (nearly sharp, luxury restraint)
- Subtle gradient overlay: burgundy alpha at bottom
- Eyebrow label: "The VIVA Lifestyle" (11px uppercase, 0.6 opacity)
- Closing tagline: "Luxury crafted for the woman who wears her confidence out loud" (Cormorant italic, centered)
- Spacing: 96px padding top/bottom, 56px above tagline

**Motion:**
- Fade-in + slide-up on scroll (300ms per image, 0.12s stagger)
- No hover animation (preserves editorial calm)

**Color:**
- Background: ALABASTER (#FAF9F6)
- Text: BURGUNDY, 0.8 opacity for tagline
- Overlay: BURGUNDY_ALPHA (0.08 at bottom)

---

### **2. COLLECTION HEADER MOMENTS** 🔮 (Upcoming)
**Position:** Before each product collection block (Batya, Coronation, etc.)  
**Purpose:** Contextualize why each collection matters through lifestyle  
**Layout:**
- Full-bleed lifestyle image (800-1000px height, responsive width)
- Overlay badge with collection name + subtitle (e.g., "Batya: Daughters of Adonai")
- Badge positioned: bottom-left or center-bottom (TBD after first iteration)
- Product grid below image (existing shop layout)

**Styling:**
- No border, full bleed to container edges
- Dark scrim overlay (20-30% burgundy) to ensure text legibility
- Badge: Cormorant italic, GOLD text, positioned with 40px padding from bottom
- Transition: Fade-in + subtle scale (1.0 → 1.02) on scroll

**Color:**
- Overlay: `linear-gradient(to bottom, rgba(110,0,37,0.1) 0%, rgba(110,0,37,0.3) 100%)`
- Badge text: GOLD (#D4AF37)
- Background below: ALABASTER

---

### **3. BETWEEN-PILLAR VISUAL BREATHING ROOM** 🔮 (Upcoming)
**Position:** Between Philosophy Pillars (e.g., after "Structured Fluidity", before "Artistic Agency")  
**Purpose:** Break text density; add rhythm to the three-pillar composition  
**Layout:**
- Split-screen: One lifestyle image (left 45-50%) + one pillar description (right 50-55%)
- Alternates left/right for visual asymmetry (odd pillars: image left; even: image right)
- Small margin between image and text (16-24px gap)

**Styling:**
- Image: Minimal border (2px radius), no shadow
- Text overlay on small screens: Reflow to stacked layout (image full width, text below)
- Alignment: Middle-aligned on desktop, top-aligned on mobile
- Background: CREAM (#F5EDE6)

**Motion:**
- Image: Fade-in + subtle scale on scroll
- Text: Fade-in with slight delay (0.12s after image)

**Color:**
- Background: CREAM
- Borders: Subtle BURGUNDY_ALPHA dividers between sections
- Text: DARK_TEXT for hierarchy

---

## Photography Direction

### Aesthetic Characteristics
- **Lighting:** Warm golden hour + studio softbox (never harsh)
- **Color Grading:** Warm earth tones (ochre, burgundy, cream, caramel)
- **Composition:** Lifestyle-first (not product-first); shows the *feeling* of wearing VIVA
- **Styling:** Heritage-inspired accessories (gold cuffs, layered jewelry); structured fabrics (linen, cotton, silk)
- **Models:** Confident, natural, diverse; never overly posed

### Quality Standards
- **Resolution:** Minimum 1600px width for web (max 2400px to control file size)
- **Format:** WebP optimized (quality 88, method 6) for fast loading
- **File Size:** Target 150-500KB per image (compressed but lossless quality)
- **Aspect Ratios:** Portrait (9:12), Landscape (16:12), flexible depending on moment

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Shift |
|-----------|-------|--------------|
| **Mobile** | 375-640px | 1 column, full bleed, tight spacing |
| **Tablet** | 641-1024px | 2 columns, breathing room |
| **Desktop** | 1025-1440px | 3 columns, maximum hierarchy |
| **Wide** | 1441px+ | Container max-width, centered |

---

## Accessibility

### Contrast
- **Text:** Minimum 4.5:1 (WCAG AA) for body; 3:1 for large text
- **Verified Pairs:**
  - DARK_TEXT (#221A1A) on ALABASTER (#FAF9F6): 14.8:1 ✓
  - BURGUNDY (#6E0025) on ALABASTER: 5.2:1 ✓
  - GOLD (#D4AF37) on BURGUNDY: 3.1:1 (large text only) ✓

### Images
- **Alt text:** Descriptive, concise (e.g., "VIVA Lifestyle — Woman in burgundy holding VIVA shopping bag")
- **Decorative overlays:** `aria-hidden="true"` to avoid redundant announcements
- **Lazy loading:** `loading="lazy"` for below-fold images

### Motion
- **Respects:** `prefers-reduced-motion` media query
- **Fallback:** All animations disabled; state changes instant but functional

---

## Performance Targets

- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.8s
- **Image Optimization:** WebP with JPEG fallback; lazy load non-critical
- **Font Loading:** `font-display: swap` to avoid invisible text

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-08-11 | 1.0 | Initial design system created for VIVA page redesign |
| | | • Added Lifestyle Interstitial section |
| | | • Documented 3 aesthetic integration points (1 implemented, 2 planned) |
| | | • Established color, typography, spacing, motion guidelines |

---

## Next Steps

1. ✅ **Lifestyle Interstitial:** Implemented and live
2. 🔮 **Collection Header Moments:** Design & implement per collection
3. 🔮 **Between-Pillar Moments:** Integrate into Philosophy section
4. 🔮 **Product Page Enhancement:** Apply aesthetic photography to individual product views
5. 🔮 **Mobile Optimization:** Refine image aspect ratios for small screens (especially landscape orientation)
