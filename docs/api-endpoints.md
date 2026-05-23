# WellForged API Reference

This document provides a map of the backend services for AI agents to understand data flow.

## Base URL
`http://localhost:5000/api`

## Endpoints

### Authentication
- `POST /auth/signup`: Register a new user with consent tracking.
- `POST /auth/login`: Authenticated via mobile number and simulated OTP.

### Products
- `GET /products`: List all products.
- `GET /products/:slug`: Get product details.
- `GET /products/batch/:batchId`: Retrieve lab report data for a specific batch.

### Orders & Checkout
- `POST /orders`: Create a new order. Requires `idempotency-key` in header.
- `GET /orders`: List user's order history (Protected).
- `PATCH /orders/:id/status`: Update order or payment status (Admin).

### Coupons
- `POST /coupons/validate`: Check coupon validity and calculate discount.

### User Data
- `GET /profile`: User profile details.
- `GET /addresses`: List saved addresses.
