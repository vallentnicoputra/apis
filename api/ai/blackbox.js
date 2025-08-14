const axios = require("axios");
const { checkApiKeyAndLimit } = require('../../middleware'); 
//
module.exports = (app) => {
class ChatBot {
  constructor(baseUrl = "https://ai-chat-bot.pro/api") {
    this.baseUrl = baseUrl;
    this.chatHistory = [];
  }
  async chat({
    prompt,
    history = this.chatHistory
  }) {
    this.chatHistory.push({
      content: prompt,
      is_user: true
    });
    try {
      const response = await axios.post(`${this.baseUrl}/deep-seek-chat?streaming=1`, new URLSearchParams({
        message: prompt,
        last_chat_json: JSON.stringify(this.chatHistory)
      }).toString(), {
        headers: {
          accept: "*/*",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "no-cache",
          connection: "keep-alive",
          "content-type": "application/x-www-form-urlencoded",
          origin: "chrome-extension://jmpcodajbcpgkebjipbmjdoboehfiddd",
          pragma: "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
          "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge Simulate";v="131", "Lemur";v="131"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"'
        }
      });
      const botResponse = response.data;
      this.chatHistory.push({
        content: botResponse,
        is_user: false
      });
      return botResponse;
    } catch (error) {
      console.error("Terjadi kesalahan saat melakukan permintaan chat:", error);
      throw error;
    }
  }
}
  app.get("/ai/blackbox", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter Prompt Di Perlukan..!" });
      }
      const bot = new ChatBot();
      const result = await bot.chat({ prompt: text });
      res.status(200).json({
        status: true,
        creator: '@Maslent',
        model: 'BackBox',
        result: result, // Perbaikan typo dari 'resul t'
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
