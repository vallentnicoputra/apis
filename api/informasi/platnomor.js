// file: api/tools/platnomor.js
const { checkApiKeyAndLimit } = require('../../middleware');

const platData = [
  { kode: "A", daerah: "Banten (Serang, Cilegon, Pandeglang, Lebak)" },
  { kode: "AA", daerah: "Magelang, Temanggung, Wonosobo" },
  { kode: "AB", daerah: "Yogyakarta" },
  { kode: "AD", daerah: "Surakarta (Solo), Klaten, Boyolali" },
  { kode: "AE", daerah: "Madiun, Ponorogo" },
  { kode: "AG", daerah: "Kediri, Blitar, Tulungagung" },
  { kode: "B", daerah: "DKI Jakarta, Depok, Bekasi, Tangerang" },
  { kode: "BA", daerah: "Sumatera Barat" },
  { kode: "BB", daerah: "Tapanuli" },
  { kode: "BD", daerah: "Bengkulu" },
  { kode: "BE", daerah: "Lampung" },
  { kode: "BG", daerah: "Sumatera Selatan" },
  { kode: "BH", daerah: "Jambi" },
  { kode: "BK", daerah: "Sumatera Utara (Medan, Deli Serdang)" },
  { kode: "BL", daerah: "Aceh" },
  { kode: "BM", daerah: "Riau" },
  { kode: "BN", daerah: "Bangka Belitung" },
  { kode: "BP", daerah: "Kepulauan Riau (Batam, Tanjungpinang)" },
  { kode: "D", daerah: "Bandung, Cimahi" },
  { kode: "DA", daerah: "Kalimantan Selatan" },
  { kode: "DB", daerah: "Sulawesi Utara (Bolmong, Kotamobagu)" },
  { kode: "DC", daerah: "Majene, Mamasa (Sulawesi Barat)" },
  { kode: "DD", daerah: "Sulawesi Selatan (Makassar, Maros)" },
  { kode: "DE", daerah: "Maluku" },
  { kode: "DG", daerah: "Maluku Utara" },
  { kode: "DH", daerah: "Nusa Tenggara Timur (Kupang, Soe)" },
  { kode: "DK", daerah: "Bali" },
  { kode: "DL", daerah: "Sulawesi Utara (Sangihe, Sitaro)" },
  { kode: "DM", daerah: "Gorontalo" },
  { kode: "DN", daerah: "Sulawesi Tengah" },
  { kode: "DR", daerah: "Nusa Tenggara Barat (Mataram, Lombok)" },
  { kode: "DS", daerah: "Papua (Jayapura)" },
  { kode: "DT", daerah: "Sulawesi Tenggara (Kendari, Bau-Bau)" },
  { kode: "EA", daerah: "Sumbawa, Bima (NTB)" },
  { kode: "EB", daerah: "Ende, Maumere (NTT)" },
  { kode: "ED", daerah: "Alor, Lembata (NTT)" },
  { kode: "F", daerah: "Bogor, Sukabumi, Cianjur" },
  { kode: "G", daerah: "Pekalongan, Tegal, Brebes" },
  { kode: "H", daerah: "Semarang, Salatiga, Kendal" },
  { kode: "K", daerah: "Pati, Kudus, Jepara, Rembang" },
  { kode: "KT", daerah: "Kalimantan Timur" },
  { kode: "L", daerah: "Surabaya" },
  { kode: "M", daerah: "Madura (Bangkalan, Sumenep, Pamekasan)" },
  { kode: "N", daerah: "Malang, Pasuruan, Probolinggo" },
  { kode: "P", daerah: "Jember, Lumajang, Bondowoso, Banyuwangi" },
  { kode: "R", daerah: "Banyumas, Cilacap, Purbalingga" },
  { kode: "S", daerah: "Mojokerto, Jombang, Bojonegoro, Lumajang" },
  { kode: "T", daerah: "Purwakarta, Subang, Karawang" },
  { kode: "W", daerah: "Sidoarjo, Gresik" },
  { kode: "Z", daerah: "Garut, Tasikmalaya, Ciamis, Banjar" }
];

module.exports = (app) => {
  app.get("/tools/platnomor", checkApiKeyAndLimit, (req, res) => {
    try {
      const kode = (req.query.kode || "").toUpperCase().trim();
      const result = kode
        ? platData.filter(item => item.kode === kode)
        : platData;

      if (!result.length) {
        return res.status(404).json({
          status: false,
          message: "Kode plat nomor tidak ditemukan"
        });
      }

      res.json({
        status: true,
        data: result
      });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};