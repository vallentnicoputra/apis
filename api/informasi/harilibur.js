// api/tools/harilibur.js
const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class HariLiburChecker {
  async fetchHariLibur() {
    try {
      const { data: html } = await axios.get("https://www.liburnasional.com/");
      const $ = cheerio.load(html);

      const nextLibur = $("div.row.row-alert > div")
        .text()
        .split("Hari libur")[1]
        ?.trim() || "Tidak ditemukan";

      const libnas_content = $("tbody > tr > td > span > div")
        .map((index, element) => {
          const summary = $(element).find("span > strong > a").text() || "-";
          const days = $(element).find("div.libnas-calendar-holiday-weekday").text() || "-";
          const dateMonth = $(element).find("time.libnas-calendar-holiday-datemonth").text() || "-";
          return { summary, days, dateMonth };
        })
        .get();

      return { nextLibur, libnas_content };
    } catch (error) {
      throw new Error("Gagal mengambil data hari libur: " + error.message);
    }
  }
}

// Module export sebagai route API
module.exports = (app) => {
  const hariLiburChecker = new HariLiburChecker();

  app.get("/informasi/harilibur", checkApiKeyAndLimit, async (req, res) => {
    try {
      const result = await hariLiburChecker.fetchHariLibur();
      res.json({ status: true, data: result });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};