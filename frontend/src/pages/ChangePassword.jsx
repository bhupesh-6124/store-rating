// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import '../index.css';
import api from "../api";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setValidationErrors([]);

    try {
      await api.put("/auth/password", { newPassword });
      setSuccess("Password updated successfully.");
      setNewPassword("");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setValidationErrors(data.errors);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError("Failed to update password");
      }
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Change password</h2>
          <div className="page-subtitle">
            All logged-in users (Admin, Normal User, Store Owner) can update
            their password here.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Password policy</span>
        </div>
        <ul className="muted">
          <li>Length: 8–16 characters</li>
          <li>Must contain at least one uppercase letter</li>
          <li>Must contain at least one special character (e.g. @, #, !)</li>
        </ul>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {validationErrors.length > 0 && (
          <div className="alert alert-error">
            <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
              {validationErrors.map((v, idx) => (
                <li key={idx}>
                  {v.msg} <span className="muted">(field: {v.path})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="e.g. User@1234"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            Update password
          </button>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;
