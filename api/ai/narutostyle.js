const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  const prompt = `Modifikasi karakter menjadi versi anime dari dunia Naruto.
--hijab-draping: gaya busana karakter Naruto
--folds: elegan dan natural
--fabric-flow: 3D cartoon khas Naruto
--coverage: mengenakan ikat kepala Konoha (Hitai-ate)
--hair-visibility: disesuaikan dengan gaya rambut karakter anime Naruto
--appearance: rapi dan menyatu
--color: palet warna 3D animasi Naruto
--hairstyle-original: mengikuti model rambut karakter Naruto

*Pertahankan wajah, bentuk tubuh, pose, ekspresi, pakaian, celana, latar belakang, pencahayaan, dan tekstur asli agar tetap utuh dan menyatu dengan modifikasi.*
--sole-modification: hanya menambahkan elemen khas dunia Naruto seperti Hitai-ate dan gaya visualnya.`;

  app.get("/ai/naruto-style", checkApiKeyAndLimit, async (req, res) => {
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
        "AIzaSyDsyj9oOFJK_-bWQFLIR4y4gpLvq43jd4",
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