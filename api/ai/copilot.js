const axios = require("axios");
const WebSocket = require("ws");
const { checkApiKeyAndLimit } = require('../../middleware'); 

module.exports = (app) => {
class ChatCopilot {
  constructor() {
    this.url = "wss://copilot.microsoft.com/c/api/chat?api-version=2&features=-%2Cncedge%2Cedgepagecontext&setflight=-%2Cncedge%2Cedgepagecontext&ncedge=1";
  }
  async chat({
    prompt
  }) {
    const url = this.url;
    const ws = new WebSocket(url);
    let result = "";
    const chars = "eEQqRXUu123456CcbBZzhj";
    const conversationId = Array.from({
      length: 21
    }).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
    const payload = {
      event: "send",
      conversationId: conversationId,
      content: [{
        type: "text",
        text: prompt
      }],
      mode: "chat",
      context: {
        edge: "NoConsent"
      }
    };
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("Timeout: Response took too long"));
      }, 15e3);
      ws.on("open", () => ws.send(JSON.stringify(payload)));
      ws.on("message", data => {
        try {
          const response = JSON.parse(data.toString());
          if (response.text) result += response.text;
          if (response.event === "done") {
            clearTimeout(timeout);
            ws.close();
            resolve(result);
          }
        } catch (error) {
          clearTimeout(timeout);
          ws.close();
          reject(error);
        }
      });
      ws.on("error", error => {
        clearTimeout(timeout);
        ws.close();
        reject(error);
      });
    });
  }
}

  app.get("/ai/copilot", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter Prompt Di Perlukan..!" });
      }
      const bot = new ChatCopilot();
      const data = await bot.chat({ prompt: text });
      res.status(200).json({
        status: true,
        creator: '@Maslent',
        model: 'Copilot - Ultra',
        result: data, // Perbaikan typo dari 'resul t'
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
