const express = require("express");
const { body, validationResult } = require("express-validator");
const { User, USER_ROLES } = require("../models/User");
const Store = require("../models/Store");
const Rating = require("../models/Rating");
const auth = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const bcrypt = require("bcryptjs");

const router = express.Router();

const passwordValidator = (value) => {
  const lengthOk = value.length >= 8 && value.length <= 16;
  const upperCaseOk = /[A-Z]/.test(value);
  const specialOk = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  if (!lengthOk || !upperCaseOk || !specialOk) {
    throw new Error(
      "Password must be 8-16 chars, include at least one uppercase and one special character"
    );
  }
  return true;
};

const buildUserFilter = (q) => {
  const filter = {};
  if (q.name) filter.name = new RegExp(q.name, "i");
  if (q.email) filter.email = new RegExp(q.email, "i");
  if (q.address) filter.address = new RegExp(q.address, "i");
  if (q.role) filter.role = q.role;
  return filter;
};

const buildStoreFilter = (q) => {
  const filter = {};
  if (q.name) filter.name = new RegExp(q.name, "i");
  if (q.email) filter.email = new RegExp(q.email, "i");
  if (q.address) filter.address = new RegExp(q.address, "i");
  return filter;
};

const getSortOptions = (req, allowedFields, defaultField = "name") => {
  const sortBy = allowedFields.includes(req.query.sortBy)
    ? req.query.sortBy
    : defaultField;
  const sortDir = req.query.sortDir === "desc" ? -1 : 1;
  return { [sortBy]: sortDir };
};

// ---------- DASHBOARD STATS ----------
router.get("/stats", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalRatings = await Rating.countDocuments();
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- LIST USERS ----------
router.get("/users", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const filter = buildUserFilter(req.query);
    const sort = getSortOptions(req, ["name", "email", "address", "role", "createdAt"]);
    const users = await User.find(filter).select("-passwordHash").sort(sort);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- USER DETAILS (OWNER RATING EXTRA) ----------
router.get("/users/:id", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    let ownerRating = null;
    if (user.role === "OWNER") {
      const store = await Store.findOne({ owner: user._id });
      if (store) {
        ownerRating = {
          averageRating: store.averageRating,
          ratingsCount: store.ratingsCount
        };
      }
    }

    res.json({ user, ownerRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- ADD USER (ADMIN USE ONLY) ----------
router.post(
  "/users",
  auth,
  allowRoles("ADMIN"),
  [
    body("name").isLength({ min: 20, max: 60 }),
    body("email").isEmail(),
    body("address").isLength({ max: 400 }).optional({ nullable: true }),
    body("password").custom(passwordValidator),
    body("role").isIn(USER_ROLES)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, address, password, role } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already in use" });

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        address,
        passwordHash: hash,
        role
      });

      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- LIST STORES ----------
router.get("/stores", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const filter = buildStoreFilter(req.query);
    const sort = getSortOptions(req, ["name", "email", "address", "averageRating", "createdAt"]);
    const stores = await Store.find(filter).populate("owner", "name email").sort(sort);
    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- ADD STORE (ADMIN) ----------
router.post(
  "/stores",
  auth,
  allowRoles("ADMIN"),
  [
    body("name").notEmpty(),
    body("email").optional().isEmail(),
    body("address").optional().isLength({ max: 400 }),
    body("ownerId").optional().isMongoId()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, address, ownerId } = req.body;

      let owner = null;
      if (ownerId) {
        owner = await User.findById(ownerId);
        if (!owner || owner.role !== "OWNER") {
          return res.status(400).json({ message: "Invalid ownerId (must be OWNER)" });
        }
      }

      const store = await Store.create({
        name,
        email,
        address,
        owner: owner ? owner._id : null
      });

      res.status(201).json(store);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- STORE RATINGS (ADMIN VIEW) ----------
router.get("/stores/:id/ratings", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const ratings = await Rating.find({ store: store._id }).populate(
      "user",
      "name email"
    );

    res.json({
      store: {
        id: store._id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: store.averageRating,
        ratingsCount: store.ratingsCount
      },
      ratings: ratings.map((r) => ({
        id: r._id,
        value: r.value,
        user: {
          id: r.user._id,
          name: r.user.name,
          email: r.user.email
        },
        createdAt: r.createdAt
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- DELETE STORE ----------
router.delete("/stores/:id", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const storeId = req.params.id;

    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    await Rating.deleteMany({ store: store._id });
    await Store.findByIdAndDelete(storeId);

    res.json({ message: "Store and its ratings deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- DELETE USER ----------
router.delete("/users/:id", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Admin cannot delete self via this endpoint" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // delete ratings by this user
    await Rating.deleteMany({ user: user._id });

    // if OWNER, delete their stores & ratings
    if (user.role === "OWNER") {
      const stores = await Store.find({ owner: user._id });
      const storeIds = stores.map((s) => s._id);
      if (storeIds.length > 0) {
        await Rating.deleteMany({ store: { $in: storeIds } });
        await Store.deleteMany({ _id: { $in: storeIds } });
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "User and related data deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
