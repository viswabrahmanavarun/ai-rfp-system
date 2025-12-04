// backend/controllers/proposalCompareController.js

const Proposal = require("../models/Proposal");
const RFP = require("../models/RFP");
const Vendor = require("../models/Vendor");

exports.compareProposals = async (req, res) => {
  try {
    const { rfpId, vendorEmails } = req.body;

    console.log("🔵 Incoming compare request:", req.body);

    if (!rfpId) {
      return res.status(400).json({
        success: false,
        message: "rfpId is required",
      });
    }

    if (!vendorEmails || vendorEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No vendors selected",
      });
    }

    // ---------------------------------------
    // 1️⃣ FETCH THE RFP
    // ---------------------------------------
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({
        success: false,
        message: "RFP not found",
      });
    }

    // ---------------------------------------
    // 2️⃣ FETCH PROPOSALS FOR THIS RFP + VENDORS
    // ---------------------------------------
    const proposals = await Proposal.find({
      rfpId,
      vendorEmail: { $in: vendorEmails },
    });

    console.log("🟡 Found proposals:", proposals.length);

    if (!proposals.length) {
      return res.status(404).json({
        success: false,
        message: "No proposals found for selected vendors",
      });
    }

    // ---------------------------------------
    // 3️⃣ FETCH ALL VENDORS (for name lookup)
    // ---------------------------------------
    const vendorList = await Vendor.find({});
    const vendorMap = {};
    vendorList.forEach((v) => (vendorMap[v.email] = v.name));

    // ---------------------------------------
    // 4️⃣ SCORE EACH PROPOSAL
    // ---------------------------------------
    const results = [];

    for (const p of proposals) {
      const ex = p.extractedData || {};

      const price = Number(ex.price ?? Infinity);
      const delivery = Number(ex.delivery_days ?? Infinity);
      const warranty = Number(ex.warranty ?? 0);

      // Min/max calculations to avoid NaN
      const minPrice = price !== Infinity ? price : 0;
      const minDelivery = delivery !== Infinity ? delivery : 0;
      const maxWarranty = warranty > 0 ? warranty : 1;

      // SAFE scoring calculations
      const priceScore =
        price && price !== Infinity ? (minPrice / price) * 40 : 0;

      const deliveryScore =
        delivery && delivery !== Infinity
          ? (minDelivery / delivery) * 30
          : 0;

      const warrantyScore =
        warranty && warranty > 0 ? (warranty / maxWarranty) * 20 : 0;

      const total = priceScore + deliveryScore + warrantyScore;

      results.push({
        vendorName: vendorMap[p.vendorEmail] || p.vendorEmail,
        vendorEmail: p.vendorEmail,
        extractedData: ex,
        scores: {
          priceScore: priceScore.toFixed(2),
          deliveryScore: deliveryScore.toFixed(2),
          warrantyScore: warrantyScore.toFixed(2),
        },
        totalScore: total.toFixed(2),
      });
    }

    // ---------------------------------------
    // 5️⃣ SORT RESULTS DESCENDING (BEST FIRST)
    // ---------------------------------------
    results.sort((a, b) => b.totalScore - a.totalScore);

    return res.json({
      success: true,
      rfp,
      bestVendor: results[0],
      allVendors: results,
    });
  } catch (err) {
    console.error("COMPARE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
