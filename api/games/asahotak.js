const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/asahotak", checkApiKeyAndLimit, async (req, res) => {
    try {
      // Ambil soal dari raw GitHub
      const response = await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/asahotak.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data soal");
      const soalList = await response.json();

      // Pilih soal random
      const soalObj = soalList[Math.floor(Math.random() * soalList.length)];

      // Buat clue (huruf vokal jadi _ )
      const clue = soalObj.jawaban.replace(/[aiueoAIUEO]/g, "_");

      res.json({
        status: true,
        soal: soalObj.soal,
        clue,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};