const axios = require('axios');
const cheerio = require('cheerio'); // WAJIB di-import kalau mau scraping HTML
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  class TextToImageGenerator {
    constructor() {
      this.client = axios.create({
        baseURL: "https://www.texttoimage.org",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "accept-language": "id-ID,id;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          origin: "https://www.texttoimage.org",
          pragma: "no-cache",
          priority: "u=1, i",
          referer: "https://www.texttoimage.org/",
          "sec-ch-ua": '"Lemur";v="135", "", "", "Microsoft Edge Simulate";v="135"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
          "x-requested-with": "XMLHttpRequest"
        }
      });
    }

    async getImageDetails(detailPageUrl) {
      try {
        const response = await this.client.get(detailPageUrl, {
          headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
          }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const details = {
          title: "N/A",
          description: "N/A",
          created_on: "N/A",
          image_url: "N/A",
          download_url: "N/A",
          likes: 0,
          share_url: "N/A",
          related_images: []
        };

        const mainImageAnchor = $(".image-container a");
        if (mainImageAnchor.length > 0) {
          details.image_url = this.client.defaults.baseURL + (mainImageAnchor.find("img").eq(0).attr("src") || "");
          details.download_url = this.client.defaults.baseURL + (mainImageAnchor.eq(0).attr("href") || "");
        }

        const promptInfo = $(".prompt-info");
        if (promptInfo.length > 0) {
          details.title = promptInfo.find("h1").eq(0).text().trim() || "N/A";
          details.description = promptInfo.find(".info-box div").eq(0).find("p").eq(0).text().trim() || "N/A";
          details.created_on = promptInfo.find(".info-box div").eq(1).find("p").eq(0).text().trim() || "N/A";
        }

        const likeButton = $(".action-btn.like-btn");
        if (likeButton.length > 0) {
          const likeCountText = likeButton.find(".like-count").eq(0).text().trim();
          details.likes = parseInt(likeCountText) || 0;
        }

        const shareButton = $(".action-btn.share-btn");
        if (shareButton.length > 0) {
          details.share_url = this.client.defaults.baseURL + (shareButton.eq(0).attr("data-url") || "");
        }

        details.related_images = $(".similar-gallery .gallery-item").get().map(_el => {
          const item = $(_el);
          const relatedImageSrc = item.find("img").eq(0).attr("src");
          const relatedImageTitle = item.find(".image-title").eq(0).text().trim();
          const relatedImageLink = item.eq(0).attr("href");
          if (relatedImageSrc && relatedImageTitle && relatedImageLink) {
            return {
              title: relatedImageTitle,
              link: this.client.defaults.baseURL + relatedImageLink,
              image: this.client.defaults.baseURL + relatedImageSrc
            };
          }
          return null;
        }).filter(item => item !== null);

        return { status: "success", data: details };
      } catch (error) {
        console.error(`Error fetching image details from ${detailPageUrl}: ${error.message}`);
        return { status: "error", message: error.message };
      }
    }

    async generate({ prompt }) {
      try {
        const response = await this.client.post("/generate", `prompt=${encodeURIComponent(prompt)}`);
        const generateResult = response.data;

        if (generateResult.success && generateResult.url) {
          const detailPageUrl = generateResult.url;
          console.log(`Image generated. Attempting to fetch details from: ${this.client.defaults.baseURL}${detailPageUrl}`);
          const detailsResult = await this.getImageDetails(detailPageUrl);

          if (detailsResult.status === "success") {
            return { status: "success", generation_info: generateResult, details: detailsResult.data };
          } else {
            return { status: "error", message: `Generated image, but failed to fetch details: ${detailsResult.message}` };
          }
        } else {
          return { status: "error", message: generateResult.message || "Image generation failed without a specific message." };
        }
      } catch (error) {
        console.error(`Error during image generation or detail fetch for prompt "${prompt}": ${error.message}`);
        return { status: "error", message: error.message };
      }
    }
  }

  // Route API
app.get("/text2image/imagine", checkApiKeyAndLimit, async (req, res) => {
  try {
    const prompt = (req.query.text || "").trim();

    if (!prompt) {
      return res.status(400).json({ status: false, error: "Parameter 'text' (prompt) wajib diisi!" });
    }

    const bot = new TextToImageGenerator();
    const result = await bot.generate({ prompt });

    console.log("Hasil generate:", JSON.stringify(result, null, 2));

    if (result.status !== "success") {
      return res.status(500).json({ status: false, error: result.message || "Gagal generate gambar." });
    }

    // Kirim hasil lengkap (generation_info + details lengkap termasuk related_images)
    return res.json({
      status: true,
      generation_info: result.generation_info,
      details: result.details
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: false, error: error.message });
  }
});
};