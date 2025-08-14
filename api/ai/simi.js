const axios = require("axios");
const { URLSearchParams } = require("url");

const { checkApiKeyAndLimit } = require('../../middleware'); 

module.exports = (app) => { 
//Scraper gpt
async function simi(query) {
  try {
    const isi = new URLSearchParams();
    isi.append('text', query);
    isi.append('lc', 'id');

    const { data } = await axios.post('https://simsimi.vn/web/simtalk', isi, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    return data;
  } catch (e) {
    throw e;
  }
}
  app.get("/ai/simi", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter Prompt Di Perlukan..!" });
      }
      const result = await simi(text);
      res.status(200).json({
        status: true,
        creator: '@Maslent',
        result: result, // Perbaikan typo dari 'resul t'
      });
    } catch (error) {
      console.error("Error di /ai/chatgpt:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
