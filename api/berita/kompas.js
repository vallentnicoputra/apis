const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class KompasNews {
  constructor() {
    this.baseURL = "https://news.kompas.com/";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $(".mostList .mostItem").each((i, el) => {
        if (hasil.length >= limit) return false;
        const anchor = $(el).find("a.mostItem-link");
        const url = anchor.attr("href");
        const img = $(el).find("img").attr("src");
        const title = $(el).find("h2.mostItem-title").text().trim();
        const subtitle = $(el).find("div.mostItem-subtitle").text().trim();

        if (url) {
          hasil.push({
            status: 200,
            title,
            subtitle,
            url,
            thumb: img,
          });
        }
      });

      const detailPromises = hasil.map(item => this.getDetail(item.url));
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

      const title =
        $("h1.article-title").text().trim() ||
        $('meta[property="og:title"]').attr("content") ||
        "";
      const description = $('meta[property="og:description"]').attr("content") || "";
      const image = $('meta[property="og:image"]').attr("content") || "";
      const publishedAt = $("div.read__time").text().trim();

      const content = [];
      $("p").each((i, el) => {
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
  app.get("/berita/kompas", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const kompas = new KompasNews();
      const result = await kompas.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};