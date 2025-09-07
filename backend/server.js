const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const medicineRoutes = require("./routes/medicineRoutes.js");
const doctorRoutes = require("./routes/doctorRoutes.js");
const locationRoutes = require("./routes/locationRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const aiRoutes = require("./routes/aiRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const app = express();
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medhelp";
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// API Routes
app.use("/api/medicines", medicineRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

// Serve frontend (static) if present
app.use(express.static(path.join(__dirname, "..", "frontend")));

const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// i want to change all navigation bar .without any other changes 