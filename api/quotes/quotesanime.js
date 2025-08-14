const { checkApiKeyAndLimit } = require('../../middleware');
const axios = require("axios");

module.exports = (app) => {
  app.get("/quotes/quotesanime", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { data } = await axios.get("https://katanime.vercel.app/api/getrandom?limit=1", { timeout: 10000 });

      // Data random anime (limit=1) biasanya array, jadi kita kirim langsung
      return res.status(200).json({
        status: true,
        data: data
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });
};