const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/ramalannasib", checkApiKeyAndLimit, async (req, res) => {
    try {
      const text = req.query.text;

      // Validasi input
      if (!text) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'text' wajib diisi dalam format tgl,bln,thn"
        });
      }

      // Pisahkan tanggal, bulan, tahun
      const [tgl, bln, thn] = text.split(",");

      if (!tgl || !bln || !thn) {
        return res.status(400).json({
          status: false,
          error: "Format 'text' salah, gunakan: tgl,bln,thn"
        });
      }

      // Panggil API primbon
      const anu = await primbon.ramalan_nasib(
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
        analisa: anu.message.analisa,
        angka_akar: anu.message.angka_akar,
        sifat: anu.message.sifat,
        elemen: anu.message.elemen,
        angka_keberuntungan: anu.message.angka_keberuntungan
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