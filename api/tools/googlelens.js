const axios = require("axios");
const fetch = require("node-fetch");
const FormData = require("formdata-node").FormData;
const Blob = require("buffer").Blob;
const cheerio = require("cheerio");
const { checkApiKeyAndLimit } = require("../../middleware");

async function googleLensSearch(imgUrl) {
  try {
    const imageData = Buffer.from(await (await fetch(imgUrl)).arrayBuffer());
    const form = new FormData();
    form.append("image_url", imgUrl);
    form.append("sbisrc", "Chromium 98.0.4725.0 Windows");
    form.append("encoded_image", new Blob([imageData], { type: "image/png" }), "image.png");

    const uploadResponse = await fetch(
      `https://lens.google.com/v3/upload?s=4&re=df&stcs=${encodeURIComponent(imgUrl)}`,
      {
        method: "POST",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4725.0 Safari/537.36",
        },
        body: form,
      }
    );

    const htmlContent = await uploadResponse.text();
    const searchStart = htmlContent.indexOf("Abrf");
    if (searchStart === -1) throw new Error("Search token not found");

    const partAfterSearch = htmlContent.substring(searchStart);
    const start = partAfterSearch.indexOf("Abrf");
    const end = partAfterSearch.indexOf("\\", start);
    const searchToken = partAfterSearch.substring(start, end);

    const searchUrl = `https://lens.google.com/search?ep=subb&re=df&s=4&p=${searchToken}`;

    const searchHtml = await (await fetch(searchUrl)).text();
    const $ = cheerio.load(searchHtml);
    const scriptContent = $("script.ds\\:0").html();

    if (!scriptContent) throw new Error("Script element not found");

    const str = scriptContent.split("AF_initDataCallback")[1];
    const jsonData = `[${str?.slice(str.indexOf("["), str.lastIndexOf("]") + 1) || "[]"}]`;
    const dataArray = JSON.parse(jsonData)[0]?.[1]?.[0]?.[1]?.[8]?.[8]?.[0] || [];

    return dataArray.flatMap(item =>
      Array.isArray(item)
        ? item.flatMap(subItem =>
            Array.isArray(subItem) &&
            subItem[3] &&
            subItem[7] &&
            subItem[0]?.[0] &&
            subItem[5] &&
            subItem[11] &&
            subItem[14]
              ? [{
                  title: subItem[3] || "",
                  domain: subItem[7] || "",
                  thumbnail: subItem[0]?.[0] || "",
                  imgres: subItem[5] || "",
                  link: subItem[11] || "",
                  source: subItem[14] || "",
                  pcnt: subItem[1] || "",
                }]
              : []
          )
        : []
    ).filter(i => i.thumbnail);
  } catch (error) {
    throw new Error(error.message || error);
  }
}

module.exports = (app) => {
  app.get("/tools/googlelens", checkApiKeyAndLimit, async (req, res) => {
    const imgUrl = req.query.imgUrl || (req.body && req.body.imgUrl);
    if (!imgUrl) return res.status(400).json({ status: false, error: "Parameter 'imgUrl' wajib diisi" });

    try {
      const result = await googleLensSearch(imgUrl);
      res.json({ status: true, result, provider: "Google Lens" });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message || "Gagal memproses Google Lens" });
    }
  });
};