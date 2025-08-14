const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

const ACCESS_KEY = "b7e74af2d49675275c934455de1ef48fe8b6c0a3";

module.exports = (app) => {
  app.get("/game/tebakemoji", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        `https://emoji-api.com/emojis?access_key=${ACCESS_KEY}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data emoji");

      const emojis = await response.json();

      res.json({
        status: true,
        total: emojis.length,
        emojis,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};