# Week 1 — Admin Dashboard Notes

Hey! Here's a quick overview of how I approached this task and a few things worth knowing.

---

## Design & UI

The color palette and overall visual direction was inspired by boards I found on **Pinterest** — specifically modern SaaS dashboards with navy sidebars and clean white content areas. Went with `#1e2a4a` for the sidebar and a blue primary (`#2563eb`) for active states and accents. Kept the cards minimal with light shadows so the data stands out.

---

## Development Process

Used **AI Agents** for documentation assistance and debugging at a few points during the build. Four specific scenarios where it came in handy:

1. **Sidebar mobile drawer not closing on route change** — the overlay was stacking on top of the backdrop blur, took a bit to figure out the z-index layering.
2. **SVG donut chart slices misaligned** — the arc calculation for the last slice was leaving a visible gap due to floating point rounding.
3. **Next.js App Router error: "Event handlers cannot be passed to Client Component props"** — forgot to add `"use client"` to `QuickActions.jsx` and `UserProfile.jsx` since they use `onMouseEnter` handlers.
4. **Tailwind v4 `@theme inline` not applying CSS variables** — had to switch to plain CSS custom properties for the design tokens since Tailwind v4's theming API changed from v3.

---

## Extras I Added

- **Basic GSAP animation** — I'd learnt GSAP previously so added a subtle fade-in on the stats cards on load. Felt natural to apply it here.
- **Mock data** in `src/lib/data.js` — added realistic names, amounts, order IDs, and activity entries so the UI actually looks like a working product rather than empty placeholders.
- **SVG-only charts** — no external chart library needed. The sales line chart and category donut are built with plain SVG so there's zero extra dependency weight.

---

## Folder Structure

```
src/
  app/           → pages + global styles
  components/
    layout/      → Sidebar, TopNavbar, DashboardLayout
    dashboard/   → StatsCard, ActivityTable, Charts, Panels
    ui/          → Icons
  lib/           → data.js (mock data)
```

That's pretty much it — feel free to reach out if anything needs clarification! 🙌
