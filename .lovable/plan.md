# Hero + Ecosystem — Strict Black & White Reconstruction

## Goal
Move the top of the page from dark-with-gold/blue to a strict **editorial monochrome**: roughly **65% white surface, 35% black** (type, image, accents). No gold (#D97706), no wine, no blue (#0F172A), no pink — pure neutrals only on these two sections.

## Scope (this pass)
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/EcosystemSection.tsx`

Other sections (VAGIN, VIVA, VAM, Founder, Contact, Shop, Footer) are **untouched** in this pass — they keep their current brand palettes. We can do a follow-up if she wants the entire page B&W.

---

## 1. HeroSection — white stage, black portrait

**Background**
- Container bg: `#0A0A0A` → `#FFFFFF`.
- Remove the dark radial vignette and the dark bottom/top fades. Replace with a soft **white** bottom fade so it dissolves into the next white section seamlessly.

**Portrait artwork**
- Keep the Jacqueline B&W image, but adjust filter so it reads as a high-contrast editorial print on white:
  `grayscale(100%) contrast(1.25) brightness(1.02)` and add `mix-blend-mode: multiply` so the white paper of the image fuses with the page (gives a true cut-out / fashion-editorial feel).
- Position unchanged.

**Frosted glass panel → paper card**
- Replace `rgba(8,8,8,0.52)` glass with either:
  - (a) **No card** — let type sit directly on white, OR
  - (b) A subtle **off-white card** `#FAFAFA` with a 1px `#0A0A0A` hairline border, no blur.
- Recommend (a) for the cleanest editorial feel; will go with (a) unless you'd rather keep a card.

**Typography colors**
- "EST. 2013" eyebrow: `#D97706` → `#0A0A0A`, same tracking.
- Wordmark logo: swap to a **black** variant. If only the amber logo asset exists, apply `filter: brightness(0) saturate(0)` to force it black on white.
- Divider gradient (gold): → solid `#0A0A0A`, 1px, 44px wide.
- Tagline body copy: `rgba(255,255,255,0.82)` → `#333333`.
- **"For her, by her."** italic pull-quote: remove the gold→pink gradient, use solid `#0A0A0A` Playfair italic.

**CTA**
- `bg-brand-gold text-brand-dark` → `bg-black text-white` rounded-full, same size; hover lifts to `#222`.

**Scroll indicator**
- Border + dot: amber → `#0A0A0A`.

**Black proportion check**
- White stage + white card + light copy areas ≈ 65%.
- Portrait (mid/dark tones), headline weight, CTA pill, eyebrow, indicator ≈ 35%. Hits the ratio.

---

## 2. EcosystemSection — white canvas, black diagram

- Section background `#0F172A` (deep blue) → `#FFFFFF`.
- All card surfaces (`rgba(20,20,28,0.6)`, `rgba(18,18,26,0.78)`, etc.) → `#FFFFFF` with `1px solid #0A0A0A` hairline (replaces colored borders).
- Vertical connector line `#D97706` → `#0A0A0A`.
- Arm accent colors (used for icons / dots / left-bar) → all collapse to `#0A0A0A`. Icon chip backgrounds `${accent}22` → `#F2F2F2`.
- Section eyebrow / heading / body: switch to `#0A0A0A` for headings, `#555` for body.
- Hover/focus states: invert (black bg, white text) instead of colored glow — keeps the monochrome rule intact while still giving feedback.
- Keep all layout, motion, and copy exactly as-is.

---

## Out of scope (ask before doing)
- NavBar: currently transparent over dark hero. On a white hero it needs **dark text** and a white/translucent background. I'll flip it in the same pass if you confirm — otherwise it'll look invisible on white.
- The rest of the page (VAGIN purple/pink, VIVA wine/gold, dark Shop band, Footer) stays branded for now.

## Technical notes
- No new dependencies. All edits are in two component files (+ likely a small NavBar tweak if you approve).
- Motion variants, refs, reduced-motion handling all preserved.
- No design tokens edited in `index.css` / `tailwind.config.ts` — changes are local to these sections so the rest of the brand system is unaffected.

## Questions before I build
1. **NavBar** — flip to dark-on-white for the hero/ecosystem area? (Strongly recommend yes.)
2. **Hero card** — go cardless (type directly on white, most editorial) or keep a subtle off-white card with hairline border?
3. **Logo asset** — do you have a black version of the Viera Amber wordmark, or should I force the existing amber PNG to black via CSS filter?
