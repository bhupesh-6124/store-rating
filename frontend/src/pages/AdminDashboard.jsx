
import React, { useEffect, useState } from "react";
import "../index.css";
import api from "../api";

const AdminDashboard = () => {
  // ----- STATS -----
  const [stats, setStats] = useState(null);

  // ----- USERS -----
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: ""
  });

  // ----- STORES -----
  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: ""
  });

  // ----- FORM STATE -----
  // USER = normal user, ADMIN = admin user, OWNER_WITH_STORE = owner + store together
  const [createMode, setCreateMode] = useState("USER");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    address: "",
    password: ""
  });

  // store data used ONLY when createMode === "OWNER_WITH_STORE"
  const [ownerStore, setOwnerStore] = useState({
    name: "",
    email: "",
    address: ""
  });

  // extra store form (optional extra store)
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: ""
  });

  // ----- USER DETAILS -----
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // ----- MESSAGES -----
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===== HELPERS =====
  const formatError = (data) => {
    if (!data) return "Operation failed";
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors
        .map((v) => {
          if (v.path === "name") {
            return "Name must be between 3 and 60 characters";
          }
          if (v.path === "password") {
            return "Password must be 8–16 chars with 1 uppercase & 1 special character.";
          }
          return `${v.msg} (field: ${v.path})`;
        })
        .join(" | ");
    }
    if (data.message) return data.message;
    return "Operation failed";
  };

  // ===== LOADERS =====
  const loadStats = async () => {
    const res = await api.get("/admin/stats");
    setStats(res.data);
  };

  const loadUsers = async (filters = userFilters) => {
    const params = {};
    if (filters.name) params.name = filters.name;
    if (filters.email) params.email = filters.email;
    if (filters.address) params.address = filters.address;
    if (filters.role) params.role = filters.role;
    const res = await api.get("/admin/users", { params });
    setUsers(res.data);
  };

  const loadStores = async (filters = storeFilters) => {
    const params = {};
    if (filters.name) params.name = filters.name;
    if (filters.email) params.email = filters.email;
    if (filters.address) params.address = filters.address;
    const res = await api.get("/admin/stores", { params });
    setStores(res.data);
  };

  const loadUserDetails = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUserDetails(res.data);
    } catch {
      setSelectedUserDetails(null);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([loadStats(), loadUsers(), loadStores()]);
      } catch {
        setError("Failed to load admin data");
      }
    };
    loadAll();
    // eslint-disable-next-line
  }, []);

  // ===== DERIVED DATA =====
  const roleCounts = users.reduce(
    (acc, u) => {
      if (u.role === "USER") acc.USER += 1;
      else if (u.role === "ADMIN") acc.ADMIN += 1;
      else if (u.role === "OWNER") acc.OWNER += 1;
      return acc;
    },
    { USER: 0, ADMIN: 0, OWNER: 0 }
  );

  const normalAndAdminUsers = users.filter(
    (u) => u.role === "USER" || u.role === "ADMIN"
  );
  const ownerUsers = users.filter((u) => u.role === "OWNER");

  // 💡 map ownerId -> store linked to that owner (if any)
  const ownerStoresMap = stores.reduce((map, s) => {
    if (s.owner) {
      const ownerId = typeof s.owner === "string" ? s.owner : s.owner._id;
      if (ownerId && !map[ownerId]) {
        map[ownerId] = s;
      }
    }
    return map;
  }, {});

  // ===== FILTER HANDLERS =====
  const handleUserFilterChange = (e) => {
    const updated = { ...userFilters, [e.target.name]: e.target.value };
    setUserFilters(updated);
  };

  const applyUserFilters = () => loadUsers(userFilters);

  const clearUserFilters = () => {
    const cleared = { name: "", email: "", address: "", role: "" };
    setUserFilters(cleared);
    loadUsers(cleared);
  };

  const handleStoreFilterChange = (e) => {
    const updated = { ...storeFilters, [e.target.name]: e.target.value };
    setStoreFilters(updated);
  };

  const applyStoreFilters = () => loadStores(storeFilters);

  const clearStoreFilters = () => {
    const cleared = { name: "", email: "", address: "" };
    setStoreFilters(cleared);
    loadStores(cleared);
  };

  // ===== ADD USER / OWNER+STORE =====
  const handleNewUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleOwnerStoreChange = (e) => {
    setOwnerStore({ ...ownerStore, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      let roleToCreate = "USER";
      if (createMode === "ADMIN") roleToCreate = "ADMIN";
      if (createMode === "OWNER_WITH_STORE") roleToCreate = "OWNER";

      // 1) Create the user (normal/admin/owner)
      const userPayload = {
        ...newUser,
        role: roleToCreate
      };

      const res = await api.post("/admin/users", userPayload);

      const createdUser =
        res.data?.user || res.data?.data || res.data || null;
      const ownerId =
        roleToCreate === "OWNER" && createdUser
          ? createdUser._id || createdUser.id
          : null;

      setNewUser({ name: "", email: "", address: "", password: "" });
      await loadUsers();

      // 2) If mode is OWNER_WITH_STORE, create store linked to this owner
      if (createMode === "OWNER_WITH_STORE" && ownerId) {
        const storePayload = {
          name: ownerStore.name,
          email: ownerStore.email,
          address: ownerStore.address,
          ownerId
        };
        await api.post("/admin/stores", storePayload);
        setOwnerStore({ name: "", email: "", address: "" });
        await loadStores();
        setSuccess("Store owner and linked store created successfully.");
      } else {
        if (roleToCreate === "USER") {
          setSuccess("Normal user created successfully.");
        } else if (roleToCreate === "ADMIN") {
          setSuccess("Admin user created successfully.");
        } else {
          setSuccess("Store owner created successfully.");
        }
      }
    } catch (err) {
      const data = err.response?.data;
      setError(formatError(data));
    }
  };

  // ===== ADD STORE (extra) =====
  const handleNewStoreChange = (e) => {
    setNewStore({ ...newStore, [e.target.name]: e.target.value });
  };

  const submitNewStore = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = { ...newStore };
      if (!payload.ownerId) delete payload.ownerId;
      await api.post("/admin/stores", payload);
      setSuccess("New store created successfully.");
      setNewStore({ name: "", email: "", address: "", ownerId: "" });
      loadStores();
    } catch (err) {
      const data = err.response?.data;
      setError(formatError(data));
    }
  };

  // ===== USER DETAILS =====
  const openUserDetails = (u) => {
    setSelectedUser(u);
    setSelectedUserDetails(null);
    loadUserDetails(u._id);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setSelectedUserDetails(null);
  };

  // ===== RENDER =====
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">System Administrator</h2>
          <div className="page-subtitle">
            Add new stores, normal users, admin users, and store owners. You can
            also create store owner + store together in one step.
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ========== SECTION 1: STATS ========== */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Dashboard overview</span>
          <span className="card-subtitle">
            Total number of users, stores, and submitted ratings.
          </span>
        </div>

        {stats ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <div className="card-section-title">Total users</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>
                  {stats.totalUsers}
                </div>
              </div>
              <div className="form-group">
                <div className="card-section-title">Total stores</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>
                  {stats.totalStores}
                </div>
              </div>
              <div className="form-group">
                <div className="card-section-title">Total ratings</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>
                  {stats.totalRatings}
                </div>
              </div>
            </div>

            <div className="form-row" style={{ marginTop: "0.75rem" }}>
              <div className="form-group">
                <div className="card-section-title">Normal users</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>
                  {roleCounts.USER}
                </div>
              </div>
              <div className="form-group">
                <div className="card-section-title">Admin users</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>
                  {roleCounts.ADMIN}
                </div>
              </div>
              <div className="form-group">
                <div className="card-section-title">Store owners</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>
                  {roleCounts.OWNER}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="muted">Loading stats...</div>
        )}
      </div>

      {/* ========== SECTION 2: ADD USER / OWNER + STORE ========== */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Add user / store owner</span>
          <span className="card-subtitle">
            Choose what to create, then fill the form. You can also create store
            owner + store together.
          </span>
        </div>

        {/* Create type selector */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Create type</label>
            <select
              className="form-select"
              value={createMode}
              onChange={(e) => setCreateMode(e.target.value)}
            >
              <option value="USER">Normal User</option>
              <option value="ADMIN">Admin User</option>
              <option value="OWNER_WITH_STORE">Store Owner + Store</option>
            </select>
          </div>
        </div>

        {/* Form */}
        <form className="form" onSubmit={handleCreateSubmit}>
          {/* USER FIELDS */}
          <div className="card-section-title">User details</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                name="name"
                className="form-input"
                value={newUser.name}
                onChange={handleNewUserChange}
                placeholder="Full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-input"
                value={newUser.email}
                onChange={handleNewUserChange}
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-input"
                value={newUser.password}
                onChange={handleNewUserChange}
                placeholder="Strong password (8–16 chars)"
              />
              <div className="form-hint">
                Must include at least 1 uppercase and 1 special character.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                className="form-textarea"
                value={newUser.address}
                onChange={handleNewUserChange}
                maxLength={400}
                placeholder="User address"
              />
            </div>
          </div>

          {/* EXTRA STORE FIELDS: ONLY WHEN OWNER_WITH_STORE */}
          {createMode === "OWNER_WITH_STORE" && (
            <>
              <div className="card-section-title">
                Store details (for this owner)
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Store name</label>
                  <input
                    name="name"
                    className="form-input"
                    value={ownerStore.name}
                    onChange={handleOwnerStoreChange}
                    placeholder="Store name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Store email</label>
                  <input
                    name="email"
                    type="email"
                    className="form-input"
                    value={ownerStore.email}
                    onChange={handleOwnerStoreChange}
                    placeholder="store@example.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Store address</label>
                <textarea
                  name="address"
                  className="form-textarea"
                  value={ownerStore.address}
                  onChange={handleOwnerStoreChange}
                  maxLength={400}
                  placeholder="Store address / location"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "0.5rem", alignSelf: "flex-start" }}
          >
            {createMode === "USER"
              ? "Create Normal User"
              : createMode === "ADMIN"
              ? "Create Admin User"
              : "Create Store Owner + Store"}
          </button>
        </form>
      </div>

      {/* ========== SECTION 3: NORMAL & ADMIN USERS LIST ========== */}
      <div className="card table-card">
        <div className="card-header">
          <span className="card-title">Normal & Admin users</span>
          <span className="card-subtitle">
            View and filter users with USER or ADMIN role.
          </span>
        </div>

        {/* Filters */}
        <div className="form-row" style={{ marginBottom: "0.75rem" }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              name="name"
              className="form-input"
              value={userFilters.name}
              onChange={handleUserFilterChange}
              placeholder="Filter by name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              className="form-input"
              value={userFilters.email}
              onChange={handleUserFilterChange}
              placeholder="Filter by email"
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: "0.75rem" }}>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              name="address"
              className="form-input"
              value={userFilters.address}
              onChange={handleUserFilterChange}
              placeholder="Filter by address"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-select"
              value={userFilters.role}
              onChange={handleUserFilterChange}
            >
              <option value="">All roles</option>
              <option value="USER">Normal User</option>
              <option value="ADMIN">Admin User</option>
              <option value="OWNER">Store Owner</option>
            </select>
          </div>
          <div className="form-group" style={{ alignSelf: "flex-end" }}>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={applyUserFilters}
              style={{ marginRight: "0.4rem" }}
            >
              Apply
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={clearUserFilters}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {normalAndAdminUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.address}</td>
                  <td>
                    <span className="chip chip-muted">{u.role}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => openUserDetails(u)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {normalAndAdminUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="table-empty">
                    No normal or admin users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== SECTION 4: STORE OWNERS + THEIR STORES ========== */}
      <div className="card table-card">
        <div className="card-header">
          <span className="card-title">Store owners & their stores</span>
          <span className="card-subtitle">
            Each store owner with their linked store (name, email, rating).
          </span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Owner Name</th>
                <th>Owner Email</th>
                <th>Owner Address</th>
                <th>Store Name</th>
                <th>Store Email</th>
                <th>Store Rating</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {ownerUsers.map((u) => {
                const st = ownerStoresMap[u._id];
                return (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.address}</td>

                    <td>
                      {st ? (
                        st.name
                      ) : (
                        <span className="muted">No store</span>
                      )}
                    </td>
                    <td>
                      {st ? (
                        st.email || "-"
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td>
                      {st && st.averageRating ? (
                        <span className="chip chip-rating">
                          {st.averageRating.toFixed(2)} ({st.ratingsCount})
                        </span>
                      ) : st ? (
                        <span className="muted">No ratings</span>
                      ) : (
                        <span className="muted">No store</span>
                      )}
                    </td>

                    <td>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => openUserDetails(u)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {ownerUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="table-empty">
                    No store owners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* ========== SECTION 6: STORE LIST ========== */}
      <div className="card table-card">
        <div className="card-header">
          <span className="card-title">Stores</span>
          <span className="card-subtitle">
            Name, Email, Address and Rating for all stores.
          </span>
        </div>

        {/* Filters */}
        <div className="form-row" style={{ marginBottom: "0.75rem" }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              name="name"
              className="form-input"
              value={storeFilters.name}
              onChange={handleStoreFilterChange}
              placeholder="Filter by name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              className="form-input"
              value={storeFilters.email}
              onChange={handleStoreFilterChange}
              placeholder="Filter by email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              name="address"
              className="form-input"
              value={storeFilters.address}
              onChange={handleStoreFilterChange}
              placeholder="Filter by address"
            />
          </div>
          <div className="form-group" style={{ alignSelf: "flex-end" }}>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={applyStoreFilters}
              style={{ marginRight: "0.4rem" }}
            >
              Apply
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={clearStoreFilters}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Store name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.email || "-"}</td>
                  <td>{s.address}</td>
                  <td>
                    {s.averageRating ? (
                      <span className="chip chip-rating">
                        {s.averageRating.toFixed(2)} ({s.ratingsCount})
                      </span>
                    ) : (
                      <span className="muted">No ratings</span>
                    )}
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan="4" className="table-empty">
                    No stores registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== SECTION 7: USER DETAILS (MODAL CARD) ========== */}
      {selectedUser && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">User details</span>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={closeUserDetails}
            >
              Close
            </button>
          </div>

          {!selectedUserDetails ? (
            <div className="muted">Loading user details...</div>
          ) : (
            <div className="stack-v">
              <div>
                <div className="card-section-title">Basic info</div>
                <div>Name: {selectedUserDetails.user.name}</div>
                <div>Email: {selectedUserDetails.user.email}</div>
                <div>Address: {selectedUserDetails.user.address}</div>
                <div>Role: {selectedUserDetails.user.role}</div>
              </div>

              {selectedUserDetails.user.role === "OWNER" && (
                <div>
                  <div className="card-section-title">Store owner rating</div>
                  {selectedUserDetails.ownerRating ? (
                    <div className="stack-v">
                      <span>
                        Average rating:{" "}
                        {selectedUserDetails.ownerRating.averageRating
                          ? selectedUserDetails.ownerRating.averageRating.toFixed(
                              2
                            )
                          : "No ratings yet"}
                      </span>
                      <span>
                        Total ratings:{" "}
                        {selectedUserDetails.ownerRating.ratingsCount}
                      </span>
                    </div>
                  ) : (
                    <span className="muted">
                      No store linked or no ratings.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
