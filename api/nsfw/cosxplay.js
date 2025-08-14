const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

class CosxplayScraper {
  constructor() {
    // Format proxy sesuai requestmu
    this.proxyBaseUrl = "https://maslent.site/tools/ex?url=&format=text&textOnly=false&ignoreLinks=false&apikey=maslent123";
    this.headers = {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36"
    };
  }

  async search({ query }) {
    try {
      const targetUrl = `https://cosxplay.com/?s=${encodeURIComponent(query)}`;
      // Proxy URL sesuai format wajib
      const proxyRequestUrl = this.proxyBaseUrl.replace("url=", `url=${encodeURIComponent(targetUrl)}`);
      const { data: htmlContent } = await axios.get(proxyRequestUrl, { headers: this.headers });
      const $ = cheerio.load(htmlContent);

      const videos = $("div.video-block.video-with-trailer").map((_, el) => {
        const videoElement = $(el);
        const linkElement = videoElement.find("a.thumb.ppopp");
        const imgElement = videoElement.find("a.thumb.ppopp img.video-img").first();
        const infosElement = videoElement.find("a.infos.ppopp");
        const getTextFromInfo = selector => {
          const found = infosElement.find(selector);
          return found.length ? found.clone().children().remove().end().text().trim() : null;
        };
        return {
          postId: videoElement.attr("data-post-id") || null,
          trailerUrl: videoElement.attr("data-trailer-url") || null,
          link: linkElement.attr("href") || null,
          imageUrl: imgElement.attr("data-src") || imgElement.attr("src") || null,
          title: infosElement.find(".title").text().trim() || null,
          views: getTextFromInfo(".views-number"),
          rating: getTextFromInfo(".rating"),
          duration: getTextFromInfo(".duration.notranslate")
        };
      }).get();

      return videos;
    } catch (error) {
      console.error("Cosxplay Search Error:", error.message);
      return [];
    }
  }

  async detail({ url }) {
    try {
      // Proxy URL sesuai format wajib
      const proxyRequestUrl = this.proxyBaseUrl.replace("url=", `url=${encodeURIComponent(url)}`);
      const { data: htmlContent } = await axios.get(proxyRequestUrl, { headers: this.headers });
      const $ = cheerio.load(htmlContent);

      let videoInfo = {
        title: null,
        description: null,
        duration: null,
        uploadDate: null,
        thumbnailUrl: null,
        embedUrl: null,
        keywords: null,
        views: null,
        likes: null,
        comments: null,
        posterUrl: null
      };
      let downloadLinks = {};
      let relatedVideos = [];
      let tags = [];
      let categories = [];

      // Parsing JSON-LD
      const jsonLdScript = $('script[type="application/ld+json"]').html();
      if (jsonLdScript) {
        try {
          const jsonData = JSON.parse(jsonLdScript);
          const videoObject = Array.isArray(jsonData) ? jsonData.find(i => i["@type"] === "VideoObject") : jsonData["@type"] === "VideoObject" ? jsonData : null;
          if (videoObject) {
            videoInfo.title = videoObject.name || videoInfo.title;
            videoInfo.description = videoObject.description || videoInfo.description;
            videoInfo.duration = videoObject.duration || videoInfo.duration;
            videoInfo.uploadDate = videoObject.uploadDate || videoInfo.uploadDate;
            videoInfo.thumbnailUrl = Array.isArray(videoObject.thumbnailUrl) ? videoObject.thumbnailUrl[0] : videoObject.thumbnailUrl;
            videoInfo.embedUrl = videoObject.embedUrl || videoInfo.embedUrl;
            videoInfo.keywords = Array.isArray(videoObject.keywords) ? videoObject.keywords.join(", ") : videoObject.keywords || videoInfo.keywords;

            if (videoObject.interactionStatistic) {
              const findStat = type => videoObject.interactionStatistic.find(stat => stat.interactionType.includes(type));
              const watch = findStat("WatchAction");
              const like = findStat("LikeAction");
              const comment = findStat("CommentAction");
              videoInfo.views = watch?.userInteractionCount || videoInfo.views;
              videoInfo.likes = like?.userInteractionCount || videoInfo.likes;
              videoInfo.comments = comment?.userInteractionCount || videoInfo.comments;
            }
          }
        } catch (e) {
          console.error("JSON-LD parse error:", e.message);
        }
      }

      // Download links
      $("video.xp-Player-video source").each((_, el) => {
        const src = $(el).attr("src");
        let quality = $(el).attr("title") || "unknown";
        if (src) downloadLinks[quality.toLowerCase()] = src;
      });

      return {
        info: videoInfo,
        download: downloadLinks,
        related: relatedVideos,
        categories,
        tags
      };
    } catch (error) {
      console.error("Cosxplay Detail Error:", error.message);
      return {
        info: {},
        download: {},
        related: [],
        categories: [],
        tags: []
      };
    }
  }
}

module.exports = (app) => {
  const scraper = new CosxplayScraper();

  app.get("/nsfw/cosxplay/search", checkApiKeyAndLimit, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, message: "Parameter 'q' wajib diisi" });
    try {
      const data = await scraper.search({ query: q });
      res.json({ status: true, total: data.length, data });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  app.get("/nsfw/cosxplay/detail", checkApiKeyAndLimit, async (req, res) => {
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