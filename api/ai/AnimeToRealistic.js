const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require('../../middleware'); 
//ya
module.exports = (app) => { 
  const prompt = `Konversi karakter anime menjadi versi manusia nyata dengan kualitas foto realistis, *tanpa mengubah* bentuk wajah, ekspresi, arah pandang, pose tubuh, pakaian, warna rambut, atau gaya rambut. *Pertahankan semua elemen desain asli karakter*. Hanya ubah dari gaya anime 2D menjadi tampilan manusia nyata 3D hyperrealistic.

--style: ultra-realistic photography  
--face: wajah manusia nyata, proporsional, ekspresi sama  
--eyes: natural human eyes dengan warna, bentuk, dan ekspresi sesuai versi anime  
--skin: tekstur kulit realistis dengan tone alami sesuai referensi  
--lighting: soft studio lighting  
--hair: bentuk rambut sama persis, hanya diubah ke tekstur manusia  
--clothing: pakaian tetap 100% identik, hanya teksturnya realistis  
--pose-lock: pertahankan pose dan arah tubuh  
--background-lock: jangan ubah latar belakang asli  
--expression-lock: ekspresi wajah tetap  
--gender-lock: jangan ubah jenis kelamin  
--no-anime-style: larang output bergaya anime, hanya real human output

((Pertahankan ciri khas wajah karakter: bentuk mata, hidung, bibir, alis, bentuk rahang))  
((Jangan ubah pakaian, warna rambut, atau gaya rambut))  
((Hanya ubah gaya visual ke manusia nyata, tidak ubah isi gambar sama sekali))`;

  app.get("/ai/AnimeToRealistic", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { url: imageUrl } = req.query;

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
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
            text: prompt
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