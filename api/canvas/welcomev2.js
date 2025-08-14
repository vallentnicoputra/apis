const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/canvas/welcomev2", checkApiKeyAndLimit, async (req, res) => {
    try {
      const {
        type,
        textcolor,
        username,
        guildName,
        memberCount,
        avatar,
      } = req.query;

      console.log("Received query:", req.query);

      // Validasi parameter wajib
      if (!username || !guildName || !memberCount || !avatar) {
        console.log("Validation failed: missing required params");
        return res.status(400).json({
          status: false,
          error:
            "Parameter 'username', 'guildName', 'memberCount', dan 'avatar' wajib diisi!",
        });
      }

      const apiUrl = `https://api.some-random-api.com/welcome/img/2/night?type=${encodeURIComponent(
        type
      )}&textcolor=${encodeURIComponent(textcolor)}&username=${encodeURIComponent(
        username
      )}&guildName=${encodeURIComponent(guildName)}&memberCount=${encodeURIComponent(
        memberCount
      )}&avatar=${encodeURIComponent(avatar)}`;

      console.log("Calling external API:", apiUrl);

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      console.log("External API response headers:", response.headers);

      res.setHeader("Content-Type", "image/png");
      res.end(Buffer.from(response.data));
    } catch (error) {
      console.error("Error caught:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};