# 🍕 Pizza Frontend (Next.js + Tailwind + TypeScript)

**Live demo / Repo:** [https://next-pizza-black.vercel.app/](https://next-pizza-black.vercel.app/)

This is the **frontend** for a full-stack pizza ordering platform, built using **Next.js App Router** and fully powered by a custom **Express backend**. It includes a modern, responsive UI, real-time filtering, cart + order system, and advanced authentication (custom JWT + Google Login).

> ⚠️ **Note:** The backend server may take up to **10 seconds** to respond on the first request due to cold start (hosted on a free-tier server). Please be patient during the initial load.

---

## 💎 My Best & Hardest Project

This is the **biggest, most challenging, and most complete project** I’ve built to date. It includes everything from authentication, state management, API integration, user experience, and data modeling — and taught me how to connect every layer of a real-world full-stack app.

I've built both the **frontend and backend** from scratch and connected every piece myself.

---

## ✨ Key Features

### 🔐 Authentication
- ✅ JWT-based login & signup
- 🔁 Auto login via token refresh
- 🔐 **Google OAuth Login** with `@react-oauth/google`
- 🧩 Multi-step registration form (email → password → confirm)

### 🍕 Pizza Catalog
- All data loaded from **Express backend**
- Each pizza supports:
  - Selectable **size** and **dough**
  - Toggleable **ingredients**
  - Add **additional ingredients**
  - Live price updates based on selection

### 🔍 Filters + Search
- Filters: price & ingredients
- **Connected to backend** — only show pizzas that match
- Fully synced with `useSearchParams` (URL reflects filter state)
- Instant, client-side UI update on filter change

### 🛒 Shopping Cart & Orders
- Add/remove/update items in real time
- **Global cart state** via Zustand
- Cart persists through navigation
- Order page with:
  - Cart review
  - User contact info

### 💬 UX Features
- Beautiful toast notifications with **Sonner**
- Loading bar via `next-nprogress-bar`
- Smooth UX even when the backend is sleeping
- Clean transitions, consistent layout, and error handling

---

## 🧰 Tech Stack

| Tool / Library        | Purpose                                      |
|------------------------|----------------------------------------------|
| **Next.js**            | App Router, SSR, Routing                     |
| **TypeScript**         | Type-safe codebase                           |
| **Tailwind CSS**       | Styling + design system                      |
| **Zustand**            | Global state (auth, cart, UI)                |
| **TanStack Query**     | API data caching + mutations                 |
| **Axios**              | API requests                                 |
| **Zod**                | Schema validation for forms                  |
| **Sonner**             | Toasts / user feedback                       |
| **@react-oauth/google**| Google Login                                 |
| **Next NProgress Bar** | Visual route loader                          |

---

## 🔁 Fully Connected to Express Backend

Every piece of data — pizzas, ingredients, filters, cart, orders, user — is served and managed by a **custom-built Express + SQLite backend**.

Backend features:
- Custom JWT system
- Google OAuth
- REST API for pizzas, filters, cart, orders
- Drizzle ORM with SQLite

---

# 🍕 Pizza Backend

**Live demo / Repo:** [https://next-pizza-black.vercel.app/](https://next-pizza-black.vercel.app/)

This is the backend service for a full-stack pizza ordering app. It’s built using **Express**, with **JWT-based custom authentication**, **Google OAuth integration**, and features a **shopping cart**, **order management**, and **SQLite database** integration via **Drizzle ORM**.

---

## 🚀 Features

- ✅ **User Authentication**
  - Custom **JWT-based** signup/login system
  - **Google Login** (OAuth2) integration
- 🛒 **Shopping Cart**
  - Add/update/remove pizza items
  - Cart stored per user
- 📦 **Order Management**
  - Place orders
  - Track past orders
- 🍕 **Pizza Management**
  - Products and variations (size, dough, etc.)
  - Attributes and ingredients
- 🧱 **Database**
  - Powered by **SQLite**
  - Managed via **Drizzle ORM**
- 🧪 Built for easy integration with a **Next.js frontend**

---

## 🧰 Tech Stack

| Technology     | Description                              |
|----------------|------------------------------------------|
| Express.js     | Backend server & routing                 |
| JWT            | Authentication tokens                    |
| Google OAuth   | Social login integration                 |
| SQLite         | Lightweight local database               |
| Drizzle ORM    | Type-safe ORM with migrations            |
| Zod            | Validation                               |

