const express = require("express");
const router = express.Router();

const { generateRFP } = require("../controllers/rfpAIController");
const { createRFP, getRfpById, getAllRfps } = require("../controllers/rfpAIController");


// ------------------------------
// AI Generate Structured RFP
// ------------------------------
router.post("/generate", generateRFP);

// ------------------------------
// Create new RFP
// ------------------------------
router.post("/create", createRFP);

// Allow GET /api/rfp/create (for frontend safety)
router.get("/create", (req, res) => {
  return res.json(null);
});

// ------------------------------
// Important: /all MUST come BEFORE /:id
// ------------------------------
router.get("/all", getAllRfps);

// ------------------------------
// Fetch RFP by ID (keep last)
// ------------------------------
router.get("/:id", getRfpById);

module.exports = router;
