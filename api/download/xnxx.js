const axios = require("axios");
const { checkApiKeyAndLimit } = require('../../middleware');

module.exports = (app) => {
  app.get("/download/xnxx", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (url) wajib diisi!" });
      }

      const apiUrl = `https://api.ibeng.my.id/api/downloader/xnxx?url=${encodeURIComponent(text)}&apikey=AuZvefCywF`;

      const response = await axios.get(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0",
          "Accept": "application/json, text/plain, */*",
          "Referer": "https://www.xnxx.com/",
          "Origin": "https://www.xnxx.com"
        }
      });

      const data = response.data;

      if (!data || data.status !== "Success" || !data.data?.success) {
        return res.status(500).json({
          status: false,
          error: "Gagal mengambil data dari API"
        });
      }

      // Extract detail video dari response
      const videoData = data.data;

      // Pastikan properti yang dibutuhkan ada, kalau enggak kasih default
      const title = videoData.title || "No Title";
      const URL = videoData.videoUrl || videoData.url || "";
      const duration = videoData.duration || "";
      const info = videoData.resolutionInfo || {};
      const image = videoData.thumbnail || "";
      const files = videoData.downloads || {};

      return res.status(200).json({
        status: true,
        statusCode: 200,
        creator: "maslent",
        data: {
          title,
          videoUrl: URL,
          duration,
          resolutionInfo: info,
          thumbnail: image,
          downloads: {
            low: files.low || "",
            high: files.high || "",
            hls: files.HLS || ""
          },
          thumbnails: {
            thumb: files.thumb || "",
            thumb69: files.thumb69 || "",
            slide: files.thumbSlide || "",
            slideBig: files.thumbSlideBig || ""
          }
        }
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