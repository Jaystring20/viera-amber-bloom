# VAGIN Dashboard Integration Guide

## Quick Start

The VAGIN dashboard components are ready to use. Here's how to integrate them into your Viera Amber app:

## File Locations

### New Pages Created
- `src/pages/VAGINDashboard.tsx` — Public VAGIN overview page
- `src/pages/VAGINUserDashboard.tsx` — Authenticated user dashboard

### New Components Created
- `src/components/VAGINAuth.tsx` — Authentication (login/signup)

### New Libraries
- `src/lib/supabase.ts` — Supabase client configuration

## Routes to Add

Add these routes to your router configuration:

```typescript
// In your main router file (e.g., src/App.tsx or src/router.tsx)
import VAGINDashboard from "@/pages/VAGINDashboard";
import VAGINUserDashboard from "@/pages/VAGINUserDashboard";

const routes = [
  {
    path: "/vagin",
    component: VAGINDashboard,
    label: "VAGIN"
  },
  {
    path: "/dashboard/vagin",
    component: VAGINUserDashboard,
    label: "VAGIN Dashboard"
  },
  // ... rest of routes
];
```

## Environment Setup

### 1. Create `.env.local` file

```bash
cp .env.example .env.local
```

### 2. Add Supabase Credentials

Get these from: https://supabase.com/dashboard/project/xcwgethymuvxcalxukzy/settings/api

```
VITE_SUPABASE_URL=https://xcwgethymuvxcalxukzy.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Install Dependencies

```bash
bun add @supabase/supabase-js
```

## Database Setup

### Run Migration

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/xcwgethymuvxcalxukzy/sql/new)
2. Create new query
3. Paste contents of `supabase/migrations/01_vagin_schema.sql`
4. Click "Run"

This creates:
- `users` table (linked to auth)
- `vaginart_modules` table (curriculum)
- `user_module_progress` table (tracking)
- `pad_kolo_tracking` table (health/savings)
- `sponsor_profiles` table (sponsor data)
- `sponsorships` table (sponsor-girl relationships)
- `impact_stories` table (testimonials)
- `resources` table (downloadable materials)
- Row-Level Security policies

## Component Structure

### VAGINDashboard (Public Overview)
```
WelcomeSection (Hero)
  ├── Welcome text
  ├── Call-to-action button
  
VaginARTSection
  ├── Curriculum overview
  ├── 4 topic cards with icons
  ├── Glassmorphism styling
  
PadKoloSection
  ├── Program description
  ├── Impact statistics
  ├── Call-to-action
```

### VAGINUserDashboard (Authenticated)
```
VAGINAuth (if not logged in)
  ├── Login form
  ├── Signup form (with user type selection)
  ├── Form validation
  
DashboardHeader (if logged in)
  ├── Welcome message with user name
  ├── Personalized subtitle
  
StatsGrid
  ├── 4 stat cards (different for girls vs sponsors)
  ├── Progress indicators
  ├── Icons and numbers
  
LearningResources (for girls) OR ImpactStories (for sponsors)
  ├── Module cards with progress
  ├── Interactive elements
```

### VAGINAuth Component
```
User Type Selection
  ├── "I'm a Girl" button
  ├── "I'm a Sponsor" button

Login Form
  ├── Email input
  ├── Password input
  ├── Submit button
  ├── Toggle to signup

Signup Form
  ├── Email input
  ├── Password input
  ├── Name input
  ├── Country input (girls only)
  ├── School input (girls only)
  ├── Age input (girls only)
  ├── Organization input (sponsors only)
  ├── Submit button
  ├── Toggle to login
```

## Design Features

### Glassmorphism
All cards use:
- `background: rgba(26, 26, 26, 0.6)`
- `backdropFilter: blur(12px)`
- `border: 1px solid rgba(217, 119, 6, 0.15)`

### Spring Animations
Interactive elements use:
- `type: "spring"`
- `stiffness: 350-400`
- `damping: 20-25`

### Responsive Grid
```
desktop: gridTemplateColumns: "repeat(auto-fit, minmax(240px-280px, 1fr))"
mobile: stacks to single column
```

## User Flow

### For Girls

1. **Registration** (`/dashboard/vagin`)
   - Click "Get Started" button
   - VAGINAuth component opens
   - Select "I'm a Girl"
   - Fill signup form
   - Account created
   - Profile shown

2. **Dashboard**
   - See welcome message with name
   - View stats: modules completed, pads received, savings, attendance
   - Browse VaginART curriculum
   - Click module card to view content
   - Track progress with visual progress bars
   - Download resources

### For Sponsors

1. **Registration** (`/dashboard/vagin`)
   - Click "Become a Sponsor" button
   - VAGINAuth component opens
   - Select "I'm a Sponsor"
   - Fill signup form
   - Account created
   - Sponsor profile shown

2. **Dashboard**
   - See impact metrics: girls supported, pads donated, total contributed
   - View impact stories from girls being supported
   - Track sponsorship status
   - Generate impact reports
   - Manage donations

## Customization Examples

### Change Primary Color
All `#D97706` references → your color

### Modify Stats Cards
Edit `mockStats` in `VAGINUserDashboard.tsx`:
```typescript
const mockStats: DashboardStats = {
  modulesCompleted: 3,
  padsReceived: 24,
  savingsBalance: 45,
  attendanceImprovement: 35,
};
```

### Add More VaginART Topics
Edit `VaginARTSection` topics array:
```typescript
const topics = [
  { icon: "🌸", title: "Your Topic", desc: "Description" },
  // ... more topics
];
```

### Customize Impact Stories
Edit the `stories` array in `ImpactStories` component

## Testing Checklist

- [ ] `.env.local` created with Supabase keys
- [ ] `@supabase/supabase-js` installed
- [ ] Database migration run successfully
- [ ] Routes added to app router
- [ ] Can navigate to `/vagin` page
- [ ] Can navigate to `/dashboard/vagin` page
- [ ] Can sign up as girl
- [ ] Can sign up as sponsor
- [ ] Dashboard loads with user data
- [ ] Stats display correctly
- [ ] Progress bars animate
- [ ] Cards have hover effects
- [ ] Mobile responsive (test at 375px)

## Next Steps

1. **Connect Real Data**
   - Replace `mockStats` with actual database queries
   - Fetch VaginART modules from database
   - Load impact stories from `impact_stories` table

2. **Add Content Management**
   - Admin panel to add VaginART modules
   - Image upload for modules and stories
   - Bulk import capabilities

3. **Enhance Sponsorship**
   - Payment integration (Stripe/PayPal)
   - Recurring donation setup
   - Sponsor dashboard refinements

4. **Add Notifications**
   - Email on new impact stories
   - Push notifications for new resources
   - Sponsor milestone alerts

5. **Analytics & Reporting**
   - Impact dashboard for admins
   - Regional statistics
   - Program effectiveness metrics

## Support

For questions or issues:
1. Check browser console for errors
2. Verify `.env.local` has correct keys
3. Check Supabase RLS policies are correct
4. Review VAGIN_SETUP.md for detailed setup

---

**Built with intention for girls' empowerment. For her, by her.**
