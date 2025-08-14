const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

// List type yang diizinkan
const allowedTypes = [
  "ass", "sixtynine", "pussy", "dick", "anal", "boobs", "bdsm", "black", "easter",
  "bottomless", "blowjub", "collared", "cum", "cumsluts", "dp", "dom", "extreme",
  "feet", "finger", "fuck", "futa", "gay", "gif", "group", "hentai", "kiss", "lesbian",
  "lick", "pegged", "phgif", "puffies", "real", "suck", "tattoo", "tiny", "toys", "xmas"
];

module.exports = (app) => {
  app.get("/nsfw/nsfwhub", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { type } = req.query;

      // Validasi parameter
      if (!type) {
        return res.status(400).json({ 
          status: false, 
          message: "Parameter 'type' wajib diisi", 
          available_types: allowedTypes 
        });
      }
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ 
          status: false, 
          message: `Type '${type}' tidak valid. Pilihan yang tersedia ada di 'available_types'.`, 
          available_types: allowedTypes 
        });
      }

      // Ambil data dari API eksternal
      const apiUrl = `https://nsfwhub.onrender.com/nsfw?type=${encodeURIComponent(type)}`;
      const response = await axios.get(apiUrl);

      if (response.status !== 200) {
        return res.status(response.status).json({ 
          status: false, 
          message: "Gagal mengambil data dari server" 
        });
      }

      // Kirim hasil ke user
      return res.status(200).json({
        status: true,
        data: response.data
      });

    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Terjadi kesalahan pada server",
        error: error.message
      });
    }
  });
};