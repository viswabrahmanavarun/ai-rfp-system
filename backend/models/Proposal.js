const mongoose = require("mongoose");

const ProposalSchema = new mongoose.Schema(
  {
    rfpId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RFP",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    vendorEmail: { type: String, required: true },
    subject: { type: String },
    body: { type: String },
    extractedData: { type: Object }, // AI extracted fields (price, items, delivery, etc.)
    attachments: { type: Array },    // attachment metadata if needed
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proposal", ProposalSchema);
