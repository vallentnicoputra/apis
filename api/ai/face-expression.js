const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { checkApiKeyAndLimit } = require('../../middleware');

const STYLES = [
  {
    nama: "senyum",
    prompt: "**Ganti ekspresi wajah menjadi senyum alami**. --expression: *(smiling)* --intensity: *(halus dan realistis)* --eye-adjustment: *(tidak mengubah arah pandangan)* --lip-curve: *(naik lembut)* --cheek-lift: *(natural, tidak dilebih-lebihkan)* ((Jangan ubah struktur wajah, bentuk mata, bentuk hidung, warna kulit, pencahayaan, pose tubuh, pakaian, latar belakang, dan arah kepala. Gambar asli harus dipertahankan 100% kecuali ekspresi wajah.))"
  },
  {
    nama: "serius",
    prompt: "**Ubah ekspresi menjadi serius atau netral**. --expression: *(neutral serious)* --bibir: *(rileks tertutup)* --mata: *(tatapan tenang, tidak tajam)* --alis: *(posisi normal)* ((Pertahankan 100% bentuk wajah asli, sudut pandang kamera, warna kulit, gaya rambut, pencahayaan, dan background. Jangan ubah struktur gambar asli kecuali ekspresi.))"
  },
  {
    nama: "marah",
    prompt: "**Tambahkan ekspresi marah secara natural tanpa efek kartun**. --expression: *(angry)* --alis: *(menyempit dan sedikit turun ke tengah)* --mata: *(tegas dan fokus)* --bibir: *(sedikit mengatup)* ((Gambar asli wajib tetap: bentuk wajah, warna kulit, arah pandangan, pencahayaan, pakaian, latar belakang, dan proporsi tubuh tidak boleh berubah sama sekali. Hanya ubah ekspresi wajah.))"
  },
  {
    nama: "kaget",
    prompt: "**Ganti ekspresi menjadi terkejut secara realistis**. --expression: *(surprised)* --mata: *(sedikit membesar, tidak berlebihan)* --bibir: *(terbuka ringan)* --alis: *(sedikit naik)* ((Tetap jaga bentuk wajah asli, pose tubuh, rambut, pencahayaan, dan background. Jangan ubah apapun kecuali ekspresi wajah. Hindari efek berlebihan yang bisa merusak realisme.))"
  },
  {
    nama: "tertawa",
    prompt: "**Tambahkan ekspresi tertawa alami (bukan kartun)**. --expression: *(laughing softly)* --mata: *(sedikit menyipit)* --pipi: *(sedikit terangkat)* --bibir: *(terbuka dengan gigi sedikit terlihat)* ((Jaga seluruh struktur gambar: wajah, tubuh, pencahayaan, warna kulit, pakaian, dan latar belakang tidak boleh berubah sedikit pun. Hanya ekspresi yang boleh berubah.))"
  }
];

module.exports = (app) => {
  app.get("/ai/face-expression", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();
      const ekspresi = (req.query.ekspresi || "senyum").trim().toLowerCase();

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
        });
      }

      const selectedStyle = STYLES.find(s => s.nama.toLowerCase() === ekspresi);
      if (!selectedStyle) {
        return res.status(400).json({
          status: false,
          error: `Ekspresi '${ekspresi}' tidak ditemukan. Pilihan tersedia: ${STYLES.map(s => s.nama).join(", ")}`
        });
      }

      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);
      const mime = response.headers["content-type"];

      const API_KEYS = [
        "AIzaSyDnBPd_EhBfr73NssnThVQZYiKZVhGZewU",
        "AIzaSyA94OZD-0V4quRbzPb2j75AuzSblPHE75M",
        "AIzaSyB5aTYbUg2VQ0oXr5hdJPN8AyLJcmM84-A"
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
            mimeType: mime,
            data: buffer.toString("base64")
          }
        },
        {
          text: selectedStyle.prompt
        }
      ]);

      const imagePart = result.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (!imagePart) throw new Error("Gagal menghasilkan gambar.");

      const outputBuffer = Buffer.from(imagePart.inlineData.data, "base64");
      res.setHeader("Content-Type", "image/png");
      res.end(outputBuffer);

    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};