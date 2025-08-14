const axios = require("axios");
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/webzone/covid19", checkApiKeyAndLimit, async (req, res) => {
    const country = req.query.country;
    if (!country) {
      return res.status(400).json({ status: false, message: "Parameter 'country' wajib diisi" });
    }

    try {
      const response = await axios.get(
        `https://www.worldometers.info/coronavirus/country/${country}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 9; Redmi 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36",
          },
        }
      );

      const $ = cheerio.load(response.data);
      let result = {
        status: response.status,
        negara: $("div").find("h1").text().slice(3).split(/ /g)[0],
        total_kasus:
          $("div#maincounter-wrap")
            .find("div.maincounter-number > span")
            .eq(0)
            .text() + " total",
        total_kematian:
          $("div#maincounter-wrap")
            .find("div.maincounter-number > span")
            .eq(1)
            .text() + " total",
        total_sembuh:
          $("div#maincounter-wrap")
            .find("div.maincounter-number > span")
            .eq(2)
            .text() + " total",
        informasi: $("div.content-inner > div").eq(1).text(),
        informasi_lengkap: `https://www.worldometers.info/coronavirus/country/${country}`,
      };

      if (!result.negara) {
        result.status = "error";
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil data Corona",
        error: error.message,
      });
    }
  });
};