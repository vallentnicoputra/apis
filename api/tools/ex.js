const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

class WebContentExtractor {
  constructor() {
    this.apiUrl = "https://yourgpt.ai/api/extractWebpageText";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
      Referer: "https://yourgpt.ai/tools/webpage-content-extractor"
    };
  }

  async extract({
    url,
    format = "text",
    textOnly = false,
    ignoreLinks = false,
    includeElements = "",
    excludeElements = ""
  }) {
    if (!url) throw new Error("URL parameter is required for extraction.");
    const payload = {
      url,
      options: {
        format,
        textOnly,
        ignoreLinks,
        includeElements,
        excludeElements
      }
    };
    try {
      const response = await axios.post(this.apiUrl, payload, {
        headers: this.defaultHeaders
      });
      return response.data?.content;
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error.message);
      if (error.response) {
        console.error("API Response Status:", error.response.status);
        console.error("API Response Data:", error.response.data);
      }
      throw error;
    }
  }
}

module.exports = (app) => {
  const extractor = new WebContentExtractor();

  app.get("/tools/ex", checkApiKeyAndLimit, async (req, res) => {
    const { url, format, textOnly, ignoreLinks, includeElements, excludeElements } = req.query;
    if (!url) return res.status(400).json({ status: false, message: "Parameter 'url' wajib diisi" });
    try {
      const result = await extractor.extract({
        url,
        format,
        textOnly: textOnly === "true",
        ignoreLinks: ignoreLinks === "true",
        includeElements: includeElements || "",
        excludeElements: excludeElements || ""
      });
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(result);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });

  app.post("/tools/ex", checkApiKeyAndLimit, async (req, res) => {
    const { url, format, textOnly, ignoreLinks, includeElements, excludeElements } = req.body;
    if (!url) return res.status(400).json({ status: false, message: "Parameter 'url' wajib diisi" });
    try {
      const result = await extractor.extract({
        url,
        format,
        textOnly: !!textOnly,
        ignoreLinks: !!ignoreLinks,
        includeElements: includeElements || "",
        excludeElements: excludeElements || ""
      });
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(result);
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};