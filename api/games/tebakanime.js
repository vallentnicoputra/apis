const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/tebakanime", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch("https://api.jikan.moe/v4/random/characters");
      if (!response.ok) throw new Error("Gagal mengambil data karakter");
      const data = await response.json();

      if (!data.data) throw new Error("Data karakter tidak ditemukan");

      const character = data.data;

      // Siapkan jawaban & soal
      const question = `Siapakah nama karakter ini?`;
      const answer = character.name || "Tidak tersedia";

      // Contoh detail tambahan buat memperkaya soal
      const description = character.about || "Deskripsi tidak tersedia";
      const imageUrl = character.images?.jpg?.image_url || "";

      res.json({
        status: true,
        question,
        answer,
        description,
        imageUrl,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};