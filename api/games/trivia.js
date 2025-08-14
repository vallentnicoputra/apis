const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/trivia", checkApiKeyAndLimit, async (req, res) => {
    try {
      const topic = req.query.topic || "general";
      const lang = req.query.lang || "en"; // default bahasa Inggris

      const url = `https://play.triviamaker.com/questionGenerator.php?topic=${encodeURIComponent(topic)}`;

      // Ambil soal dari TriviaMaker
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
          Referer: "https://triviamaker.ai/",
        },
      });
      if (!response.ok) throw new Error("Gagal mengambil data dari TriviaMaker");

      const json = await response.json();
      if (!json.data || json.data.length === 0)
        throw new Error("Tidak ada soal ditemukan");

      const soalObj = json.data[Math.floor(Math.random() * json.data.length)];

      // Kalau lang=id → translate
      async function translateText(text) {
        const res = await fetch(
          "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=" +
            encodeURIComponent(text)
        );
        const data = await res.json();
        return data[0]?.map((item) => item[0]).join(" ") || text;
      }

      let soal = soalObj.question;
      let opsi = soalObj.options || [];
      let jawaban = soalObj.answer;

      if (lang.toLowerCase() === "id") {
        soal = await translateText(soal);
        opsi = await Promise.all(opsi.map((opt) => translateText(opt)));
        jawaban = await translateText(jawaban);
      }

      res.json({
        status: true,
        soal,
        opsi,
        jawaban,
        lang,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};