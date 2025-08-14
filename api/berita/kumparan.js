const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class Kumparan {
  constructor() {
    this.baseURL = "https://m.kumparan.com/channel/news";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $("a._918c86772.enabled").each((i, el) => {
        const beritaUrl = $(el).attr("href");
        const beritaTitle = $(el).find("span.Textweb__StyledText-sc-1ed9ao-0").text().trim();
        const beritaCat = $(el).find("span.Textweb__StyledText-sc-1ed9ao-0").text().trim();
        hasil.push({
          status: 200,
          title: beritaTitle || "No Title",
          url: beritaUrl ? `https://m.kumparan.com${beritaUrl}` : "No URL",
          category: beritaCat || "No Category",
        });
      });

      const filteredResults = hasil.slice(0, limit);
      const detailPromises = filteredResults.map(item => this.getDetail(item.url));
      const details = await Promise.all(detailPromises);
      details.forEach((detail, index) => {
        filteredResults[index].detail = detail;
      });

      return filteredResults;
    } catch (err) {
      return {
        status: false,
        message: err.message,
      };
    }
  }

  async getDetail(url) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $('meta[property="og:title"]').attr("content") || "";
      const description = $('meta[property="og:description"]').attr("content") || "";
      const image = $('meta[property="og:image"]').attr("content") || "";
      const content = [];

      $("span.Textweb__StyledText-sc-1ed9ao-0").each((i, el) => {
        const text = $(el).text().trim();
        if (text) content.push(text);
      });

      return {
        title,
        description,
        image,
        text: content.join("\n"),
      };
    } catch (err) {
      return {
        status: false,
        url,
        message: "Gagal mengambil detail",
        error: err.message,
      };
    }
  }
}

module.exports = (app) => {
  app.get("/berita/kumparan", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const scraper = new Kumparan();
      const data = await scraper.getNews({ limit });
      res.json(data);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};