const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/tebaklirik", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/tebaklirik.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data tebak lirik");
      const data = await response.json();

      const soalObj = data[Math.floor(Math.random() * data.length)];
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