## Goal

Transform the `/viva` hero into a contemporary editorial composition: the centered VIVA wordmark + "For her, by her." + Daughters of Adonai portrait stays, but two full-height model cut-outs flank it — pink look on the LEFT, olive-stripe look on the RIGHT — both with white studio backgrounds removed and mirrored so the extended sleeve/arm of each model points inward toward the wordmark (matching reference image 1).

## Steps

1. **Prepare cut-out assets** (background removed, then mirrored)
   - `src/assets/viva-hero-left.png` — sourced from `user-uploads://viva_2.jpeg` (pink top), background removed via `imagegen--edit_image` with `transparent_background: true`, then horizontally flipped so the model's extended arm points to the RIGHT (toward center).
   - `src/assets/viva-hero-right.png` — sourced from `user-uploads://Viva_1.jpeg` (olive stripes), background removed, then horizontally flipped so the extended sleeve points to the LEFT (toward center).
   - Both saved as transparent PNGs and uploaded via `lovable-assets create` so the binaries don't bloat the repo; pointer JSON files committed to `src/assets/`.
   - (Note: flipping is achieved either in the edit prompt or via CSS `transform: scaleX(-1)` on the `<img>` — CSS is cheaper and lossless, so we'll generate clean bg-removed PNGs and flip in CSS.)

2. **Restructure the VIVA hero block** (`src/pages/VIVA.tsx`, ~lines 105–260)
   - Wrap the existing centered column in a 3-column flex/grid: `[leftModel] [centeredColumn] [rightModel]` inside the burgundy `<section>`.
   - Models are absolutely positioned to the section's bottom edges (so they "stand on" the section floor), `height: clamp(420px, 70vh, 760px)`, `width: auto`, `object-fit: contain`, `object-position: bottom`. Left model pinned `left: 0, bottom: 0`; right model pinned `right: 0, bottom: 0`. Apply `transform: scaleX(-1)` to mirror each inward.
   - Center column keeps current `max-width: 680px` and z-index above models so the wordmark/portrait sit in front; models z-index 0, gradient/grain stay behind both.
   - Increase section `min-height` to `clamp(720px, 95vh, 920px)` so the models read at full editorial scale and the centered content remains balanced.

3. **Entrance animation** (framer-motion, respects `useReducedMotion`)
   - Left model: `initial={{ opacity: 0, x: -40 }}` → `animate={{ opacity: 1, x: 0 }}`, `duration: 1.1`, `delay: 0.35`, ease `[0.16, 1, 0.3, 1]`.
   - Right model: symmetric with `x: 40`, same timing.
   - Reduced motion: opacity-only, duration 0.

4. **Responsive behavior**
   - At `<768px`: hide the two flanking models (`display: none` via Tailwind `hidden md:block`) so the mobile hero stays the clean centered portrait it is today. The editorial flanking treatment is a desktop/tablet enhancement.
   - At `768–1024px`: reduce model height to `clamp(360px, 55vh, 520px)` and slightly reduce their opacity (0.92) so they don't crowd the centered column.

5. **Accessibility & polish**
   - `alt=""` and `aria-hidden="true"` on both flanking model images — they're decorative editorial framing; the central portrait already carries the meaningful alt text.
   - `pointer-events: none` on the model images so they don't intercept clicks on the CTA.
   - `draggable={false}`, `user-select: none`.
   - No changes to NavBar, copy, or any other section.

## Technical notes

- Use `imagegen--edit_image` with `transparent_background: true` per the assets-pipeline rule for clean alpha. Prompt: "Remove the white studio background completely, keep the full figure including hair, fingertips, shoe tips intact, on a solid white background" (the tool inverts to alpha).
- Use `lovable-assets create --file <tmp.png> --filename viva-hero-left.png > src/assets/viva-hero-left.png.asset.json`, then `import leftHero from "@/assets/viva-hero-left.png.asset.json"` and reference `leftHero.url`.
- Flip via CSS `transform: scaleX(-1)` rather than re-rendering — preserves pixel quality.
- Existing burgundy `#6E0025` background, gold glow gradient, and grain overlay are kept exactly as-is; the new figures sit between those overlays and the centered content.
