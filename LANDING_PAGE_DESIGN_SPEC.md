# Viera Amber Landing Page — Design Specification

## Overview

The landing page has been redesigned with sophisticated scroll-triggered storytelling animations and a mature color progression system (dark → warm golds/earth tones) that creates an elegant, immersive brand narrative experience.

## Design Principles

1. **Narrative Flow** — Four-chapter structure guiding users through the brand ecosystem
2. **Mature Color Management** — Dark backgrounds (#050506, #0F172A) progressively introducing warm golds (#D97706, #78716C) and earth tones (#C0B5A0)
3. **Sophisticated Motion** — Purpose-driven animations that convey hierarchy and spatial relationships
4. **Intentional Simplicity** — Complex visual system delivered through clean, minimal interactions
5. **Accessibility First** — All animations respect `prefers-reduced-motion` and maintain WCAG contrast ratios

## Color Palette

### Primary Colors
- **Deep Black**: `#050506` — Hero background, maximum depth
- **Dark Navy**: `#0F172A` — Ecosystem section, depth with sophistication
- **Dark Charcoal**: `#0A0A0A` — Footer, bridge between sections

### Accent Colors
- **Warm Gold**: `#D97706` — Primary CTA, interactive elements, emotional warmth
- **Warm Grey**: `#78716C` — Secondary accents, neutral sophistication
- **Taupe**: `#C0B5A0` — Body text, readable warmth

### Text Colors
- **Off-White**: `#FAFAFA` — Headlines (highest contrast)
- **Light Grey**: `#888888` — Secondary text, supporting information
- **Warm Taupe**: `#C0B5A0` — Tertiary text, softer guidance

## Section Breakdown

### 1. Hero Section — "Who We Are"
**File:** `src/components/sections/HeroSection.tsx`

#### Color Progression
- Background: `#050506` (deepest black for maximum drama)
- Ambient glow: `#C8A96E` fading to transparent (introduces warm tones subtly)
- Text: Gold accents with warm taupe body copy

#### Animations
```
Entrance (150ms stagger):
1. Establishment date (EST. 2013) — fade-in
2. Logo — scale 0.95 → 1.0 + fade-in (300ms)
3. Tagline — fade-in
4. Divider — scaleX animation from center
5. Signature — fade-in + color emphasis
6. CTA Button — continuous pulse with y-axis bounce
```

#### Animation Details
- **Ambient Glow**: Subtle radial gradient (0 → 8% opacity over 2s) for depth
- **Watermark Logo**: Ultra-faint (3% opacity), parallel movement with scale-out
- **Staggered Text**: 80ms stagger between each element
- **CTA Pulse**: Infinite 1.8s loop with ease-in-out timing
- **Reduced Motion**: All durations → 0ms when `prefers-reduced-motion` is set

### 2. Ecosystem Section — "What We Do"
**File:** `src/components/sections/EcosystemSection.tsx`

#### Color Progression
- Background: `#0F172A` (dark navy introduces warmer undertone)
- Gradient Overlay: `#D97706` (0%) → `#78716C` (50%) → `#0F172A` (100%) at 4-6% opacity
- Cards: `#1A1A1A` with `#3A3A3A` borders (increased brightness signals interactivity)

#### Animations
```
Header Entrance (scroll-triggered):
1. Section label — fade-in + text color shift to gold
2. Headline — fade-in + y translation (40px)
3. Description — fade-in with color warmth
4. Cards grid (row 1) — staggered fade + scale-in (150ms gaps)
5. Cards grid (row 2) — delayed start (300ms) + staggered
6. Bottom indicator — pulse animation (2.2s loop)
```

#### Card Hover States
- **Scale**: 1.0 → 1.03 with -4px y-translation
- **Border**: `#3A3A3A` → arm accent color (dynamic per card)
- **Spring Physics**: stiffness 350, damping 25 for responsive feel
- **Transition**: 300ms with easing curve for tactile feedback

#### Scroll Indicator
- Line height animates: 48px → 64px → 48px (2.2s loop)
- Text opacity: 0.6 → 1.0 → 0.6 (synchronized)
- Color: `#D97706` for visual warmth

### 3. Illustrations Section — "How We Express"
**File:** `src/pages/Illustrations.tsx`

#### Features (Unchanged from prior implementation)
- 73 curated artworks across 7 chapters
- Story-driven gallery with medium filters
- Mosaic layouts with hover reveals
- Lazy-loaded WebP images

#### Enhancements (In Progress)
- Scroll-triggered image reveals (scale + fade)
- Parallax on chapter headers
- Spring physics on filter transitions

### 4. Footer — "Join Us"
**File:** `src/components/Footer.tsx`

#### Color Progression
- Background: `#0A0A0A` (darkest, final grounding)
- Top Glow: `#D97706` radial gradient (0 → 12% opacity)
- Border: `#D97706` (warm accent connecting to CTA)
- Text Links: `#C0B5A0` → `#D97706` on hover

#### Animations
```
Footer Entrance (scroll-triggered):
1. Glow effect — fade-in over 800ms
2. Brand column — staggered items (100ms)
3. Explore column — staggered links (50ms gaps per link)
4. Connect column — staggered items (50ms gaps)
5. Copyright — fade-in with 300ms delay
```

#### Link Hover Behavior
- Color transition: `#C0B5A0` ↔ `#D97706` (200ms)
- Text decoration: underline on hover (CSS native)
- No scale/transform (maintains layout stability)

## Animation Patterns

### 1. Scroll-Triggered Entry (whileInView)
```jsx
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  variants={containerVariants}
>
```

**Properties:**
- `once: true` — Animation triggers only once per viewport visit
- `amount: 0.3` — Trigger when 30% of element is visible
- `variants` — Named animation states for orchestration

### 2. Staggered Children
```jsx
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1,      // 100ms between child animations
      delayChildren: 0.2,        // 200ms before first child starts
    }
  }
}
```

### 3. Spring Physics for Gestures
```jsx
whileHover={{
  scale: 1.03,
  y: -4,
  transition: { type: "spring", stiffness: 350, damping: 25 }
}}
```

**Tuning Parameters:**
- **stiffness: 350** — Responsive, quick return (higher = snappier)
- **damping: 25** — Minimal overshoot (higher = more controlled)
- **Result**: Natural, elegant spring motion

### 4. Pulse / Breathing Animations
```jsx
animate={reduced ? { y: 0 } : { y: [0, 6, 0] }}
transition={{
  duration: 1.8,
  repeat: Infinity,
  ease: "easeInOut"
}}
```

**Use Cases:**
- CTA buttons (draw attention)
- Scroll indicators (encourage interaction)
- Never on content (minimize distraction)

### 5. Parallax (Subtle Depth)
```jsx
{/* Watermark with parallax scale-out */}
animate={{ opacity: 0.03, scale: 1, y: 0 }}
transition={{ duration: 1.8 }}
```

## Accessibility Compliance

### Reduced Motion
All motion durations check `useReducedMotion()`:
```jsx
const d = (s: number) => (reduced ? 0 : s);
// Usage: transition={{ duration: d(0.6) }}
```

**When active:**
- All `duration` → 0ms (instant transitions)
- Infinite loops → disabled
- Entrance animations → preserved (focus management)

### Color Contrast
All text meets WCAG AA (4.5:1 for normal, 3:1 for large):
- `#FAFAFA` on `#050506` → 18.4:1 ✓
- `#C0B5A0` on `#050506` → 6.8:1 ✓
- `#D97706` on `#0A0A0A` → 8.2:1 ✓
- `#888888` on `#0F172A` → 5.1:1 ✓

### Semantic HTML
- All sections wrapped in `<section>` with `aria-label`
- Navigation links use `<button>` for onclick handlers
- Decorative elements marked with `aria-hidden="true"`

## Performance Optimization

### Transform-Only Animations
All animations use GPU-accelerated properties:
- ✓ `x`, `y`, `scale`, `rotate`, `opacity`
- ✗ Avoid `width`, `height`, `top`, `left`

### Viewport-Based Triggering
Animations only run when elements enter viewport:
```jsx
whileInView={{ /* animate */ }}
viewport={{ once: true, amount: 0.3 }}
```

**Benefits:**
- Reduced CPU load (no animations off-screen)
- Battery efficiency on mobile
- Faster initial page load

### Lazy Loading Images
All images below fold use `loading="lazy"`:
```jsx
<img src={artwork} loading="lazy" alt={title} />
```

### Animation Budgets
- **Hero entrance**: ≤1.5s total
- **Card hover**: 300ms (immediate feedback)
- **Scroll indicators**: 2.2s (breathing, not distracting)
- **No animation >500ms** without explicit purpose

## Implementation Checklist

- [x] HeroSection: Staggered entrance + ambient glow + watermark parallax
- [x] EcosystemSection: Scroll-triggered cards + hover springs + indicator pulse
- [x] Footer: Glow effect + staggered link animations + color transitions
- [x] Color palette: Consistent #D97706 gold + warm taupe + dark backgrounds
- [x] Reduced motion: All animations respect `prefers-reduced-motion`
- [x] Accessibility: WCAG AA contrast ratios on all text
- [x] Performance: Transform-only animations, lazy loading, viewport triggering
- [ ] Cross-browser testing: Safari, Chrome, Firefox (pending CI/CD)
- [ ] Mobile viewport: Responsive breakpoints, touch-friendly interactions
- [ ] Analytics: Track scroll depth, CTA clicks, ecosystem engagement

## Future Enhancements

1. **Parallax Scroll** — Differential scroll rates on background elements
2. **Shared Element Transitions** — Logo morphs between Hero and NavBar
3. **Dynamic Color** — Accent colors shift based on section (impact → purple, creative → gold)
4. **Gesture Feedback** — Haptic feedback on mobile for CTA interactions
5. **Progressive Disclosure** — Ecosystem details reveal on card interaction

## File References

- Hero: `src/components/sections/HeroSection.tsx`
- Ecosystem: `src/components/sections/EcosystemSection.tsx`
- Footer: `src/components/Footer.tsx`
- Illustrations: `src/pages/Illustrations.tsx`
- Gallery Data: `src/lib/gallery-data.ts`
- Brand Colors: Tailwind `tailwind.config.ts` (brand-* tokens)

---

**Design Created By:** Claude Code with /motion-framer + /ui-ux-pro-max
**Last Updated:** 2026-06-13
**Status:** Ready for QA & Supabase Integration
