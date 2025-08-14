//
const axios = require('axios');
const crypto = require('crypto');
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
class PerchanceImageGenerator {
  constructor() {
    this.baseUrl = "https://www.perchanceimagegenerator.tech";
    this.apiUrl = "https://api.together.ai/v1/images/generations";
    this.nonce = null;
    this.apiKey = null;
    this.cookies = "";
    this.remainingGenerations = 0;
    this.maxUses = 0;
    this.axiosInstance = axios.create({
      timeout: 3e4
    });
    this.axiosInstance.interceptors.response.use(response => {
      if (response.headers["set-cookie"]) {
        this.cookies = response.headers["set-cookie"].map(cookie => cookie.split(";")[0]).join("; ");
        console.log("🍪 Cookies updated:", this.cookies);
      }
      return response;
    }, error => {
      console.error("❌ Axios interceptor error:", error.message);
      return Promise.reject(error);
    });
  }
  randomCryptoIP() {
    try {
      const bytes = crypto.randomBytes(4);
      const ip = Array.from(bytes).map(b => b % 256).join(".");
      console.log("🌐 Generated random IP:", ip);
      return ip;
    } catch (error) {
      console.error("❌ Error generating random IP:", error.message);
      return "192.168.1.1";
    }
  }
  randomID(length = 16) {
    try {
      const id = crypto.randomBytes(length).toString("hex");
      console.log(`🔑 Generated random ID (${length * 2} chars):`, id);
      return id;
    } catch (error) {
      console.error("❌ Error generating random ID:", error.message);
      return "fallback-id";
    }
  }
  buildHeaders(extra = {}) {
    try {
      const ip = this.randomCryptoIP();
      const headers = {
        accept: "*/*",
        "accept-language": "id-ID,id;q=0.9",
        origin: this.baseUrl,
        referer: `${this.baseUrl}/`,
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
        "sec-ch-ua": `"Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge Simulate";v="131", "Lemur";v="131"`,
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": `"Android"`,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-forwarded-for": ip,
        "x-real-ip": ip,
        "x-request-id": this.randomID(8),
        ...extra
      };
      console.log("📋 Headers built with IP:", ip);
      return headers;
    } catch (error) {
      console.error("❌ Error building headers:", error.message);
      return {
        ...extra
      };
    }
  }
  async initialize() {
    try {
      console.log("🚀 Initializing generator...");
      const mainPageResponse = await this.axiosInstance.get(this.baseUrl, {
        headers: this.buildHeaders({
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none"
        })
      });
      const nonceMatch = mainPageResponse.data.match(/"nonce":\s*"([^"]+)"/);
      if (nonceMatch) {
        this.nonce = nonceMatch[1];
        console.log("✅ Nonce extracted:", this.nonce);
      } else {
        throw new Error("Nonce tidak ditemukan dalam response");
      }
    } catch (error) {
      console.error("❌ Initialization failed:", error.message);
      throw new Error(`Gagal inisialisasi: ${error.message}`);
    }
  }
  async getApiKey() {
    try {
      console.log("🔑 Getting API key...");
      const response = await this.axiosInstance.post(`${this.baseUrl}/wp-admin/admin-ajax.php`, new URLSearchParams({
        action: "get_together_ai_key",
        nonce: this.nonce
      }), {
        headers: this.buildHeaders({
          "content-type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          pragma: "no-cache",
          priority: "u=1, i",
          cookie: this.cookies
        })
      });
      if (response.data.success) {
        this.apiKey = response.data.data.key;
        this.remainingGenerations = response.data.data.remaining_generations;
        this.maxUses = response.data.data.max_uses;
        console.log("✅ API key obtained:", this.apiKey.substring(0, 20) + "...");
        console.log("📊 Remaining generations:", this.remainingGenerations);
        console.log("📊 Max uses:", this.maxUses);
        return response.data.data;
      } else {
        throw new Error("API response success = false");
      }
    } catch (error) {
      console.error("❌ Failed to get API key:", error.message);
      throw new Error(`Error getting API key: ${error.message}`);
    }
  }
  async trackGeneration() {
    try {
      console.log("📊 Tracking generation...");
      const response = await this.axiosInstance.post(`${this.baseUrl}/wp-admin/admin-ajax.php`, new URLSearchParams({
        action: "track_generation",
        nonce: this.nonce
      }), {
        headers: this.buildHeaders({
          "content-type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          pragma: "no-cache",
          priority: "u=1, i",
          cookie: this.cookies
        })
      });
      if (response.data.success) {
        this.remainingGenerations = response.data.data.remaining;
        console.log("✅ Generation tracked. Remaining:", this.remainingGenerations);
        return response.data.data;
      } else {
        throw new Error("Track generation response success = false");
      }
    } catch (error) {
      console.error("❌ Failed to track generation:", error.message);
      throw new Error(`Error tracking generation: ${error.message}`);
    }
  }
  async generateImage(options = {}) {
    const {
      prompt = "men in the forest, Cyberpunk, portrait composition, vertical orientation, highly detailed, sharp focus, high quality",
        negative_prompt = "",
        model = "black-forest-labs/FLUX.1-schnell",
        width = 768,
        height = 1024,
        steps = 3,
        n = 1
    } = options;
    try {
      console.log("🎨 Generating image with prompt:", prompt.substring(0, 50) + "...");
      console.log("📏 Dimensions:", `${width}x${height}`);
      console.log("🔄 Steps:", steps);
      console.log("🤖 Model:", model);
      const response = await this.axiosInstance.post(this.apiUrl, {
        prompt: prompt,
        negative_prompt: negative_prompt,
        model: model,
        width: width,
        height: height,
        steps: steps,
        n: n
      }, {
        headers: this.buildHeaders({
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
          "sec-fetch-site": "cross-site",
          "cache-control": "no-cache",
          pragma: "no-cache",
          priority: "u=1, i"
        })
      });
      console.log("✅ Image generated successfully!");
      console.log("🖼️ Image URL:", response.data.data[0].url.substring(0, 80) + "...");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to generate image:", error.message);
      throw new Error(`Error generating image: ${error.message}`);
    }
  }
  async generate(options = {}) {
    try {
      console.log("🎯 Starting image generation process...");
      await this.initialize();
      await this.getApiKey();
      await this.trackGeneration();
      const result = await this.generateImage(options);
      console.log("🎉 Generation completed successfully!");
      return {
        success: true,
        data: result,
        remaining: this.remainingGenerations
      };
    } catch (error) {
      console.error("💥 Generation process failed:", error.message);
      return {
        success: false,
        error: error.message,
        remaining: this.remainingGenerations
      };
    }
  }
}

app.get("/text2image/flux", checkApiKeyAndLimit, async (req, res) => {
    try {
      const prompt = (req.query.text || "").trim();

      if (!prompt) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (prompt) wajib diisi!" });
      }

      const bot = new PerchanceImageGenerator();
      const result = await bot.generate({ prompt });


      console.log("Hasil generate:", JSON.stringify(result, null, 2));

          const imageUrl = result?.data?.data?.[0]?.url;

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

