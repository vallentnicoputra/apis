const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  const prompt = `Warnai gambar hitam putih ini secara alami dan realistis.  
*Pertahankan bentuk wajah, ekspresi, pose tubuh, pakaian, tekstur, dan semua elemen gambar asli sepenuhnya.*  
Tambahkan warna dengan gradasi lembut dan pencahayaan alami, tanpa mengubah struktur atau gaya asli gambar.

--preservasi-detail: maksimal  
--warna-kulit: natural dan realistis  
--warna-pakaian: sesuai konteks dan kain  
--latar: tidak diubah, hanya diberi tone warna halus  
--saturasi: lembut dan seimbang  
--pencahayaan: siang hari alami  
--tekstur: dipertahankan  
--gaya: foto dokumenter, bukan kartun atau digital art  
--peningkatan: hanya pada warna, bukan bentuk

Tujuan: *menjaga keaslian gambar hitam putih sepenuhnya, sambil menambahkan warna dengan pendekatan realistis dan konservatif.*.`;

  app.get("/ai/colorize", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
        });
      }

      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
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