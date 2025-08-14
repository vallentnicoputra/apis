const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class DetikNews {
  constructor() {
    this.baseURL = "https://news.detik.com/";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];
      const seenUrls = new Set();
      let articleCount = 0;
      const selectors = [
        "article.ph_newsfeed_m",
        "article.article_inview",
        "article.list-content__item",
        "article",
        "div.news",
        "div.list-content",
      ];

      for (const selector of selectors) {
        $(selector).each((_, el) => {
          articleCount++;
          const article = $(el);
          const a = article.find("a.block-link, a").first();
          const url = a.attr("href");
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            const title = a.find("div").text().trim() || a.text().trim();
            const thumbCss = article.find("span.ratiobox").css("background-image") || "";
            const imageMatch = thumbCss.match(/url\("([^"]+)"\)/);
            const imageUrl = imageMatch ? imageMatch[1] : null;
            hasil.push({
              status: 200,
              title,
              url,
              thumb: imageUrl,
            });
          }
        });
        if (hasil.length >= limit) break;
      }

      const filtered = hasil.slice(0, limit);
      const detailPromises = filtered.map((item) => this.getDetail(item.url));
      const details = await Promise.all(detailPromises);
      details.forEach((detail, i) => {
        filtered[i].detail = detail;
      });

      return filtered;
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

      const title = $("h1.detail__title").text().trim() || "";
      const image = $(".detail__media-image img").attr("src") || "";
      const author = $(".detail__author").text().trim() || "";
      const publishedAt = $(".detail__date").text().trim() || "";

      const content = [];
      $(".detail__body-text p").each((_, el) => {
        const text = $(el).text().trim();
        if (text) content.push(text);
      });

      return {
        title,
        author,
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
  app.get("/berita/detik", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const detik = new DetikNews();
      const result = await detik.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};