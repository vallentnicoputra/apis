const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/artinama", checkApiKeyAndLimit, async (req, res) => {
    try {
      const text = req.query.text;

      // Validasi input
      if (!text) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'text' wajib diisi"
        });
      }

      // Panggil API primbon
      const anu = await primbon.arti_nama(text);

      if (!anu.status) {
        return res.status(400).json({
          status: false,
          error: anu.message
        });
      }

      const data = {
        nama: anu.message.nama,
        arti: anu.message.arti,
        catatan: anu.message.catatan
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