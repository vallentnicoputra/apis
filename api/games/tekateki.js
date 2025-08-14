const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/tekateki", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/tekateki.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data tekateki");

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0)
        throw new Error("Data tekateki kosong");

      const soalObj = data[Math.floor(Math.random() * data.length)];

      res.json({
        status: true,
        soal: soalObj.soal || soalObj.question || "",
        jawaban: soalObj.jawaban || soalObj.answer || "",
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};