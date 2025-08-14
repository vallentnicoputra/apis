const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/siapakahaku", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/siapakahaku.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data soal");
      const soalList = await response.json();

      // Pilih soal secara random
      const soalObj = soalList[Math.floor(Math.random() * soalList.length)];

      res.json({
        status: true,
        soal: soalObj.soal,
        jawaban: soalObj.jawaban,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};