# WellForged Handover Documentation

This document serves as a comprehensive guide for any AI agent or developer taking over the WellForged project.

## 🌟 Project Identity
WellForged is a premium D2C e-commerce platform for an Indian supplement brand focused on **Radical Transparency**. 
- **Core Value**: Trust through verification (Batch-wise lab results).
- **Aesthetic**: Premium minimalist, health-focused, high-performance.

---

## 🚀 Quick Start

### 1. Environment Setup
Run the automated setup script from the root:
```bash
npm run setup
```
This script validates `.env` files, creates them from `.env.example` if missing, and installs dependencies for both Backend and Frontend.

### 2. Development Servers
Start both Backend and Frontend concurrently:
```bash
npm run dev-all
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000/api

---

## 🛠️ Technical Architecture

### Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Shadcn UI.
- **Backend**: Node.js, Express, PostgreSQL (pg client).
- **Security**: JWT Auth, Zod Validation, Rate Limiting (Helmet, Express-Rate-Limit).
- **Payment**: Razorpay Integration.

### Database Schema Highlights
- **`profiles`**: Stores user identity and role (admin/user).
- **`orders`**: Central table for transactions. Uses `order_number` and `razorpay_order_id`.
- **`skus` & `products`**: Hierarchical product structure (Product -> Multiple SKUs).
- **`cart_items`**: Persistent server-side cart linked to `profiles`.

---

## 🔑 Core Domain Logic

### 1. Radical Transparency (Portal)
- **Mechanism**: Users input a `Batch ID`. The frontend queries `GET /products/batch/:batchId`.
- **Data**: Returns COA (Certificate of Analysis) metadata and PDF links.

### 2. Checkout & Inventory Integrity
- **Idempotency**: Frontend sends an `idempotency_key` (UUID) with `POST /orders`. Backend ensures duplicate requests with the same key don't create multiple orders.
- **Stock Locking**: Uses `SELECT ... FOR UPDATE` in `order.controller.ts` to prevent race conditions during high-traffic checkout.
- **Transaction**: Full ACID compliance via SQL `BEGIN/COMMIT/ROLLBACK`.

### 3. Admin Panel
- Located at `/admin`.
- **Features**: Dashboard Overview (Recharts), Product CRUD, Order Status Management.
- **Access Control**: Middleware checks for `role = 'admin'` in JWT payload.

---

## 📊 Current Project State

### Recent Audit Fixes
- Fixed database connection stability.
- Corrected sign-up flow and profile mapping.
- Implemented row-level locking for inventory.
- Added address snapshots to orders (to preserve address at time of purchase).

### Known "Gotchas"
- **OTP Simulation**: Currently, the system simulates OTP for mobile login. Real SMS gateway integration is pending.
- **Image Assets**: Many product images are currently placeholders or generated mocks.

---

## 🗺️ Roadmap

1.  **Production Readiness**:
    - [ ] Real SMS/Email gateway integration.
    - [ ] S3/Cloudinary setup for lab reports and product images.
2.  **User Experience**:
    - [ ] Subscription model for repeats.
    - [ ] Enhanced search and filtering on product listing.
3.  **Analytics**:
    - [ ] Google Analytics / Mixpanel integration for conversion tracking.

---

**WellForged** — *Handover complete. Ready for next phase.*
