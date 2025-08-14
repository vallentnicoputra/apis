const axios = require("axios");
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  app.get("/download/xvideos", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (url) wajib diisi!" });
      }

      const response = await axios.get("https://api.ibeng.my.id/api/downloader/xvideosdown", {
        params: {
          url: text,
          apikey: "AuZvefCywF",
        },
      });

      const result = response.data?.data?.result;

      if (!result?.url) {
        return res.status(500).json({
          status: false,
          message: "Gagal mendapatkan video.",
        });
      }

      return res.status(200).json({
        status: true,
        statusCode: 200,
        title: result.title || "",
        views: result.views || "",
        likes: result.likes || "",
        dislikes: result.dislikes || "",
        keyword: result.keyword || "",
        thumb: result.thumb || "",
        download_url: result.url || "",
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