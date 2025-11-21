const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User } = require("../models/User");
const Store = require("../models/Store");
const auth = require("../middleware/auth");

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

// ---------- NORMAL USER SIGNUP ----------
router.post(
  "/signup",
  [
    body("name").isLength({ min: 20, max: 60 }),
    body("email").isEmail(),
    body("address").isLength({ max: 400 }),
    body("password").custom(passwordValidator)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, address, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        address,
        passwordHash: hash,
        role: "USER"
      });

      res.status(201).json({
        message: "User signup successful",
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- STORE OWNER SIGNUP (WITH STORE INFO) ----------
router.post(
  "/signup-owner",
  [
    // owner user fields
    body("name").isLength({ min: 20, max: 60 }),
    body("email").isEmail(),
    body("address").isLength({ max: 400 }),
    body("password").custom(passwordValidator),

    // store fields
    body("storeName").notEmpty(),
    body("storeEmail").optional().isEmail(),
    body("storeAddress").isLength({ max: 400 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const {
        name,
        email,
        address,
        password,
        storeName,
        storeEmail,
        storeAddress
      } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);

      // create owner user
      const owner = await User.create({
        name,
        email,
        address,
        passwordHash: hash,
        role: "OWNER"
      });

      // create store for this owner
      const store = await Store.create({
        name: storeName,
        email: storeEmail,
        address: storeAddress,
        owner: owner._id
      });

      res.status(201).json({
        message: "Store owner signup successful",
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          role: owner.role
        },
        store: {
          id: store._id,
          name: store.name,
          email: store.email,
          address: store.address
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- LOGIN (ALL ROLES) ----------
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- CHANGE PASSWORD (ALL LOGGED-IN USERS) ----------
router.put(
  "/password",
  auth,
  [body("newPassword").custom(passwordValidator)],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { newPassword } = req.body;
      const hash = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(req.user._id, { passwordHash: hash });
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
