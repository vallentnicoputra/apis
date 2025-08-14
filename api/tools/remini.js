const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

// Helper fetchJson
async function fetchJson(url) {
  const res = await axios.get(url);
  return res.data;
}

async function superHDRemini(urlGambar) {
  const apis = [
    {
      name: "Maslent",
      type: "json",
      endpoint: `https://jerofc.my.id/api/remini?url=${encodeURIComponent(urlGambar)}`,
      path: "data.image",
    },
    {
      name: "Maslent",
      type: "json",
      endpoint: `https://restapi.rizk.my.id/remini?image_url=${encodeURIComponent(urlGambar)}&apikey=free`,
      path: "url",
      success: (res) => res?.status === "success",
    },
    {
      name: "Maslent",
      type: "json",
      endpoint: `https://apikey.sazxofficial.web.id/api/imagecreator/upscale?url=${encodeURIComponent(urlGambar)}`,
      path: "result",
    },
    {
      name: "Maslent",
      type: "json",
      endpoint: `https://flowfalcon.dpdns.org/imagecreator/remini?url=${encodeURIComponent(urlGambar)}`,
      path: "result",
    },
    {
      name: "Maslent",
      type: "json",
      endpoint: `https://www.ikyiizyy.my.id/imagecreator/remini?apikey=new&url=${encodeURIComponent(urlGambar)}`,
      path: "result",
    },
    {
      name: "Maslent",
      type: "json",
      endpoint: `https://www.ikyiizyy.my.id/imagecreator/upscale?apikey=new&url=${encodeURIComponent(urlGambar)}`,
      path: "result",
    },
    {
      name: "Maslent",
      type: "json",
      endpoint: `https://flowfalcon.dpdns.org/imagecreator/upscale?url=${encodeURIComponent(urlGambar)}`,
      path: "result",
    },
    {
      name: "Maslent",
      type: "image",
      endpoint: `https://api.yupradev.biz.id/api/tools/hd?url=${encodeURIComponent(urlGambar)}`,
    },
    {
      name: "Maslent",
      type: "image",
      endpoint: `https://fastrestapis.fasturl.cloud/aiimage/upscale?imageUrl=${encodeURIComponent(urlGambar)}&resize=4`,
    },
  ];

  for (const api of apis) {
    try {
      if (api.type === "image") {
        const res = await axios.get(api.endpoint, { responseType: "arraybuffer" });
        if (res.data) return { type: "image", data: Buffer.from(res.data) };
        continue;
      }

      const res = await fetchJson(api.endpoint);
      const success = typeof api.success === "function" ? api.success(res) : res?.status;
      if (!success) continue;

      const pathParts = api.path.split(".");
      let result = res;
      for (const part of pathParts) {
        result = result?.[part];
      }

      if (result && typeof result === "string") return { type: "url", data: result };
    } catch (e) {
      console.log(`[superHDRemini] Gagal: ${api.name} - ${e.message}`);
    }
  }

  return null;
}

module.exports = (app) => {
  app.get("/tools/remini", checkApiKeyAndLimit, async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ status: false, error: "Parameter 'url' wajib diisi" });

    try {
      const result = await superHDRemini(url);
      if (!result) return res.status(500).json({ status: false, error: "Gagal memproses gambar" });

      if (result.type === "image") {
        res.setHeader("Content-Type", "image/png");
        return res.end(result.data);
      }

      // Kalau tipe URL
      return res.json({ status: true, result: result.data });
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  });
};