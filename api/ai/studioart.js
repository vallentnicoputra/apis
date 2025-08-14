const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require("../../middleware");

const STYLES = [
  {
    name: "ghibli",
    prompt: "Ubah gaya gambar menjadi ala Studio Ghibli. **Pilihan:** --tone: lembut alami, --warna: pastel halus, --detail: tinggi, --style: anime sinematik, --ambience: hangat dan emosional. **Pertahankan:** style pakaian asli, pose tubuh, bentuk wajah, ekspresi, warna kulit, latar belakang, pencahayaan, dan tekstur asli agar tetap utuh dan natural."
  },
  {
    name: "pixar",
    prompt: "Ubah tampilan gambar menjadi gaya 3D Pixar. **Pilihan:** --render: 3D realistis, --pencahayaan: sinematik, --warna: hidup, --style: animasi Pixar modern, --detail: tinggi. **Pertahankan:** style pakaian asli, pose tubuh, bentuk wajah, ekspresi, warna kulit, latar belakang, pencahayaan, dan tekstur asli agar tetap utuh dan natural."
  },
  {
    name: "lego",
    prompt: "Transformasi gambar menjadi gaya karakter Lego. **Pilihan:** --struktur: blok modular, --warna: cerah solid, --style: mainan lego, --ekspresi: minimalis, --detail: sederhana. **Pertahankan:** pose tubuh, bentuk wajah, warna dasar pakaian, pencahayaan, dan latar belakang agar tetap utuh dan natural."
  },
  {
    name: "barbie",
    prompt: "Ganti gaya gambar menjadi tampilan boneka Barbie. **Pilihan:** --style: feminin elegan, --warna: pink pastel, --kulit: halus sempurna, --cahaya: terang bersih, --tone: glamor. **Pertahankan:** bentuk wajah, pose tubuh, model pakaian, warna kulit, latar belakang, pencahayaan, dan ekspresi asli."
  },
  {
    name: "crayon_shinchan",
    prompt: "Ubah gambar ke dalam gaya Crayon Shinchan. **Pilihan:** --garis: tebal sederhana, --warna: crayon mencolok, --style: kartun anak-anak, --ekspresi: lucu bebas, --detail: rendah. **Pertahankan:** bentuk tubuh, pose, pakaian, warna kulit, dan latar belakang agar tetap utuh dan dikenali."
  }
];

module.exports = (app) => {
  app.get("/ai/studioart", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { url: imageUrl, style: requestedStyle } = req.query;

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
        });
      }

      const selectedStyle = STYLES.find(
        s => s.name.toLowerCase() === (requestedStyle || "").toLowerCase()
      );

      if (!selectedStyle) {
        return res.status(400).json({
          status: false,
          error: `Style '${requestedStyle}' tidak ditemukan. Pilihan tersedia: ${STYLES.map(s => s.name).join(", ")}`
        });
      }

      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers["content-type"];

      const API_KEYS = [
        "AIzaSyDnBPd_EhBfr73NssnThVQZYiKZVhGZewU",
        "AIzaSyA94OZD-0V4quRbzPb2j75AuzSblPHE75M",
        "AIzaSyB5aTYbUg2VQ0oXr5hdJPN8AyLJcmM84-A",
        "AIzaSyB1xYZ2YImnBdi2Bh-If_8lj6rvSkabqlA",
        "AIzaSyB9DzI2olokERvU_oH0ASSO2OKRahleC7U",
        "AIzaSyDsyj9oOFJK_-bWQFLIR4y4gpLvq43jd4",
        "AIzaSyDpqC3y2ZZNlU9O93do36_uijl1HIJ-XKw",
        "AIzaSyCwO0UWohpAKGu32A0YYJaxpbj5lVInjss"
      ];
      const apiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];

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
            mimeType: contentType,
            data: imageBuffer.toString("base64")
          }
        },
        {
          text: selectedStyle.prompt
        }
      ]);

      const imagePart = result.response.candidates[0].content.parts.find(part => part.inlineData);

      if (!imagePart) throw new Error("Gagal menghasilkan gambar.");

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