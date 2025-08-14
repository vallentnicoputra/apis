const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/tebakapp", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/orderku/db/main/dbbot/game/tebakapp.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data tebakapp");
      const data = await response.json();

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