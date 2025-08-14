// api/tools/quran.js
const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

class QuranAPI {
  async getAyah(ayat, edition = "quran-simple") {
    try {
      const url = `https://api.alquran.cloud/v1/ayah/${ayat}/${edition}`;
      const res = await fetch(url);
      const data = await res.json();
      return {
        ...data,
        imageUrl: `https://cdn.islamic.network/quran/images/high-resolution/${data.data.surah.number}_${data.data.number}.png`,
        audioUrl: `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${data.data.number}.mp3`
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getSurah(surah, edition = "quran-simple") {
    try {
      const url = `https://api.alquran.cloud/v1/surah/${surah}/${edition}`;
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = (app) => {
  const quranAPI = new QuranAPI();

app.get("/religion/alquran/ayat", checkApiKeyAndLimit, async (req, res) => {
  const { ayat, edition } = req.query;
  if (!ayat) return res.status(400).json({ status: false, error: "Parameter 'ayat' wajib diisi" });

  const result = await quranAPI.getAyah(ayat, edition); // <--- diganti getAyah
  res.json({ status: !result.error, ...result });
});

app.get("/religion/alquran/surah", checkApiKeyAndLimit, async (req, res) => {
  const { surah, edition } = req.query;
  if (!surah) return res.status(400).json({ status: false, error: "Parameter 'surah' wajib diisi" });

  const result = await quranAPI.getSurah(surah, edition); // <--- sudah benar
  res.json({ status: !result.error, ...result });
});
};