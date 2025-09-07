const express = require("express");
const Medicine = require("../models/Medicine.js");

const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/medicines/get?location=Delhi&name=Paracetamol
router.get("/get", async (req, res) => {
  const { location = "", name = "" } = req.query;
  const nearby = req.query.nearby === '1' || req.query.nearby === 'true';

  try {
    const query = {
      location: { $regex: location, $options: "i" },
      name: { $regex: name, $options: "i" },
    };
    if (nearby) {
      // only return medicines with availability > 0 when user requests nearby
      query.availability = { $gt: 0 };
    }

    const medicines = await Medicine.find(query);

    if (!medicines || medicines.length === 0) {
      return res.status(404).json({ message: "No medicine found" });
    }

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/medicines/add
router.post("/add", auth, async (req, res) => {
  const { name, location, availability = 0 } = req.body;

  try {
    if (!name || !location) {
      return res.status(400).json({ message: "Name and location are required" });
    }

  const newMedicine = new Medicine({ name, location, availability, addedBy: req.doctor._id });
    await newMedicine.save();
    res.status(201).json({ message: "Medicine created successfully", medicine: newMedicine });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
