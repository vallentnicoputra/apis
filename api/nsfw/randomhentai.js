const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class SfmCompile {
  constructor() {
    this.baseURL = "https://sfmcompile.club";
  }

  async getHentaiList() {
    try {
      const page = Math.floor(Math.random() * 1153) + 1;
      const url = `${this.baseURL}/page/${page}`;
      const response = await fetch(url);
      const htmlText = await response.text();
      const $ = cheerio.load(htmlText);

      const hasil = [];

      $("#primary > div > div > ul > li > article").each((_, el) => {
        const $el = $(el);
        hasil.push({
          title: $el.find("header > h2").text().trim(),
          link: $el.find("header > h2 > a").attr("href"),
          category: $el.find("header > div.entry-before-title > span > span").text().replace("in ", "").trim(),
          share_count: $el.find("header > div.entry-after-title > p > span.entry-shares").text().trim(),
          views_count: $el.find("header > div.entry-after-title > p > span.entry-views").text().trim(),
          type: $el.find("source").attr("type") || "image/jpeg",
          video_1: $el.find("source").attr("src") || $el.find("img").attr("data-src"),
          video_2: $el.find("video > a").attr("href") || "",
        });
      });

      return hasil;
    } catch (error) {
      console.error("Error fetching hentai list:", error);
      return {
        status: false,
        message: "Terjadi kesalahan saat mengambil daftar video hentai dari sfmcompile.club.",
        error: error.message,
      };
    }
  }
}

module.exports = (app) => {
  app.get("/nsfw/randomhentai", checkApiKeyAndLimit, async (req, res) => {
    try {
      const scraper = new SfmCompile();
      const data = await scraper.getHentaiList();
      res.json(data);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  });
};