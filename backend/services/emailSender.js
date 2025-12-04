// backend/services/emailSender.js
const nodemailer = require("nodemailer");

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

if (!user || !pass) {
  console.warn("EMAIL_USER or EMAIL_PASS not set. Email sending will fail.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass, // app password
  },
});

module.exports = async function sendEmail({ to, subject, text, html }) {
  const info = await transporter.sendMail({
    from: user,
    to,
    subject,
    text,
    html,
  });
  return info;
};
