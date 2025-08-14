const axios = require("axios");
const { checkApiKeyAndLimit } = require("../../middleware");

class TTSTokohGenerator {
  constructor() {
    this._tokoh = {
      jokowi: { speed: -30, model: "id-ID-ArdiNeural-Male", tune: -3 },
      megawati: { speed: -20, model: "id-ID-GadisNeural-Female", tune: -3 },
      prabowo: { speed: -30, model: "id-ID-ArdiNeural-Male", tune: -3 }
    };
    this.baseUrl = "https://deddy-tts-rvc-tokoh-indonesia.hf.space";
  }

  async synthesize(text, tokoh = "jokowi") {
    if (!text) throw new Error("Text is required");
    if (!Object.keys(this._tokoh).includes(tokoh)) 
      throw new Error(`Available tokoh: ${Object.keys(this._tokoh).join(", ")}`);

    const session_hash = Math.random().toString(36).substring(2);

    // Join queue
    await axios.post(`${this.baseUrl}/queue/join?`, {
      data: [
        tokoh,
        this._tokoh[tokoh].speed,
        text,
        this._tokoh[tokoh].model,
        this._tokoh[tokoh].tune,
        "rmvpe",
        0.5,
        0.33
      ],
      event_data: null,
      fn_index: 0,
      trigger_id: 20,
      session_hash
    });

    // Get result
    const { data } = await axios.get(`${this.baseUrl}/queue/data?session_hash=${session_hash}`);
    let result;

    if (typeof data === "string") {
      const lines = data.split("\n\n");
      for (const line of lines) {
        if (line.startsWith("data:")) {
          const d = JSON.parse(line.substring(6));
          if (d.msg === "process_completed") result = d.output?.data?.[2]?.url;
        }
      }
    } else if (data?.data) {
      // fallback jika data JSON
      result = data.output?.data?.[2]?.url;
    }

    if (!result) throw new Error("TTS generation failed");
    return result;
  }

  async generate({ text, tokoh = "jokowi" }) {
    if (!text) throw new Error("Text is required for TTS generation.");
    const audioUrl = await this.synthesize(text, tokoh);
    return { result: audioUrl };
  }
}

module.exports = (app) => {
  const ttsGenerator = new TTSTokohGenerator();

  app.get("/tts/ttsindonesia", checkApiKeyAndLimit, async (req, res) => {
    const { text, tokoh } = req.query;
    if (!text) return res.status(400).json({ status: false, error: "Parameter 'text' wajib diisi" });

    try {
      const result = await ttsGenerator.generate({ text, tokoh });
      res.json({ status: true, data: result });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};