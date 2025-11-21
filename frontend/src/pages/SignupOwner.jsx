import React, { useState } from "react";
import '../index.css';
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

const SignupOwner = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    storeName: "",
    storeEmail: "",
    storeAddress: ""
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
      await api.post("/auth/signup-owner", form);
      setSuccess("Owner & Store registered. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
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
        maxWidth: 600,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>
        Signup - Store Owner
      </h2>

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
          <li>Owner Name: 20–60 characters</li>
          <li>Owner Address: max 400 characters</li>
          <li>
            Password: 8–16 characters, at least 1 uppercase and 1 special
            character (e.g. <code>Owner@1234</code>)
          </li>
          <li>Store Address: max 400 characters</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <h3>Owner Details</h3>
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
          <label>Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            maxLength={400}
            style={{ width: "100%", padding: 8 }}
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

        <h3 style={{ marginTop: 20 }}>Store Details</h3>
        <div style={{ marginBottom: 10 }}>
          <label>Store Name</label>
          <input
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Store Email</label>
          <input
            name="storeEmail"
            type="email"
            value={form.storeEmail}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Store Address</label>
          <textarea
            name="storeAddress"
            value={form.storeAddress}
            onChange={handleChange}
            maxLength={400}
            style={{ width: "100%", padding: 8 }}
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
            background: "#28a745",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Signup as Owner
        </button>
      </form>

      <p style={{ marginTop: 12, textAlign: "center" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignupOwner;
