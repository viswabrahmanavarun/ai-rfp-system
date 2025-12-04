const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.extractProposal = async (emailText) => {
  const prompt = `
Given this vendor proposal email:

${emailText}

Extract structured JSON with:
{
  "price": number,
  "delivery_days": number,
  "warranty_years": number,
  "items": [
      { "name": string, "quantity": number }
  ]
}
Only output valid JSON.
  `;

  const response = await client.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "mixtral-8x7b-32768",
    temperature: 0,
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("AI JSON parse error:", err);
    return null;
  }
};
