require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("./models/User");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "fullstack_rating_app"
    });

    const email = "admin@example.com";
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists:", email);
      return process.exit(0);
    }

    const hash = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "Application System Administrator",
      email,
      address: "Head Office",
      passwordHash: hash,
      role: "ADMIN"
    });

    console.log("Admin created:");
    console.log("Email:", email);
    console.log("Password: Admin@123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
