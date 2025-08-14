const axios = require('axios');
const crypto = require('crypto');
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  class PadletImageGenerator {
    constructor() {
      this.padletApiBase = "https://ta.padlet.com/api";
      this.baseUrl = "https://ta.padlet.com";
      console.log("[Inisialisasi] Kelas PadletImageGenerator diinisialisasi.");
    }
    randomCryptoIP() {
      const bytes = crypto.randomBytes(4);
      return Array.from(bytes).map(b => b % 256).join(".");
    }
    randomID(length = 16) {
      return crypto.randomBytes(length).toString("hex");
    }
    buildHeaders(extra = {}) {
      const ip = this.randomCryptoIP();
      return {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
        Referer: `${this.baseUrl}/image-generator/nlp8YbOlKX`,
        Origin: this.baseUrl,
        "x-forwarded-for": ip,
        "x-real-ip": ip,
        "x-request-id": this.randomID(8),
        ...extra
      };
    }
    async generate({
      prompt = "a futuristic city skyline at sunset, cyberpunk style, neon lights, high detail",
      ratio = "16:9"
    }) {
      const url = `${this.padletApiBase}/ai-generate-image`;
      const headers = this.buildHeaders();
      const body = {
        prompt: prompt,
        ratio: ratio
      };
      console.log(`[Padlet AI] Mengirim permintaan pembuatan gambar dengan prompt: "${prompt}" dan rasio: "${ratio}"...`);
      try {
        const response = await axios.post(url, body, {
          headers: headers
        });
        console.log("[Padlet AI] Respons berhasil diterima:");
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (error) {
        console.error(`[Padlet AI] Gagal menghasilkan gambar: ${error.message}`);
        if (error.response) {
          console.error(`[Padlet AI] Status Server: ${error.response.status}`);
          console.error(`[Padlet AI] Data Respons Error: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          console.error("[Padlet AI] Tidak ada respons diterima dari server.");
        } else {
          console.error("[Padlet AI] Error saat mengkonfigurasi permintaan:", error.message);
        }
        throw error;
      }
    }
  }

  app.get("/text2image/genimage", checkApiKeyAndLimit, async (req, res) => {
    try {
      const prompt = (req.query.text || "").trim();

      if (!prompt) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (prompt) wajib diisi!" });
      }

      const bot = new PadletImageGenerator();
      const result = await bot.generate({ prompt });

      console.log("Hasil generate:", JSON.stringify(result, null, 2));

      const images = result?.data?.images || [];

      if (!images.length) {
        return res.status(500).json({
          status: false,
          error: "Gambar tidak ditemukan dalam respons."
        });
      }

      res.json({
        status: true,
        count: images.length,
        images: images.map(img => ({
          url: img.url,
          width: img.width,
          height: img.height,
          thumbnail_url: img.thumbnail_url
        }))
      });

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};