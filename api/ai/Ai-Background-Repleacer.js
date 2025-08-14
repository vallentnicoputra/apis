const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require('../../middleware'); 
//ya//ya
module.exports = (app) => { 
  // List gaya/background style yang bisa dipilih
  const STYLES = [
    {
      name: "bali",
      prompt: `
Ganti latar belakang gambar dengan tema Pulau Bali tanpa mengubah subjek.
--background-replace: ((Pantai Bali dengan pura, langit senja))
--subject-preservation: ((ekstrem))
--detail-preservation: maksimum
--exposure-balance: jaga agar cahaya subjek tidak berubah
--shadow-behavior: ikuti bayangan asli
--style-consistency: cocokkan lighting & tone background baru tanpa mempengaruhi subjek
--focus: ((subjek tetap tajam dan dominan))
--composition-integrity: jangan ubah posisi, ekspresi, proporsi, warna kulit, atau pakaian subjek
--environment-light-blend: natural, halus
**Kunci mutlak:** wajah, bentuk tubuh, pose, pakaian, tekstur, arah pandang, ekspresi, dan pencahayaan asli.
**Dilarang keras:** merubah pose, wajah, warna, latar depan, atau menambahkan efek tambahan ke subjek utama.
`
    },
    {
      name: "borobudur",
      prompt: `
Ganti latar belakang menjadi Candi Borobudur saat matahari terbit.
--background-replace: ((Candi Borobudur dengan kabut pagi))
--subject-preservation: ((ekstrem))
--detail-preservation: maksimum
--exposure-balance: jaga agar pencahayaan subjek tetap alami
--shadow-behavior: ikut bayangan asli
--style-consistency: lighting dan tone disesuaikan dengan background
--focus: ((subjek dominan dan tidak terganggu))
--composition-integrity: proporsi tubuh, ekspresi, dan pose terkunci
--environment-light-blend: smooth natural blend
**Kunci total:** bentuk wajah, pose, pakaian, tekstur, warna kulit, arah kamera.
**Larang keras:** ubah ekspresi, struktur tubuh, atau tambahkan efek pada subjek utama.
`
    },
    // Tambahkan style lainnya sesuai kebutuhan
    {
      name: "komodo",
      prompt: `
Ubah latar menjadi Pulau Komodo dengan lanskap savana tropis.
--background-replace: ((Pulau Komodo, bukit hijau, langit cerah))
--subject-preservation: ((maksimal))
--detail-preservation: maksimum
--exposure-balance: stabilkan eksposur agar serasi
--shadow-behavior: ikuti subjek asli
--style-consistency: pencocokan warna dan cahaya dengan natural
--focus: ((subjek selalu dominan dan tetap di fokus))
--composition-integrity: jaga komposisi dan arah pandang asli
--environment-light-blend: subtle blending
**Kunci ketat:** wajah, warna kulit, ekspresi, pakaian, pose tubuh.
**Dilarang keras:** mengubah bentuk subjek, menambahkan efek atau filter.
`
    }
    // dst ...
  ];

  app.get("/ai/Ai-Background-repleacer", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { url: imageUrl, wilayah: requestedStyle } = req.query;

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
        });
      }

      const selectedStyle = STYLES.find(
        s => s.name.toLowerCase() === (requestedStyle || "bali").toLowerCase()
      );

      if (!selectedStyle) {
        return res.status(400).json({
          status: false,
          error: `Wilayah '${requestedStyle}' tidak ditemukan. Pilihan tersedia: ${STYLES.map(s => s.name).join(", ")}`
        });
      }

      try {
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
            text: selectedStyle.prompt
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
        console.error("Error saat memproses gambar:", error);
        return res.status(500).json({ status: false, error: error.message });
      }

    } catch (error) {
      console.error("Error di /ai/Ai-Background-repleacer:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};