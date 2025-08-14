const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require('../../middleware');//

module.exports = (app) => {
  const STYLES = [
    {
      nama: "Jawa",
      prompt: `*Ubah pakaian karakter menjadi baju adat Jawa.* 
--style: kebaya klasik dengan batik, 
--accessory: konde, selendang, dan bros emas, 
--pattern: batik tradisional motif parang/kawung, 
--color-tone: coklat, krem, emas, 
--fit: anggun dan formal. 
**Pertahankan:** wajah, pose tubuh, bentuk badan, latar belakang, pencahayaan, dan proporsi natural.`
    },
    {
      nama: "Bugis",
      prompt: `*Ganti pakaian karakter menjadi baju adat Bugis.* 
--style: baju bodo dengan kain sarung sutra, 
--accessory: perhiasan emas, ikat pinggang khas Sulawesi Selatan, 
--color-tone: cerah seperti merah, hijau, ungu, 
--fabric-flow: mengembang dan ringan, 
--fit: elegan dan formal. 
**Pertahankan:** wajah, pose, postur, ekspresi, pencahayaan, dan latar belakang asli.`
    },
    {
      nama: "Dayak",
      prompt: `*Transformasi karakter mengenakan pakaian adat Dayak.* 
--style: rompi manik-manik dengan kain khas suku Dayak, 
--accessory: hiasan kepala bulu enggang, 
--pattern: motif ukiran Dayak, 
--color-tone: merah, hitam, kuning emas, 
--vibe: tradisional dan kuat. 
**Pertahankan:** bentuk tubuh, wajah, pencahayaan, latar belakang, serta ekspresi asli.`
    }
  ];

  app.get("/ai/clothes-traditional", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();
      const requestedStyle = (req.query.baju || "Dayak").trim();

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
        });
      }

      const styleObj = STYLES.find(
        s => s.nama.toLowerCase() === requestedStyle.toLowerCase()
      );

      if (!styleObj) {
        return res.status(400).json({
          status: false,
          error: `Baju '${requestedStyle}' tidak ditemukan. Pilihan tersedia: ${STYLES.map(s => s.nama).join(", ")}`
        });
      }

      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });
      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers["content-type"];

      const API_KEYS = [
        "AIzaSyDnBPd_EhBfr73NssnThVQZYiKZVhGZewU",
        "AIzaSyA94OZD-0V4quRbzPb2j75AuzSblPHE75M",
        "AIzaSyB5aTYbUg2VQ0oXr5hdJPN8AyLJcmM84-A",
        "AIzaSyB1xYZ2YImnBdi2Bh-If_8lj6rvSkabqlA",
        "AIzaSyB9DzI2olokERvU_oH0ASSO2OKRahleC7U",
        "AIzaSyDsyj9oOFJK_-bWQFLIR4yY4gpLvq43jd4",
        "AIzaSyDpqC3y2ZZNlU9O93do36_uijl1HIJ-XKw",
        "AIzaSyCwO0UWohpAKGu32A0YYJaxpbj5lVInjss"
      ];
      const randomApiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];

      const genAI = new GoogleGenerativeAI(randomApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: contentType,
            data: imageBuffer.toString("base64")
          }
        },
        {
          text: styleObj.prompt
        }
      ]);

      const imagePart = result.response.candidates[0].content.parts.find(
        part => part.inlineData
      );

      if (!imagePart) {
        throw new Error("Gagal menghasilkan gambar.");
      }

      const outputImageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
      res.setHeader("Content-Type", "image/png");
      res.end(outputImageBuffer);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        error: error.message
      });
    }
  });
};