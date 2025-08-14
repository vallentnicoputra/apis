const axios = require("axios");
const { randomBytes } = require("crypto");
const { checkApiKeyAndLimit } = require("../../middleware");

class SpeechifyAPI {
  constructor() {
    this.tokenURL = "https://voiceover-demo-server--us-central1-5hlswwmzra-uc.a.run.app/token";
    this.createAudioURL = "https://api.sws.speechify.com/experimental/audio/stream";
    this.listVoicesURL = "https://cdn.speechify.com/voiceover-demo/voices.json";
    this.accessToken = null;
    this.tokenExpiry = 0;
    this.defaultVoiceId = "oliver";
    this.defaultModel = "simba-english";
    this.defaultLanguage = "en-US";
    this.defaultEmotion = "bright";
  }

  _randomSpoofIP() {
    const bytes = randomBytes(4);
    return Array.from(bytes).map(b => (b % 255) + 1).join(".");
  }

  _randomID(length = 8) {
    return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
  }

  _buildSpoofHeaders(targetSite = "speechify.com", contentType = "application/json", extra = {}) {
    const ip = this._randomSpoofIP();
    const headers = {
      accept: "*/*",
      "accept-language": "id-ID,id;q=0.9",
      origin: `https://${targetSite}`,
      referer: `https://${targetSite}/`,
      "sec-ch-ua": `"Lemur";v="135", "", "", "Microsoft Edge Simulate";v="135"`,
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": `"Android"`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": targetSite === "speechify.com" ? "same-site" : "cross-site",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
      "x-forwarded-for": ip,
      "x-real-ip": ip,
      "x-request-id": this._randomID(8),
      "content-type": contentType,
      ...extra
    };
    if (this.accessToken) {
      headers["authorization"] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  async _parseJsonResponse(response) {
    if (!response || !response.data) throw new Error("No response data to parse.");
    try {
      return JSON.parse(response.data);
    } catch (err) {
      throw new Error(`Failed to parse JSON: ${err.message}`);
    }
  }

  async _getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;

    const headers = this._buildSpoofHeaders("speechify.com", "*/*");
    const response = await axios.get(this.tokenURL, { headers, responseType: "text" });
    const data = await this._parseJsonResponse(response);

    if (data?.access_token) {
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;
      return this.accessToken;
    } else {
      throw new Error("Failed to get access token");
    }
  }

  async create({ text, voice = this.defaultVoiceId, model = this.defaultModel, language = this.defaultLanguage, emotion = this.defaultEmotion, ...rest }) {
    if (!text) throw new Error("Text is required for TTS generation");

    const token = await this._getAccessToken();
    const input = `<speak><speechify:emotion emotion="${emotion}">${text}</speechify:emotion></speak>`;

    const payload = { input, voice_id: voice, model, language, ...rest };
    const headers = this._buildSpoofHeaders("speechify.com", "text/plain;charset=UTF-8", { accept: "audio/mpeg" });

    const response = await axios.post(this.createAudioURL, payload, { headers, responseType: "text" });
    return await this._parseJsonResponse(response);
  }

  async list() {
    const headers = this._buildSpoofHeaders("speechify.com", "*/*");
    const response = await axios.get(this.listVoicesURL, { headers, responseType: "text" });
    return await this._parseJsonResponse(response);
  }
}

// Endpoint Express
module.exports = (app) => {
  const mic = new SpeechifyAPI();

  app.get("/tts/speechify", checkApiKeyAndLimit, async (req, res) => {
    const { action, ...params } = req.query;

    if (!action) return res.status(400).json({ error: "Parameter 'action' wajib diisi: list | create" });

    try {
      let result;
      switch (action) {
        case "list":
          result = await mic.list();
          break;
        case "create":
          if (!params.text) return res.status(400).json({ error: "Missing required field: text (required for create)" });
          result = await mic.create(params);
          break;
        default:
          return res.status(400).json({ error: `Invalid action: ${action}. Allowed: list | create` });
      }
      res.status(200).json({ status: true, data: result });
    } catch (error) {
      res.status(500).json({ status: false, error: `Processing error: ${error.message}` });
    }
  });
};