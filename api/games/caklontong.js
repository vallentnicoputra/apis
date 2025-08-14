const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/caklontong", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/caklontong.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data soal");

      const caklontongList = await response.json();

      // Pilih soal random
      const soalObj = caklontongList[Math.floor(Math.random() * caklontongList.length)];

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