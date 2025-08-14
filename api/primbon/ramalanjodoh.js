const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/ramalanjodoh", checkApiKeyAndLimit, async (req, res) => {
    try {
      const {
        nama1, tgl1, bln1, thn1,
        nama2, tgl2, bln2, thn2
      } = req.query;

      // Cek parameter wajib
      if (!nama1 || !tgl1 || !bln1 || !thn1 || !nama2 || !tgl2 || !bln2 || !thn2) {
        return res.status(400).json({
          status: false,
          error: "Semua parameter wajib diisi: nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2"
        });
      }

      // Panggil API primbon
      const anu = await primbon.ramalan_jodoh(
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
        nama_anda: anu.message.nama_anda.nama,
        lahir_anda: anu.message.nama_anda.tgl_lahir,
        nama_pasangan: anu.message.nama_pasangan.nama,
        lahir_pasangan: anu.message.nama_pasangan.tgl_lahir,
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