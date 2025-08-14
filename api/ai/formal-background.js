const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require('../../middleware');
//
module.exports = (app) => {
  const STYLES = [
    {
      nama: "Merah",
      prompt: `Ganti latar belakang foto formal menjadi warna merah standar (#D50000), tanpa mengubah apapun dari subjek.

**Pertahankan**: ((wajah asli)), ((bentuk tubuh dan pose)), ((warna kulit asli)), ((pakaian formal)), ((pencahayaan asli)), ((proporsi dan ekspresi alami))  
**Jangan ubah**: struktur wajah, rambut, bentuk telinga, pakaian, pencahayaan pada subjek, atau komposisi tubuh.

--background-color: #D50000  
--edit-area: latar belakang saja  
--preservasi-subjek: maksimal  
--deteksi-tepi: akurat dan halus  
--gaya: foto formal resmi (KTP, lamaran, ijazah)  
--pencahayaan: tetap alami  
--transisi-subjek: tidak boleh terlihat edit`
    },
    {
      nama: "Biru",
      prompt: `Ubah latar belakang foto formal menjadi warna biru cerah pas foto (#3A75C4) tanpa mengubah bagian subjek sama sekali.

**Pertahankan**: ((semua detail wajah, pakaian, warna kulit, ekspresi, dan pose))  
**Jangan ubah**: tekstur, pencahayaan subjek, atau bentuk tubuh.

--background-color: #3A75C4  
--edit-focus: background only  
--preservasi-wajah: 100%  
--preservasi-pakaian: 100%  
--gaya: pas foto formal resmi  
--edge-cleanup: halus tanpa crop keras`
    },
    {
      nama: "Hijau",
      prompt: `Ganti latar belakang foto formal menjadi hijau natural lembut (#4CAF50), tanpa mengubah subjek apapun.

**Pertahankan**: ((proporsi wajah, warna kulit, bentuk badan, dan pencahayaan asli))  
**Jangan ubah**: komposisi subjek atau tampilan naturalnya.

--background-color: #4CAF50  
--edit-area: hanya background  
--pencahayaan: tetap stabil  
--gaya: formal document photo  
--preservasi: total pada subjek`
    },
    {
      nama: "Kuning",
      prompt: `Ubah latar belakang gambar menjadi kuning pastel netral (#FFEB3B) untuk pas foto resmi, tanpa menyentuh subjek.

**Pertahankan**: ((semua ciri wajah dan tubuh subjek, pencahayaan, dan pakaian))  
**Jangan ubah**: ekspresi, warna kulit, bentuk atau tekstur.

--background-color: #FFEB3B  
--focus-edit: latar belakang saja  
--preservasi-detail: ketat  
--gaya: dokumentasi formal`
    },
    {
      nama: "Putih",
      prompt: `Ganti latar belakang pas foto menjadi putih polos (#FFFFFF), tanpa mengubah subjek formal apapun.

**Pertahankan**: ((semua detail wajah, rambut, baju, kulit, ekspresi, pencahayaan))  
**Jangan ubah**: komposisi atau tekstur subjek.

--background-color: #FFFFFF  
--gaya: foto formal (resmi)  
--edit-area: hanya background  
--preservasi-subjek: sempurna  
--deteksi-tepi: sangat presisi`
    }
  ];

  app.get("/ai/formal-background", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();
      const requestedColor = (req.query.warna || "Putih").trim();

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
        });
      }

      const styleObj = STYLES.find(
        s => s.nama.toLowerCase() === requestedColor.toLowerCase()
      );

      if (!styleObj) {
        return res.status(400).json({
          status: false,
          error: `Warna '${requestedColor}' tidak ditemukan. Pilihan tersedia: ${STYLES.map(s => s.nama).join(", ")}`
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