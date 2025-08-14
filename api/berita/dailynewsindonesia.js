const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class DailyNewsIndonesia {
  constructor() {
    this.baseURL = "https://dailynewsindonesia.com";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(`${this.baseURL}/category/news/`);
      const $ = cheerio.load(data);
      const hasil = [];

      $(".jeg_post").each((_, el) => {
        const title = $(el).find(".jeg_post_title a").text().trim();
        const url = $(el).find(".jeg_post_title a").attr("href");
        const thumb = $(el).find(".jeg_thumb img").attr("src");
        const category = $(el).find(".jeg_post_category span a").text().trim();
        const date = $(el).find(".jeg_meta_date a").text().trim();

        if (title && url && thumb) {
          hasil.push({
            status: 200,
            title,
            url,
            thumb,
            category,
            publishedAt: date,
          });
        }
      });

      const limited = hasil.slice(0, limit);
      const details = await Promise.all(limited.map((item) => this.getDetail(item.url)));
      details.forEach((detail, i) => {
        limited[i].detail = detail;
      });

      return limited;
    } catch (err) {
      return { status: false, message: err.message };
    }
  }

  async getDetail(url) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $(".entry-header .jeg_post_title").text().trim();
      const image = $(".jeg_featured img").attr("src");

      const content = [];
      $(".entry-content .content-inner p").each((_, el) => {
        const text = $(el).text().trim();
        if (text) content.push(text);
      });

      return {
        title,
        image,
        text: content.join("\n\n"),
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
  app.get("/berita/dailynewsindonesia", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const dailynews = new DailyNewsIndonesia();
      const result = await dailynews.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};