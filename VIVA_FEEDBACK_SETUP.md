# VIVA Feedback Carousel - Setup Guide

## 1. Create the Supabase Table

Run this SQL in your Supabase SQL editor to create the feedback table:

```sql
-- Create the viva_feedback table
CREATE TABLE viva_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index on created_at for faster queries
CREATE INDEX idx_viva_feedback_created_at ON viva_feedback(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE viva_feedback ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read (public)
CREATE POLICY "Allow public read access"
  ON viva_feedback
  FOR SELECT
  USING (true);

-- Create a policy to allow anyone to insert (public)
CREATE POLICY "Allow public insert access"
  ON viva_feedback
  FOR INSERT
  WITH CHECK (true);

-- Optionally, if you want to moderate feedback before it appears, 
-- add an 'approved' column and update the SELECT policy:
-- ALTER TABLE viva_feedback ADD COLUMN approved BOOLEAN DEFAULT false;
-- UPDATE the SELECT policy to: USING (approved = true);
```

## 2. Enable Realtime for Live Updates

In Supabase Dashboard:
1. Go to **Replication** → **Publication**
2. Enable replication for the `viva_feedback` table
3. Make sure the following events are enabled:
   - INSERT
   - UPDATE
   - DELETE

## 3. Component Features

✨ **Key Features:**
- Real-time feedback submission form
- Automatic carousel rotation every 5 seconds
- Manual navigation with previous/next buttons
- Star rating system (1-5 stars)
- Responsive design (desktop: side-by-side, mobile: stacked)
- Matches VIVA's burgundy/gold luxury aesthetic
- Framer Motion animations
- Real-time subscription updates (new feedback appears instantly)
- Empty state when no feedback exists

## 4. Integration into VIVA Page

Add this import at the top of `src/pages/VIVA.tsx`:

```typescript
import VIVAFeedbackCarousel from "@/components/sections/VIVAFeedbackCarousel";
```

Then place this component in the VIVA page where you want it to appear (typically before or after the shop section):

```tsx
<VIVAFeedbackCarousel />
```

Example placement in the JSX:
```tsx
{/* After shop section, before enquiry */}
<VIVAFeedbackCarousel />

{/* Enquiry section */}
<section id="viva-enquiry">
  {/* existing enquiry form */}
</section>
```

## 5. Styling Notes

The component uses inline styles that match VIVA's design system:
- **Colors:** Burgundy (#6E0025), Gold (#D4AF37), Alabaster (#FAF9F6)
- **Typography:** Cormorant Garamond for headings, DM Sans for body
- **Spacing:** 80px top/bottom padding on section
- **Shadows:** Subtle shadows (0 4px 20px rgba(110,0,37,0.08))

## 6. Customization Options

If you want to modify the component, here are key variables you can change:

```typescript
// In VIVAFeedbackCarousel.tsx
const BURGUNDY = "#6E0025";          // Primary color
const GOLD = "#D4AF37";               // Accent color
const ALABASTER = "#FAF9F6";          // Background
const CORMORANT = "'Cormorant Garamond', ...";  // Heading font

// Auto-play duration
const autoPlayInterval = 5000;        // Change in useEffect (line ~90)

// Number of feedbacks to fetch
.limit(50)                            // Change in fetchFeedback (line ~45)
```

## 7. Optional: Moderate Feedback

If you want to approve feedback before display, uncomment the moderation section in the SQL setup:

```sql
ALTER TABLE viva_feedback ADD COLUMN approved BOOLEAN DEFAULT false;
```

Then update the SELECT policy:
```sql
-- Allow only approved feedback to be public
CREATE POLICY "Allow approved feedback"
  ON viva_feedback
  FOR SELECT
  USING (approved = true);
```

## 8. Analytics/Admin

To view all feedback (including unapproved), run this query in Supabase:

```sql
SELECT 
  id,
  name,
  comment,
  rating,
  created_at,
  approved
FROM viva_feedback
ORDER BY created_at DESC;
```

## 9. Testing

### Test Real-time Updates:
1. Open the VIVA page in one browser window
2. Submit feedback through the form
3. The carousel should immediately update with the new feedback
4. Try opening multiple windows to see the real-time sync

### Test Auto-play:
1. Load the page
2. Wait 5 seconds to see the carousel auto-advance
3. Click navigation buttons to manually advance
4. Auto-play should pause when you manually navigate

### Test Responsive:
1. Test on desktop (two-column layout)
2. Test on tablet/mobile (stacked layout)
3. Verify button sizes meet accessibility requirements (min 44px)

## 10. Performance Notes

- Fetches limited to 50 recent feedbacks
- Real-time subscription updates only on INSERT events
- Lazy loads feedback carousel on page view
- Optimized animations with Framer Motion

## Next Steps

1. Run the SQL migration in Supabase
2. Add the component to VIVA.tsx
3. Test with your development environment
4. Deploy when ready

For questions, refer to the component code at:
`src/components/sections/VIVAFeedbackCarousel.tsx`
