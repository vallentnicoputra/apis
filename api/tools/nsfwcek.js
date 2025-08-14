const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data"); // pakai yang dari npm
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/tools/nsfwcek", checkApiKeyAndLimit, async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, error: "Parameter url wajib diisi." });

    try {
      // Cek content-type
      const head = await axios.head(url);
      if (!head.headers["content-type"]?.startsWith("image/")) {
        return res.status(400).json({ success: false, error: "URL tersebut bukan gambar." });
      }

      // Ambil Function ID dari Nyckel
      const nyckelRes = await axios.get("https://www.nyckel.com/pretrained-classifiers/nsfw-identifier", {
        headers: {
          "user-agent": "Postify/1.0.0"
        }
      });
      const $ = cheerio.load(nyckelRes.data);
      const script = $('script[src*="embed-image.js"]').attr("src");
      const functionId = script?.match(/[?&]id=([^&]+)/)?.[1];
      if (!functionId) throw new Error("Function ID tidak ditemukan.");

      // Download gambar dalam buffer
      const imageRes = await axios.get(url, { responseType: "arraybuffer" });

      // Kirim ke Nyckel API
      const form = new FormData();
      form.append("file", Buffer.from(imageRes.data), "image.jpg");

      const invokeUrl = `https://www.nyckel.com/v1/functions/${functionId}/invoke`;
      const detectRes = await axios.post(invokeUrl, form, {
        headers: {
          ...form.getHeaders(),
          "user-agent": "Postify/1.0.0"
        }
      });

      res.json({
        success: true,
        result: detectRes.data
      });

    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
};