// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const startEmailReceiver = require("./services/emailReceiver");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ROUTES IMPORT
const rfpRoutes = require("./routes/rfpRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const testRoutes = require("./routes/testRoutes");
const sendRFPRoutes = require("./routes/sendRoutes");
const reportRoutes = require("./routes/reportRoutes");   // ✅ ADDED

// ROUTES MAPPING
app.use("/api/rfp", rfpRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/test", testRoutes);
app.use("/api/send-rfp", sendRFPRoutes);
app.use("/api/reports", reportRoutes);   // ✅ ADDED

// Health Check
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// START SERVER
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
  startEmailReceiver();
});
