const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  app.get("/canvas/qrcode", checkApiKeyAndLimit, async (req, res) => {
    try {
      const {
        data = "Hello World",
        do: doParam = 1,
        action = "text",
        ecl = "L",
        block = 20,
        margin = 1,
        otype = "png",
        ctype = "q",
        fg = "#000000",
        bg = "#FFFFFF",
        hid = "7d4f629c-65737102",
      } = req.query;

      const response = await axios.get("https://keremerkan.net/generator/code.png", {
        params: {
          do: doParam,
          action,
          ecl,
          block,
          margin,
          otype,
          ctype,
          fg,
          bg,
          hid,
          free_text: data,
        },
        responseType: "arraybuffer",
      });

      res.setHeader("Content-Type", "image/png");
      res.send(response.data);
    } catch (err) {
      console.error("[/tools/qrcode] Error:", err.message);
      res.status(500).json({ status: false, error: "Internal Server Error" });
    }
  });
};