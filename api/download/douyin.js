const axios = require("axios");
const { checkApiKeyAndLimit } = require('../../middleware'); 

module.exports = (app) => {
  app.get("/download/douyin", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter 'text' (url) wajib diisi!" });
      }

      const apiKey = "AuZvefCywF"; // Bisa dijadikan env variable untuk keamanan
      const apiUrl = `https://api.ibeng.my.id/api/downloader/douyin?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

      const response = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0",
          "Accept": "application/json, text/plain, */*",
          "Referer": "https://www.douyin.com/",
          "Origin": "https://www.douyin.com"
        }
      });

      const data = response.data;

      if (data.status !== "Success" || !data.data || !Array.isArray(data.data.dl)) {
        return res.status(500).json({
          status: false,
          error: "Gagal mengambil data dari API iBeng (Douyin)."
        });
      }

      return res.status(200).json({
        status: true,
        statusCode: 200,
        creator: "maslent",
        data: {
          title: data.data.title || "Unknown Title",
          thumbnail: data.data.thumbnail || null,
          duration: data.data.duration || null,
          downloadLinks: data.data.dl.map(link => ({
            label: link.text || "Download",
            url: link.url || ""
          }))
        }
      });

    } catch (error) {
      console.error("Error:", error.message || error);
      return res.status(500).json({ status: false, error: error.message || "Internal server error" });
    }
  });
};