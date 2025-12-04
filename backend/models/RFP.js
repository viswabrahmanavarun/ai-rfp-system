const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name: { type: String, default: "" },
  specs: { type: String, default: "" },
  unit: { type: String, default: "pcs" },
});

const RFPSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    requirements: { type: String, default: "" },
    budget: { type: String, default: "" },
    delivery_timeline: { type: String, default: "" },
    items: [ItemSchema],
    payment_terms: { type: String, default: "" },
    warranty: { type: String, default: "" },
    raw_text: { type: String, default: "" }, // FIXED
  },
  { timestamps: true }
);

module.exports = mongoose.model("RFP", RFPSchema);
