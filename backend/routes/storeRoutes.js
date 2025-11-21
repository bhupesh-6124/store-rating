const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Store = require("../models/Store");
const Rating = require("../models/Rating");

const router = express.Router();

// GET /api/stores  -> list/search stores for user, with sorting
router.get("/", auth, async (req, res) => {
  try {
    const { name, address } = req.query;
    const filter = {};
    if (name) filter.name = new RegExp(name, "i");
    if (address) filter.address = new RegExp(address, "i");

    const sortByAllowed = ["name", "address", "averageRating"];
    const sortBy = sortByAllowed.includes(req.query.sortBy)
      ? req.query.sortBy
      : "name";
    const sortDir = req.query.sortDir === "desc" ? -1 : 1;

    const stores = await Store.find(filter).sort({ [sortBy]: sortDir });

    const storeIds = stores.map((s) => s._id);
    const userRatings = await Rating.find({
      user: req.user._id,
      store: { $in: storeIds }
    });

    const ratingMap = {};
    userRatings.forEach((r) => {
      ratingMap[r.store.toString()] = r.value;
    });

    const result = stores.map((s) => ({
      id: s._id,
      name: s.name,
      address: s.address,
      overallRating: s.averageRating,
      ratingsCount: s.ratingsCount,
      userRating: ratingMap[s._id.toString()] || null
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/stores/:id/ratings  -> submit / update rating 1–5
router.post(
  "/:id/ratings",
  auth,
  [body("value").isInt({ min: 1, max: 5 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(404).json({ message: "Store not found" });

      const { value } = req.body;

      let rating = await Rating.findOne({
        user: req.user._id,
        store: store._id
      });

      if (!rating) {
        rating = await Rating.create({
          user: req.user._id,
          store: store._id,
          value
        });
      } else {
        rating.value = value;
        await rating.save();
      }

      const agg = await Rating.aggregate([
        { $match: { store: store._id } },
        { $group: { _id: "$store", avg: { $avg: "$value" }, count: { $sum: 1 } } }
      ]);

      if (agg.length > 0) {
        store.averageRating = agg[0].avg;
        store.ratingsCount = agg[0].count;
        await store.save();
      }

      res.json({ message: "Rating submitted", ratingValue: value });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
