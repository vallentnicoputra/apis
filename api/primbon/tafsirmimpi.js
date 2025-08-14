const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/artimimpi", checkApiKeyAndLimit, async (req, res) => {
    try {
      const text = req.query.text; 
      if (!text) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'text' wajib diisi"
        });
      }

      // Panggil API primbon
      const anu = await primbon.tafsir_mimpi(text); // kurung ganda dihapus

      if (!anu.status) {
        return res.status(400).json({
          status: false,
          error: anu.message
        });
      }

      const data = {
        arti_mimpi: anu.message.mimpi,
        arti: anu.message.arti,
        penjelasan: anu.message.solusi        
      };
         
      return res.status(200).json({
        status: true,
        data
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