const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class BBCIndonesia {
  constructor() {
    this.baseURL = "https://www.bbc.com/indonesia";
  }

  async getNews({ limit = 5 } = {}) {
    try {
      const { data } = await axios.get(this.baseURL);
      const $ = cheerio.load(data);
      const hasil = [];

      $('ul[data-testid="topic-promos"] > li').each((i, el) => {
        if (hasil.length >= limit) return false;

        const elLink = $(el).find("a");
        const elImg = $(el).find("img");
        const elDesc = $(el).find("p");
        const elTime = $(el).find("time");

        const href = elLink.attr("href") || "";
        const url = href.startsWith("http") ? href : `https://www.bbc.com${href}`;
        const title = elLink.text().trim();
        const thumb = elImg.attr("src") || "";
        const description = elDesc.text().trim() || "";
        const published = elTime.text().trim() || "";

        if (url && title) {
          hasil.push({
            status: 200,
            title,
            url,
            thumb,
            description,
            published,
          });
        }
      });

      const detailPromises = hasil.map((item) => this.getDetail(item.url));
      const details = await Promise.all(detailPromises);

      details.forEach((detail, idx) => {
        hasil[idx].detail = detail;
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

      const title = $('meta[property="og:title"]').attr("content") || "";
      const image = $('meta[property="og:image"]').attr("content") || "";
      const description = $('meta[property="og:description"]').attr("content") || "";
      const content = [];

      $('p[dir="ltr"]').each((i, el) => {
        const txt = $(el).text().trim();
        if (txt) content.push(txt);
      });

      return {
        title,
        image,
        description,
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
  app.get("/berita/bbcindonesia", checkApiKeyAndLimit, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const bbc = new BBCIndonesia();
      const result = await bbc.getNews({ limit });
      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};