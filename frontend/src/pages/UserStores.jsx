// src/pages/UserStores.jsx
import React, { useEffect, useState } from "react";
import '../index.css';
import api from "../api";

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [error, setError] = useState("");

  const fetchStores = async () => {
    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;
      const res = await api.get("/stores", { params });
      setStores(res.data);
    } catch {
      setError("Failed to load stores");
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line
  }, []);

  const handleRatingChange = async (storeId, value) => {
    if (!value) return;
    try {
      await api.post(`/stores/${storeId}/ratings`, { value });
      fetchStores();
    } catch {
      alert("Failed to submit rating");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Stores directory</h2>
          <div className="page-subtitle">
            Normal User: view all stores, search by name/address, submit or
            modify ratings (1 to 5).
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Search filters</span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Store name</label>
            <input
              className="form-input"
              placeholder="Search by name"
              value={search.name}
              onChange={(e) => setSearch({ ...search, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              className="form-input"
              placeholder="Search by address"
              value={search.address}
              onChange={(e) =>
                setSearch({ ...search, address: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-secondary" onClick={fetchStores}>
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Stores table */}
      <div className="card table-card">
        <div className="card-header">
          <span className="card-title">Stores</span>
          <span className="card-subtitle">
            {stores.length} store{stores.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Address</th>
                <th>Overall Rating</th>
                <th>Your Rating</th>
                <th>Submit / Modify</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.address}</td>
                  <td>
                    {s.overallRating ? (
                      <span className="chip chip-rating">
                        {s.overallRating.toFixed(2)} ({s.ratingsCount})
                      </span>
                    ) : (
                      <span className="muted">No ratings yet</span>
                    )}
                  </td>
                  <td>
                    {s.userRating ? (
                      <span className="chip chip-muted">{s.userRating}</span>
                    ) : (
                      <span className="muted">Not rated</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={s.userRating || ""}
                      onChange={(e) =>
                        handleRatingChange(s.id, Number(e.target.value))
                      }
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan="5" className="table-empty">
                    No stores found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserStores;
