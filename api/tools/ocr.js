const axios = require("axios");
const FormData = require("form-data");
const { checkApiKeyAndLimit } = require("../../middleware");

function genSerial(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

class DecopyOCRService {
  constructor() {
    this.cookies = "";
    this.axiosInstance = axios.create({
      baseURL: "https://api.decopy.ai/api/decopy/",
      headers: {
        accept: "*/*",
        "accept-language": "id-ID,id;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "product-code": "067003",
        "product-serial": genSerial(32),
        origin: "https://decopy.ai",
        referer: "https://decopy.ai/",
        "sec-ch-ua": '"Lemur";v="135", "", "", "Microsoft Edge Simulate";v="135"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36"
      }
    });
  }

  async getCookies() {
    try {
      const response = await axios.get("https://decopy.ai/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
          "Accept-Language": "id-ID,id;q=0.9"
        }
      });
      const setCookieHeaders = response.headers["set-cookie"];
      if (setCookieHeaders) {
        this.cookies = setCookieHeaders.map(cookieStr => cookieStr.split(";")[0]).join("; ");
      }
      return this.cookies;
    } catch (error) {
      console.error("Error fetching initial cookies:", error.message);
      throw error;
    }
  }

  async processImage({ url }) {
    if (!url) throw new Error("Image URL is required for OCR.");

    if (!this.cookies) {
      await this.getCookies();
    }

    try {
      const imageResponse = await axios.get(url, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers["content-type"] || "image/jpeg";
      const filename = url.substring(url.lastIndexOf("/") + 1) || "image.jpg";

      const formData = new FormData();
      formData.append("upload_images", imageBuffer, {
        filename,
        contentType
      });

      const headers = {
        ...formData.getHeaders(),
        Cookie: this.cookies
      };

      const response = await this.axiosInstance.post("image-to-text/create-job", formData, { headers });

      return response.data?.result;
    } catch (error) {
      console.error("OCR process error:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }
}

module.exports = (app) => {
  const ocr = new DecopyOCRService();

  app.get("/tools/ocr", checkApiKeyAndLimit, async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, error: "Parameter 'url' wajib diisi" });

    try {
      const result = await ocr.processImage({ url });
      res.json({ status: true, result });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  });
};