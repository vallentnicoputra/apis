const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/family100", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/BochilTeam/database/master/games/family100.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data family100");

      const dataList = await response.json();

      // Pilih random soal
      const dataObj = dataList[Math.floor(Math.random() * dataList.length)];

      res.json({
        status: true,
        question: dataObj.question,
        answers: dataObj.answers,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};