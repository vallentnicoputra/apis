const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/lengkapikalimat", checkApiKeyAndLimit, async (req, res) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/qisyana/scrape/main/lengkapikalimat.json"
      );
      if (!response.ok) throw new Error("Gagal mengambil data lengkapikalimat");

      const dataList = await response.json();

      // Pilih random data
      const dataObj = dataList[Math.floor(Math.random() * dataList.length)];

      res.json({
        status: true,
        soal: dataObj.soal || dataObj.question || "",
        jawaban: dataObj.jawaban || dataObj.answer || "",
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};