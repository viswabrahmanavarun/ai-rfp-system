const express = require("express");
const router = express.Router();

const {
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor
} = require("../controllers/vendorController");

// GET all vendors
router.get("/all", getAllVendors);

// ADD vendor
router.post("/create", createVendor);

// UPDATE vendor
router.post("/update/:id", updateVendor);

// DELETE vendor
router.post("/delete/:id", deleteVendor);

module.exports = router;
