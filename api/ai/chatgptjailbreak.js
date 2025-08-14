const axios = require("axios");
const crypto = require("crypto");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const { checkApiKeyAndLimit } = require('../../middleware'); 

module.exports = (app) => {
//Scraper
class VeniceAPI {
  userAgents = [
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-S906N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1"
  ];

  constructor() {
    this.baseUrl = "https://venice.ai";
    this.api = axios.create({
      baseURL: "https://outerface.venice.ai/api/inference/"
    });
  }

  randomCryptoIP() {
    const bytes = crypto.randomBytes(4);
    return Array.from(bytes).map(b => b % 256).join(".");
  }

  randomID(length = 16) {
    return crypto.randomBytes(length).toString("hex");
  }

  _generateAnonymousUserId() {
    return `user_anon_${Math.floor(Math.random() * 1e9)}${Math.floor(Math.random() * 1e9)}`;
  }

  _generateId() {
    return Math.random().toString(36).substring(2, 9);
  }

  buildHeaders(extra = {}) {
    const ip = this.randomCryptoIP();
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    return {
      accept: "*/*",
      "accept-language": "id-ID,id;q=0.9",
      origin: this.baseUrl,
      referer: `${this.baseUrl}/`,
      "user-agent": randomUserAgent,
      "sec-ch-ua": '"Lemur";v="135", "", "", "Microsoft Edge Simulate";v="135"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-forwarded-for": ip,
      "x-real-ip": ip,
      "x-request-id": this.randomID(8),
      ...extra
    };
  }

  async chat(rest = {}) {
    try {
      const defaultPayload = {
        conversationType: "text",
        type: "text",
        modelId: "mistral-31-24b",
        modelName: "Venice Uncensored",
        modelType: "text",
        prompt: [{
          content: "apa itu wibu",
          role: "user"
        }],
        systemPrompt: "",
        includeVeniceSystemPrompt: true,
        isCharacter: false,
        simpleMode: true,
        characterId: "",
        id: "",
        textToSpeech: {
          voiceId: "af_sky",
          speed: 1
        },
        webEnabled: true,
        reasoning: true,
        clientProcessingTime: 541
      };

      const { messages, prompt, ...otherRest } = rest;
      let finalPrompt = defaultPayload.prompt;

      if (messages?.length) {
        finalPrompt = messages;
      } else if (typeof prompt === "string" && prompt.trim() !== "") {
        finalPrompt = [{
          content: prompt,
          role: "user"
        }];
      }

      const payload = {
        ...defaultPayload,
        ...otherRest,
        prompt: finalPrompt,
        requestId: this._generateId(),
        messageId: this._generateId(),
        userId: this._generateAnonymousUserId()
      };

      const headers = this.buildHeaders({
        "content-type": "application/json",
        priority: "u=1, i",
        "x-venice-version": "interface@20250611.010712+52c00c6"
      });

      const { data } = await this.api.post("/chat", payload, { headers });
      return this.parseChatStream(data);
    } catch (error) {
      console.error("Error in chat request:", error.response ? error.response.data : error.message);
      throw error;
    }
  }

  parseChatStream(rawResponse) {
    if (!rawResponse || typeof rawResponse !== "string") {
      return {
        result: "",
        array_stream: [],
        kinds: {}
      };
    }

    const array_stream = rawResponse
      .split("\n")
      .filter(line => line.startsWith("{"))
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const kinds = array_stream.reduce((acc, obj) => {
      const key = obj.kind || "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(obj);
      return acc;
    }, {});

    const result = (kinds.content || []).map(obj => obj.content).join("");
    return { result, array_stream, kinds };
  }
}

  app.get("/ai/chatgptjailbreak", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter Prompt Di Perlukan..!" });
      }
      
      const venice = new VeniceAPI();
      const result = await venice.chat({ prompt: text });
      res.status(200).json({
        status: true,
        creator: '@Maslent',
        result: result.result,
        stream: result.array_stream
      });
    } catch (error) {
      console.error("Error di /ai/chatgpt:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
