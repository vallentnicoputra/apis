const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/tebakgambar", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakgambar.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data tebak gambar");
      const gambarList = await response.json();

      const randomIndex = Math.floor(Math.random() * gambarList.length);
      const data = gambarList[randomIndex];

      res.json({
        status: true,
        soal: data.soal || "Tidak ada soal",
        image: data.img || "",
        jawaban: data.jawaban || "Tidak ada jawaban",
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};