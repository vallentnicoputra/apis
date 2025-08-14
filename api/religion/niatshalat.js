// api/religion/niatshalat.js
const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/religion/niatshalat", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/hamidamaulana/bacaan-sholat-main/main/assets/data/niatshalat.json"
      );
      const niat = await response.json();

      res.json({
        status: true,
        total: niat.length,
        data: niat
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message || "Gagal mengambil data niat shalat"
      });
    }
  });
};