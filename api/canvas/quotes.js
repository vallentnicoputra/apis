const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/canvas/quotes", checkApiKeyAndLimit, async (req, res) => {
    try {
      const host = "https://quozio.com/";
      const { author, message, templateIndex = 0 } = req.query;

      // Validasi parameter
      if (!author || !message) {
        return res.status(400).json({
          status: false,
          error: "❌ Parameter 'author' dan 'message' wajib diisi."
        });
      }

      // 1. Buat quote ID
      const { data: { quoteId } } = await axios.post(`${host}api/v1/quotes`, {
        author: author,
        quote: message
      });

      // 2. Ambil daftar template
      const { data: { data: templates } } = await axios.get(`${host}api/v1/templates`);
      const template = templates[templateIndex];
      if (!template) {
        return res.status(400).json({
          status: false,
          error: `❌ Template index ${templateIndex} tidak valid.`
        });
      }

      // 3. Generate image URL
      const { data: { medium } } = await axios.get(
        `${host}api/v1/quotes/${quoteId}/imageUrls?templateId=${template.templateId}`
      );

      if (!medium) {
        return res.status(500).json({
          status: false,
          error: "❌ Gagal membuat gambar quote."
        });
      }

      // 4. Kirim respon
      res.json({
        status: true,
        imageUrl: medium,
        message: `Result nya bang *${author}*`
      });

    } catch (err) {
      console.error("[Route /canvas/quote] Error:", err.message);
      res.status(500).json({
        status: false,
        error: "❌ Internal Server Error."
      });
    }
  });
};