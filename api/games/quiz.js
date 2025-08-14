const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/quiz", checkApiKeyAndLimit, async (req, res) => {
    try {
      const difficulty = req.query.difficulty || "easy"; // default easy
      const apiKey = "MrSORkLFSsJabARtQhyloo7574YX2dquEAchMn8x";

      const response = await fetch(
        `https://quizapi.io/api/v1/questions?apiKey=${apiKey}&difficulty=${difficulty}&limit=1`
      );

      if (!response.ok) throw new Error("Gagal mengambil data quiz");

      const data = await response.json();

      // Data biasanya array, kita kirim langsung atau map sesuai kebutuhan
      res.json({
        status: true,
        data: data, // langsung kirim array soal yang didapat
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};