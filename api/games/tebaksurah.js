const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

function getRandomAyahNumber() {
  return Math.floor(Math.random() * 6236) + 1;
}

module.exports = (app) => {
  app.get("/game/tebaksurah", checkApiKeyAndLimit, async (req, res) => {
    try {
      const randomNumber = getRandomAyahNumber();
      const url = `https://api.alquran.cloud/v1/ayah/${randomNumber}/ar.alafasy`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Gagal mengambil data ayat");

      const data = await response.json();
      if (!data || !data.data) throw new Error("Data ayat kosong");

      res.json({
        status: true,
        nomorAyat: `${data.data.surah.number}:${data.data.numberInSurah}`,
        surah: data.data.surah.englishName,
        teksArab: data.data.text,
        audio: data.data.audio,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};