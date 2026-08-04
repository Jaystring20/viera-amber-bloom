# Product Management System - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Create Supabase Table (2 minutes)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **SQL Editor**
3. Click **+ New Query**
4. Copy and paste this SQL:

```sql
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('garment', 'print')),
  badge TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  price_ngn BIGINT NOT NULL,
  price_usd INTEGER NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  materials TEXT,
  care_instructions TEXT,
  size_guide TEXT,
  style_notes TEXT,
  occasions TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  fit_details TEXT,
  ai_enhanced BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS products_type_idx ON products(type);
CREATE INDEX IF NOT EXISTS products_active_idx ON products(active);
CREATE INDEX IF NOT EXISTS products_sort_idx ON products(sort_order);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Public read active" ON products
  FOR SELECT USING (active = true);

-- Admin policy (for now, allows authenticated users)
CREATE POLICY "Admin manage" ON products
  FOR ALL USING (auth.role() = 'authenticated');
```

5. Click **Run** ✓

### Step 2: Done! (2 minute setup complete)

That's it! You're ready to start managing products.

> **Note:** AI-powered description enhancement is currently pending. You can manually write rich descriptions, or we can integrate Claude API enhancements later.

---

## 📝 Using the Admin Dashboard

### Access Admin Panel
- **URL:** `http://localhost:5173/admin/products`
- Currently unprotected (add auth as needed)

### Dashboard Features

#### 1. **Quick Stats**
- Total products count
- Garments vs Prints breakdown
- AI Enhanced count
- Featured items count

#### 2. **Search & Filter**
- **Search:** Find products by title
- **Type Filter:** Garments, Prints, or All
- **Status Filter:** Active, Inactive, or All
- **Sort:** By created date, title, or price

#### 3. **Manage Products**
- **New Product:** Click "+ New Product" button
- **Edit:** Click pencil icon → Save
- **Delete:** Click trash icon → Confirm
- **Expand:** Click chevron for full details

#### 4. **Product Details**
- Write rich descriptions manually
- Add materials and care information
- Describe fit details and styling notes
- Include color palette and occasions
- All editable in the product form

#### 5. **Export**
- Click **Copy icon** to export product JSON
- Great for backups or migrations

---

## 🎨 Adding Your First Product

### Quick Example: "The Heritage" Garment

1. Click **+ New Product**
2. Fill in basic info:
   - **Title:** The Heritage
   - **Type:** Garment
   - **Subtitle:** Look 01 · Batya Collection
   - **Badge:** Made to Order

3. Add images (comma-separated):
   ```
   /viva/look-1.webp, /viva/look-2.webp, /viva/look-3.webp
   ```

4. Set pricing:
   - **NGN:** 180000
   - **USD:** 115

5. Write description:
   > Olive woven kimono · wide-leg pleated denim · gold cuffs. Bespoke fit, made to your measurements.

6. (Optional) Add more details:
   - Full description (2-3 paragraphs)
   - Materials composition
   - Care instructions
   - Fit details and sizing

7. Click **Save Product** ✓

8. Done! Product appears on VIVA page instantly

---

## 🔄 Real-Time Sync

### How It Works

```
Admin Creates Product
   ↓ Saves to Supabase
   ↓ Real-time subscription triggers
   ↓ Frontend hook updates
   ↓ Product appears on VIVA page
   ↓ (No refresh needed!)
```

### Features
- ✅ Changes sync in real-time
- ✅ Multiple browser tabs stay synced
- ✅ No page refresh required
- ✅ Instant product modal updates
- ✅ Image carousel available immediately

---

## 🤖 AI Enhancement (Pending Feature)

### Coming Soon

AI-powered product description enhancement is planned for a future release. When implemented, it will use Claude API to generate:

1. **Full Description** (2-3 paragraphs)
   - Tells the product story
   - Fashion e-commerce best practices
   - Aspirational language

2. **Materials** (detailed composition)
   - Fabric types and percentages
   - Ethical sourcing notes
   - Quality indicators

3. **Care Instructions** (step-by-step)
   - Washing guidelines
   - Drying recommendations
   - Storage tips

4. **Fit Details**
   - Sizing information
   - Body type fit
   - Length/width notes

5. **Style Notes**
   - Pairing suggestions
   - Layering ideas
   - Occasion recommendations

6. **Occasions** (array)
   - Daily wear
   - Evening events
   - Special occasions

7. **Color Palette** (extracted)
   - Dominant colors
   - Tone families
   - Versatility notes

### Example Output

```json
{
  "full_description": "The Heritage silhouette celebrates structured fluidity...",
  "materials": "100% premium cotton kimono · 98% organic cotton denim...",
  "care_instructions": "1. Hand wash in cold water\n2. Use gentle detergent\n3. Air dry...",
  "fit_details": "Designed for true-to-size fit with room for layering...",
  "style_notes": "Perfect for elevated casual or professional settings...",
  "occasions": ["Daily wear", "Office", "Evening events"],
  "colors": ["Olive", "Khaki", "Gold accents"]
}
```

---

## 📊 Product Data Schema

| Field | Type | Purpose |
|-------|------|---------|
| `title` | Text | Product name |
| `subtitle` | Text | Collection info (e.g., "Look 01 · Collection") |
| `type` | Select | "garment" or "print" |
| `badge` | Text | "Made to Order", "Limited", "Edition / 30" |
| `images` | Array | URLs to product photos |
| `price_ngn` | Number | Price in Nigerian Naira |
| `price_usd` | Number | Price in US Dollars |
| `description` | Text | One-line teaser |
| `full_description` | Text | Rich 2-3 paragraph story (AI-generated) |
| `materials` | Text | Fabric composition (AI-enhanced) |
| `care_instructions` | Text | Care steps (AI-generated) |
| `fit_details` | Text | Sizing and fit notes |
| `style_notes` | Text | Styling tips (AI-generated) |
| `occasions` | Array | Perfect use cases |
| `colors` | Array | Dominant colors (AI-extracted) |
| `featured` | Toggle | Show on homepage |
| `active` | Toggle | Visible to users |
| `ai_enhanced` | Toggle | Auto-marked after AI enhancement |
| `sort_order` | Number | Display order |

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Supabase table created successfully
- [ ] Edge function deployed (no errors)
- [ ] ANTHROPIC_API_KEY set in environment
- [ ] Can access `/admin/products` dashboard
- [ ] Can create a test product
- [ ] Product appears in dashboard grid
- [ ] Can click Sparkles to AI-enhance
- [ ] Product appears on VIVA page instantly
- [ ] Image carousel works with multiple photos
- [ ] Detail modal opens when clicking product

---

## 🐛 Troubleshooting

### Products Not Appearing

**Check:**
1. Is `active = true` on the product?
2. Did you refresh the page? (Try Ctrl+Shift+R)
3. Check browser console for errors
4. Verify Supabase connection works

**Fix:**
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### AI Enhancement Fails

**Check:**
1. Is ANTHROPIC_API_KEY set in Supabase?
2. Does your Claude account have quota?
3. Check browser console for error details

**Fix:**
- Verify API key is correct (starts with `sk-ant-`)
- Check [Anthropic Console](https://console.anthropic.com) for usage
- Try again - it's resilient and retries

### Images Not Loading

**Check:**
1. Are image URLs correct?
2. Are URLs absolute (with http/https)?
3. Are URLs accessible from the browser?
4. Do paths use `/` not `\`?

**Fix:**
- Use absolute paths: `/viva/look-1.webp`
- Test URL in new browser tab
- Ensure images are < 5MB each

---

## 🎯 Next Steps

### Day 1: Setup
- [ ] Create Supabase table
- [ ] Deploy edge function
- [ ] Set ANTHROPIC_API_KEY

### Day 2: Populate
- [ ] Create 5-10 test products
- [ ] AI-enhance all products
- [ ] Test product detail modals
- [ ] Verify carousel with multiple images

### Day 3: Refine
- [ ] Add product descriptions
- [ ] Organize into collections
- [ ] Set featured items
- [ ] Test on mobile

### Day 4+: Optimize
- [ ] Add authentication for admin panel
- [ ] Create batch import from CSV
- [ ] Set up product analytics
- [ ] Enable image uploads

---

## 💡 Pro Tips

### Batch Operations
To manage multiple products efficiently:
1. Use sort/filter to find related items
2. Edit one, copy JSON
3. Paste to spreadsheet for bulk editing
4. Re-import via API (future feature)

### AI Enhancement Tips
- **Better input = Better output**
  - Write detailed short descriptions
  - Include size/style info
  - Mention materials upfront
  - Describe target wearer

- **Re-enhance after updates**
  - If you update description, re-run AI
  - It adapts to new information
  - Creates more accurate details

### Product Organization
- **Sort Order:** Set numbers (0, 10, 20...) for control
- **Featured:** Toggle for homepage promotion
- **Active:** Uncheck to hide temporarily without deleting
- **Type:** Keeps garments and prints organized

---

## 📞 Support

### Common Issues

**"Supabase connection error"**
- Check your Supabase project is active
- Verify internet connection
- Try refreshing browser

**"AI Enhancement takes too long"**
- Claude API can take 10-30 seconds
- Don't refresh during enhancement
- Check browser console for timeout

**"Products don't show on VIVA page"**
- Verify `active = true`
- Check fallback data loads
- Hard refresh browser

### Getting Help
1. Check ADMIN_PRODUCTS_GUIDE.md for details
2. Check browser console for error messages
3. Verify Supabase RLS policies allow access
4. Test with simple product first

---

## 🎉 You're All Set!

Your product management system is ready to:
- ✅ Create unlimited products
- ✅ AI-enhance descriptions automatically
- ✅ Sync changes in real-time
- ✅ Manage pricing (NGN/USD)
- ✅ Upload multiple images
- ✅ Organize by type and status
- ✅ Search and filter efficiently

**Start creating amazing products!** 🚀
