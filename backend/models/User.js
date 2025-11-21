const mongoose = require("mongoose");

const USER_ROLES = ["ADMIN", "USER", "OWNER"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    address: {
      type: String,
      maxlength: 400
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "USER"
    }
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  USER_ROLES
};
