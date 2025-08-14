// api/religion/bacaanshalat.js
const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/religion/bacaanshalat", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/hamidamaulana/bacaan-sholat-main/main/assets/data/bacaanshalat.json"
      );
      const bacaan = await response.json();

      res.json({
        status: true,
        total: bacaan.length,
        data: bacaan
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message || "Gagal mengambil data bacaan shalat"
      });
    }
  });
};