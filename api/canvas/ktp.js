const axios = require("axios");
const Html = require("../../data/html/ktp/list"); // fungsi pembuat HTML KTP
const { checkApiKeyAndLimit } = require("../../middleware");
const apiConfig = require("../../configs/apiConfig");

class HtmlToImg {
  constructor() {
    this.baseURL = `${apiConfig.PROTOCOL}://${apiConfig.DOMAIN_URL}/tools/html2img`;
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
    };
    console.log("[HtmlToImg] API Base URL:", this.baseURL);
  }

  async generate(data) {
    const templateSizes = {
      1: { width: 720, height: 430 },
      2: { width: 735, height: 463 },
      3: { width: 735, height: 477 },
      4: { width: 1200, height: 800 },
    };

    const { width, height } = templateSizes[data.model] || templateSizes[1];

    const htmlString = Html(data);
    const encodedHtml = encodeURIComponent(htmlString);

    const apikey = data.apikey || "";

    const url = `${this.baseURL}?html=${encodedHtml}&width=${width}&height=${height}&apikey=${apikey}`;

    console.log("[HtmlToImg] Request URL:", url);

    try {
      const response = await axios.get(url, {
        headers: this.headers,
      });

      console.log("[HtmlToImg] Response data:", response.data);

      // Ganti dari response.data.url ke response.data.image_url
      return response.data?.image_url;
    } catch (error) {
      console.error("[HtmlToImg] Error during API call:", error.message);
      throw error;
    }
  }
}

module.exports = (app) => {
  app.get("/canvas/ktp", checkApiKeyAndLimit, async (req, res) => {
    try {
      console.log("[Route /canvas/ktp] Query params:", req.query);

      const htmlToImg = new HtmlToImg();

      const url = await htmlToImg.generate({
        photo: req.query.photo,
        provinsi: req.query.provinsi,
        kabupaten: req.query.kabupaten,
        nik: req.query.nik,
        nama: req.query.nama,
        ttl: req.query.ttl,
        gender: req.query.gender,
        darah: req.query.darah,
        alamat: req.query.alamat,
        rt: req.query.rt,
        desa: req.query.desa,
        kecamatan: req.query.kecamatan,
        agama: req.query.agama,
        status: req.query.status,
        pekerjaan: req.query.pekerjaan,
        kewarganegaraan: req.query.kewarganegaraan,
        berlaku: req.query.berlaku,
        dibuat: req.query.dibuat,
        terbuat: req.query.terbuat,
        sign: req.query.sign,
        model: parseInt(req.query.model) || 1,
        type: req.query.type || "v5",
        apikey: req.query.apikey,
      });

      res.json({ status: true, url });
    } catch (err) {
      console.error("[Route /canvas/ktp] Error:", err.message);
      res.status(500).json({ status: false, error: err.message });
    }
  });
};