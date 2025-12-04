const express = require("express");
const router = express.Router();

// Main proposal controller (OAuth, proposals, sending emails, gmail fetch)
const { 
  getProposals, 
  getAuthUrl, 
  googleCallback,
  sendRFPToVendors,
  fetchProposalsFromGmail
} = require("../controllers/proposalController");

// Proposal comparison controller
const { compareProposals } = require("../controllers/proposalCompareController");


// ===============================
// GET ALL SAVED PROPOSALS
// ===============================
router.get("/all", getProposals);

// ===============================
// GOOGLE OAUTH FLOW
// ===============================
router.get("/auth", getAuthUrl);
router.get("/auth/google/callback", googleCallback);

// ===============================
// SEND RFP TO SELECTED VENDORS
// ===============================
router.post("/send", sendRFPToVendors);

// ===============================
// FETCH PROPOSALS FROM GMAIL
// ===============================
router.get("/gmail/fetch", fetchProposalsFromGmail);

// ===============================
// COMPARE PROPOSALS (AI SCORING)
// ===============================
router.post("/compare", compareProposals);

module.exports = router;
