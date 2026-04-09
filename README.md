# VendorConnect — Project Planning & Architecture

## Overview
VendorConnect is an upcoming full-stack application designed to connect suppliers and retailers. This document outlines our planned architecture, database schemas, and expected API endpoints for development.

## Proposed Tech Stack
- **Environment**: Node.js v20+
- **Database**: MongoDB Atlas
- **Frontend**: React (Vite) with Tailwind CSS

## Planned Project Structure
We will divide the repository into `backend/` and `frontend/` directories.

### Backend (Express)
- `src/config/db.js`: MongoDB Atlas connection setup.
- `src/models/`: Mongoose schemas for User, Product, SupplierProduct, Order, and OrderItem.
- `src/controllers/` & `src/routes/`: Handlers for auth, supplier, retailer, and product operations.
- `src/middleware/`: JWT authentication and role-based access control.

### Frontend (React/Vite)
- `src/api/`: Axios instance for backend communication.
- `src/context/`: Global state management for authentication via JWT.
- `src/pages/`: Dedicated routing views for Authentication, Retailer dashboards, and Supplier dashboards.

## Target API Endpoints
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Products**: `/api/products` (browse active listings), `/api/products/categories`
- **Supplier**: POST/GET/PUT/DELETE for `/api/supplier/products`, plus `/api/supplier/orders` and `/api/supplier/dashboard`
- **Retailer**: POST/GET for `/api/retailer/orders`, plus `/api/retailer/dashboard`

## Database Models (Draft)
| Model | Proposed Fields |
|-------|-----------|
| User | name, email, password, role, businessName, trustScore |
| Product | name, category, unit, imageUrl |
| SupplierProduct | supplierId, productId, price, stock, minOrderQty |
| Order | retailerId, supplierId, status, totalAmount, paymentMethod |
| OrderItem | orderId, supplierProductId, quantity, unitPrice, subtotal |

## Target Testing Flow
Once the MVP is complete, we will verify the core loop by:
1. Registering as a Supplier and adding products.
2. Registering as a Retailer to browse products and place an order.
3. Having the Supplier accept and fulfill the order.
4. Having the Retailer verify the status update.
