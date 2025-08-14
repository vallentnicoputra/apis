const fetch = require("node-fetch");
const cheerio = require("cheerio");
const path = require("path");
const { checkApiKeyAndLimit } = require("../../middleware");

async function tebakHewan() {
  const url = `https://rimbakita.com/daftar-nama-hewan-lengkap/${Math.floor(20 * Math.random()) + 1}/`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = $("div.entry-content.entry-content-single img[class*=wp-image-][data-src]")
      .map((_, el) => {
        const src = $(el).attr("data-src");
        const alt = path.basename(src, path.extname(src)).replace(/-/g, " ");
        return {
          title: alt.charAt(0).toUpperCase() + alt.slice(1),
          url: src,
        };
      })
      .get();
    return results;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

module.exports = (app) => {
  app.get("/game/tebakhewan", checkApiKeyAndLimit, async (req, res) => {
    try {
      const data = await tebakHewan();
      if (!data.length) return res.status(404).json({ status: false, message: "Data tidak ditemukan" });
      res.json({
        status: true,
        total: data.length,
        results: data,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
    }
  });
};