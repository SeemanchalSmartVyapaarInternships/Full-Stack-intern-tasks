# Production-Grade SaaS Admin Dashboard

A full-featured admin dashboard built with **Next.js 14 (App Router)** + **Tailwind CSS v3** — inspired by modern SaaS products like Linear, Vercel, and Planetscale.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Charts**: Recharts
- **Fonts**: Inter (Google Fonts)
- **Theme**: Dark mode by default, with light mode toggle

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (fonts, providers)
│   ├── page.tsx            # Dashboard home → redirects to /dashboard
│   └── dashboard/
│       ├── layout.tsx      # Shell: Sidebar + Navbar wrapper
│       ├── page.tsx        # Overview page
│       ├── users/page.tsx  # Users management page
│       ├── analytics/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── MobileSidebar.tsx
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── ActivityTable.tsx
│   │   ├── NotificationPanel.tsx
│   │   └── UserProfileCard.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Avatar.tsx
│       └── ThemeToggle.tsx
├── contexts/
│   ├── SidebarContext.tsx   # Mobile sidebar open/close
│   └── ThemeContext.tsx     # Dark/Light mode
├── data/
│   └── mock.ts             # All mock data
└── types/
    └── index.ts
```

---

## Component Breakdown

### Sidebar Navigation
- Collapsible on desktop (icon-only mode)
- Full-screen overlay drawer on mobile
- Active route highlighting
- Role badges (Admin / Editor / Viewer)
- Nested nav items with expand/collapse

### Top Navbar
- Breadcrumb trail
- Global search bar (animated)
- Notification bell with unread badge
- User avatar + dropdown menu
- Dark/Light mode toggle

### Dashboard Overview
- Hero greeting with date/time
- 4 stats cards (Revenue, Users, Orders, Conversion)
- Line/Area revenue chart (Recharts)
- Recent Activity Table
- Right-side panel: Notifications + User Profile

### Statistics Cards
- Animated number counters
- Trend indicators (up/down %)
- Sparkline mini-charts
- Color-coded by type

### Recent Activity Table
- Sortable columns
- Status badges
- Pagination
- Row hover effects
- Empty state

### Notification Panel
- Grouped by time (Today, Yesterday)
- Unread dot indicator
- Mark all as read action
- Type icons (alert, success, info)

### User Profile Section
- Avatar with online indicator
- Role badge
- Quick stats (projects, tasks)
- Edit profile button

---

## Responsive Strategy
| Breakpoint | Sidebar | Layout |
|---|---|---|
| Mobile (<768px) | Hidden, drawer on hamburger | Single column |
| Tablet (768–1024px) | Icon-only collapsed | Two column |
| Desktop (>1024px) | Full expanded | Three column |

---

## Color Palette (Dark Theme)
- Background: `#0a0a0f` / `#111118`
- Surface: `#1a1a24` / `#22222e`
- Accent: Violet `#7c3aed` → Purple gradient
- Success: `#10b981`
- Warning: `#f59e0b`
- Danger: `#ef4444`
