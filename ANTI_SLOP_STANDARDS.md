# Anti-AI-Slop Standards for Viera Amber

**Core Principle:** Every design decision must be intentional, craft-first, and grounded in real brand strategy. No generic trends, no "because it looks cool," no copy-paste aesthetics.

---

## 🚫 What We Never Do

### Design Patterns (BANNED)
- [ ] Centered hero with dark mesh gradient (the #1 LLM default)
- [ ] Three equal feature cards (lazy layout)
- [ ] AI-purple gradients on everything
- [ ] Glassmorphism without purpose
- [ ] Infinite-loop micro-animations (decoration-only)
- [ ] Generic "modern SaaS" aesthetic
- [ ] Bento grids just because Apple does them
- [ ] Serif fonts "because creative"
- [ ] Mixed-family typography (serif word in sans headline)

### Color (BANNED)
- [ ] AI-purple (#7C3AED, #A78BFA) as default accent
- [ ] Neon gradients with no context
- [ ] Warm beige + brass + espresso (premium brand cliché)
- [ ] Gray-on-gray text (pretending to be "sophisticated")
- [ ] Rainbow gradients
- [ ] Unsaturated pastels masquerading as minimalism

### Typography (BANNED)
- [ ] Inter as default sans (use Geist, Outfit, Cabinet Grotesk first)
- [ ] Fraunces or Instrument Serif (LLM favorites)
- [ ] Mixed font weights for "emphasis" instead of italic/bold
- [ ] Text smaller than 12px body
- [ ] Line-height under 1.5 for readability
- [ ] Serif fonts without explicit brand requirement
- [ ] Placeholder-as-label in forms

### Interactions (BANNED)
- [ ] Animations that serve no purpose
- [ ] Hover-only interactions (no mobile equivalent)
- [ ] Smooth scroll animations that distract
- [ ] Staggered list animations over 300ms
- [ ] Loading spinners everywhere (reserve for >1s waits)
- [ ] Parallax that causes motion sickness
- [ ] Touch interactions that don't match tap feedback

### Components (BANNED)
- [ ] Cards when a divider would work
- [ ] Buttons with no clear visual hierarchy
- [ ] Icon-only controls without labels
- [ ] Form inputs without visible labels
- [ ] Toasts that auto-dismiss with critical info
- [ ] Modals for non-critical confirmations
- [ ] Tooltip-dependent UI

### Copy (BANNED)
- [ ] "Seamlessly integrate"
- [ ] "World-class"
- [ ] "Cutting-edge"
- [ ] "Synergy"
- [ ] "AI-powered" (unless literally true)
- [ ] "Innovative solutions"
- [ ] Placeholder lorem ipsum in demos
- [ ] Generic CTAs ("Click here")

---

## ✅ What We DO Instead

### 1. Start with Product Truth
**Before any design:**
- [ ] What does this product actually do?
- [ ] Who uses it? What's their context?
- [ ] What problem does it solve? (Specific, not generic)
- [ ] What's the business model? (Informs UX)
- [ ] What's already winning in this space?

**Then:** Design serves the product, not the other way around.

### 2. Read the Room (Design Read)
Every project gets a **one-line design read** before any code:

Example reads:
- *"B2B SaaS landing for technical procurement → Linear-clean + Geist + restrained motion"*
- *"Solo designer portfolio for hiring managers → editorial + kinetic type + native CSS"*
- *"VIVA fashion DTC → luxury + burgundy/gold + Cormorant serif + high craft"*

**Never:** default to trendy aesthetic. Always: infer from brief.

### 3. Establish Dials (Not Presets)
Every surface gets three configurable dials:

```
DESIGN_VARIANCE:  1 (perfect symmetry) ←→ 10 (artsy chaos)
MOTION_INTENSITY:  1 (static) ←→ 10 (cinematic)
VISUAL_DENSITY:   1 (gallery) ←→ 10 (cockpit)
```

**Example for VIVA:**
- Variance: 7 (brand-confident, not experimental)
- Motion: 5-6 (premium feel, not excessive)
- Density: 3 (luxury whitespace, not cramped)

**These lock decisions.** Don't override them for trends.

### 4. Honor the Brief
**If the brief says:**
- "Minimalist" → Variance 5-6, density 2-3 (not: add gradients)
- "Luxury" → Match existing brand palette (not: remake it)
- "Trust-first" → Clarity > decoration (not: fancy animations)

**Rule:** The brief wins. Your taste loses.

### 5. One Design System Per Project
Pick ONE foundation, commit fully:

| Product | Foundation | Why Not Others |
|---------|-----------|-----------------|
| VIVA (DTC luxury) | Custom CSS + Tailwind | No pre-built system fits luxury brand |
| VAGIN (B2B dashboard) | shadcn/ui + Tailwind | Works, you own the code, easy to customize |
| STEAM (community platform) | Custom monorepo design | Unique brand, modular needs |

**Don't:** Mix Fluent UI components with custom CSS. Use one system fully.

### 6. Responsive with Intent
**Not:** "Let's make it responsive" (lazy)
**Instead:** Define exact breakpoints + behavior

```
Mobile:   320–640px  (single column, touch-first)
Tablet:   641–1024px (transition state, hybrid)
Desktop:  1025px+    (full features, hover states)
```

**Use:** `clamp()` for fluid scaling, not magic numbers.

### 7. Craft > Trends
Every decision must answer: **"Why this, not that?"**

**Bad reasoning:**
- "It's trending"
- "Looks cool"
- "Everyone else does it"
- "It's modern"

**Good reasoning:**
- "Aligns with brand personality"
- "Solves specific UX problem"
- "Matches existing system"
- "Users need this feedback"
- "Improves accessibility"
- "Supports the product goal"

---

## 🎨 Anti-Slop Checklist (Before Shipping)

### Visual Design
- [ ] Can I articulate WHY every color was chosen?
- [ ] Does this match the brief's aesthetic, not a trend?
- [ ] Are all interactive elements ≥44×44px?
- [ ] Is there intentional negative space (not gaps)?
- [ ] Does typography hierarchy serve content priority?
- [ ] Are animations purposeful (not decorative)?
- [ ] Does dark mode work (not just inverted)?

### Code Quality
- [ ] No inline styles with magic numbers
- [ ] Color/spacing/type in CSS variables (not raw hex)
- [ ] Responsive units (clamp, %, em) not fixed px
- [ ] Semantic HTML (not div soup)
- [ ] Accessible to keyboard + screen readers
- [ ] No unnecessary libraries (one system, not five)

### Product Alignment
- [ ] Does this solve a real user problem?
- [ ] Is the flow intentional (not assumed)?
- [ ] Does the design ladder to business goals?
- [ ] Can we articulate the value prop clearly?
- [ ] Does it differentiate, not imitate?

### Accessibility
- [ ] WCAG AA minimum (4.5:1 contrast)
- [ ] Keyboard navigation works end-to-end
- [ ] Focus states are visible
- [ ] Forms have labels (not placeholders)
- [ ] Motion respects prefers-reduced-motion
- [ ] Touch targets meet 44×44px standard

---

## 🔍 AI-Slop Red Flags (Stop & Reconsider)

If you see these, question the choice:

- **"It's minimal"** but has no purpose
- **"It's premium"** but looks like every luxury site
- **"It's modern"** but could be from any year
- **"It's clean"** but has zero personality
- **"It's simple"** but loses necessary info
- **Copy-paste components** from trending designs
- **Animations that distract** from content
- **Colors chosen because they're "in"** not because they fit
- **Layout that looks cool** but breaks on real content
- **Gradient on everything** to hide weak design

---

## 📋 Pre-Ship Accountability

Before any feature goes live, run this:

### Is It Intentional?
```
[ ] Can I explain the design read?
[ ] Can I defend every color choice?
[ ] Can I articulate the user problem it solves?
[ ] Can I name the design system / pattern source?
[ ] Would this design work without motion/color?
```

### Is It Accessible?
```
[ ] Keyboard navigable end-to-end?
[ ] Screen reader reads all content?
[ ] Contrast meets WCAG AA?
[ ] Touch targets ≥44×44px?
[ ] Reduced motion respected?
```

### Is It Responsive?
```
[ ] Works 320px–1920px without horizontal scroll?
[ ] Typography scales fluidly (clamp)?
[ ] Touch targets scale, don't shrink?
[ ] Layout adapts to content, not breaks?
```

### Is It On-Brand?
```
[ ] Matches VIVA's burgundy/gold/serif?
[ ] Maintains existing component library?
[ ] Respects editorial voice?
[ ] Aligns with luxury positioning?
```

---

## 🎯 VIVA-Specific Anti-Slop Standards

### Color
- ✅ Burgundy #6E0025 (authentic, not trendy)
- ✅ Gold #D4AF37 (accent with purpose)
- ✅ Alabaster #FAF9F6 (luxury whitespace)
- ❌ NO purples, teals, or trendy accents
- ❌ NO gray-on-gray (lost in translation)

### Typography
- ✅ Cormorant Garamond (display, serif, luxury)
- ✅ DM Sans (body, clean, readable)
- ❌ NO random serif swaps
- ❌ NO placeholder-as-label
- ❌ NO truncated text (wrap instead)

### Components
- ✅ Cards for products (contextual grouping)
- ✅ Buttons with clear hierarchy (primary/secondary)
- ✅ Forms with visible labels + validation
- ❌ NO icon-only buttons
- ❌ NO hover-only interactions
- ❌ NO modal spam

### Spacing
- ✅ Generous whitespace (luxury brand)
- ✅ clamp() scaling across breakpoints
- ✅ Intentional gaps between sections
- ❌ NO cramped mobile layouts
- ❌ NO inconsistent spacing

### Motion
- ✅ Framer Motion for state transitions (150-300ms)
- ✅ Smooth hover feedback on desktop
- ✅ Touch feedback on mobile
- ❌ NO infinite loops
- ❌ NO parallax
- ❌ NO animations >500ms

---

## 🚀 Development Workflow

**Every feature follows this:**

1. **Define:** What's the real problem?
2. **Brief:** Write one-line design read
3. **Audit:** Check against anti-slop standards
4. **Design:** Create with intent (not trends)
5. **Build:** Semantic HTML + CSS variables + responsive units
6. **Test:** Keyboard, screen reader, 44×44px targets
7. **Review:** Can I defend every choice?
8. **Ship:** Only when anti-slop checklist is 100% checked

---

## 📖 References (Trustworthy, Not Trendy)

- **Apple HIG** (platform idioms, real accessibility)
- **Material Design** (thoughtful motion, accessible colors)
- **GOV.UK Frontend** (clarity, simplicity, purpose)
- **Linear** (restrained aesthetic, intentional craft)
- **Your VIVA brand guidelines** (the source of truth)

**Avoid:** Dribbble, Awwwards, trending design blogs (often beautiful, rarely craft-first).

---

## The Bottom Line

**AI Slop = Making things because they look cool, not because they work.**

**Anti-Slop = Every pixel, color, animation, interaction serves the product and user.**

Before shipping anything on Viera Amber:
- ✅ Ask: "Why this?"
- ✅ Defend: "For this reason"
- ✅ Verify: "It works for everyone"

If you can't answer all three, iterate until you can.

**No shortcuts. No trends. No slop. Just craft.**
