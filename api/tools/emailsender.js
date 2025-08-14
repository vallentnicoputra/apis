// api/tools/anonymousmail.js
const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

class AnonymousMailSender {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL: baseURL,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
        Referer: "https://send-anonymous-mail.vercel.app/"
      }
    });
  }

  async send({ to, subject, text }) {
    if (!to || !subject || !text) {
      throw new Error("Missing required fields for sending: to, subject, or text");
    }
    const response = await this.client.post("/api/v1/send-email", {
      to,
      subject,
      text
    });
    return response.data;
  }
}

module.exports = (app) => {
  app.get("/tools/emailsender", checkApiKeyAndLimit, async (req, res) => {
    const { to, subject, text } = req.query;

    if (!to || !subject || !text) {
      return res.status(400).json({
        status: false,
        error: "Missing required fields: to, subject, or text"
      });
    }

    const mailSender = new AnonymousMailSender("https://send-anonymous-mail.onrender.com");

    try {
      const result = await mailSender.send({ to, subject, text });
      return res.status(200).json({
        status: true,
        message: "Email sent successfully",
        result
      });
    } catch (error) {
      console.error("Failed to send anonymous email:", error);
      return res.status(500).json({
        status: false,
        error: "Failed to send email",
        details: error
      });
    }
  });
};