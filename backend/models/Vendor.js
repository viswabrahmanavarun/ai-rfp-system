const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String, required: true },
  phone: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Vendor", vendorSchema);
