import React, { useEffect, useState } from "react";
import '../index.css';
import api from "../api";

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/owner/my-store/ratings");
        setData(res.data);
      } catch (err) {
        setError("Failed to load owner dashboard");
      }
    };
    load();
  }, []);

  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!data) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Owner Dashboard</h2>
      <h3>{data.store.name}</h3>
      <p>Store Email: {data.store.email || "-"}</p>
      <p>Store Address: {data.store.address}</p>
      <p>
        Average Rating:{" "}
        {data.store.averageRating
          ? data.store.averageRating.toFixed(2)
          : "No ratings yet"}
      </p>
      <p>Total Ratings: {data.store.ratingsCount}</p>

      <h3>User Ratings</h3>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Rating</th>
            <th>Rated At</th>
          </tr>
        </thead>
        <tbody>
          {data.ratings.map((r) => (
            <tr key={r.id}>
              <td>{r.user.name}</td>
              <td>{r.user.email}</td>
              <td>{r.value}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {data.ratings.length === 0 && (
            <tr>
              <td colSpan="4">No ratings yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OwnerDashboard;
