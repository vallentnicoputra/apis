const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { checkApiKeyAndLimit } = require('../../middleware'); 
//
module.exports = (app) => { 
const prompt = "Transform the character in the image to have very dark brown skin, resembling the deep skin tone of indigenous African tribes. Keep all other features—hair, clothes, background, and facial structure—exactly the same. Only the skin tone should be changed to a rich, deep brown, almost black hue, with natural skin texture and lighting preserved.";

  app.get("/ai/BlackSkin", checkApiKeyAndLimit, async (req, res) => {
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