const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

const fixUrl = url => url?.startsWith("//") ? url.replace(/^\/\//, "https://") : url;

class NobokepScraper {
  constructor() {
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    };
  }

  async search({ query }) {
    try {
      const searchUrl = `https://nobokep.life/?s=${encodeURIComponent(query)}`;
      const { data: html } = await axios.get(searchUrl, { headers: this.headers });
      const $ = cheerio.load(html);

      const results = $("article").map((i, el) => ({
        title: $(el).find("a").attr("title") || "No Title",
        link: $(el).find("a").attr("href") || "",
        duration: $(el).find(".duration").text() || "00:00"
      })).get();

      return results;
    } catch (error) {
      console.error("Search Error:", error.message);
      return [];
    }
  }

  async detail({ url }) {
    try {
      const { data: html } = await axios.get(url, { headers: this.headers });
      const $ = cheerio.load(html);

      return {
        meta: {
          author: $('meta[itemprop="author"]').attr("content") || "",
          name: $('meta[itemprop="name"]').attr("content") || "",
          description: $('meta[itemprop="description"]').attr("content") || "",
          duration: $('meta[itemprop="duration"]').attr("content") || "",
          thumbnail: $('meta[itemprop="thumbnailUrl"]').attr("content") || "",
          embed: fixUrl($('meta[itemprop="embedURL"]').attr("content") || ""),
          upload: $('meta[itemprop="uploadDate"]').attr("content") || ""
        },
        iframe: fixUrl($("iframe[data-lazy-src]").attr("data-lazy-src") || ""),
        download: $('a[onclick*="go"]').map((_, el) => fixUrl($(el).attr("onclick")?.split("'")[1])).get()
      };
    } catch (error) {
      console.error("Detail Error:", error.message);
      return null;
    }
  }
}

module.exports = (app) => {
  const scraper = new NobokepScraper();

  app.get("/nsfw/bokepindo/search", checkApiKeyAndLimit, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, message: "Parameter 'q' wajib diisi" });
    try {
      const data = await scraper.search({ query: q });
      res.json({ status: true, total: data.length, data });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  app.get("/nsfw/bokepindo/detail", checkApiKeyAndLimit, async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, message: "Parameter 'url' wajib diisi" });
    try {
      const data = await scraper.detail({ url });
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};