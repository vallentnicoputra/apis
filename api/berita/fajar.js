const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class FajarNews {
  constructor() {
    this.baseURL = "https://fajar.co.id/category/nasional/";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $("article").each((i, el) => {
        if (hasil.length >= limit) return false;
        const anchor = $(el).find(".post-thumbnail");
        const url = anchor.attr("href");
        const img = anchor.find("img").attr("src");
        const title = $(el).find(".entry-title a").text().trim();
        const author = $(el).find(".author.vcard a").text().trim();
        const date = $(el).find(".fa-clock-o").parent().text().trim();

        if (url && title && img) {
          hasil.push({
            status: 200,
            title,
            url,
            thumb: img,
            author,
            date,
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

      const title = $("h1.entry-title").text().trim();
      const description = $('meta[property="og:description"]').attr("content") || "";
      const image = $('meta[property="og:image"]').attr("content") || "";
      const publishedAt = $("span.posted-on").text().trim();

      const content = [];
      $(".entry-content p").each((i, el) => {
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
  app.get("/berita/fajar", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const fajar = new FajarNews();
      const result = await fajar.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};