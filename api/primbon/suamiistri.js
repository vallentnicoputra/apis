const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/suamiistri", checkApiKeyAndLimit, async (req, res) => {
    try {
      const {
        nama1, tgl1, bln1, thn1,
        nama2, tgl2, bln2, thn2
      } = req.query;

      // Validasi parameter
      if (!nama1 || !tgl1 || !bln1 || !thn1 || !nama2 || !tgl2 || !bln2 || !thn2) {
        return res.status(400).json({
          status: false,
          error: "Semua parameter wajib diisi: nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2"
        });
      }

      // Panggil API primbon
      const anu = await primbon.suami_istri(
        nama1, Number(tgl1), Number(bln1), Number(thn1),
        nama2, Number(tgl2), Number(bln2), Number(thn2)
      );

      if (!anu.status) {
        return res.status(400).json({
          status: false,
          error: anu.message
        });
      }

      const data = {
        nama_suami: anu.message.suami.nama,
        lahir_suami: anu.message.suami.tgl_lahir,
        nama_istri: anu.message.istri.nama,
        lahir_istri: anu.message.istri.tgl_lahir,
        hasil: anu.message.result,
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