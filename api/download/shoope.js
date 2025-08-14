const axios = require("axios");
const { checkApiKeyAndLimit } = require('../../middleware'); 

module.exports = (app) => {
  app.get("/download/shoope", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (url) wajib diisi!" });
      }
//
      const apiKey = "AuZvefCywF"; // Bisa dijadikan environment variable
      const apiUrl = `https://api.ibeng.my.id/api/downloader/shoppedl?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

      const response = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
          "Accept": "application/json, text/plain, */*",
          "Referer": "https://shopee.co.id/",
          "Origin": "https://shopee.co.id"
        }
      });

      const data = response.data;

      if (data.status !== "Success" || !data.data?.success) {
        return res.status(500).json({
          status: false,
          error: "Gagal mengambil data dari API iBeng (Shopee)"
        });
      }

      const videoData = data.data;

      res.status(200).json({
        status: true,
        statusCode: 200,
        creator: "maslent",
        data: {
          username: videoData.username || null,
          caption: videoData.videoCaption || null,
          videoUrl: videoData.videoUrl || null,
          cover: videoData.coverImage || null,
          durationMs: videoData.duration || null,
          like: videoData.like || 0,
          comment: videoData.comment || 0,
          postId: videoData.postId || null,
          postUrl: videoData.postUrl || null,
          sharedBy: videoData.shareBy || null
        }
      });

    } catch (error) {
      console.error("Error:", error.message || error);
      res.status(500).json({ status: false, error: error.message || "Internal server error" });
    }
  });
};