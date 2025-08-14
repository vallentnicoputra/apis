const { checkApiKeyAndLimit } = require('../../middleware');
const axios = require("axios");

module.exports = (app) => {
  app.get("/religion/kisahnabi", checkApiKeyAndLimit, async (req, res) => {
    try {
      const text = (req.query.text || "").trim();
      if (!text) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'text' wajib diisi!"
        });
      }

      const url = `https://raw.githubusercontent.com/ZeroChanBot/Api-Freee/a9da6483809a1fbf164cdf1dfbfc6a17f2814577/data/kisahNabi/${encodeURIComponent(text)}.json`;

      const { data } = await axios.get(url, { timeout: 10000 });

      return res.status(200).json({
        status: true,
        data
      });

    } catch (err) {
      return res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });
};