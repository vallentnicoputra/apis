const { Primbon } = require("scrape-primbon");
const primbon = new Primbon();
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/primbon/fengsui", checkApiKeyAndLimit, async (req, res) => {
    try {
      const text = req.query.text;

      // Validasi input
      if (!text) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'text' wajib diisi dalam format nama,gender,tahun"
        });
      }

      // Pisahkan nama, gender, tahun
      const [nama, gender, tahun] = text.split(",");

      if (!nama || !gender || !tahun) {
        return res.status(400).json({
          status: false,
          error: "Format 'text' salah, gunakan: nama,gender,tahun"
        });
      }

      // Panggil API primbon
      const anu = await primbon.perhitungan_feng_shui(nama, gender, tahun);

      if (!anu.status) {
        return res.status(400).json({
          status: false,
          error: anu.message
        });
      }

      const data = {
        nama: anu.message.nama,
        tahun_lahir: anu.message.tahun_lahir,
        gender: anu.message.jenis_kelamin,
        angka_kua: anu.message.angka_kua,
        kelompok: anu.message.kelompok,
        karakter: anu.message.karakter,
        sektor_baik: anu.message.sektor_baik,
        sektor_buruk: anu.message.sektor_buruk
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