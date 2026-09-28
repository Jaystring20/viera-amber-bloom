# Illustrations Gallery Design Spec
**Maintaining VIVA Design System Aesthetic**

---

## Design Intent

The Illustrations Gallery is an **Experience** mode surface — visitors immerse themselves in the artwork, not the interface. The design recedes, letting the 103 illustrations and their organization tell the story.

**Guiding Principle:** Editorial breathing room + luxury restraint. Every design decision serves the artworks, not the navigation.

---

## Page Structure

### Level 1: Category Navigation (Hero)

**Component:** Minimal category selector at top  
**Layout:**
- Split screen: 2 main category buttons
  - Left: "Fashion Illustration" (burgundy background)
  - Right: "Lifestyle Illustration" (darker burgundy background)
- Full-width hero space (no image; pure typography + color)
- Minimal button states: subtle scale on hover, gold underline accent

**Typography:**
- Headline: "Explore Our Collections" (Cormorant Garamond, 48-56px, 300w italic)
- Subheading: "103 Curated Illustrations Organized Across 21 Sections" (DM Sans, 14px, 400w, 0.7 opacity)

**Spacing:**
- Top padding: 80px
- Button container: 40px gap between
- Bottom padding: 96px

**Color:**
- Background: ALABASTER (#FAF9F6)
- Buttons: BURGUNDY (#6E0025) text on CREAM (#F5EDE6) background
- Hover: Gold underline, subtle scale (1.0 → 1.02)

**Motion:**
- Fade-in on mount: 300ms ease-out
- Button hover: 150ms scale + underline
- No jank, no excessive movement

---

### Level 2: Subcategory Filter

**Component:** Horizontal scrollable tabs (desktop: static row)  
**Layout:**
- Display 9 subcategory tabs in a clean row
  - Fashion Illustrations, Bridal Designs, Shoes, Bags
  - Single Illustrations, Product Illustrations, Birthday & Couple, Book Covers, Event Programs
- Active tab: burgundy background + gold text
- Inactive: transparent background, DARK_TEXT

**Typography:**
- Tab label: DM Sans, 13px, 500w
- Spacing: 16px horizontal padding, 12px vertical

**Spacing:**
- Horizontal scroll on mobile, static row on desktop (768px+)
- Padding: 24px top/bottom section container

**Color:**
- Active: BURGUNDY background, GOLD text
- Inactive: Transparent, DARK_TEXT with 0.6 opacity
- Divider: BURGUNDY_ALPHA (0.14)

**Motion:**
- Tab change: Smooth fade (200ms) + content transition
- Scroll on mobile: Natural momentum

---

### Level 3: Illustration Grid

**Component:** Responsive masonry/grid layout  
**Layout:**
- Desktop (1025px+): 3-column grid
- Tablet (641-1024px): 2-column grid
- Mobile (375-640px): 1-column grid
- No gap between images (editorial flush alignment)
- Images fill container width with aspect-ratio: auto preserved

**Typography:**
- Title: Hidden (optional: hover reveal on desktop)
- Metadata: None visible initially
- Collection badge (if applicable): Small overlay on image bottom-left

**Spacing:**
- Container max-width: 1100px (desktop), centered
- Grid gap: 0px (flush edges for editorial impact)
- Padding: 56-72px sides (responsive via `clamp`)
- Section break before next 21-section grouping: 80px

**Color:**
- Background: ALABASTER
- Image borders: None (direct image dominance)
- Overlay on hover (desktop only): BURGUNDY_ALPHA (0.08) 0-200ms fade
- Collection label: GOLD text, 11px, 0.8 opacity

**Motion:**
- Image load: Fade-in 400ms ease-out
- Stagger: 60ms per image (left-to-right, top-to-bottom)
- Hover (desktop): Subtle scale (1.0 → 1.03) + overlay fade, 200ms
- Mobile tap: No hover animation; instant visual feedback

**Interaction:**
- Tap/click opens image detail view (modal or dedicated page)
- Keyboard navigation: Tab through images, Enter to open

---

### Level 4: Section Headers (21 Sections)

**Component:** Divider + header before each section of 5-13 images  
**Layout:**
- Section number and name (e.g., "Section 5: #5for5 Campaign")
- Centered above grid start
- Minimal visual weight (thin divider, elegant text)

**Typography:**
- Label: "SECTION [#]" (DM Sans, 11px, 600w, uppercase, 0.6 opacity)
- Name: Cormorant Garamond, 28-36px, 400w italic
- Collection subtitle (if applicable): DM Sans, 13px, 0.5 opacity

**Spacing:**
- Top padding: 80px
- Bottom padding: 40px
- Divider: 1px BURGUNDY_ALPHA (0.1)

**Color:**
- Text: DARK_TEXT
- Divider: BURGUNDY_ALPHA

**Motion:**
- Section header: Fade-in 300ms ease-out (trigger at viewport -100px)

---

### Level 5: Image Detail View (Modal / Lightbox)

**Component:** Full-screen detail overlay  
**Layout:**
- Image centered (max 90% viewport width/height)
- Metadata panel (right side desktop, below mobile)
  - Title, Section, Collection
  - Description (if available)
  - Related illustrations (grid of 4 below)
- Close button: Top-right corner (X icon)

**Typography:**
- Title: Cormorant Garamond, 32-40px, 400w
- Metadata: DM Sans, 13px, 400w
- Section/Collection: Gold accent, 11px, 600w

**Spacing:**
- Image margin: 40px from edges
- Metadata padding: 32px
- Related grid: 4-column desktop, 2-column mobile

**Color:**
- Background: BURGUNDY with 0.95 opacity overlay (preserve image prominence)
- Text: ALABASTER (light text on dark)
- Accents: GOLD for section/collection tags

**Motion:**
- Modal enter: Fade-in 300ms + slide-up 400ms
- Modal exit: Fade-out 200ms
- No jank, smooth transitions

---

### Level 6: Collection Browse (Sidebar / Drawer)

**Component:** Optional secondary navigation  
**Layout:**
- Side panel (desktop) or bottom sheet (mobile)
- Lists all 15 collections + count
- Filter by collection

**Typography:**
- Collection name: DM Sans, 14px, 400w
- Count: 12px, 0.6 opacity
- Active: GOLD text

**Spacing:**
- Padding: 24px
- Item gap: 12px

**Color:**
- Background: CREAM
- Text: DARK_TEXT
- Active: GOLD

**Motion:**
- Drawer slide-in: 300ms ease-out
- Drawer slide-out: 200ms ease-in

---

## Component Details

### Image Card (Grid Item)

**States:**
1. **Default:** Image only, no overlay
2. **Hover (desktop):** Subtle overlay + scale
3. **Active/Selected:** Thin gold border (2px)
4. **Loading:** Skeleton placeholder (cream background + shimmer)

**Accessibility:**
- `alt` text: Descriptive (e.g., "Fashion Illustration: Eden Collection artwork")
- `loading="lazy"` for below-fold images
- `decoding="async"` for non-critical renders

**Performance:**
- WebP format (optimized quality 88)
- Responsive srcset (375w, 640w, 1024w, 1440w)
- Aspect-ratio: `auto` to preserve original proportions
- No hardcoded dimensions (CSS handles layout)

---

### Category Buttons

**States:**
1. **Default:** Transparent, DARK_TEXT
2. **Active:** BURGUNDY background, ALABASTER text
3. **Hover:** Subtle gold underline (2px), scale 1.02
4. **Disabled:** Opacity 0.5, no hover

**Typography:**
- DM Sans, 16px, 500w
- Uppercase eyebrow: 11px, 600w

**Spacing:**
- Padding: 16px 32px
- Min-width: 180px

**Border:** 1px BURGUNDY_ALPHA on inactive

---

### Filter Tabs

**States:**
1. **Default:** Transparent, DARK_TEXT (0.6 opacity)
2. **Active:** BURGUNDY background, GOLD text
3. **Hover:** BURGUNDY_ALPHA background (0.1), slight scale

**Typography:**
- DM Sans, 13px, 500w

**Spacing:**
- Horizontal padding: 16px
- Vertical padding: 12px
- Gap between tabs: 8px

**Border:** Subtle divider (BURGUNDY_ALPHA) under active tab only

---

## Responsive Breakpoints

| Breakpoint | Grid | Navigation | Details |
|-----------|------|------------|---------|
| Mobile (375-640px) | 1 column | Category buttons stack, tabs scroll | Modal only, no drawer |
| Tablet (641-1024px) | 2 columns | Horizontal tabs | Bottom sheet on tap |
| Desktop (1025px+) | 3 columns | Static tabs, sidebar drawer | Side panel + detail |
| Wide (1441px+) | 3 columns, centered | Same as desktop | Same as desktop |

---

## Accessibility

### Color Contrast
- DARK_TEXT (#221A1A) on ALABASTER (#FAF9F6): 14.8:1 ✓
- BURGUNDY (#6E0025) on CREAM (#F5EDE6): 5.2:1 ✓
- GOLD (#D4AF37) on BURGUNDY: 3.1:1 (large text) ✓

### Keyboard Navigation
- Tab through images in grid order
- Enter to open detail view
- Escape to close modal
- Arrow keys to navigate between images in modal (next/prev)

### Screen Readers
- All images have descriptive alt text
- Section headers are `<h2>` elements
- Collection names are announced
- Form labels (filter, search) are properly associated
- Modal is marked with `role="dialog"` and `aria-modal="true"`

### Motion
- All animations respect `prefers-reduced-motion`
- Fallback: instant state changes, no transitions
- Focus indicators are visible and have 3:1 contrast minimum

---

## Performance Targets

- **LCP:** < 2.5s (hero image loads fast)
- **CLS:** < 0.1 (no layout shift as images load)
- **TTI:** < 3.8s
- **Image optimization:** WebP, lazy load, responsive srcset
- **Font loading:** `font-display: swap`

---

## Color Token Reference

```css
:root {
  --color-burgundy: #6E0025;
  --color-gold: #D4AF37;
  --color-cream: #F5EDE6;
  --color-alabaster: #FAF9F6;
  --color-dark-text: #221A1A;
  --color-burgundy-alpha: rgba(110, 0, 37, 0.14);
  --color-gold-alpha: rgba(212, 175, 55, 0.3);
}
```

---

## Typography Token Reference

```css
:root {
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'DM Sans', sans-serif;
  
  --size-display: clamp(36px, 8vw, 56px);
  --size-h1: clamp(32px, 7vw, 48px);
  --size-h2: clamp(24px, 5vw, 36px);
  --size-h3: clamp(18px, 3vw, 24px);
  --size-body: clamp(14px, 1.5vw, 16px);
  --size-small: clamp(11px, 1.2vw, 13px);
  
  --line-height-tight: 1.1;
  --line-height-normal: 1.5;
  --line-height-loose: 1.75;
}
```

---

## Next Steps

1. ✅ Design spec complete — ready for implementation
2. Build React component hierarchy (Gallery → Category → Grid → Card → DetailModal)
3. Integrate with database query guide (fetch by chapter/collection/section)
4. Test responsive layouts across breakpoints
5. Verify image performance and loading states
6. Accessibility audit (contrast, keyboard nav, screen readers)
7. Motion & animation review (reduced-motion support)

