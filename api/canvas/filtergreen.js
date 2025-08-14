const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/canvas/filtergreen", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();
      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!",
        });
      }
      const apiUrl = `https://api.some-random-api.com/canvas/filter/green?avatar=${encodeURIComponent(imageUrl)}`;

      // Panggil API eksternal, minta response berupa arraybuffer supaya dapat buffer gambarnya
      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
      });

      // Ambil content-type dari header response API eksternal
      const contentType = response.headers["content-type"] || "image/png";

      // Set header content-type ke response client supaya langsung dianggap gambar
      res.setHeader("Content-Type", contentType);

      // Kirim langsung buffer gambarnya ke client
      res.end(Buffer.from(response.data));
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        error: err.message,
      });
    }
  });
};