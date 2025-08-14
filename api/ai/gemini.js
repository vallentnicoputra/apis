const { checkApiKeyAndLimit } = require('../../middleware'); 
module.exports = (app) => {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAlbK2NP8qM8vLzfJmtGSFE_z4dLADvYso");
  async function Llama(prom) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prom);
    const response = await result.response;
    const texts = response.text();
    return texts;
  }//
  app.get("/ai/gemini", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({ status: false, error: "Parameter Prompt Di Perlukan..!" });
      }
      const result = await Llama(text);
      res.status(200).json({
        status: true,
        creator: '@Maslent',
        model: 'gemini',
        result: result,
      });
    } catch (error) {
      console.error("Error di /ai/gemini:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
