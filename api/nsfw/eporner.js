const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class EpornerScraper {
  constructor() {
    // Proxy base URL sesuai requestmu
    this.proxyBaseUrl = "https://maslent.site/tools/ex?url=&format=text&textOnly=false&ignoreLinks=false&apikey=maslent123";
    this.headers = {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    };
  }

  async search({ query }) {
    try {
      const targetUrl = `https://www.eporner.com/search?q=${encodeURIComponent(query)}`;
      const proxyRequestUrl = this.proxyBaseUrl.replace("url=", `url=${encodeURIComponent(targetUrl)}`);
      const { data: html } = await axios.get(proxyRequestUrl, { headers: this.headers });
      const $ = cheerio.load(html);

      const videos = $("#vidresults .mb").map((i, el) => {
        const videoEl = $(el);
        return {
          id: videoEl.data("id") || null,
          quality: videoEl.find(".mvhdico span").text() || null,
          title: videoEl.find(".mbtit a").text() || null,
          duration: videoEl.find(".mbtim").text() || null,
          rating: videoEl.find(".mbrate").text() || null,
          views: videoEl.find(".mbvie").text() || null,
          uploader: videoEl.find(".mb-uploader a").text() || null,
          url: new URL(videoEl.find(".mbtit a").attr("href"), "https://www.eporner.com").href,
          thumbnail: videoEl.find(".mbimg img").attr("src") || null
        };
      }).get();

      return videos;
    } catch (error) {
      console.error("Eporner Search Error:", error.message);
      return [];
    }
  }

  async detail({ url }) {
    try {
      const proxyRequestUrl = this.proxyBaseUrl.replace("url=", `url=${encodeURIComponent(url)}`);
      const { data: html } = await axios.get(proxyRequestUrl, { headers: this.headers });
      const $ = cheerio.load(html);

      const title = $('meta[property="og:title"]').attr("content") || null;
      const description = $('meta[property="og:description"]').attr("content") || null;
      const thumbnail = $('meta[property="og:image"]').attr("content") || null;

      const downloadLinks = $(".dloaddivcol .download-h264 a").map((i, el) => {
        const text = $(el).text().trim();
        const qualityMatch = text.match(/\d+p/);
        const sizeMatch = text.match(/\d+\.\d+\s*MB/);
        return {
          quality: qualityMatch ? qualityMatch[0] : null,
          url: new URL($(el).attr("href"), url).href,
          info: text,
          size: sizeMatch ? sizeMatch[0] : null
        };
      }).get();

      return { title, description, thumbnail, download: downloadLinks };
    } catch (error) {
      console.error("Eporner Detail Error:", error.message);
      return { title: null, description: null, thumbnail: null, download: [] };
    }
  }
};

module.exports = (app) => {
  const scraper = new EpornerScraper();

  app.get("/nsfw/eporner/search", checkApiKeyAndLimit, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, message: "Parameter 'q' wajib diisi" });
    try {
      const data = await scraper.search({ query: q });
      res.json({ status: true, total: data.length, data });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  app.get("/nsfw/eporner/detail", checkApiKeyAndLimit, async (req, res) => {
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