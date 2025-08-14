const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/pekerjaan", checkApiKeyAndLimit, async (req, res) => {
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
      const anu = await primbon.pekerjaan_weton_lahir(
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
        lahir: anu.message.hari_lahir,
        pekerjaan: anu.message.pekerjaan,
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