const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load .env file contents into process.env
dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    user: "syntrade.team@gmail.com",
    pass: "nxjosdhnczhdnpnl",
  },
});

module.exports = transporter;
