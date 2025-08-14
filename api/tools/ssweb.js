const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  const screenshotService = new (class ScreenshotProvider {
    async fetchBuffer(url, options = {}) {
      const axios = require("axios");
      try {
        const response = await axios({ url, responseType: "arraybuffer", ...options });
        return Buffer.from(response.data);
      } catch (e) {
        console.error(`Error fetching buffer from ${url}:`, e.message);
        throw e;
      }
    }
    async fetchJson(url, options = {}) {
      const axios = require("axios");
      try {
        const response = await axios({ url, responseType: "json", ...options });
        return response.data;
      } catch (e) {
        console.error(`Error fetching JSON from ${url}:`, e.message);
        throw e;
      }
    }
    async webss(link) { return this.fetchBuffer(`https://webss.yasirweb.eu.org/api/screenshot?resX=1280&resY=900&outFormat=jpg&waitTime=1000&isFullPage=true&dismissModals=false&url=${link}`); }
    async apiFlash(link) { return this.fetchBuffer(`https://api.apiflash.com/v1/urltoimage?access_key=7eea5c14db5041ecb528f68062a7ab5d&wait_until=page_loaded&url=${link}`); }
    async thumIO(link) { return this.fetchBuffer(`https://image.thum.io/get/fullpage/${link}`); }
    async sShot(link) { return this.fetchBuffer(`https://mini.s-shot.ru/2560x1600/PNG/2560/Z100/?${link}`); }
    async webshotElzinko(link) { return this.fetchBuffer(`https://webshot-elzinko.vercel.app/api/webshot?url=${link}`); }
    async screenshotLayer(link) { return this.fetchBuffer(`https://api.screenshotlayer.com/api/capture?access_key=de547abee3abb9d3df2fc763637cac8a&url=${link}`); }
    async urlbox(link) { return this.fetchBuffer(`https://api.urlbox.io/v1/ln9ptArKXobLRpDQ/png?url=${link}`); }
    async backup15(link) { return this.fetchBuffer(`https://backup15.terasp.net/api/screenshot?resX=1280&resY=900&outFormat=jpg&waitTime=100&isFullPage=false&dismissModals=false&url=${link}`); }
    async shotsnap(link) { return this.fetchBuffer(`https://shotsnap.vercel.app/api/screenshot?page=${link}`); }
    async pptr(link) { return this.fetchBuffer(`https://pptr.io/api/screenshot?width=400&height=300&deviceScaleFactor=1&dark=1&url=${link}`); }
    async screenshotMachine(link) {
      const axios = require("axios");
      try {
        const form = new URLSearchParams({ url: link, device: "desktop", cacheLimit: 0, full: "on" });
        const response = await axios.post("https://www.screenshotmachine.com/capture.php", form, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const imageResponse = await axios.get(`https://www.screenshotmachine.com/${response.data.link}`, { responseType: "arraybuffer" });
        return Buffer.from(imageResponse.data);
      } catch (e) {
        console.error("Error with ScreenshotMachine:", e.message);
        throw e;
      }
    }
    async pikwy(link) {
      try {
        const res = await this.fetchJson(`https://api.pikwy.com/v1/screenshot?url=${link}`);
        return this.fetchBuffer(`https://api.pikwy.com/v1/screenshot/${res.id}`);
      } catch (e) {
        console.error("Error with Pikwy:", e.message);
        throw e;
      }
    }
    async fetchFox(link) {
      try {
        const res = await this.fetchJson(`https://fetchfox.ai/api/v2/fetch?url=${link}`);
        return this.fetchBuffer(res.screenshot);
      } catch (e) {
        console.error("Error with FetchFox:", e.message);
        throw e;
      }
    }
    async googleApis(link) {
      try {
        const res = await this.fetchJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?screenshot=true&url=${link}`);
        const dataURL = res.lighthouseResult?.fullPageScreenshot?.screenshot?.data;
        if (!dataURL) throw new Error("No screenshot data");
        return Buffer.from(dataURL.replace(/^data:image\/\w+;base64,/, ""), "base64");
      } catch (e) {
        console.error("Error with GoogleApis:", e.message);
        throw e;
      }
    }
    async euCentral(link) { return this.fetchBuffer(`https://2s9e3bif52.execute-api.eu-central-1.amazonaws.com/production/screenshot?url=${link}`); }
    async hexometer(link) {
      const axios = require("axios");
      try {
        const res = await axios.post("https://api.hexometer.com/v2/ql", {
          query: `{Property{liveScreenshot(address: "${link}"){width height hash}}}`,
        }, {
          headers: { Accept: "application/json", "Content-Type": "application/json" },
        });
        const imageHash = res.data.data.Property.liveScreenshot.hash;
        return this.fetchBuffer(`https://fullpagescreencapture.com/screen/${imageHash}.jpg`);
      } catch (e) {
        console.error("Error with Hexometer:", e.message);
        throw e;
      }
    }
    async microlink(link) {
      const axios = require("axios");
      try {
        const res = await axios.post("https://api.microlink.io/", {
          url: link,
          screenshot: true,
          meta: false,
          pdf: false,
        }, {
          headers: { Accept: "application/json", "Content-Type": "application/json" },
        });
        return this.fetchBuffer(res.data.data.screenshot.url);
      } catch (e) {
        console.error("Error with Microlink:", e.message);
        throw e;
      }
    }
    async geoBrowse(link, code = "us") {
      const axios = require("axios");
      try {
        const res = await axios.post("https://us-central1-geotargetly-1a441.cloudfunctions.net/free-tool_geobrowse-gen-screenshots", {
          code,
          url: link,
        }, {
          headers: {
            "Content-Type": "application/json",
            Referer: "https://geotargetly.com/geo-browse",
          },
        });
        return Buffer.from(res.data, "base64");
      } catch (e) {
        console.error("Error with GeoBrowse:", e.message);
        throw e;
      }
    }
  })();

  // Urutan method sesuai class kamu
  const methods = [
    "googleApis",
    "hexometer",
    "pikwy",
    "fetchFox",
    "microlink",
    "euCentral",
    "apiFlash",
    "backup15",
    "pptr",
    "sShot",
    "screenshotLayer",
    "screenshotMachine",
    "shotsnap",
    "thumIO",
    "urlbox",
    "webshotElzinko",
    "webss",
    "geoBrowse",
  ];

  app.get("/tools/ssweb", checkApiKeyAndLimit, async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, error: "Parameter 'url' wajib diisi" });

    async function tryProviders(i = 0) {
      if (i >= methods.length) throw new Error("Semua provider gagal.");
      try {
        const result = await screenshotService[methods[i]](url);
        if (!result) throw new Error("Provider gagal mengembalikan data");
        return result;
      } catch (error) {
        console.error(`Provider ke-${i + 1} (${methods[i]}) gagal:`, error.message);
        return tryProviders(i + 1);
      }
    }

    try {
      const buffer = await tryProviders();
      res.setHeader("Content-Type", "image/jpeg");
      res.status(200).send(buffer);
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};