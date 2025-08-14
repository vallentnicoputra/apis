const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class AntaraNews {
  constructor() {
    this.baseURL = "https://www.antaranews.com/top-news";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];
      $(".card__post.card__post-list.card__post__transition.mt-30").each((i, el) => {
        if (hasil.length >= limit) return false;
        const anchor = $(el).find(".card__post__title h2 a");
        const url = anchor.attr("href");
        const img = $(el).find("picture img.lazyload").attr("data-src");
        const title = anchor.attr("title");
        const time = $(el).find(".card__post__author-info .text-secondary").text().trim();

        if (url && title && img && time) {
          hasil.push({
            status: 200,
            title,
            url,
            thumb: img,
            time,
          });
        }
      });

      // Ambil detail tiap berita secara paralel
      const detailPromises = hasil.map((item) => this.getDetail(item.url));
      const details = await Promise.all(detailPromises);

      details.forEach((detail, idx) => {
        if (detail && detail.status !== false) {
          hasil[idx].detail = detail;
        } else {
          hasil[idx].detail = {
            status: false,
            message: "Gagal ambil detail",
          };
        }
      });

      return hasil;
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  async getDetail(url) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $(".wrap__article-detail-title h1").text().trim() || $('meta[property="og:title"]').attr("content") || "";
      const description = $('meta[property="og:description"]').attr("content") || "";
      const image = $('meta[property="og:image"]').attr("content") || "";
      const publishedAt = $(".wrap__article-detail-info .text-secondary").first().text().trim();

      const content = [];
      $(".wrap__article-detail-content.post-content p").each((i, el) => {
        const text = $(el).text().trim();
        if (text && !$(el).find("script").length) content.push(text);
      });

      if (!title || content.length === 0) {
        return {
          status: false,
          url,
          message: "Gagal ekstrak detail (judul atau isi kosong)",
        };
      }

      return {
        status: 200,
        title,
        description,
        image,
        publishedAt,
        text: content.join("\n"),
      };
    } catch (error) {
      return {
        status: false,
        url,
        message: "Gagal mengambil detail",
        error: error.message,
      };
    }
  }
}

module.exports = (app) => {
  app.get("/berita/antaranews", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const antara = new AntaraNews();
      const result = await antara.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};