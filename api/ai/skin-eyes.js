const fs = require("fs");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  const STYLES = [
    { name: "Biru", prompt: "**Ubah warna mata menjadi biru alami dengan kilau realistis.** --eye-color: deep blue --highlight: natural --contrast: medium ((Pertahankan wajah, bentuk mata, ekspresi, rambut, kulit, pose, pakaian, dan latar belakang. Fokus hanya pada iris mata!))" },
    { name: "Merah", prompt: "**Ganti warna iris mata menjadi merah terang dengan efek alami.** --eye-color: vivid red --shine: soft glow --texture: natural ((JANGAN ubah bagian wajah, bentuk kepala, rambut, pose, atau background. Fokus ketat hanya pada mata!))" },
    { name: "Hijau", prompt: "**Transformasi mata menjadi hijau zamrud alami.** --eye-color: emerald green --clarity: tinggi --realism: natural ((Tidak boleh ada perubahan pada wajah, bentuk badan, latar belakang, atau pencahayaan. Hanya mata yang berubah!))" },
    { name: "Coklat", prompt: "**Ganti warna iris menjadi coklat tua alami.** --eye-color: dark brown --tone: natural warm --texture: detail tinggi ((Seluruh bagian selain iris mata tetap seperti gambar asli!))" },
    { name: "Sharingan", prompt: "**Mata Sharingan unik dengan warna biru elektrik dan 3 tomoe.** --eye-style: sharingan --tomoe-count: 3 --eye-color: electric blue --glow: subtle ((Pertahankan ekspresi wajah, arah pandangan, warna kulit, rambut, latar belakang, dan seluruh proporsi asli!))" },
    { name: "Rinnegan", prompt: "**Ganti iris mata menjadi Rinnegan warna merah tua dengan pola ripple.** --eye-style: rinnegan --eye-color: crimson red --detail: ultra high --highlight: natural ((JANGAN ubah bentuk wajah, kepala, arah pandang, rambut, atau latar belakang. Fokus ketat pada area iris!))" },
    { name: "Byakugan", prompt: "**Eksperimen mata Byakugan dengan warna hijau pucat tanpa pupil.** --eye-style: byakugan --eye-color: pale green --pupil: hidden ((Bentuk wajah, pose, pakaian, rambut, dan latar belakang HARUS tidak berubah! Fokus hanya mata.))" },
    { name: "Tenseigan", prompt: "**Ubah mata menjadi Tenseigan bercahaya ungu lembut.** --eye-style: tenseigan --eye-color: soft purple --effect: crystal glow ((Jangan ubah bagian mana pun selain mata. Fokus keras pada detail iris. Semua elemen asli gambar tetap utuh.))" }
  ];

  app.get("/ai/skin-eyes", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();
      const requestedColor = (req.query.warna || "Biru").trim();

      if (!imageUrl) {
        return res.status(400).json({ status: false, error: "Parameter 'url' wajib diisi!" });
      }

      const styleObj = STYLES.find(s => s.name.toLowerCase() === requestedColor.toLowerCase());

      if (!styleObj) {
        return res.status(400).json({
          status: false,
          error: `Style Eyes '${requestedColor}' tidak ditemukan. Pilihan tersedia: ${STYLES.map(s => s.name).join(", ")}`
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
        "AIzaSyDsyj9oOFJK_-bWQFLIR4yY4gpLvq43jd4",
        "AIzaSyDpqC3y2ZZNlU9O93do36_uijl1HIJ-XKw",
        "AIzaSyCwO0UWohpAKGu32A0YYJaxpbj5lVInjss"
      ];
      const randomApiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];

      const genAI = new GoogleGenerativeAI(randomApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      });

      const result = await model.generateContent([
        { inlineData: { mimeType: contentType, data: imageBuffer.toString("base64") } },
        { text: styleObj.prompt }
      ]);

      const imagePart = result.response.candidates[0].content.parts.find(part => part.inlineData);

      if (!imagePart) throw new Error("Gagal menghasilkan gambar.");

      const outputImageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
      res.setHeader("Content-Type", "image/png");
      res.end(outputImageBuffer);

    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};