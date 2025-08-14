// api/religion/alkitab.js
const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class AlkitabScraper {
  async search(text) {
    try {
      const res = await axios.get(
        `https://alkitab.me/search?q=${encodeURIComponent(text)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
          },
        }
      );
      const $ = cheerio.load(res.data);
      const result = [];

      $("div.vw").each((i, el) => {
        const teks = $(el).find("p").text().trim();
        const link = $(el).find("a").attr("href");
        const title = $(el).find("a").text().trim();
        result.push({ teks, link, title });
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = (app) => {
  const scraper = new AlkitabScraper();

  app.get("/religion/alkitab", checkApiKeyAndLimit, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, error: "Parameter 'q' wajib diisi" });

    const data = await scraper.search(q);
    res.json({
      status: !data.error,
      data,
    });
  });
};