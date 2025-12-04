const Groq = require("groq-sdk");
const RFP = require("../models/RFP");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* -------------------------------------------------------
   1️⃣  AI — Generate Structured RFP JSON
------------------------------------------------------- */
exports.generateRFP = async (req, res) => {
  try {
    const { title, description, requirements } = req.body;

    if (!title || !description || !requirements) {
      return res.status(400).json({
        success: false,
        error: "Title, description and requirements are required",
      });
    }

    const prompt = `
You MUST respond with ONLY valid JSON. No explanation, no comments.

Return JSON exactly like this:

{
  "title": "",
  "description": "",
  "requirements": "",
  "budget": "",
  "delivery_timeline": "",
  "items": [
    { "name": "", "quantity": 0, "specs": "", "unit": "" }
  ],
  "payment_terms": "",
  "warranty": "",
  "raw_text": ""
}

Now convert the following into JSON:

Title: ${title}
Description: ${description}
Requirements: ${requirements}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    let raw = response.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, "").trim(); // remove markdown

    let parsed;

    // Try parsing raw JSON
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON parse failed. Cleaning...");

      const cleaned = raw
        .replace(/\n|\r|\t/g, "")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .trim();

      try {
        parsed = JSON.parse(cleaned);
      } catch (finalErr) {
        return res.status(500).json({
          success: false,
          error: "AI returned invalid JSON format",
          ai_output: raw,
        });
      }
    }

    return res.json({
      success: true,
      data: parsed, // IMPORTANT — frontend expects this
    });
  } catch (err) {
    console.error("🔥 AI ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* -------------------------------------------------------
   2️⃣  Create RFP
------------------------------------------------------- */
exports.createRFP = async (req, res) => {
  try {
    const saved = await RFP.create(req.body);

    return res.json({
      success: true,
      data: saved,
    });
  } catch (err) {
    console.error("RFP CREATE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* -------------------------------------------------------
   3️⃣  Get Single RFP
------------------------------------------------------- */
exports.getRfpById = async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id);

    if (!rfp) {
      return res.status(404).json({ success: false, error: "RFP not found" });
    }

    return res.json({
      success: true,
      data: rfp,
    });
  } catch (err) {
    return res.status(404).json({
      success: false,
      error: "RFP not found",
    });
  }
};

/* -------------------------------------------------------
   4️⃣  Get All RFPs
------------------------------------------------------- */
exports.getAllRfps = async (req, res) => {
  try {
    const rfps = await RFP.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: rfps,
    });
  } catch (err) {
    console.error("ERROR FETCHING RFPs:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to load RFP list",
    });
  }
};
