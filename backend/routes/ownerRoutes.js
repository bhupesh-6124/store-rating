const express = require("express");
const auth = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const Store = require("../models/Store");
const Rating = require("../models/Rating");

const router = express.Router();

// GET /api/owner/my-store/ratings
router.get("/my-store/ratings", auth, allowRoles("OWNER"), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found for owner" });

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

module.exports = router;
