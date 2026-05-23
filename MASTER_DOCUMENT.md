# WELLFORGED - MASTER EXECUTION DOCUMENT & AI HANDBOOK

> **⚠️ CRITICAL: SYSTEM CONTEXT FILE**
> This is the Single Source of Truth for the Wellforged ecommerce project.
> Any Developer or AI Assistant MUST read this document entirely before making architectural decisions, modifying APIs, or creating UI components to ensure 100% alignment with existing standards.

---

## 1. PROJECT OVERVIEW & VISION
*   **Product Name:** Wellforged
*   **Product Type:** Modern, high-conversion Ecommerce Store
*   **Domain:** Health & Wellness (Clean, filler-free supplements)
*   **Core Value Proposition:** Absolute transparency, batch-testing validations, rich user-experience, and seamless payment flows.
*   **Brand Identity:** Premium, dark-mode leanings (`#1A3C34` primary), no-nonsense aesthetics, dynamic animations.

---

## 2. TECH ARCHITECTURE STACK

### Frontend (Client Tier)
*   **Core:** React 18 / TypeScript / Vite
*   **Build Tooling:** `@vitejs/plugin-react` (Babel-based; explicitly moved away from SWC to prevent Vercel native-binary build crashes).
*   **Styling:** Tailwind CSS, PostCSS, Shadcn/UI, Radix UI.
*   **State Management:** React Context (`CartContext`).
*   **Routing:** React Router v6.

### Backend (API Tier)
*   **Core:** Node.js, Express 5.x / TypeScript
*   **Deployment Architecture:** Serverless-ready (`vercel.json` routing `src/index.ts`).
*   **Validation:** Zod.
*   **Security:** Helmet, Express Rate Limiter, CORS restricted.

### Data & External Services
*   **Database:** PostgreSQL (Cloud instance via Supabase/Neon).
*   **ORM/Query Builder:** Native `pg` Pool (with strict SSL constraints).
*   **Payments:** Razorpay (Standard Checkout).
*   **Hosting:** Vercel (Frontend & Backend independently deployed).

---

## 3. FOLDER STRUCTURE

Understanding the project topology prevents routing misconfigurations.

### Backend Directory (`/Backend`)
```text
Backend/
├── .env                  # Secrets 
├── vercel.json           # Cloud serverless routing definitions
├── package.json          # Entry scripts (migration, dev, build)
├── src/
│   ├── config/           # Database connections (db.ts)
│   ├── controllers/      # Route logic (payment.controller.ts, etc)
│   ├── middlewares/      # Error & Auth handlers
│   ├── routes/           # Express router definitions
│   ├── services/         # Third party integration logic (razorpay.service.ts)
│   ├── utils/            # Shared helpers (logger, path sanitizers)
│   └── index.ts          # Main Express execution entry point
└── scripts/              # Migration / SQL assets
```

### Frontend Directory (`/frontend`)
```text
frontend/
├── .env                  # Public Vite variables
├── package.json          # React + Vite specific
├── vite.config.ts        # Babel React configuration
├── index.html            # Entry point (Contains Critical Global Interceptor Script)
└── src/
    ├── components/       # Shared UI (Shadcn/UI, Navbar, Footer)
    ├── context/          # State managers (CartContext.tsx)
    ├── pages/            # View components (CheckoutPage, etc)
    ├── utils/            # Client logic (urlUtils.ts, razorpay.ts)
    ├── config.ts         # Centralizes API paths
    └── main.tsx          # React DOM entry and Migration execution
```

---

## 4. ENVIRONMENT VARIABLES

*⚠️ Deployment WILL crash if these are missing or mismatched.*

### Backend Variables (Vercel Dashboard)
| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables Morgan logging & disables error traces. |
| `ALLOWED_ORIGIN`| `https://wellforged.in` | Secures the Express setup via CORS. |
| `RAZORPAY_KEY_ID` | `rzp_live_abc123` | Server-safe Razorpay ID. |
| `RAZORPAY_KEY_SECRET` | `secret_xyz` | Used strictly in backend for HMAC Verification. |
| `DB_HOST` | `aws-0-eu-[region].pooler.supabase.com`| Managed Supabase connection (Must use Pooler URL). |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `postgres.[id]` / `***` / `postgres` | Standard Supabase DB bindings. |
| `DB_PORT` | `6543` | Must use 6543 for Supabase pooler connections in serverless env. |

### Frontend Variables (Vercel Dashboard)
| Key | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://api.wellforged.in` | Complete backend URL (No trailing slash). |
| `VITE_RAZORPAY_KEY_ID`| `rzp_live_abc123` | Public key necessary to spawn the checkout modal. |

---

## 5. CURRENT IMPLEMENTATION STATUS (EXACT STATE)

### Functional & Complete (Stable)
*   **Frontend UI & UX:** Navigation, Product listing, and fully responsive Cart. Unified global loading aligns with brand aesthetics.
*   **Admin CRM Infrastructure:** Secure **HTTP-Only Cookie-based Authentication** system for administrators. Modular frontend architecture for the dashboard (`src/components/admin/`).
*   **Core Admin Features:**
    *   **Orders:** Full lifecycle management (Listing, Tracking ID injection, Fulfillment status).
    *   **Products:** Parent creation, **WebP Image Pipeline** (Multer/Sharp/Sepabase), SKU/Variant management, and Stock control.
    *   **Transparency:** Batch Lab Report publishing.
    *   **Marketing:** Review moderation and Coupon issuance.

### Partially Implemented (Needs Work)
*   **Admin CRM Enrichment:** Missing CRUD for **Product Categories**, **FAQ management**, and **Product Metadata** (Highlights/Specs).
*   **Order Intelligence:** Admin can see order lists, but detailed item-by-item breakdown and Customer History view are pending.
*   **Email Notifications:** Brevo service is ready but awaits production DNS verification for the sender domain.

### Missing / Broken / Untested
*   **Razorpay Webhooks:** Async fallback for payment verification.
*   **UX Hardening:** "Edit" and "Delete" capabilities for existing CRM entities to prevent "only-create" dead-ends.

---

## 6. FEATURE PRIORITY ROADMAP

*   🔴 **P0 (Critical to Launch):**
    *   Bridge Admin CRM gaps (Metadata, FAQs, Categories).
    *   Implement "Fulfillment Details" modal for order accuracy.
    *   Razorpay Webhook integration -> `/api/payments/webhook`.
*   🟠 **P1 (Immediate Post-Launch):**
    *   Email notification verification on live domain.
    *   User Account Authentication System.
*   🟡 **P2 (Future Growth):**
    *   Analytics visualization (Trend charts). 
    *   Product metadata cache optimization (Redis).

---

## 7. COMPLETE USER FLOW (END-TO-END)

1.  **Browse:** User views dynamic products fetched via `/api/products/:slug`.
2.  **Add to Cart:** `CartContext` updates `localstorage`, instantly filtering out invalid image paths.
3.  **Checkout Info Entry:** User enters basic data in `CheckoutPage.tsx`. Form validation applies.
4.  **Order Generation:** Form submits to POST `/api/orders`. Backend establishes a record in `pending_payment` state linked to a generated Razorpay ID (`total_amount` is calculated strictly backend-side).
5.  **Payment Processing:** The Razorpay standard checkout widget overlays. User applies payment method.
6.  **Signature Processing:** The Razorpay callback returns `razorpay_signature`. Frontend immediately hits POST `/api/payments/verify`.
7.  **Fulfillment Logic:** Backend validates HMAC SHA256. If `true`, sets `orders` row to `paid`, decrements inventory `skus`, writes full JSON payload to `payments` table, and automatically sends an email receipt via Brevo Native Fetch.
8.  **Redirection:** User lands on `/order-success`. Cart context flushes `localStorage`.

---

## 8. API ARCHITECTURE & INTEGRATION FLOW

*All frontend API calls leverage the base variable defined in `src/config.ts`.*

| Flow | Direction | Endpoint | Action Breakdown |
| :--- | :--- | :--- | :--- |
| **Catalog** | `FE -> BE` | `GET /api/products` | Retrieves active inventory and pricing logic based on current variants. |
| **Commit** | `FE -> BE` | `POST /api/orders` | Initiates payment intent. Requires `{ items, address, subtotal }`. Returns `{ order_id, razorpay_payment_options }`. |
| **Callback** | `FE -> BE` | `POST /api/payments/verify` | The critical security node. Validates frontend payloads against merchant secrets. Translates states from pending to paid. |
| **Webhook**| `RP -> BE` | `POST /api/webhooks/razorpay` | (TBD). Async fallback to guarantee capturing payments regardless of user UI drops. |

---

## 9. DATABASE SCHEMA (CRITICAL PATHS)

*   **Data Types MUST MATCH:** The Database primarily utilizes **`UUID`** for generic Primary Keys and Foreign Keys (`DEFAULT uuid_generate_v4()`). Mathematical fields (like pricing and totals) are strictly **`INTEGER`** to sync natively with Razorpay's required "Paise" formatting logic.
*   `products` (id: UUID, name, slug) ➔ 1:N ➔ `skus` (id: UUID, product_id, stock, price: INTEGER)
*   `orders` (id: UUID, profile_id, order_number, checkout_amount, payment_status, razorpay_order_id, address_snapshot: JSONB)
*   `order_items` (id: UUID, order_id, sku_id, split_amounts)
*   `payments` (transaction log mapping to `orders.id`, stores full API response in `raw_response`)
*   `addresses` (shipping metadata fallback)

---

## 10. COMMON ERRORS & DEBUG GUIDE

| Error State | Exact Cause | Fix Implementation |
| :--- | :--- | :--- |
| **Frontend: Many `ERR_CONNECTION_REFUSED` in console** | Local Lovable generation artifact trying to fetch images from `localhost:PORT` dynamically. | Handled via `getSafeImageUrl()` and `index.html` observer. Check these files if errors reappear. Do NOT debug database for this. |
| **Vercel: `500 INTERNAL_SERVER_ERROR (FUNCTION_INVOCATION_FAILED)`** | `vercel.json` routing points to wrong file, OR the backend crashed trying to connect to a missing `DB_HOST`. | Validate that `vercel.json` maps `destination: "src/index.ts"`. Ensure cloud DB credentials are set in Vercel. |
| **Vercel: `sh -c vite build (Exit 1)`**| Vercel Linux cannot compile `@swc/core` native bindings reliably. | We explicitly use `@vitejs/plugin-react` (Babel). If this recurs, checking for rogue SWC references in `package-lock.json` is mandatory. |
| **Razorpay: `Expected integer but got string`** | Amounts must be sent as raw Paise (cents). Passing "₹50.00" string will crash the SDK. | Review `razorpay.service.ts` -> Ensure `Math.round(Math.floor(Number(amount)) * 100)` is enforced. |

---

## 11. DEVELOPMENT WORKFLOW (HOW TO ADD FEATURES)

### Step 1: Backend First
Always establish the data layer and routing before attempting frontend state implementation.
1. Update SQL schemas / define migrations.
2. Build Express Controller + Services logic.
3. Test using REST Client/Postman locally.

### Step 2: Types & Config Sync
If API payloads change, ensure Frontend Types (Interfaces) are immediately updated.

### Step 3: Frontend Integration
1. Build UI Components (Using Tailwind and Shadcn).
2. Wire logic into the unified `API_BASE_URL` handler.

### Step 4: Staging & Deployment
Before pushing: Run `npm run lint` and `npm run build` locally. Never push code that breaks Vite static build pipeline. 

---

## 12. AI OPTIMIZATION RULES (CRITICAL DIRECTIVES)

> **Any AI Agent interacting with this project MUST adhere strictly to these operational commandments:**

### Rule #1: Context Reading & Anchoring
*   Never start executing complex tasks before referring rapidly back to this document to understand architectural limits.
*   Check `frontend/package.json` vs `Backend/package.json` to gauge exact environment constraints (e.g. knowing we use Babel, not SWC). 

### Rule #2: Modification Constraints
*   **DO NOT** automatically switch Vercel routing logic without verifying `vercel.json` logic directly.
*   **DO NOT** refactor the global asset interceptors (`urlUtils.ts` or `index.html` scripts) unless explicitly requested. They are crucial load-bearing structures for security/telemetry integrations.
*   **DO NOT** run non-specific bash commands like `cat file.ts > file2.ts`. Use native tool `replace_file_content` to enact updates specifically.

### Rule #3: AI Interaction Formatting
*   Provide code responses using Standard GitHub Flavored Markdown (diff/patches if editing deeply).
*   Be exceptionally brief and specific. If a database layer is affected by a frontend feature, call out the impact immediately using an `> [!IMPORTANT]` alert.
*   Ask clarifying questions BEFORE rewriting any core integration logic (like razorpay or checkout state machines). Avoid assumptions regarding untested flows (e.g. Webhook setups).
