const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/tebakcharacter", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch("https://api.jikan.moe/v4/characters");
      if (!response.ok) throw new Error("Gagal mengambil data karakter anime");
      const data = await response.json();

      // Ambil data karakter pertama (random dari response)
      // Kalau mau random, ambil index random dari data.data array
      const characters = data.data;
      if (!characters || characters.length === 0)
        throw new Error("Data karakter tidak tersedia");

      const randomIndex = Math.floor(Math.random() * characters.length);
      const char = characters[randomIndex];

      const result = {
        status: true,
        name: char.name,
        image: char.images?.jpg?.image_url || "",
        about: char.about ? char.about.substring(0, 500) + "..." : "Deskripsi tidak tersedia",
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
    }
  });
};