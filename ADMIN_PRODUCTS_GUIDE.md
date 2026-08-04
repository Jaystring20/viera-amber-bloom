# Product Management System Guide

## Overview

The VIVA product management system combines:
- **Admin Dashboard** for managing products (CRUD operations)
- **AI-Powered Enhancement** to generate rich product descriptions
- **Supabase Integration** for persistent data storage
- **Real-time Sync** between admin changes and frontend display

## Setup Instructions

### 1. Create Supabase Table

Connect to your Supabase project and run this SQL:

```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic info
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('garment', 'print')),
  badge TEXT NOT NULL,
  
  -- Images
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  
  -- Pricing
  price_ngn BIGINT NOT NULL,
  price_usd INTEGER NOT NULL,
  
  -- Descriptions
  description TEXT NOT NULL,
  full_description TEXT,
  materials TEXT,
  care_instructions TEXT,
  
  -- Fashion e-commerce details
  size_guide TEXT,
  style_notes TEXT,
  occasions TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  fit_details TEXT,
  ai_enhanced BOOLEAN DEFAULT false,
  
  -- Metadata
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX products_type_idx ON products(type);
CREATE INDEX products_active_idx ON products(active);
CREATE INDEX products_sort_idx ON products(sort_order);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### 2. Set Up Authentication

Create RLS policies:

```sql
-- Policy: Anyone can read active products
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (active = true);

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admin manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');
```

### 3. Ready to Use

Your product management system is now ready!

> **AI Enhancement (Pending):** Claude API-based description enhancement is planned for a future release. You can manually write rich product descriptions now, or we can enable AI-powered generation later.

### 4. Update Frontend

The frontend automatically:
- Fetches products from Supabase on load
- Falls back to hardcoded data if Supabase is unavailable
- Subscribes to real-time updates
- Syncs changes immediately across all tabs

## Features

### Admin Dashboard (`/admin/products`)

#### Create New Product
1. Click "New Product" button
2. Fill in required fields:
   - Title, Subtitle, Type (Garment/Print)
   - Badge (e.g., "Made to Order", "Limited")
   - Images (comma-separated URLs)
   - Pricing (NGN & USD)
   - Short description

3. (Optional) Add detailed fields:
   - Full Description
   - Materials
   - Care Instructions
   - Fit Details

#### Edit Product
1. Click the Edit (pencil) icon
2. Update fields
3. Click "Save Product"

#### AI Enhancement
1. Click the Sparkles icon on any product
2. AI analyzes the product and generates:
   - Rich full description
   - Detailed materials composition
   - Care instructions
   - Fit details and sizing
   - Style recommendations
   - Occasions for wearing
   - Color palette

#### Delete Product
1. Click the Trash icon
2. Confirm deletion

#### Product Details
- Click the Chevron (down arrow) to expand and see all details
- View description, materials, and care information in detail view

### Product Detail Modal

When users click a product image on the frontend:
- Opens full-screen detail modal
- Shows image carousel with all product photos
- Displays AI-enhanced descriptions
- Shows materials and care instructions
- Lists occasions and styling tips
- Offers "Add to Cart" and "Try On" options

## Data Schema

### Database Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Product name |
| `subtitle` | TEXT | Collection/line info |
| `type` | TEXT | 'garment' or 'print' |
| `badge` | TEXT | "Made to Order", "Limited", "Edition / 30" |
| `images` | TEXT[] | Array of image URLs |
| `price_ngn` | BIGINT | Price in Nigerian Naira |
| `price_usd` | INTEGER | Price in US Dollars |
| `description` | TEXT | One-line description |
| `full_description` | TEXT | 2-3 paragraph story (AI-generated) |
| `materials` | TEXT | Fabric composition (AI-enhanced) |
| `care_instructions` | TEXT | Care steps (AI-generated) |
| `size_guide` | TEXT | Sizing information |
| `style_notes` | TEXT | Styling tips and pairing ideas |
| `occasions` | TEXT[] | Array of occasions |
| `colors` | TEXT[] | Array of colors/tones |
| `fit_details` | TEXT | Fit notes and body type info |
| `ai_enhanced` | BOOLEAN | Marked true after AI enhancement |
| `featured` | BOOLEAN | Highlight on homepage |
| `active` | BOOLEAN | Show on frontend (default true) |
| `sort_order` | INTEGER | Display order |

## Frontend Integration

### Using Products in Components

```typescript
import { useProducts } from "@/hooks/useProducts";

const MyComponent = () => {
  const fallbackProducts = [ /* hardcoded data */ ];
  const { products, loading, error } = useProducts(fallbackProducts);

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.desc}</p>
          {/* Display product details */}
        </div>
      ))}
    </div>
  );
};
```

### Real-time Updates

Products update automatically in real-time when:
- You create a new product in admin panel
- You edit a product (all tabs sync instantly)
- You delete a product (removed from all displays)
- You enhance with AI (enriched details appear immediately)

## AI Enhancement (Pending Feature)

AI-powered product description enhancement is planned for a future release.

When implemented, it will use Claude 3 Sonnet to:
1. Analyze the current product description and metadata
2. Generate compelling 2-3 paragraph full descriptions
3. Create specific materials composition details
4. Write detailed care instructions (3-5 steps)
5. Suggest fit details and sizing information
6. Provide styling notes and pairing recommendations
7. Identify occasions perfect for the piece
8. Extract dominant colors from descriptions

### Planned AI Capabilities

The AI will be instructed to:
- Use sophisticated, aspirational language
- Emphasize craftsmanship and quality
- Focus on the wearer's empowerment
- Use the brand voice: "For her, by her"
- Include sustainability/ethical notes when relevant
- Make it feel premium and exclusive

## Best Practices

### Product Creation
1. **Start with good images** - Use 2-3 high-quality photos per product
2. **Write compelling short description** - Make users want to learn more
3. **Use consistent badging** - "Made to Order", "Limited", "Edition / 30"
4. **Price accurately** - Double-check NGN/USD conversion
5. **Add rich details** - Write full descriptions, materials, care instructions

### Product Editing
1. **Update all fields** - Incomplete data affects frontend display
2. **Fix typos promptly** - Changes sync in real-time
3. **Improve descriptions** - Enhance with more details over time
4. **Test on mobile** - Ensure content displays well

### Image Management
1. **Use optimized images** - WebP format, ~300KB each
2. **Maintain consistent dimensions** - 3:4 aspect ratio for garments
3. **Multiple angles** - Show front, side, detail for garments
4. **Use CDN paths** - Store images in `/public` or CDN

## Troubleshooting

### Products Not Syncing
- Check Supabase connection in browser console
- Verify RLS policies are correct
- Ensure `active = true` on products
- Hard refresh browser (Ctrl+Shift+R)

### Images Not Loading
- Verify image URLs are correct
- Check URLs are accessible from frontend
- Ensure paths use `/` not `\`
- Use absolute URLs for external images

### Admin Dashboard Access
- Product admin page is at `/admin/products`
- Currently unprotected - should add auth
- Consider adding role-based access control

## Future Enhancements

1. **AI-Powered Descriptions** - Claude API integration for rich descriptions and metadata generation
2. **Admin Authentication** - Require login for `/admin/products`
3. **Batch Operations** - Edit multiple products at once
4. **Image Upload** - Upload images directly to Supabase Storage
5. **Audit Logs** - Track who changed what and when
6. **Product Variants** - Support size/color options
7. **Inventory Tracking** - Stock levels per product
8. **SEO Optimization** - Meta descriptions, keywords

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase credentials
3. Test with fallback data (disable Supabase query)
4. Review Supabase logs for database errors
5. Consult this guide's troubleshooting section
