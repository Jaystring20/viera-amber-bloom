# VAGIN Dashboard Setup Guide

## Overview

VAGIN (Viera Amber Girls' Initiative) Dashboard is a comprehensive platform for:
- **Girls**: Access stigma-free sexual and reproductive health education through VaginART
- **Sponsors**: Track impact and support girls through the PAD KOLO program
- **Admins**: Manage content, users, and impact metrics

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Authentication**: Supabase Auth (Email/Password)
- **Database**: PostgreSQL with Row-Level Security

## Setup Instructions

### 1. Supabase Project Setup

Your Supabase project is already created at:
```
https://supabase.com/dashboard/project/xcwgethymuvxcalxukzy
```

#### Step 1a: Run Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/01_vagin_schema.sql`
3. Click "Run" to create all tables and policies

#### Step 1b: Get Your API Keys

1. Go to **Settings → API**
2. Under "Project API keys", copy:
   - `anon` (public) key
   - `service_role` (admin) key

### 2. Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Supabase keys to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xcwgethymuvxcalxukzy.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Install Supabase client:
   ```bash
   bun add @supabase/supabase-js
   ```

### 3. Install Dependencies

```bash
bun install
```

### 4. Start Development Server

```bash
bun run dev
```

## Routes

### Landing Pages
- `/` — Main landing page with VAGIN section
- `/vagin` — VAGIN initiative overview page

### Dashboard
- `/dashboard/vagin` — User dashboard (requires authentication)
  - For girls: Learning modules, progress tracking, health resources
  - For sponsors: Impact tracking, girls supported, contribution overview

## Database Schema

### Core Tables

#### `users`
- Linked to Supabase Auth (`auth.users`)
- Stores user profiles (girls, sponsors, admins)
- Fields: `id`, `email`, `name`, `user_type`, `country`, `school`, `age`

#### `vaginart_modules`
- Curriculum content on sexual/reproductive health
- Topics: puberty, hygiene, safety, mental_health
- Fields: `id`, `title`, `topic`, `content_url`, `duration_minutes`

#### `user_module_progress`
- Tracks which modules each girl has completed
- Fields: `user_id`, `module_id`, `progress_percent`, `completed`

#### `pad_kolo_tracking`
- Menstrual health support and micro-savings data
- Fields: `girl_id`, `pads_received`, `savings_balance`, `attendance_days`

#### `sponsor_profiles`
- Extended sponsor information
- Fields: `id`, `organization_name`, `impact_level`, `total_contributed`

#### `sponsorships`
- Links sponsors to girls they support
- Enables impact tracking per relationship

#### `impact_stories`
- User success stories and testimonials
- Fields: `girl_id`, `title`, `story_text`, `impact_category`

#### `resources`
- Downloadable materials (guides, worksheets, videos)
- Searchable by topic and language

## Authentication Flow

### Girl Registration
1. User selects "I'm a Girl" on signup
2. Fills: Email, Password, Name, Country, School (optional), Age
3. Account created in Supabase Auth
4. User profile created in `users` table with `user_type='girl'`
5. Redirected to dashboard

### Sponsor Registration
1. User selects "I'm a Sponsor" on signup
2. Fills: Email, Password, Name, Organization (optional)
3. Account created in Supabase Auth
4. User profile created in `users` table
5. Sponsor profile created in `sponsor_profiles` table
6. Redirected to sponsor dashboard

## Features by User Type

### For Girls
- ✅ Access VaginART curriculum (4 modules: puberty, safety, hygiene, wellness)
- ✅ Track learning progress with visual progress bars
- ✅ View PAD KOLO impact (health packs received, savings balance)
- ✅ Download resources and guides
- ✅ Submit impact stories
- ✅ View community stories for inspiration

### For Sponsors
- ✅ View overall impact metrics
- ✅ See girls being supported
- ✅ Track contributions and donations
- ✅ Read impact stories from girls
- ✅ Access impact reports by region
- ✅ Renew or pause sponsorships

### For Admins (Future)
- Content management dashboard
- User management
- Report generation
- Analytics and insights

## Security

### Row-Level Security (RLS)
- Girls can only see their own progress and data
- Sponsors can only see girls they support
- Admins will have elevated permissions
- All VaginART modules and resources are publicly readable

### Authentication
- Email + Password authentication via Supabase Auth
- Passwords are hashed and secured
- Session management via Supabase

## Design System

All VAGIN components use the Viera Amber brand identity:

### Colors
- **Primary**: #62017F (VAGIN purple)
- **Accent**: #ED155D (PAD KOLO pink)
- **Gold**: #D97706 (Impact/Warmth)
- **Dark**: #0A0A0A, #050505, #0F172A

### Typography
- **Display**: Font Display (headings)
- **Body**: DM Sans (content)

### Components
- Glassmorphism cards with backdrop blur
- Spring physics animations (Framer Motion)
- Responsive grid layouts
- Accessibility-first (ARIA labels, keyboard nav)

## Customization

### Adding VaginART Modules
1. Go to Supabase → SQL Editor
2. Insert new module:
   ```sql
   INSERT INTO vaginart_modules (title, description, topic, content_url, duration_minutes, order_index)
   VALUES ('Module Title', 'Description', 'puberty', 'https://...', 15, 1);
   ```

### Adding Sponsor Tiers
Edit `src/lib/supabase.ts` to define impact levels:
- Bronze: < $500
- Silver: $500-$1500
- Gold: $1500-$5000
- Platinum: $5000+

### Customizing Dashboard Stats
Edit `src/pages/VAGINUserDashboard.tsx`:
- Modify `mockStats` object to connect to real data
- Update stat card labels and icons
- Adjust grid layouts for different screen sizes

## Deployment

### Build
```bash
bun run build
```

### Preview Production Build
```bash
bun run preview
```

### Deploy to Production
Set environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then deploy:
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy
```

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
bun add @supabase/supabase-js
```

### RLS Policy Errors
- Check user is authenticated: `supabase.auth.getSession()`
- Verify RLS policies are enabled: Settings → Database → RLS
- Check policy conditions match your data

### Module Not Found
- Ensure `.env.local` has correct Supabase URL and key
- Verify `src/lib/supabase.ts` is importing correctly

### Dashboard Blank
- Check browser console for errors
- Verify auth session with: `supabase.auth.getSession()`
- Check if user profile exists in `users` table

## Next Steps

1. ✅ Database schema created
2. ✅ Authentication system built
3. ✅ Dashboard UI created
4. **TODO**: Connect real data to dashboard stats
5. **TODO**: Seed sample VaginART modules
6. **TODO**: Build sponsor onboarding flow
7. **TODO**: Create admin management panel
8. **TODO**: Add impact report generation
9. **TODO**: Implement WhatsApp integration for PAD KOLO distribution

## Support & Contact

For questions about VAGIN dashboard:
- Email: admin@vieraamber.com
- Instagram: @viera_amber

---

**Built with intention for girls' empowerment. For her, by her.**
