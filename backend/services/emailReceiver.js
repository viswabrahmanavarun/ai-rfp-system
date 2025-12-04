const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const Proposal = require("../models/Proposal");
const Vendor = require("../models/Vendor");
const RFP = require("../models/RFP");
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function startEmailReceiver() {
  const imap = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await imap.connect();
  console.log("📡 Connected to Gmail IMAP");

  let lock = await imap.getMailboxLock("INBOX");
  console.log("📥 Watching INBOX for emails...");

  imap.on("exists", async () => {
    console.log("\n🔔 New email received!");

    try {
      const message = await imap.fetchOne(imap.mailbox.exists, { source: true });
      const parsed = await simpleParser(message.source);

      const fromEmail = parsed.from?.value?.[0]?.address;
      const subject = parsed.subject || "";
      const body = parsed.text || parsed.html || "";

      console.log("📨 Subject:", subject);
      console.log("👤 From:", fromEmail);

      const match = subject.match(/RFP\s([a-fA-F0-9]{24})/);
      if (!match) {
        console.log("❌ No RFP ID found in subject");
        return;
      }

      const rfpId = match[1];

      const vendor = await Vendor.findOne({ email: fromEmail });
      if (!vendor) {
        console.log("❌ Vendor not registered:", fromEmail);
        return;
      }

      const prompt = `
Extract JSON only:
{
  "price": "",
  "delivery_days": "",
  "warranty": "",
  "items": []
}

Email:
"""${body}"""
`;

      let extracted = {};

      try {
        const aiRes = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
        });

        extracted = JSON.parse(aiRes.choices[0].message.content);
      } catch (err) {
        console.log("❌ AI Parsing Error:", err.message);
      }

      await Proposal.create({
        rfpId,
        vendorId: vendor._id,
        vendorEmail: vendor.email,
        subject,
        body,
        extractedData: extracted,
      });

      console.log("✅ Proposal saved to database!");

    } catch (err) {
      console.log("❌ ERROR processing email:", err.message);
    }
  });

  console.log("👀 Waiting for new emails...");
}

module.exports = startEmailReceiver;
