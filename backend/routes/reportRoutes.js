const express = require("express");
const router = express.Router();

const {
  listReports,
  getReport,
  getReportPdf
} = require("../controllers/reportController");

// GET all reports
router.get("/", listReports);

// GET specific report comparison
router.get("/:rfpId", getReport);

// Download PDF
router.get("/:rfpId/pdf", getReportPdf);

module.exports = router;
