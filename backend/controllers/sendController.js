const nodemailer = require("nodemailer");
const RFP = require("../models/RFP");
const Vendor = require("../models/Vendor");

exports.sendRfpEmail = async (req, res) => {
  try {
    const { rfpId, vendorIds } = req.body;

    if (!rfpId || !vendorIds || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "RFP ID and vendor list are required",
      });
    }

    // Fetch RFP
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ success: false, error: "RFP not found" });
    }

    // Fetch selected vendors
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });

    // Gmail transporter using your existing variables
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email to each vendor
    for (let vendor of vendors) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: vendor.email,
        subject: `RFP Invitation: ${rfp.title}`,
        html: `
          <h2>${rfp.title}</h2>
          <p>${rfp.raw_text}</p>
          <hr>
          <p>Regards,<br/>AI-Powered RFP System</p>
        `,
      });
    }

    res.json({
      success: true,
      message: "RFP successfully sent to selected vendors!",
    });

  } catch (error) {
    console.error("❌ SEND EMAIL ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
