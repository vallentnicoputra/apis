// api/religion/hadits.js
const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

const API_BASE_URL = "https://hadits.e-mufassir.com/api";

class HaditsAPI {
  async getHaditsByKitab(kitabId, page = 1) {
    try {
      const res = await fetch(`${API_BASE_URL}/hadits/by_id/${kitabId}?pagination=true&limit=5&page=${page}`);
      const data = await res.json();

      if (!data || !data.data || !data.data.list_hadits) {
        return { error: "Data Hadits tidak ditemukan" };
      }

      return data.data.list_hadits;
    } catch (error) {
      return { error: error.message || "Gagal mengambil hadits" };
    }
  }
}

module.exports = (app) => {
  const haditsAPI = new HaditsAPI();

  app.get("/religion/hadits", checkApiKeyAndLimit, async (req, res) => {
    const { kitabId, page } = req.query;
    if (!kitabId) return res.status(400).json({ status: false, error: "Parameter 'kitabId' wajib diisi" });

    const result = await haditsAPI.getHaditsByKitab(kitabId, page || 1);

    if (result.error) return res.json({ status: false, data: { error: result.error } });

    res.json({ status: true, data: result });
  });
};