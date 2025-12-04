const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

router.get("/models", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const models = await client.models.list();
    res.json(models);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
