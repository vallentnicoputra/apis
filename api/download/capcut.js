const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require('../../middleware'); 

module.exports = (app) => {//
class CapCutDL {
  constructor() {
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
    };
  }

  async getId(url) {
    try {
      const res = await axios.get(url, {
        headers: this.headers,
        maxRedirects: 5
      });
      const redirectedUrl = res.request.res.responseUrl;
      if (redirectedUrl) {
        const idStart = redirectedUrl.lastIndexOf("/") + 1;
        return redirectedUrl.substring(idStart);
      }
      return null;
    } catch (err) {
      console.error("Error getting ID:", err.message);
      return null;
    }
  }

  async getMeta(url) {
    try {
      const { data } = await axios.get(url, {
        headers: this.headers,
        maxRedirects: 5
      });
      const $ = cheerio.load(data);
      let metaData = null;

      $("script").each((_, el) => {
        const scriptText = $(el).html();
        if (scriptText?.includes("window._ROUTER_DATA")) {
          const jsonStr = scriptText.substring(
            scriptText.indexOf("{"),
            scriptText.lastIndexOf("}") + 1
          );
          try {
            metaData = JSON.parse(jsonStr);
            return false;
          } catch (e) {
            console.error("Error parsing ROUTER_DATA JSON:", e.message);
          }
        }
      });

      const template =
        metaData?.loaderData?.["template-detail_$"]?.templateDetail;

      if (template?.videoUrl) {
        return {
          title: template.title,
          desc: template.desc,
          like: template.likeAmount,
          play: template.playAmount,
          duration: template.templateDuration,
          usage: template.usageAmount,
          createTime: template.createTime,
          coverUrl: template.coverUrl,
          videoRatio: template.videoRatio,
          author: template.author
        };
      } else {
        throw new Error("Video URL not found");
      }
    } catch (err) {
      console.error("Error fetching CapCut metadata:", err.message);
      throw err;
    }
  }

  async getData(id) {
    try {
      const response = await axios.get(
        `https://www.capcut.com/templates/${id}`,
        { headers: this.headers }
      );
      const $ = cheerio.load(response.data);
      let videoData = null;

      $('script[type="application/ld+json"]').each((_, el) => {
        const scriptText = $(el).html();
        try {
          videoData = JSON.parse(scriptText);
          return false;
        } catch (e) {
          console.error("Error parsing LD+JSON:", e.message);
        }
      });

      if (videoData) {
        delete videoData["@context"];
        delete videoData["@type"];
      }

      return videoData || {};
    } catch (err) {
      console.error("Error fetching video data:", err.message);
      throw err;
    }
  }

  async download(url) {
    try {
      const id = await this.getId(url);
      if (!id) throw new Error("ID not found");

      const [data, meta] = await Promise.all([
        this.getData(id),
        this.getMeta(url)
      ]);

      return {
        status: true,
        message: "Success",
        data: {
          ...data,
          ...meta
        }
      };
    } catch (err) {
      console.error("Download failed:", err.message);
      throw err;
    }
  }
}

  app.get("/download/capcut", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter url Di Perlukan..!" });
      }
      const bot = new CapCutDL();
      const result = await bot.download(text); // ✅ fixed here
      res.status(200).json({
        status: true,
        creator: '@Maslent',
        result: result, // Perbaikan typo dari 'resul t'
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
