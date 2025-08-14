const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/canvas/cardname", checkApiKeyAndLimit, async (req, res) => {
    try {
      const username = (req.query.username || "").trim();
      const birthday = (req.query.birthday || "").trim();
      const avatar = (req.query.avatar || "").trim();

      if (!username) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'username' wajib diisi!",
        });
      }
      if (!birthday) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'birthday' wajib diisi!",
        });
      }
      if (!avatar) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'avatar' wajib diisi!",
        });
      }

      const apiUrl = `https://api.some-random-api.com/canvas/misc/namecard?username=${encodeURIComponent(username)}&birthday=${encodeURIComponent(birthday)}&avatar=${encodeURIComponent(avatar)}`;

      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
      });

      const contentType = response.headers["content-type"] || "image/png";
      res.setHeader("Content-Type", contentType);
      res.end(Buffer.from(response.data));
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        error: err.message,
      });
    }
  });
};