const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class iNews {
  constructor() {
    this.baseURL = "https://www.inews.id/news";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $("article.cardArticle").each((i, el) => {
        const anchor = $(el).find("a");
        const beritaUrl = anchor.attr("href");
        const beritaImg = $(el).find("img.thumbCard").attr("src");
        const beritaCat = $(el).find("div.kanal").text().trim();
        const beritaTime = $(el).find("div.postTime").text().trim();
        const beritaTitle = $(el).find("h3.cardTitle").text().trim();

        hasil.push({
          status: 200,
          title: beritaTitle || "No Title",
          url: beritaUrl || "No URL",
          thumb: beritaImg || "No Image",
          category: beritaCat,
          time: beritaTime,
        });
      });

      const filteredResults = hasil.filter(
        (v) => v.title !== "No Title" && v.url !== "No URL" && v.thumb !== "No Image"
      ).slice(0, limit);

      const detailPromises = filteredResults.map((item) => this.getDetail(item.url));
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
      const publishedAt = $('meta[property="article:published_time"]').attr("content") || "";

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
  app.get("/berita/inews", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const inews = new iNews();
      const result = await inews.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};