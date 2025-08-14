const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/jadianpernikahan", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { tgl, bln, thn } = req.query;

      // Validasi parameter
      if (!tgl || !bln || !thn) {
        return res.status(400).json({
          status: false,
          error: "Parameter wajib: tgl, bln, thn"
        });
      }

      // Panggil API primbon
      const anu = await primbon.tanggal_jadian_pernikahan(
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
        tanggal_pernikahan: anu.message.tanggal,
        karakteristik: anu.message.karakteristik
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