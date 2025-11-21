import React, { useState, useContext } from "react";
import '../index.css';
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);

      if (res.data.user.role === "ADMIN") navigate("/admin");
      else if (res.data.user.role === "OWNER") navigate("/owner");
      else navigate("/stores");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" style={{ marginTop: 8 }}>
          Login
        </button>
      </form>
      <div style={{ marginTop: 16 }}>
        <p>
          Normal User? <Link to="/signup-user">Signup</Link>
        </p>
        <p>
          Store Owner? <Link to="/signup-owner">Signup as Store Owner</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
