const { checkApiKeyAndLimit } = require('../../middleware');
const axios = require("axios");
const FormData = require("form-data");

module.exports = (app) => {
  class IllariaUpscaler {
    constructor() {
      this.api_url = 'https://thestinger-ilaria-upscaler.hf.space/gradio_api';
      this.file_url = 'https://thestinger-ilaria-upscaler.hf.space/gradio_api/file=';
    }

    generateSession() {
      return Math.random().toString(36).substring(2);
    }

    async upload(buffer) {
      const upload_id = this.generateSession();
      const orig_name = `rynn_${Date.now()}.jpg`;
      const form = new FormData();
      form.append('files', buffer, orig_name);

      const { data } = await axios.post(
        `${this.api_url}/upload?upload_id=${upload_id}`,
        form,
        { headers: form.getHeaders() }
      );

      return {
        orig_name,
        path: data[0],
        url: `${this.file_url}${data[0]}`
      };
    }

    async process(buffer, options = {}) {
      const {
        model = 'RealESRGAN_x4plus',
        denoise_strength = 0.5,
        resolution = 4,
        face_enhancement = false
      } = options;

      const validModels = [
        'RealESRGAN_x4plus',
        'RealESRNet_x4plus',
        'RealESRGAN_x4plus_anime_6B',
        'RealESRGAN_x2plus',
        'realesr-general-x4v3'
      ];

      if (!Buffer.isBuffer(buffer)) throw new Error('Image buffer is required');
      if (!validModels.includes(model)) throw new Error(`Available models: ${validModels.join(', ')}`);

      const image_url = await this.upload(buffer);
      const session_hash = this.generateSession();

      await axios.post(`${this.api_url}/queue/join?`, {
        data: [
          {
            path: image_url.path,
            url: image_url.url,
            orig_name: image_url.orig_name,
            size: buffer.length,
            mime_type: 'image/jpeg',
            meta: { _type: 'gradio.FileData' }
          },
          model,
          denoise_strength,
          face_enhancement,
          resolution
        ],
        event_data: null,
        fn_index: 1,
        trigger_id: 20,
        session_hash
      });

      let resultPath;
      for (let i = 0; i < 20; i++) {
        const { data } = await axios.get(`${this.api_url}/queue/data?session_hash=${session_hash}`);
        const lines = data.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const parsed = JSON.parse(line.substring(6));
            if (parsed.msg === 'process_completed') {
              resultPath = parsed.output.data[0].path;
              break;
            }
          }
        }
        if (resultPath) break;
        await new Promise(res => setTimeout(res, 1500));
      }

      if (!resultPath) throw new Error('Processing failed or timed out.');
      return resultPath;
    }
  }

  app.get("/ai/reminisuperhd", checkApiKeyAndLimit, async (req, res) => {
    try {
      const url = (req.query.url || "").trim();
      if (!url) {
        return res.status(400).json({ status: false, error: "Parameter 'url' wajib diisi!" });
      }

      // Ambil gambar awal
      const imgResp = await axios.get(url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(imgResp.data);

      const upscaler = new IllariaUpscaler();
      const resultPath = await upscaler.process(buffer);

      // Ambil hasilnya dari server Gradio
      const finalImage = await axios.get(
        `${upscaler.file_url}${resultPath}`,
        { responseType: "arraybuffer" }
      );

      res.set("Content-Type", "image/png");
      return res.send(finalImage.data);

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err.message
      });
    }
  });
};