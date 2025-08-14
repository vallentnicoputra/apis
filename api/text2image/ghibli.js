const axios = require('axios');
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  app.get("/text2image/ghibli", checkApiKeyAndLimit, async (req, res) => {
    try {
      const prompt = (req.query.text || "").trim();

      if (!prompt) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (prompt) wajib diisi!" });
      }

      const endpoints = [
        "https://api.nekorinn.my.id/ai-img/text2ghibli?text="
        // Bisa ditambah endpoint lain di sini kalau ada
      ];

      let success = false;

      for (const base of endpoints) {
        try {
          const url = base + encodeURIComponent(prompt);
          const response = await axios.get(url, { responseType: "arraybuffer" });

          const contentType = response.headers["content-type"] || "image/jpeg";

          res.setHeader("Content-Type", contentType);
          res.send(Buffer.from(response.data));
          
          success = true;
          break; // berhenti coba endpoint lain karena sudah berhasil
        } catch (err) {
          console.error(`Gagal request ke endpoint ${base}:`, err.message);
          // coba endpoint berikutnya
        }
      }

      if (!success) {
        return res.status(500).json({ status: false, error: "Gagal menghasilkan gambar dari semua endpoint." });
      }

    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};