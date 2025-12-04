const { google } = require("googleapis");
const credentials = require("./credentials.json");

const { client_id, client_secret, redirect_uris } = credentials.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

exports.setAccessToken = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

exports.listEmails = async () => {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 20, // read last 20 emails
    q: "subject:RFP", // only proposals
  });

  return res.data.messages || [];
};

exports.getEmailBody = async (messageId) => {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const msg = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const body = msg.data.payload.parts?.[0]?.body?.data;

  if (!body) return "";

  return Buffer.from(body, "base64").toString("utf-8");
};
