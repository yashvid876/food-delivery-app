# FoodDelApp

**A full-stack, multi-role food delivery platform** — connecting customers, restaurants, and delivery agents through a single, real-time order pipeline.

Most food delivery clones stop at "place an order." FoodDelApp goes further, modeling the entire lifecycle of an order — from the moment a customer taps checkout to the second a delivery agent marks it delivered — with role-specific dashboards for everyone involved.

---

## ✨ What It Does

- **Three roles, three experiences** — Customers, Restaurants, and Delivery Agents each get a purpose-built interface instead of one generic dashboard trying to do everything.
- **A real order state machine** — every order moves through a strict, validated pipeline: `pending → confirmed → preparing → ready → picked_up → delivered` (with `cancelled` available at every stage until pickup). Each role can only trigger the transitions that make sense for them.
- **Live delivery marketplace** — once an order hits `ready`, it becomes visible to all available delivery agents, who can claim it. The moment it's accepted, it disappears from the available pool and moves into that agent's active queue — no double-claiming, no stale state.
- **Instant UI feedback** — accepting or completing an order updates the interface immediately via local state changes, backed by an automatic data refresh to stay in sync with the server — so the dashboard never feels laggy or out of date.
- **Delivery agent workspace** — a dedicated dashboard and active-orders view showing available deliveries and current assignments side by side, with manual refresh, clear error handling, and status-aware action buttons that only show what's actually valid to do next.

---

## 🏗️ Architecture

### Frontend — React + React-Bootstrap
- Role-aware routing via an `AuthContext`, so delivery agents, customers, and restaurants only ever see their own tools.
- A clean service layer (`deliveryAPI`, `orderAPI`) separating delivery-agent operations from general order operations.
- Reusable UI primitives — `OrderCard`, `LoadingSpinner` — built once and shared across every dashboard, so status badges, action buttons, and order details stay visually consistent everywhere.
- Defensive UX throughout: dismissible error alerts, loading states, empty states with clear messaging ("No orders available" instead of a blank screen), and refresh affordances so the user is never left guessing whether something worked.

### Backend — Node.js + SQL
- Relational schema across `Orders`, `Restaurant`, `Customer`, and delivery agents, joined to surface human-readable restaurant and customer info alongside every order.
- Delivery-agent queries are scoped precisely: only orders that are `ready` **and** unassigned show up in the available pool, preventing race conditions where two agents see the same claimable order.
- Status transitions are enforced server-side, not just hidden in the UI — so the action buttons and the backend agree on what's a legal next step for any given order.

```
fooddelapp/
├── frontend/
│   └── src/
│       ├── components/ui/       → OrderCard and shared UI primitives
│       ├── pages/delivery/      → Dashboard, ActiveOrders
│       ├── context/             → AuthContext (role-based access)
│       └── services/            → api.js (orderAPI, deliveryAPI)
└── backend/
    └── models/                  → Order.js and related SQL models
```

---

## 🧠 Design Decisions Worth Calling Out

- **Optimistic-then-verified state updates.** When an agent accepts an order, it's removed from the local list *immediately* for a snappy feel, then a background refresh confirms the true server state shortly after — the UI never lies to the user, but it also never makes them wait.
- **Status-driven UI, not role-hardcoded UI.** Action buttons are generated from a `statusFlow` map (`pending → [confirmed, cancelled]`, etc.) rather than a pile of conditionals, so adding a new status or transition is a one-line change, not a rewrite.
- **Iterative UX cleanup.** Early versions included stat cards (total deliveries, earnings, completed today) on the delivery dashboard — these were deliberately removed to keep the focus on *actionable* orders rather than vanity metrics, resulting in a cleaner, more professional interface.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, React-Bootstrap, Context API, Font Awesome |
| Backend | Node.js, SQL (relational schema: Orders, Restaurant, Customer) |
| Core Concepts | Role-based access control, order state machines, optimistic UI updates |

---

## 📊 Core Modules

- **Delivery Dashboard** — available orders + active orders in one view, with live refresh
- **Active Orders** — a focused, split-pane view for agents managing multiple in-flight deliveries
- **Order Card** — the shared building block: status badge, restaurant/customer info, and context-aware action buttons
- **Auth Context** — role gating so customers, restaurants, and delivery agents each land on the right experience

---

## 🚀 Getting Started

```bash
# clone the repo
git clone https://github.com/<your-username>/fooddelapp.git
cd fooddelapp

# backend
cd backend
npm install
npm start

# frontend
cd ../frontend/fooddelapp
npm install
npm start
```

Configure your database connection and API base URLs before running the backend.


