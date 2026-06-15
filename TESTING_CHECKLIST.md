# Hero Section Testing Checklist

## Option A: Polish & Optimize

### Phase 1: Responsive Testing

#### Desktop (1440px)
- [ ] Dual Heritage artwork blend displays side-by-side
- [ ] Both Coronation and Omo-Oba visible
- [ ] Screen blend mode creates ethereal effect
- [ ] Text readable over artwork
- [ ] Logo centered and prominent
- [ ] CTA button visible and hoverable
- [ ] No layout breaks or overflow

#### Tablet (768px - 1024px)
- [ ] At 1024px: Still shows dual images
- [ ] Below 1024px: Switches to single image (Coronation)
- [ ] Grid transitions smoothly
- [ ] Text remains readable
- [ ] Logo scales appropriately
- [ ] CTA button accessible

#### Mobile (375px)
- [ ] Single Coronation image displays
- [ ] Image fills viewport appropriately
- [ ] Text is centered and readable
- [ ] Font sizes scale down with `clamp()`
- [ ] No horizontal scroll
- [ ] Touch targets (button) are 44px+ minimum
- [ ] Spacing feels balanced

#### Mobile (425px)
- [ ] Same checks as 375px
- [ ] Verify text doesn't overlap
- [ ] Logo scales correctly

---

### Phase 2: Animation Performance

- [ ] Spring entrance plays smoothly on desktop
- [ ] Animations complete without jank
- [ ] Mobile animations are fluid (60fps where possible)
- [ ] `prefers-reduced-motion` disables all animations
- [ ] Lower-end device test (if available)

---

### Phase 3: Image Optimization

- [ ] artwork_0050.webp loads quickly
- [ ] artwork_0042.webp loads quickly
- [ ] No Cumulative Layout Shift (CLS) when images load
- [ ] Images are properly optimized for web

---

### Phase 4: Browser Compatibility

Desktop Browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari

Mobile Browsers:
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile

---

## Option B: Expand the Story

- [ ] Ecosystem section matches hero quality
- [ ] Illustrations carousel feels premium
- [ ] Footer is cohesive
- [ ] Color system consistent throughout
- [ ] Motion language uniform across sections
- [ ] Typography hierarchy maintained

---

## Option C: Ship It

- [ ] All Option A tests pass
- [ ] All Option B audits complete
- [ ] Build compiles with 0 errors
- [ ] Performance is acceptable
- [ ] Ready for production deployment

---

## Test Results

### Desktop (1440px)
Status: ✅ PASS
Notes: 
- Dual blend looks stunning
- Text readable
- Animations smooth

### Tablet (1024px)
Status: 🔍 TESTING
Notes:

### Tablet (768px)
Status: 🔍 TESTING
Notes:

### Mobile (425px)
Status: 🔍 TESTING
Notes:

### Mobile (375px)
Status: 🔍 TESTING
Notes:

### Animation Performance
Status: 🔍 TESTING
Notes:

### Image Loading
Status: 🔍 TESTING
Notes:

### Browser Compatibility
Status: 🔍 TESTING
Notes:
