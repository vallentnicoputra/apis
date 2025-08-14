const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/nomorhoki", checkApiKeyAndLimit, async (req, res) => {
    try {
      const text = req.query.text; 
      if (!text) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'text' wajib diisi"
        });
      }

      // Panggil API primbon
      const anu = await primbon.nomer_hoki(Number(text));

      if (!anu.status) {
        return res.status(400).json({
          status: false,
          error: anu.message
        });
      }

      const data = {
        nomor_hp: anu.message.nomer_hp,
        angka_shuzi: anu.message.angka_shuzi,
        energi_positif: anu.message.energi_positif,
        energi_negatif: anu.message.energi_negatif
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