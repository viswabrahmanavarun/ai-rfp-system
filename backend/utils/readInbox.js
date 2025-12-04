const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const Proposal = require("../models/Proposal");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY
});

async function readInbox() {
  const config = {
    imap: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      authTimeout: 5000
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox("INBOX");

    const searchCriteria = ["UNSEEN"]; // unread emails
    const fetchOptions = { bodies: ["HEADER", "TEXT"], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const msg of messages) {
      const all = msg.parts.filter((p) => p.which === "TEXT")[0];
      const raw = all.body;

      const parsed = await simpleParser(raw);

      // Extract using AI
      const prompt = `
      Extract details from this vendor proposal email:

      "${parsed.text}"

      Return JSON:
      {
        "vendor_name": "",
        "quoted_price": "",
        "delivery_days": "",
        "warranty": "",
        "payment_terms": ""
      }
      `;

      const aiResp = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0
      });

      const extracted = JSON.parse(aiResp.choices[0].message.content);

      // Save in DB
      await Proposal.create({
        vendorEmail: parsed.from.text,
        subject: parsed.subject,
        body: parsed.text,
        extractedData: extracted,
        attachments: parsed.attachments
      });

      console.log(`📥 Saved proposal from ${parsed.from.text}`);
    }

    connection.end();
  } catch (error) {
    console.error("INBOX ERROR:", error);
  }
}

module.exports = readInbox;
