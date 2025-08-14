const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class CNNIndonesia {
  constructor() {
    this.baseURL = "https://www.cnnindonesia.com";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $("article").each((i, el) => {
        const berita = $(el).find("a").attr("href");
        const title = $(el).find("img").attr("alt") || "No Title";
        const thumb = $(el).find("img").attr("src") || "No Image";

        hasil.push({
          status: 200,
          title,
          url: berita || "No URL",
          thumb,
        });
      });

      // Filter data yang valid dan batasi sesuai limit
      const filteredResults = hasil
        .filter(
          (v) =>
            v.title !== "No Title" && v.url !== "No URL" && v.thumb !== "No Image"
        )
        .slice(0, limit);

      const detailPromises = filteredResults.map((item) =>
        this.getDetail(item.url)
      );
      const details = await Promise.all(detailPromises);

      details.forEach((detail, i) => {
        filteredResults[i].detail = detail;
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
      const publishedAt = $("strong").first().text().trim() || "";

      const content = [];
      $(".detail-text > p").each((i, el) => {
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
  app.get("/berita/cnn", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const cnn = new CNNIndonesia();
      const result = await cnn.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};