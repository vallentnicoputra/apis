const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class Tribun {
  constructor() {
    this.baseURL = "https://m.tribunnews.com/news";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $("#latestul li").each((i, el) => {
        const beritaUrl = $(el).find("a").attr("href");
        const beritaTitle = $(el).find("h3 a").text().trim();
        const beritaCategory = $(el).find("h4 a").text().trim();
        const beritaDate = $(el).find("time.foot span.foot").text().trim();
        const beritaImage = $(el).find("img").attr("src");

        hasil.push({
          status: 200,
          title: beritaTitle || "No Title",
          url: beritaUrl ? `https://m.tribunnews.com${beritaUrl}` : "No URL",
          category: beritaCategory || "No Category",
          date: beritaDate || "No Date",
          image: beritaImage || "No Image",
        });
      });

      const filteredResults = hasil.slice(0, limit);

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
      const content = [];

      $("div.txt-article.multi-fontsize.mb20").each((i, el) => {
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
  app.get("/berita/tribun", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const scraper = new Tribun();
      const data = await scraper.getNews({ limit });
      res.json(data);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};