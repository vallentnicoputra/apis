const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/kecocokannama", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { nama, tgl, bln, thn } = req.query;

      // Validasi input
      if (!nama || !tgl || !bln || !thn) {
        return res.status(400).json({
          status: false,
          error: "Parameter wajib: nama, tgl, bln, thn"
        });
      }

      // Panggil API primbon
      const anu = await primbon.kecocokan_nama(
        nama,
        Number(tgl),
        Number(bln),
        Number(thn)
      );

      if (!anu.status) {
        return res.status(400).json({
          status: false,
          error: anu.message
        });
      }

      const data = {
        nama: anu.message.nama,
        lahir: anu.message.tgl_lahir,
        life_path: anu.message.life_path,
        destiny: anu.message.destiny,
        destiny_desire: anu.message.destiny_desire,
        personality: anu.message.personality,
        persentase: anu.message.persentase_kecocokan
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