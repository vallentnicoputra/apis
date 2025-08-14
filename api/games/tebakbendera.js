const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/game/tebakbendera", checkApiKeyAndLimit, async (req, res) => {
    try {
      let json;
      try {
        // Ambil data negara dan kode bendera dari flagcdn
        const data = await (await fetch("https://flagcdn.com/en/codes.json")).json();

        // Pilih kode negara random
        const randomKey = Object.keys(data)[Math.floor(Math.random() * Object.keys(data).length)];

        json = {
          name: data[randomKey], // nama negara
          img: `https://flagpedia.net/data/flags/ultra/${randomKey}.png`, // url gambar bendera
        };
      } catch (e) {
        // Jika gagal ambil dari flagcdn, fallback ke data GitHub
        const src = await (
          await fetch(
            "https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakbendera2.json"
          )
        ).json();

        // Pilih data random dari file GitHub
        json = src[Math.floor(Math.random() * src.length)];
      }

      res.json({
        status: true,
        question: `Tebak bendera negara berikut ini`,
        name: json.name,
        flagImage: json.img,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
    }
  });
};