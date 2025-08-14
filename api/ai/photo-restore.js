const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { checkApiKeyAndLimit } = require("../../middleware");

const prompt = `Pulihkan foto lama ini menjadi versi bersih dan tajam secara realistis, tanpa mengubah bentuk wajah, ekspresi, pose, pakaian, maupun latar belakang.

**Pertahankan**: ((struktur wajah)), ((pose tubuh)), ((pakaian asli)), ((warna latar)), ((tekstur asli)), ((komposisi foto lama))  
**Fokuskan** pada: ((membersihkan noise)), ((menghapus goresan)), ((memperbaiki kerusakan/flek)), ((mengembalikan warna aslinya secara natural)), ((meningkatkan ketajaman secara selektif tanpa distorsi))

--preservasi-wajah: maksimal  
--peningkatan-detail: hanya pada area rusak  
--restorasi-warna: alami dan tidak mencolok  
--tekstur-film: dipertahankan agar tetap terlihat seperti foto lama  
--saturasi: seimbang  
--pencahayaan: alami, tanpa efek buatan  
--gaya: dokumenter, bukan digital art  
--peningkatan: kontras dan kejernihan  
--grain: sedikit untuk menjaga nuansa analog

**Tujuan**: mengembalikan kondisi terbaik dari foto lama, ((tanpa mengubah apapun secara artistik)), hanya *memperbaiki dan membersihkan* secara konservatif.`;

module.exports = (app) => {
  app.get("/ai/photo-restore", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!",
        });
      }

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
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
        "AIzaSyCwO0UWohpAKGu32A0YYJaxpbj5lVInjss",
      ];

      const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      const result = await model.generateContent([
        {
          text: prompt,
        },
        {
          inlineData: {
            mimeType: mime,
            data: buffer.toString("base64"),
          },
        },
      ]);

      const part = result.response.candidates[0].content.parts.find(
        (p) => p.inlineData
      );

      if (!part) throw new Error("Gagal mendapatkan gambar hasil.");

      const finalBuffer = Buffer.from(part.inlineData.data, "base64");
      res.setHeader("Content-Type", "image/png");
      res.end(finalBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        error: err.message,
      });
    }
  });
};