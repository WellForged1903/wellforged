# System Architecture & Integration

## 🧱 Design Philosophy
WellForged uses a **Radical Transparency** model. Every transaction and product state is verifiable.

## 🌉 Integration Bridge
- **Idempotency**: The frontend generates a UUID for every order attempt. The backend uses this to prevent double-charging or duplicate inventory deduction.
- **Stock Management**: Inventory is updated using row-level locking (`FOR UPDATE`) to ensure consistency during concurrent sales.
- **Security**: JWT tokens are issued on login and stored in local state/storage. No hardcoded secrets are used; they are managed via `.env`.

## 📁 Folder Structure
- `/frontend`: Vite + React + Tailwind. Contains the transparency portal and e-commerce UI.
- `/Backend`: Node + Express + PostgreSQL. Handles business logic and financial integrity.
- `/docs`: This directory. Contains technical specifications.
