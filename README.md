# WellForged – Wellness, Forged with Integrity

WellForged is a premium D2C e-commerce platform built for a supplement brand that prioritizes **radical transparency**. Every product is backed by batch-wise third-party lab results, providing users with the proof they need to trust their wellness journey.

## 🚀 Key Features

- **Transparency Portal**: Users can enter a Batch ID to view verified Lab Reports (COA) for their specific product.
- **Responsive E-commerce**: Optimized for mobile, tablet, and desktop viewports with fluid typography.
- **Secure Authentication**: JWT-based auth with mobile/email input (OTP simulation).
- **Full Checkout Flow**: Multi-step checkout with address management, coupon application, and inventory checks.
- **Order Management**: Detailed order history, status tracking, and payment link verification.
- **Inventory Resilience**: Prevent race conditions during high-traffic order placements using row-level locking.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS (Mobile-first, Fluid Design)
- **Icons**: Lucide React
- **Validation**: Zod (Frontend forms & API schemas)
- **State/Routing**: React Context, React Router DOM

### Backend
- **Runtime**: Node.js & Express
- **Database**: PostgreSQL
- **Security**: JWT Authentication, Zod Request Validation, Centralized Error Handling
- **Utilities**: `pg` (PostgreSQL Client), `crypto` (Idempotency), `dotenv`

## 🗺️ System Topology

```mermaid
graph TD
    User((User)) <--> Frontend[Vite/React Frontend]
    Frontend <--> API[Express Backend]
    API <--> DB[(PostgreSQL Database)]
    API -- "Logs/Email" --> Mailer[Mailer Service Stub]
    Frontend -- "Batch ID" --> LabReports[Transparency Portal]
```

## 📂 Repository Navigation (AI-Friendly)
- **[HANDOVER.md](file:///d:/wellforged%20-%202/HANDOVER.md)**: Essential guide for developers and agents taking over the project.
- **[/frontend](file:///d:/wellforged%20-%202/frontend)**: Client-side application and UI components.
- **[/Backend](file:///d:/wellforged%20-%202/Backend)**: RESTful API and database controllers.
- **[/docs](file:///d:/wellforged%20-%202/docs)**: Technical specifications and architecture deep-dives.
- **[package.json](file:///d:/wellforged%20-%202/package.json)**: Root manifest defining the workspace structure.

## 📊 Database Schema

```mermaid
erDiagram
    users ||--o{ orders : "places"
    users ||--o{ addresses : "saves"
    orders ||--o{ order_items : "contains"
    orders ||--|| payments : "has"
    orders }o--|| coupons : "applies"
    products ||--o{ order_items : "ordered as"
    products ||--o{ inventory_logs : "tracked in"
    categories ||--o{ products : "categorizes"

    users {
        uuid id PK
        string first_name
        string last_name
        string email
        string mobile_number
        boolean terms_accepted
        boolean whatsapp_opt_in
    }

    orders {
        uuid id PK
        uuid user_id FK
        uuid address_id FK
        string status
        decimal total_amount
        string idempotency_key UNIQUE
        jsonb address_snapshot
    }

    payments {
        uuid id PK
        uuid order_id FK UNIQUE
        string payment_method
        string payment_status
        string transaction_id
        timestamp paid_at
    }

    products {
        uuid id PK
        string name
        string slug
        decimal price
        integer stock_quantity
    }
```

## 🔒 Security & Reliability Implementations

- **Idempotency**: Prevents duplicate orders from repeated API calls using frontend-generated UUIDs.
- **Inventory Locking**: Uses `SELECT ... FOR UPDATE` to ensure stock counts remain accurate during simultaneous purchases.
- **Schema Integrity**: Unique constraints on `payments(order_id)` and `orders(idempotency_key)` to maintain high financial data quality.
- **Sensitive Data**: Hardcoded secrets removed; environment variables standardized across the stack.

## 🛠️ Development Setup

### Backend
1. Navigate to `/Backend`.
2. Install dependencies: `npm install`.
3. Set up `.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/wellforged
   JWT_SECRET=your_secure_secret
   ```
4. Start server: `npm start`.

### Frontend
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.

---

**WellForged** — *Wellness, Forged with Integrity.*
