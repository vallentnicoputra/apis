const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  const prompt = `**Hanya tambahkan pencahayaan sinematik realistis — dilarang keras mengubah bentuk wajah, tubuh, warna kulit, pakaian, latar belakang, atau ekspresi.** --lighting-type: ((cinematic directional light, soft diffused rim light)) --mood: *moody cinematic contrast* --tone: ((warm highlights with cold shadows)) --color-grade: subtle filmic LUT --shadow-quality: ((deep soft shadows)) --highlight-zones: ((cheekbones, jawline, hair edge)) --lighting-behavior: ((film-style realism, non-invasive)) --brightness-balance: ((maintain original exposure)) --lens-effects: slight glow, no blur --environment-light: ((unchanged)) --detail-preservation: maximum. **Pertahankan dengan ketat dan kunci secara absolut**: ((wajah, bentuk tubuh, ukuran mata, proporsi kepala, warna kulit, warna pakaian, pose tubuh, sudut kamera, tekstur gambar asli, latar belakang, objek lain)). *JANGAN ubah ekspresi, pose, atau struktur apapun di gambar ini.* Fokus hanya pada simulasi pencahayaan sinematik.`;

  app.get("/ai/chinematic-lightning", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
        });
      }

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });

      const buffer = Buffer.from(response.data);
      const mime = response.headers["content-type"];

      const apiKeys = [
        "AIzaSyDnBPd_EhBfr73NssnThVQZYiKZVhGZewU",
        "AIzaSyA94OZD-0V4quRbzPb2j75AuzSblPHE75M",
        "AIzaSyB5aTYbUg2VQ0oXr5hdJPN8AyLJcmM84-A",
        "AIzaSyB1xYZ2YImnBdi2Bh-If_8lj6rvSkabqlA",
        "AIzaSyB9DzI2olokERvU_oH0ASSO2OKRahleC7U",
        "AIzaSyDsyj9oOFJK_-bWQFLIR4yY4gpLvq43jd4",
        "AIzaSyDpqC3y2ZZNlU9O93do36_uijl1HIJ-XKw",
        "AIzaSyCwO0UWohpAKGu32A0YYJaxpbj5lVInjss"
      ];

      const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mime,
            data: buffer.toString("base64")
          }
        },
        {
          text: prompt
        }
      ]);

      const part = result.response.candidates[0].content.parts.find(p => p.inlineData);
      if (!part) throw new Error("Gagal mendapatkan gambar hasil.");

      const finalBuffer = Buffer.from(part.inlineData.data, "base64");
      res.setHeader("Content-Type", "image/png");
      res.end(finalBuffer);

    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });
};