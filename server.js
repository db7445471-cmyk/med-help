const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const medicineRoutes = require("./backend/routes/medicineRoutes.js");
const doctorRoutes = require("./backend/routes/doctorRoutes.js");
const locationRoutes = require("./backend/routes/locationRoutes.js");
const authRoutes = require("./backend/routes/authRoutes.js");
const aiRoutes = require("./backend/routes/aiRoutes.js");
const adminRoutes = require("./backend/routes/adminRoutes.js");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// MongoDB Connection with in-memory fallback for development
async function connectMongo() {
  const defaultUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medhelp";
  try {
    await mongoose.connect(defaultUri, { dbName: 'medhelp' });
    console.log("✅ MongoDB Connected");
    return;
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    // In development, automatically start an in-memory MongoDB
    if ((process.env.NODE_ENV || 'development') === 'development') {
      console.log('⚙️  Attempting to start in-memory MongoDB (development fallback)...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log('🟢 Connected to in-memory MongoDB');
        // keep reference so the process doesn't exit and so we could stop it later if needed
        process.__MONGOD__ = mongod;
        return;
      } catch (memErr) {
        console.error('❌ In-memory MongoDB Error:', memErr.message);
      }
    }

    // If we reach here, connection failed
    console.error('❌ Unable to connect to MongoDB. Continuing without DB — some endpoints may fail.');
  }
}

connectMongo();

// API Routes
app.use("/api/medicines", medicineRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "MedHelp server is running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  });
});

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "frontend")));

// Handle client-side routing - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;