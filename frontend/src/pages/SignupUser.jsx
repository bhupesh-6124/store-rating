import React, { useState } from "react";
import '../index.css';
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

const SignupUser = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setValidationErrors([]);

    try {
      await api.post("/auth/signup", form);
      setSuccess("Signup successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        // backend validation errors from express-validator
        setValidationErrors(data.errors);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError("Signup failed");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>Signup - Normal User</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {validationErrors.length > 0 && (
        <ul style={{ color: "red" }}>
          {validationErrors.map((v, idx) => (
            <li key={idx}>{v.msg} (field: {v.path})</li>
          ))}
        </ul>
      )}

      <div
        style={{
          fontSize: 12,
          marginBottom: 12,
          padding: 8,
          background: "#f8f8f8",
          borderRadius: 4
        }}
      >
        <b>Rules:</b>
        <ul>
          <li>Name: 20–60 characters</li>
          <li>Address: max 400 characters</li>
          <li>
            Password: 8–16 characters, at least 1 uppercase and 1 special character
            (e.g. <code>Test@1234</code>)
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Name (20–60 chars)</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
            minLength={20}
            maxLength={60}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Address (max 400 chars)</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
            maxLength={400}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            marginTop: 8,
            borderRadius: 4,
            border: "none",
            background: "#007bff",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Signup
        </button>
      </form>

      <p style={{ marginTop: 12, textAlign: "center" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignupUser;
