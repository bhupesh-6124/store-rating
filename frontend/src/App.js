// src/App.js
import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import SignupUser from "./pages/SignupUser";
import SignupOwner from "./pages/SignupOwner";
import UserStores from "./pages/UserStores";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import ChangePassword from "./pages/ChangePassword";

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-logo">StoreRating</div>
        <nav className="app-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {!user && (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup-user" className="nav-link">
                Signup User
              </Link>
              <Link to="/signup-owner" className="nav-link">
                Signup Owner
              </Link>
            </>
          )}

          {user && user.role === "USER" && (
            <Link to="/stores" className="nav-link">
              User Dashboard
            </Link>
          )}

          {user && user.role === "OWNER" && (
            <Link to="/owner" className="nav-link">
              Owner Dashboard
            </Link>
          )}

          {user && user.role === "ADMIN" && (
            <Link to="/admin" className="nav-link nav-link-primary">
              Admin Dashboard
            </Link>
          )}

          {user && (
            <Link to="/change-password" className="nav-link">
              Change Password
            </Link>
          )}
        </nav>

        <div className="app-user-info">
          {user ? (
            <>
              <span>
                {user.name}{" "}
                <span className="badge-role">
                  {user.role === "USER"
                    ? "Normal User"
                    : user.role === "OWNER"
                    ? "Store Owner"
                    : "Admin"}
                </span>
              </span>
              <button className="btn-logout" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <span className="muted">Not logged in</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="page-container">{children}</div>
      </main>
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Welcome to StoreRating</h1>
          </div>
          <p className="card-subtitle">
            System Administrator, Normal User, and Store Owner each have their
            own dedicated features.
          </p>
          <div className="stack-v" style={{ marginTop: "0.75rem" }}>
            <span className="muted">
              ● System Administrator: manage users (normal/admin/owners), stores and view all ratings.
            </span>
            <span className="muted">
              ● Normal User: sign up, log in, search stores, submit/modify ratings (1–5).
            </span>
            <span className="muted">
              ● Store Owner: view users who rated their store and average rating.
            </span>
          </div>
        </div>
      }
    />
    <Route path="/login" element={<Login />} />
    <Route path="/signup-user" element={<SignupUser />} />
    <Route path="/signup-owner" element={<SignupOwner />} />

    {/* Normal User */}
    <Route
      path="/stores"
      element={
        <ProtectedRoute allowedRoles={["USER"]}>
          <UserStores />
        </ProtectedRoute>
      }
    />

    {/* Store Owner */}
    <Route
      path="/owner"
      element={
        <ProtectedRoute allowedRoles={["OWNER"]}>
          <OwnerDashboard />
        </ProtectedRoute>
      }
    />

    {/* System Administrator */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* Change Password – all logged-in roles */}
    <Route
      path="/change-password"
      element={
        <ProtectedRoute allowedRoles={["USER", "OWNER", "ADMIN"]}>
          <ChangePassword />
        </ProtectedRoute>
      }
    />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
