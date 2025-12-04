const Vendor = require("../models/Vendor");

// --------------------------------------------------
// CREATE VENDOR
// --------------------------------------------------
exports.createVendor = async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;

    if (!name || !email || !company) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and company are required"
      });
    }

    const vendor = await Vendor.create({
      name,
      email,
      company,
      phone
    });

    res.json({
      success: true,
      message: "Vendor added successfully",
      data: vendor
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// GET ALL VENDORS
// --------------------------------------------------
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: vendors.length,
      data: vendors
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// UPDATE VENDOR
// --------------------------------------------------
exports.updateVendor = async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { name, email, company, phone },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found"
      });
    }

    res.json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --------------------------------------------------
// DELETE VENDOR
// --------------------------------------------------
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found"
      });
    }

    await Vendor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Vendor deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
