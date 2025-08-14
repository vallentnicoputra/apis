const axios = require("axios");
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  app.get("/download/videy", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (url) wajib diisi!" });
      }//

      const apiUrl = `https://api.ibeng.my.id/api/downloader/videy?url=${encodeURIComponent(text)}&apikey=AuZvefCywF`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data || data.status !== "Success" || !data.data?.success) {
        return res.status(500).json({
          status: false,
          error: "Gagal mengambil data dari API"
        });
      }

      // Ambil data video yang berhasil didapat
      const videoData = data.data;

      return res.status(200).json({
        status: true,
        statusCode: 200,
        creator: "maslent",
        data: videoData
      });

    } catch (error) {
      console.error("Error:", error.message || error);
      return res.status(500).json({
        status: false,
        error: error.message || "Internal server error"
      });
    }
  });
};