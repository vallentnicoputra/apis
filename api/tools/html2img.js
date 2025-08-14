const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

class Page2ImageConverter {
  constructor() {
    this.baseURL = "https://www.page2images.com";
    this.apiURL = `${this.baseURL}/api`;
    this.axiosInstance = axios.create({
      baseURL: this.apiURL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
      }
    });
  }

  async generate({ html, width = 1024, height = 0, device = 6 }) {
    const endpoint = "/html_to_image";
    const formData = new URLSearchParams();
    formData.append("p2i_html", html);
    formData.append("p2i_device", device.toString());
    formData.append("p2i_size", `${width}x${height}`);
    formData.append("p2i_url", "");
    formData.append("flag", "mobile_emulator");
    formData.append("p2i_htmlerror", "1");

    let response = null;
    const startTime = Date.now();
    const timeout = 30000;

    while (Date.now() - startTime < timeout) {
      try {
        response = await this.axiosInstance.post(endpoint, formData);
        if (response.data?.status === "finished") {
          return response.data;
        }
        await new Promise(r => setTimeout(r, 1500));
      } catch {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    throw new Error(`Gagal render HTML ke gambar dalam waktu ${timeout / 1000} detik`);
  }

  async convertHTMLToImage({ html, width = 1280, height = 1280 }) {
    const result = await this.generate({ html, width, height });
    return result?.image_url;
  }
}

module.exports = (app) => {
  app.get("/tools/html2img", async (req, res) => {
    try {
      const html = req.query.html;
      const width = parseInt(req.query.width) || 1280;
      const height = parseInt(req.query.height) || 1280;

      if (!html) {
        return res.status(400).json({ status: false, error: "Parameter 'html' wajib diisi" });
      }

      const converter = new Page2ImageConverter();
      const imageUrl = await converter.convertHTMLToImage({ html, width, height });

      res.json({
        status: true,
        width,
        height,
        image_url: imageUrl
      });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  });
};