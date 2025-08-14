const axios = require("axios");
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
class AIFreeBoxAI {
  constructor() {
    this.baseURL = "https://aifreebox.com/api";
    this.session = axios.create({
      baseURL: this.baseURL,
      headers: {
        accept: "*/*",
        "accept-language": "id-ID,id;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://aifreebox.com",
        pragma: "no-cache",
        priority: "u=1, i",
        referer: "https://aifreebox.com/image-generator/ai-vintage-film-noir-vibes-images-generator",
        "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge Simulate";v="131", "Lemur";v="131"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
      }
    });
  }
  async generateImage({
    prompt,
    ratio = "4:5",
    slug = "ai-vintage-film-noir-vibes-images-generator"
  }) {
    try {
      console.log(`Membuat gambar dengan prompt: "${prompt}"`);
      const response = await this.session.post("/image-generator", {
        userPrompt: prompt,
        aspectRatio: ratio,
        slug: slug
      });
      console.log("Permintaan berhasil dikirim.");
      return response.data;
    } catch (error) {
      console.error("Gagal membuat gambar:", error.message);
      if (error.response) {
        console.error("Data respons error:", error.response.data);
        console.error("Status respons error:", error.response.status);
        console.error("Header respons error:", error.response.headers);
      } else if (error.request) {
        console.error("Tidak ada respons yang diterima:", error.request);
      } else {
        console.error("Terjadi kesalahan saat menyiapkan permintaan:", error.message);
      }
      throw error;
    }
  }
}

  app.get("/text2image/vintagefilm", checkApiKeyAndLimit, async (req, res) => {
    try {
      const prompt = (req.query.text || "").trim();

      if (!prompt) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (prompt) wajib diisi!" });
      }

      const bot = new AIFreeBoxAI();
      const result = await bot.generateImage({ prompt });

      console.log("Hasil generate:", JSON.stringify(result, null, 2));

      const imageUrl = result?.imageUrl || result?.image_url || result?.data?.imageUrl;

      if (!imageUrl) {
        return res.status(500).json({
          status: false,
          error: "Gambar tidak ditemukan dalam respons."
        });
      }

      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });

      const contentType = imageResponse.headers["content-type"] || "image/jpeg";

      res.set("Content-Type", contentType);
      res.send(Buffer.from(imageResponse.data));
      
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};