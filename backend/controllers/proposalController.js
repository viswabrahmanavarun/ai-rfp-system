// backend/controllers/proposalController.js

const Proposal = require("../models/Proposal");
const Vendor = require("../models/Vendor");
const RFP = require("../models/RFP");
const { google } = require("googleapis");

const sendEmail = require("../services/emailSender");

// Gmail reading + AI extraction
const { listEmails, getEmailBody } = require("../services/gmailService");
const { extractProposal } = require("../services/extractProposal");

// OAuth Credentials
const credentials = require("../services/credentials.json");
const { client_id, client_secret, redirect_uris } = credentials.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// ================================
// GET ALL PROPOSALS
// ================================
exports.getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: proposals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ================================
// GOOGLE AUTH URL
// ================================
exports.getAuthUrl = async (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    });

    res.json({ success: true, authUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ================================
// GOOGLE CALLBACK
// ================================
exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.json({
      success: true,
      message: "Google authentication successful",
      tokens,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ================================
// SEND RFP TO SELECTED VENDORS
// ================================
exports.sendRFPToVendors = async (req, res) => {
  try {
    const { rfpId, vendorIds } = req.body;

    if (!rfpId || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "rfpId and vendorIds are required",
      });
    }

    const rfp = await RFP.findById(rfpId);
    if (!rfp) return res.status(404).json({ success: false, message: "RFP not found" });

    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    const results = [];

    for (const vendor of vendors) {
      const subject = `RFP Request: ${rfp.title}`;

      const htmlBody = `
        <p>Hello ${vendor.name},</p>
        <p>Please submit your proposal for this RFP:</p>
        <pre>${JSON.stringify(rfp, null, 2)}</pre>
        <p>Reply with price, delivery days, and warranty details.</p>
      `;

      // Save EMPTY proposal first
      const savedProposal = await Proposal.create({
        rfpId,
        vendorId: vendor._id,
        vendorEmail: vendor.email,
        subject,
        body: htmlBody,
        extractedData: {}, // AI extraction will fill this later
      });

      // Send Email
      await sendEmail({
        to: vendor.email,
        subject,
        html: htmlBody,
      });

      results.push({
        vendor: vendor.email,
        proposalId: savedProposal._id,
        status: "sent",
      });
    }

    res.json({
      success: true,
      message: "RFP sent successfully!",
      proposalsCreated: results,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ================================
// AUTO-FETCH PROPOSALS FROM GMAIL
// ================================
exports.fetchProposalsFromGmail = async (req, res) => {
  try {
    const emails = await listEmails();
    if (!emails.length)
      return res.json({ success: true, message: "No new emails found" });

    const savedResults = [];

    for (const mail of emails) {
      const body = await getEmailBody(mail.id);
      const extracted = await extractProposal(body);

      if (!extracted) continue;

      console.log("🟢 Extracted Proposal:", extracted);

      // 1️⃣ Identify Vendor
      let vendorMatch = null;

      if (extracted.vendorEmail) {
        vendorMatch = await Vendor.findOne({ email: extracted.vendorEmail });
      }

      if (!vendorMatch && extracted.vendorName) {
        vendorMatch = await Vendor.findOne({ name: extracted.vendorName });
      }

      if (!vendorMatch) {
        console.log("❌ Vendor not found:", extracted);
        continue;
      }

      // 2️⃣ Identify RFP
      let rfpMatch = null;

      if (extracted.rfpTitle) {
        rfpMatch = await RFP.findOne({
          title: { $regex: extracted.rfpTitle, $options: "i" },
        });
      }

      if (!rfpMatch) {
        console.log("❌ RFP not found:", extracted.rfpTitle);
        continue;
      }

      // 3️⃣ Save Proposal
      const proposal = await Proposal.create({
        rfpId: rfpMatch._id,
        vendorId: vendorMatch._id,
        vendorEmail: vendorMatch.email,
        subject: "Auto Extracted Proposal",
        body,
        extractedData: extracted,
      });

      savedResults.push(proposal);
    }

    return res.json({ success: true, proposals: savedResults });
  } catch (err) {
    console.error("FETCH EMAIL ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
