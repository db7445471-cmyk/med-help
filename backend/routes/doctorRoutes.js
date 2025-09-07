const express = require("express");
const Doctor = require("../models/Doctor.js");

const router = express.Router();

// GET /api/doctors/get?location=Delhi&category=Cardiologist
router.get("/get", async (req, res) => {
  const { location = "", category = "" } = req.query;
  const nearby = req.query.nearby === '1' || req.query.nearby === 'true';

  try {
    const doctors = await Doctor.find({
      location: { $regex: location, $options: "i" },
      category: { $regex: category, $options: "i" },
    });

    // annotate response so client can show a 'Nearby' hint when requested
    const annotated = doctors.map(d => ({ ...d.toObject(), nearbyRequested: !!nearby }));

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        message: `No doctors found for category "${category}" in location "${location}".`,
      });
    }

  res.json(annotated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/doctors/add
router.post("/add", async (req, res) => {
  const { name, category, location, phone } = req.body;

  try {
    if (!name || !category || !location) {
      return res.status(400).json({ message: "Name, category, and location are required" });
    }

    const newDoctor = new Doctor({ name, category, location, phone });
    await newDoctor.save();
    res.status(201).json({ message: "Doctor created successfully", doctor: newDoctor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
