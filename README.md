# 🚀 VendorConnect — B2B Marketplace Platform

VendorConnect is a full-stack B2B marketplace that connects **suppliers and retailers**, enabling product discovery, logistics handling, trust scoring (V-Score), and price negotiation.

---
### 🔹 Feature Highlights

* **🛒 Order Flow:** Retailer → Order → Supplier → Delivery
* **🚚 Logistics:** Pickup → In Transit → Delivered
* **⭐ Ratings & V-Score:** Two-way rating system with trust scoring

---

## 🧠 Key Features

### 🔐 Authentication & Access
- JWT-based login and registration.
- Role-based access control (Supplier vs. Retailer).
- Password recovery and reset functionality.

### 🛒 Inventory & Product Management
- **Suppliers:** Full CRUD operations on products, stock management, and pricing control.
- **Retailers:** Advanced browsing with comprehensive filtering options.

### 📦 Order & Logistics
- Complete order lifecycle: `Pending` → `In Transit` → `Delivered` → `Cancelled`.
- **Location-Based Logistics:** Dynamic delivery costing based on City (₹50), District (₹100), State (₹200), and Interstate (₹400) shipping.
- **Real-Time Tracking:** Timestamps for `pickedUpAt` and `deliveredAt`.
- **Automatic Inventory:** Real-time stock reduction on purchase and restoration on cancellation.

### 🏆 V-Score (Trust System)
A proprietary scoring mechanism to ensure marketplace integrity:
- **Supplier Score:** Derived from average ratings, order completion rates, and cancellation penalties.
- **Retailer Score:** Derived from success rates, cancellation history, and supplier feedback.
- **Badges:** 🟢 Elite (90+), 🔵 Trusted (75-89), 🟡 Average (50-74), 🔴 Risky (<50).

---

## 📊 Dashboards

- **Supplier Dashboard:** Monitor revenue (net of delivery), order volume, V-Score trends, and active negotiations.
- **Retailer Dashboard:** Track spending, order history, V-Score status, and pending offers.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB Atlas
- **Frontend:** React (Vite), Tailwind CSS, Axios
- **Auth:** JSON Web Tokens (JWT)

---

## 🚀 Setup Instructions

### 1. Clone Repository
```bash
git clone [https://github.com/pokefanchanti/VendorConnect.git](https://github.com/pokefanchanti/VendorConnect.git)
cd VendorConnect
```

### 2. Install Dependencies
Backend
```bash
cd backend
npm install
```


Frontend
```bash
cd frontend
npm install
```

### 3. Environment Variables
backend/.env
```bash
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

frontend/.env
```bash
VITE_API_URL=http://localhost:5000
```

## 4. Run App
Backend
```bash
cd backend
npm run dev
```


Frontend
```bash
cd frontend
npm run dev
```
---

## Architecture
Frontend : React + Vite

Backend : Express API (Node.js)

Database : MongoDB Atlas

## Development Notes
- Delivery costs are handled separately and do not count toward Supplier revenue.

- V-Score calculations are dynamic and updated upon order completion/cancellation.

- Reviews can only be submitted after a successful delivery to prevent spam.
