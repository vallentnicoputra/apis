const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class GoreScraper {
  static async getRandomPost() {
    try {
      // Pilih halaman random
      const page = Math.floor(Math.random() * 228);
      const listRes = await axios.get(`https://seegore.com/gore/page/${page}`);
      const $ = cheerio.load(listRes.data);

      const posts = [];
      $("ul > li > article").each((_, el) => {
        posts.push({
          title: $(el).find("div.content > header > h2").text(),
          link: $(el).find("div.post-thumbnail > a").attr("href"),
          thumb: $(el).find("div.post-thumbnail > a > div > img").attr("src"),
          view: $(el).find("span.post-meta-item.post-views").text(),
          vote: $(el).find("span.post-meta-item.post-votes").text(),
          tag: $(el).find("div.content > header > div > div.bb-cat-links").text(),
          comment: $(el).find("div.content > header > div > div.post-meta.bb-post-meta > a").text()
        });
      });

      if (posts.length === 0) throw new Error("Tidak menemukan posting di halaman ini");

      // Pilih salah satu post random
      const randomPost = posts[Math.floor(Math.random() * posts.length)];

      // Ambil detail post
      const detailRes = await axios.get(randomPost.link);
      const $$ = cheerio.load(detailRes.data);

      return {
        title: randomPost.title,
        source: randomPost.link,
        thumb: randomPost.thumb,
        tag: $$("div.site-main > div > header > div > div > p").text(),
        upload: $$("span.auth-posted-on > time:nth-child(2)").text(),
        author: $$("span.auth-name.mf-hide > a").text(),
        comment: randomPost.comment,
        vote: randomPost.vote,
        view: $$("span.post-meta-item.post-views.s-post-views.size-lg > span.count").text(),
        video1: $$("video > source").attr("src"),
        video2: $$("video > a").attr("href")
      };
    } catch (error) {
      console.error("Error fetching gore content:", error.message);
      throw error;
    }
  }
}

// Express endpoint
module.exports = (app) => {
  app.get("/webzone/randomgore", checkApiKeyAndLimit, async (req, res) => {
    try {
      const result = await GoreScraper.getRandomPost();
      res.json({ status: true, data: result });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};