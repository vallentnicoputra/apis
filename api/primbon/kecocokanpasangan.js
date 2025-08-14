const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/kecocokanpasangan", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { nama1, nama2 } = req.query;

      // Validasi parameter
      if (!nama1 || !nama2) {
        return res.status(400).json({
          status: false,
          error: "Parameter wajib: nama1, nama2"
        });
      }

      // Panggil API primbon
      const anu = await primbon.kecocokan_nama_pasangan(nama1, nama2);

      if (!anu.status) {
        return res.status(400).json({
          status: false,
          error: anu.message
        });
      }

      const data = {
        nama_anda: anu.message.nama_anda,
        nama_pasangan: anu.message.nama_pasangan,
        sisi_positif: anu.message.sisi_positif,
        sisi_negatif: anu.message.sisi_negatif,
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