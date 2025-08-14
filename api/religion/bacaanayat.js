// api/religion/alquran-json.js
const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/religion/bacaanayat", checkApiKeyAndLimit, async (req, res) => {
    const { surah, ayat } = req.query;

    try {
      const response = await fetch(
        "https://github.com/rzkytmgr/quran-api/raw/deprecated/data/quran.json"
      );

      if (!response.ok) {
        return res.status(500).json({
          status: false,
          error: "Gagal mengambil data: " + response.statusText,
        });
      }

      const data = await response.json();

      // Kalau surah & ayat dikasih
      if (surah && ayat) {
        const surahNum = Number(surah) - 1;
        const ayatNum = Number(ayat) - 1;
        if (!data[surahNum] || !data[surahNum].ayahs[ayatNum]) {
          return res.status(404).json({
            status: false,
            error: "Surah atau Ayat tidak ditemukan",
          });
        }
        const selectedAyah = data[surahNum].ayahs[ayatNum];
        return res.json({
          status: true,
          surah: data[surahNum].asma.id.short,
          ayat: selectedAyah.number.insurah,
          text: selectedAyah.text.ar,
          translation: selectedAyah.translation.id,
          audio: selectedAyah.audio.url,
        });
      }

      // Kalau cuma minta seluruh data
      res.json({
        status: true,
        totalSurah: data.length,
        data,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message,
      });
    }
  });
};