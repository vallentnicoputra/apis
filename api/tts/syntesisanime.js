// api/tools/tts.js
const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

class TTSGenerator {
  constructor() {
    this.models = {
      miku: { voice_id: "67aee909-5d4b-11ee-a861-00163e2ac61b", voice_name: "Hatsune Miku" },
      nahida: { voice_id: "67ae0979-5d4b-11ee-a861-00163e2ac61b", voice_name: "Nahida (Exclusive)" },
      nami: { voice_id: "67ad95a0-5d4b-11ee-a861-00163e2ac61b", voice_name: "Nami" },
      ana: { voice_id: "f2ec72cc-110c-11ef-811c-00163e0255ec", voice_name: "Ana(Female)" },
      optimus_prime: { voice_id: "67ae0f40-5d4b-11ee-a861-00163e2ac61b", voice_name: "Optimus Prime" },
      goku: { voice_id: "67aed50c-5d4b-11ee-a861-00163e2ac61b", voice_name: "Goku" },
      taylor_swift: { voice_id: "67ae4751-5d4b-11ee-a861-00163e2ac61b", voice_name: "Taylor Swift" },
      elon_musk: { voice_id: "67ada61f-5d4b-11ee-a861-00163e2ac61b", voice_name: "Elon Musk" },
      mickey_mouse: { voice_id: "67ae7d37-5d4b-11ee-a861-00163e2ac61b", voice_name: "Mickey Mouse" },
      kendrick_lamar: { voice_id: "67add638-5d4b-11ee-a861-00163e2ac61b", voice_name: "Kendrick Lamar" },
      angela_adkinsh: { voice_id: "d23f2adb-5d1b-11ee-a861-00163e2ac61b", voice_name: "Angela Adkinsh" },
      eminem: { voice_id: "c82964b9-d093-11ee-bfb7-e86f38d7ec1a", voice_name: "Eminem" },
    };
  }

  getRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  getRandomUserAgent() {
    const agents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.1.2 Safari/602.3.12",
      "Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36",
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  async generateTTS(text) {
    const requests = Object.entries(this.models).map(async ([modelName, { voice_id, voice_name }]) => {
      try {
        const payload = {
          raw_text: text,
          url: "https://filme.imyfone.com/text-to-speech/anime-text-to-speech/",
          product_id: "200054",
          convert_data: [{ voice_id, speed: "1", volume: "50", text, pos: 0 }],
        };

        const headers = {
          "Content-Type": "application/json",
          Accept: "*/*",
          "X-Forwarded-For": this.getRandomIP(),
          "User-Agent": this.getRandomUserAgent(),
        };

        const response = await axios.post("https://voxbox-tts-api.imyfone.com/pc/v1/voice/tts", JSON.stringify(payload), { headers });
        const { channel_id, oss_url } = response.data.data.convert_result[0];

        return { modelName, channel_id, oss_url, voice_id, voice_name };
      } catch (err) {
        return { modelName, error: `Error TTS untuk ${modelName}` };
      }
    });

    return await Promise.all(requests);
  }
}

// Export sebagai route API
module.exports = (app) => {
  const ttsGenerator = new TTSGenerator();

  app.get("/speech/syntesisanime", checkApiKeyAndLimit, async (req, res) => {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, error: "Parameter 'text' wajib diisi" });

    try {
      const result = await ttsGenerator.generateTTS(text);
      res.json({ status: true, data: result });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};