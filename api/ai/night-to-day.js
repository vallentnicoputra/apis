const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { checkApiKeyAndLimit } = require("../../middleware");

const prompt = `Ubah suasana gambar menjadi versi **siang hari yang cerah** dengan pencahayaan alami.  
*Pertahankan bentuk objek, manusia, latar belakang, pose, pakaian, ekspresi wajah, tekstur, dan keseluruhan komposisi gambar asli sepenuhnya.*  
Hilangkan nuansa malam atau gelap, lalu terangi gambar dengan nuansa siang yang realistis dan seimbang.

--transisi-waktu: malam ke siang  
--pencahayaan: matahari alami, jam 9 pagi  
--bayangan: lembut dan realistis  
--langit: biru muda dengan awan putih  
--warna-objek: disesuaikan dengan pencahayaan siang  
--koreksi-warna: otomatis berdasarkan intensitas cahaya  
--suhu-warna: sedikit hangat  
--tone-gambar: netral alami  
--refleksi dan kilau: diperhalus sesuai suasana siang  
--preservasi-detail: tinggi  
--elemen-manusia: tidak diubah

Tujuan: *mengonversi gambar malam menjadi versi siang yang realistis dan alami tanpa mengubah isi gambar asli, hanya suasananya.*.`;

module.exports = (app) => {
  app.get("/ai/night-to-day", checkApiKeyAndLimit, async (req, res) => {
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