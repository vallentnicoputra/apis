const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class CnbcNews {
  constructor() {
    this.baseURL = "https://www.cnbcindonesia.com/news";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $("article").each((i, el) => {
        if (hasil.length >= limit) return false;

        const anchor = $(el).find("a");
        const url = anchor.attr("href");
        const img = $(el).find("img").attr("src");
        const title = $(el).find("h2").text().trim();

        if (url && title && img) {
          hasil.push({
            status: 200,
            title,
            url,
            thumb: img,
          });
        }
      });

      const detailPromises = hasil.map((item) => this.getDetail(item.url));
      const details = await Promise.all(detailPromises);

      details.forEach((detail, i) => {
        hasil[i].detail = detail;
      });

      return hasil;
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

      const title = $("h1").text().trim() || "";
      const description = $('meta[name="description"]').attr("content") || "";
      const image = $('meta[property="og:image"]').attr("content") || "";
      const publishedAt = $("time").attr("datetime") || "";

      const content = [];
      $(".detail-text p").each((i, el) => {
        const text = $(el).text().trim();
        if (text) content.push(text);
      });

      return {
        title,
        description,
        image,
        publishedAt,
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
  app.get("/berita/cnbcindonesia", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const cnbc = new CnbcNews();
      const result = await cnbc.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};