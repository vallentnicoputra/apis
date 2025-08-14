const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class IndozoneNews {
  constructor() {
    this.baseURL = "https://news.indozone.id";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $(".latest__item").each((i, el) => {
        if (hasil.length >= limit) return false;
        const anchor = $(el).find("a.latest__link");
        let url = anchor.attr("href");
        if (url && !url.startsWith("http")) url = this.baseURL + url;

        const img = $(el).find("img").attr("src");
        const title = $(el).find(".latest__title").text().trim();
        const subtitle = $(el).find(".latest__subtitle").text().trim();
        const date = $(el).find(".latest__date").text().trim();

        if (url && title && img) {
          hasil.push({
            status: 200,
            title,
            url,
            thumb: img,
            subtitle,
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

      const title = $('meta[property="og:title"]').attr("content") || "";
      const description = $('meta[property="og:description"]').attr("content") || "";
      const image = $('meta[property="og:image"]').attr("content") || "";
      const publishedAt = $(".latest__date").text().trim();

      const content = [];
      $("article.read__content p").each((i, el) => {
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
  app.get("/berita/indozone", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const indozone = new IndozoneNews();
      const result = await indozone.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};