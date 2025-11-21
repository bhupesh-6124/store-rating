# Store Rating System

_A MERN platform to rate & manage local stores with separate roles for Admin, Store Owner, and Normal User._

---

## 🔍 Overview

Store Rating System is a full-stack web application built using the **MERN stack (MongoDB, Express, React, Node.js)**.

It allows:

- **System Administrator**
  - Manage **users** (normal, admin, store owners)
  - Manage **stores**
  - View **stats** (total users, stores, ratings)
  - See details of owners + their stores and ratings
- **Normal Users**
  - Sign up & log in
  - View all stores
  - Search stores
  - Submit & update ratings
- **Store Owners**
  - Log in
  - View who rated their store
  - See average rating

This project is suitable as a **full-stack assignment implementation** or a base for a production-ready rating platform.

---

## ✨ Features

### 👨‍💼 System Administrator

- Can add new **stores**, **normal users**, **admin users**, and **store owners**
- Dashboard shows:
  - Total number of users
  - Total number of stores
  - Total number of submitted ratings
  - Count of normal users, admins, and store owners
- Can add new users with:
  - Name
  - Email
  - Address
  - Password
  - Role (USER / ADMIN / OWNER)
- Can create a **Store Owner + Store in one step** (owner + linked store)
- Can view:
  - List of normal & admin users (Name, Email, Address, Role)
  - List of store owners **with their store and rating**:
    - Owner Name, Email, Address
    - Store Name, Store Email, Store Rating
  - List of all stores:
    - Store Name, Email, Address, Overall Rating
- Can filter users and stores by:
  - Name
  - Email
  - Address
  - Role (for users)
- Can view detailed information for any user:
  - Name, Email, Address, Role
  - If role is OWNER → also store rating info
- Can log out

### 👤 Normal User

- Can **sign up** and **log in**
- Signup fields:
  - Name
  - Email
  - Address
  - Password
- Can change their password after login
- Can view list of all stores
- Can search stores by:
  - Name
  - Address
- Store listing shows:
  - Store Name
  - Store Address
  - Overall Rating
  - User’s own rating (if submitted)
  - Option to **submit rating** (1–5)
  - Option to **modify rating**
- Can log out

### 🏪 Store Owner

- Can log in (created by Admin)
- Can change password after login
- Dashboard shows:
  - List of users who rated their store
  - Each rating value
  - Average rating of the store
- Can log out

---

## 🧱 Tech Stack

**Frontend:**

- React
- Axios
- React Router
- Custom CSS (`index.css`)

**Backend:**

- Node.js
- Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator
- cors
- dotenv

---

## 📁 Project Structure

```bash
store-rating-system/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection using MONGO_URI
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT auth, role-based protection
│   │   └── errorMiddleware.js  # Error handling (optional)
│   ├── models/
│   │   ├── User.js             # User model (USER / ADMIN / OWNER)
│   │   ├── Store.js            # Store model (name, email, address, owner, ratings)
│   │   └── Rating.js           # Rating model (user, store, value)
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth (login, signup, change password)
│   │   ├── adminRoutes.js      # /api/admin (stats, manage users & stores)
│   │   ├── storeRoutes.js      # /api/stores (list, rate, search)
│   │   └── ownerRoutes.js      # /api/owner (owner dashboard for ratings)
│   ├── seedAdmin.js            # Script to create initial admin user
│   ├── server.js               # Express app entrypoint
│   ├── package.json
│   ├── .env.example            # Example env variables
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api.js              # Axios instance with baseURL (uses REACT_APP_API_BASE_URL)
│   │   ├── index.js            # React root, imports index.css
│   │   ├── index.css           # Global styling (cards, tables, forms, layout)
│   │   ├── App.js              # Routes and layout
│   │   ├── components/
│   │   │   ├── Header.jsx      # Top navigation bar (role-aware)
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── AdminDashboard.jsx   # System Administrator UI
│   │   │   ├── UserStores.jsx       # Normal user store listing & rating
│   │   │   ├── OwnerDashboard.jsx   # Store owner dashboard
│   │   │   ├── ChangePassword.jsx   # For all logged-in users
│   │   │   └── NotFound.jsx
│   ├── package.json
│   └── .gitignore
│
└── README.md


