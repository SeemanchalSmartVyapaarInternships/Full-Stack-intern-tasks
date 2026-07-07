# SSC Admin Dashboard Project Documentation

## 1. Task Summary
The objective of this project was to develop a production-grade Admin Dashboard for **SSC**, a modern SaaS platform. The dashboard is designed to provide administrators with a comprehensive overview of key metrics, user activity, revenue generation, and system notifications. It features a responsive layout, a light theme with a striking red accent (`#dc2626`), and a role-based access control (RBAC) UI. 

This project was built using **Next.js 14**, **React**, **Tailwind CSS v3**, and **Recharts** for data visualization, ensuring high performance, scalability, and an exceptional user experience.

---

## 2. Features Implemented

> [!TIP]
> The dashboard was built with a component-driven architecture, ensuring maximum reusability and maintainability.

### 🎨 Design & Layout
*   **Modern Light Theme:** A clean, professional white/gray background paired with SSC's signature red accent color.
*   **Responsive Navigation:** 
    *   A collapsible desktop sidebar for maximum screen real estate.
    *   A fully functional mobile drawer sidebar with a backdrop blur.
    *   A top navbar featuring a global search bar, notification dropdown, and user profile menu.
*   **Dynamic Routing:** Seamless navigation across Overview, Analytics, Users, Orders, Products, Content, and Settings pages.

### 📊 Data Visualization & Metrics
*   **Stats Cards:** Animated counter cards displaying Total Revenue, Active Users, New Orders, and Conversion Rates with sparklines and percentage changes.
*   **Interactive Charts:** 
    *   An interactive Area Chart for Revenue Overview (allowing toggling between revenue, expenses, and profit).
    *   A Bar Chart for Traffic by Channel analytics.
*   **Activity Feeds:** A sortable and filterable Recent Activity table displaying user actions across the platform.

### 🔐 System & User Management
*   **Role-Based UI:** Elements dynamically render based on user roles (Admin, Editor, Viewer). For example, the 'Users' tab is restricted to Admins.
*   **Notification Panel:** A real-time dropdown panel and dedicated widget for system alerts, categorizing them into success, warning, error, and info types.
*   **Settings Management:** Toggle switches and configuration panels for account preferences, notifications, appearance, and security.

---

## 3. Screenshots

Below are visual representations of the implemented dashboard.

### Dashboard Overview
![Dashboard Overview](C:\Users\ACER\.gemini\antigravity\brain\3855011c-5c09-4766-948b-288b3ba829c7\dashboard_overview_1781325684664.png)

### Analytics Page
![Analytics Page](C:\Users\ACER\.gemini\antigravity\brain\3855011c-5c09-4766-948b-288b3ba829c7\analytics_page_1781325752852.png)

---

## 4. API Documentation

While the current version utilizes mocked data for frontend development and UI testing, the architecture is designed to seamlessly integrate with a backend REST or GraphQL API.

### Target Endpoints Structure

> [!NOTE]
> The following endpoints represent the intended backend structure for integration.

| Endpoint | Method | Description | Request Body (Example) |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/user` | `GET` | Fetch current authenticated user details. | N/A |
| `/api/v1/metrics/overview` | `GET` | Retrieve aggregate stats for the overview cards. | N/A |
| `/api/v1/metrics/revenue` | `GET` | Fetch time-series revenue data for charts. | `?period=6m` |
| `/api/v1/activity` | `GET` | Get paginated recent activity logs. | `?page=1&limit=5&filter=all` |
| `/api/v1/notifications` | `GET` | Fetch user notifications. | `?unreadOnly=true` |
| `/api/v1/users` | `GET` | Retrieve all platform users (Admin only). | `?search=vikash` |

### Example Response: `/api/v1/metrics/overview`
```json
{
  "status": "success",
  "data": {
    "revenue": {
      "value": 284592,
      "change": 18.2,
      "trend": "up"
    },
    "activeUsers": {
      "value": 48294,
      "change": 12.5,
      "trend": "up"
    }
  }
}
```

---

## 5. Testing Notes

> [!IMPORTANT]
> The following areas have been manually verified across different viewports and states.

### 📱 Responsive Design Verification
*   [x] **Mobile (320px - 767px):** Desktop sidebar is hidden. Hamburger menu opens the mobile drawer. Tables allow horizontal scrolling. Charts resize correctly.
*   [x] **Tablet (768px - 1023px):** Sidebar collapses to icon-only mode to save space. Grids adjust from 1 column to 2 columns.
*   [x] **Desktop (1024px+):** Full sidebar is visible. Complex grid layouts (e.g., 3-column data tables and side-by-side charts) display optimally.

### 🖱️ Component Interaction
*   [x] **Sidebar Toggle:** Clicking the collapse button smoothly transitions the sidebar width without layout jumps.
*   [x] **Dropdowns:** Profile and Notification dropdowns close automatically when clicking outside the component.
*   [x] **Chart Toggles:** Clicking metrics on the Revenue Chart correctly toggles the visibility of the corresponding area graphs.

### ⚙️ State Management & Logic
*   [x] **Activity Sorting:** Clicking table headers (User, Status, Amount, Time) correctly sorts the data in ascending/descending order.
*   [x] **Pagination:** Next/Previous buttons on the activity table function correctly and disable at boundaries (first/last page).
*   [x] **Role Access:** The `Users` navigation link is successfully hidden when the mocked `currentUser.role` is changed to `viewer`.
*   [x] **Recharts Compatibility:** The `'use client'` directive is correctly applied to chart components to prevent Next.js Server Side Rendering (SSR) crashes.
