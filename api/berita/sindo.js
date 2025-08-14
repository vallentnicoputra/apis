const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class Sindonews {
  constructor() {
    this.baseURL = "https://nasional.sindonews.com";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $("div.list-article").each((i, el) => {
        if (hasil.length >= limit) return false;
        const anchor = $(el).find("a");
        const url = anchor.attr("href");
        const img = $(el).find("img.lazyload").attr("data-src");
        const title = $(el).find(".title-article").text().trim();
        const date = $(el).find(".date-article").text().trim();

        if (url && title && img) {
          hasil.push({
            status: 200,
            title: title,
            url: url.startsWith("http") ? url : this.baseURL + url,
            thumb: img,
            date: date,
          });
        }
      });

      const detailPromises = hasil.map((item) => this.getDetail(item.url));
      const details = await Promise.all(detailPromises);

      details.forEach((detail, index) => {
        hasil[index].detail = detail;
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

      const title = $("h1.title").text().trim() || $('meta[property="og:title"]').attr("content") || "";
      const description = $('meta[property="og:description"]').attr("content") || "";
      const image = $('meta[property="og:image"]').attr("content") || "";
      const publishedAt = $("div.date-article").text().trim();

      const content = [];
      $("#detail-desc p").each((i, el) => {
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
  app.get("/berita/sindonews", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const scraper = new Sindonews();
      const data = await scraper.getNews({ limit });
      res.json(data);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};