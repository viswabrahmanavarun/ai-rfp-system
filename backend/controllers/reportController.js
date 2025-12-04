// backend/controllers/reportController.js

const Proposal = require("../models/Proposal");
const RFP = require("../models/RFP");
const Vendor = require("../models/Vendor");
const PDFDocument = require("pdfkit");

/* ============================================================
   🔵 HELPER: Compute full comparison (same as proposals compare)
=============================================================== */
async function computeComparison(rfpId) {
  const rfp = await RFP.findById(rfpId);
  if (!rfp) throw new Error("RFP not found");

  let proposals = await Proposal.find({ rfpId });

  // Vendor name map
  const vendors = await Vendor.find({});
  const vendorMap = {};
  vendors.forEach((v) => (vendorMap[v.email] = v.name));

  // Normalize extractedData
  proposals = proposals.map((p) => {
    const extracted = p.extractedData || {};

    const price = parseFloat(extracted.price) || Infinity;
    const delivery = parseFloat(extracted.delivery_days) || Infinity;
    const warranty = parseFloat(extracted.warranty) || 0;

    // Items fallback
    const items =
      Array.isArray(extracted.items) && extracted.items.length
        ? extracted.items
        : (extracted.items_text || "")
            .toString()
            .split(",")
            .map((s) => ({ name: s.trim(), quantity: 1 }))
            .filter((i) => i.name);

    return {
      ...p.toObject(),
      extractedData: {
        ...extracted,
        price,
        delivery_days: delivery,
        warranty,
        items,
      },
    };
  });

  if (!proposals.length) {
    return { rfp, results: [] };
  }

  // Scoring parameters
  const prices = proposals.map((p) => p.extractedData.price);
  const deliveries = proposals.map((p) => p.extractedData.delivery_days);
  const warranties = proposals.map((p) => p.extractedData.warranty);

  const minPrice = Math.min(...prices);
  const minDelivery = Math.min(...deliveries);
  const maxWarranty = Math.max(...warranties);

  const results = [];

  for (const p of proposals) {
    const extracted = p.extractedData;

    const priceScore =
      minPrice !== Infinity && extracted.price !== Infinity
        ? (minPrice / extracted.price) * 40
        : 0;

    const deliveryScore =
      minDelivery !== Infinity && extracted.delivery_days !== Infinity
        ? (minDelivery / extracted.delivery_days) * 30
        : 0;

    const warrantyScore =
      maxWarranty > 0 ? (extracted.warranty / maxWarranty) * 20 : 0;

    // Item matching
    const vendorItems = extracted.items || [];
    const rfpItems = rfp.items || [];
    let matchCount = 0;

    vendorItems.forEach((vi) => {
      rfpItems.forEach((ri) => {
        if (
          vi.name?.toLowerCase() === ri.name?.toLowerCase() &&
          Number(vi.quantity || 1) >= Number(ri.quantity || 1)
        ) {
          matchCount++;
        }
      });
    });

    const itemScore =
      rfpItems.length > 0 ? (matchCount / rfpItems.length) * 10 : 0;

    const totalScore =
      priceScore + deliveryScore + warrantyScore + itemScore;

    results.push({
      proposalId: p._id,
      vendorEmail: p.vendorEmail,
      vendorName: vendorMap[p.vendorEmail] || p.vendorEmail,
      extracted,
      scores: {
        priceScore: Number(priceScore.toFixed(2)),
        deliveryScore: Number(deliveryScore.toFixed(2)),
        warrantyScore: Number(warrantyScore.toFixed(2)),
        itemScore: Number(itemScore.toFixed(2)),
      },
      totalScore: Number(totalScore.toFixed(2)),
    });
  }

  results.sort((a, b) => b.totalScore - a.totalScore);

  return { rfp, results };
}

/* ============================================================
   🔵 GET /api/reports → list all RFPs + proposalCount
=============================================================== */
exports.listReports = async (req, res) => {
  try {
    const rfps = await RFP.find().sort({ createdAt: -1 });

    const list = await Promise.all(
      rfps.map(async (r) => {
        const count = await Proposal.countDocuments({ rfpId: r._id });
        return {
          _id: r._id,
          title: r.title,
          createdAt: r.createdAt,
          proposalCount: count,
        };
      })
    );

    res.json({ success: true, data: list });
  } catch (err) {
    console.error("REPORT LIST ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ============================================================
   🔵 GET /api/reports/:rfpId → full comparison
=============================================================== */
exports.getReport = async (req, res) => {
  try {
    const { rfpId } = req.params;
    const comp = await computeComparison(rfpId);
    res.json({ success: true, ...comp });
  } catch (err) {
    console.error("GET REPORT ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ============================================================
   🔵 GET /api/reports/:rfpId/pdf → Generate PDF
=============================================================== */
exports.getReportPdf = async (req, res) => {
  try {
    const { rfpId } = req.params;
    const { rfp, results } = await computeComparison(rfpId);

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="report_${rfpId}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(18).text(`Comparison Report — ${rfp.title}`, {
      align: "center",
    });
    doc.moveDown();

    // RFP Summary
    doc.fontSize(12).text(`RFP ID: ${rfp._id}`);
    doc.text(`Title: ${rfp.title}`);
    if (rfp.budget) doc.text(`Budget: ${rfp.budget}`);
    if (rfp.delivery_timeline)
      doc.text(`Delivery Timeline: ${rfp.delivery_timeline}`);
    doc.moveDown();

    // Comparison list
    doc.fontSize(12).text("Vendor Comparisons:", { underline: true });
    doc.moveDown(0.5);

    results.forEach((r, idx) => {
      doc.fontSize(11).text(`${idx + 1}. ${r.vendorName} (${r.vendorEmail})`);
      doc.fontSize(10).list([
        `Total Score: ${r.totalScore}`,
        `Price Score: ${r.scores.priceScore}`,
        `Delivery Score: ${r.scores.deliveryScore}`,
        `Warranty Score: ${r.scores.warrantyScore}`,
        `Item Score: ${r.scores.itemScore}`,
      ]);

      if (r.extracted.items?.length) {
        doc.text("Items:");
        r.extracted.items.forEach((i) =>
          doc.text(` - ${i.name} × ${i.quantity || 1}`, { indent: 10 })
        );
      }

      doc.moveDown(0.5);
    });

    // Best Vendor Page
    if (results.length) {
      const best = results[0];
      doc.addPage();
      doc.fontSize(14).text("Best Vendor Recommendation", {
        underline: true,
      });
      doc.moveDown();

      doc.fontSize(12).text(
        `${best.vendorName} (${best.vendorEmail}) — Score: ${best.totalScore}`
      );
      doc.moveDown();
      doc.text("Extracted Details:");
      doc.text(JSON.stringify(best.extracted, null, 2), { fontSize: 10 });
    }

    doc.end();
  } catch (err) {
    console.error("PDF GENERATION ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
