const express = require("express");
const router = express.Router();
const { sendRfpEmail } = require("../controllers/sendController");

router.post("/", sendRfpEmail);

module.exports = router;
