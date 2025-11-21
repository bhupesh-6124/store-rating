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
├── README.md
└── .gitignore            # Root ignore (optional)


⚙️ Environment Variables
Backend (backend/.env)

Create a .env file in backend (do not commit this):

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ratings-app
JWT_SECRET=SomeStrongSecretKey123!
NODE_ENV=development
PORT=5001

# Optional – seedAdmin.js will use these
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Application System Administrator
ADMIN_ADDRESS=Head Office

Frontend (frontend/.env)

For local development:

REACT_APP_API_BASE_URL=http://localhost:5001/api


For production (Render, etc.), set REACT_APP_API_BASE_URL to your backend’s public URL, for example:

REACT_APP_API_BASE_URL=https://store-rating-backend.onrender.com/api

🚀 Getting Started (Local Development)
1️⃣ Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

2️⃣ Backend Setup
cd backend
npm install
cp .env.example .env    # or manually create .env from content above


Edit .env with your actual MongoDB Atlas connection string and secrets.

Connect to MongoDB

Make sure MONGO_URI in .env is a valid MongoDB connection string.

Example:

MONGO_URI=mongodb+srv://appuser:AppUser123@cluster0.abcd1.mongodb.net/ratings-app?retryWrites=true&w=majority

Seed initial Admin user
npm run seed:admin


This will create an admin user using ADMIN_EMAIL and ADMIN_PASSWORD from .env.
Check console log for:

Admin created: admin@example.com
# or
Admin already exists: admin@example.com

Run Backend
npm run dev


Backend will start on:

http://localhost:5001
API base path: http://localhost:5001/api

3️⃣ Frontend Setup

In a separate terminal:

cd frontend
npm install


Make sure frontend/.env contains:

REACT_APP_API_BASE_URL=http://localhost:5001/api


Then start React dev server:

npm start


Frontend will run on:

http://localhost:3000

🔑 Default Admin Credentials

After seeding:

Admin Login:
Email:    admin@example.com
Password: Admin@123


You can change these in .env before running npm run seed:admin.

🧪 Role Flows (How to test)
Admin

Login with admin credentials.

Go to Admin Dashboard.

Check Dashboard Overview:

Total users, stores, ratings, counts per role.

Use Add user / store owner section:

Create normal user

Create admin

Create store owner + store (linked in one step)

Check:

Normal & Admin Users table

Store owners & their stores table (owner + store name + rating)

Stores table (all stores with overall rating)

Normal User

Open Signup page.

Register as a new user.

Login with that user.

Go to Stores List:

View all stores

Search by name or address

Rate a store (1–5)

Update your rating

Store Owner

Admin creates a Store Owner + Store OR owner alone and link store later.

Owner logs in.

Go to Store Owner Dashboard:

See list of users who rated the store

See average rating

🌐 Deployment (Render)
Backend on Render

Create a Web Service

Root Directory: backend

Build Command:

npm install


Start Command:

node server.js


Set environment variables:

MONGO_URI

JWT_SECRET

NODE_ENV=production

ADMIN_EMAIL, ADMIN_PASSWORD (optional)

Frontend on Render

Create a Static Site

Root Directory: frontend

Build Command:

npm install && npm run build


Publish Directory:

build


Environment Variable:

REACT_APP_API_BASE_URL=https://<your-backend-service>.onrender.com/api

✅ Status & Future Improvements

Current features:

Multi-role system (Admin, User, Store Owner)

Store rating (1–5), per-user rating

Admin dashboards with metrics

Owner→Store mapping and rating visibility

Possible future enhancements:

Password reset via email

Store images/logo uploads

Pagination and sorting

Role-based activity logs

🧑‍💻 Author

This project was implemented as a full-stack MERN assignment with:

Multiple roles

Clean separation of frontend & backend

MongoDB Atlas integration

Ready-to-deploy environment setup

Feel free to fork, extend, or use as a reference in interviews/projects.
