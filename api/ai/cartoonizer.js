const axios = require("axios");
const { checkApiKeyAndLimit } = require('../../middleware'); 

module.exports = (app) => {
class AirbrushService {
  constructor() {
    this.headers = {};
    this.instance = axios.create({
      baseURL: "https://airbrush.com",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "id-ID,id;q=0.9",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
      }
    });
    this.instance.interceptors.response.use(response => {
      const setCookie = response.headers["set-cookie"];
      if (setCookie) {
        this.headers["set-cookie"] = setCookie;
        this.instance.defaults.headers.common["cookie"] = this.headers["set-cookie"].join("; ");
      }
      return response;
    }, error => {
      if (error.response && error.response.data && error.response.data.includes && error.response.data.includes("<Code>MissingRequiredHeader</Code>")) {
        console.error("Error: Missing required header (x-ms-blob-type).  Retrying with image/jpeg.");
        return Promise.reject(error);
      }
      return Promise.reject(error);
    });
  }
  generateAnonymousUid() {
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `ab-${randomString.substring(0, 32)}`;
  }
  generateSentryTrace() {
    const hex = n => n.toString(16).padStart(2, "0");
    const randomBytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    const traceIdBytes = randomBytes.slice(0, 16);
    const spanIdBytes = randomBytes.slice(0, 8);
    const traceId = Array.from(traceIdBytes).map(hex).join("");
    const spanId = Array.from(spanIdBytes).map(hex).join("");
    return `${traceId}-${spanId}-0`;
  }
  async getCsrfToken() {
    const response = await this.instance.post("/core-api/v1/csrf/token", {}, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "id-ID,id;q=0.9",
        "content-type": "application/json",
        "x-requested-with": "XMLHttpRequest"
      }
    });
    return response.data;
  }
  async requestUploadUrl(mimeType = "image/jpeg") {
    const csrfToken = await this.getCsrfToken();
    const sentryTrace = this.generateSentryTrace();
    const response = await this.instance.get(`/core-api/v1/upload/sas?mimetype=${encodeURIComponent(mimeType)}`, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "id-ID,id;q=0.9",
        referer: "https://airbrush.com/photo-to-cartoon",
        "user-agent": this.instance.defaults.headers.common["user-agent"],
        "x-anonymous-uid": this.generateAnonymousUid(),
        "x-csrf-token": csrfToken,
        "x-tenant": "ab",
        baggage: `sentry-environment=production,sentry-release=lye2GcirR3MXm3BMjNqPw,sentry-public_key=abcd491e990f6b7131e31a895634fd74,sentry-trace_id=${sentryTrace},sentry-sample_rate=0.1,sentry-transaction=%2Fphoto-to-cartoon,sentry-sampled=false`,
        "sentry-trace": sentryTrace,
        cookie: this.instance.defaults.headers.common["cookie"]
      }
    });
    return response.data;
  }
  async uploadImage(uploadUrl, imageFile, mimeType) {
    await axios.put(uploadUrl, imageFile, {
      headers: {
        "Content-Type": mimeType,
        "x-ms-blob-type": "BlockBlob"
      }
    });
  }
  async getImageFileFromUrl(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const contentType = response.headers["content-type"] || "image/jpeg";
    return {
      data: response.data,
      type: contentType
    };
  }
  async createCartoon({ imageUrl }) {
    const imageFile = await this.getImageFileFromUrl(imageUrl);
    const uploadResponse = await this.requestUploadUrl(imageFile.type);
    const { uploadUrl, accessUrl } = uploadResponse;
    await this.uploadImage(uploadUrl, imageFile.data, imageFile.type);
    const csrfToken = await this.getCsrfToken();
    const anonymousUid = this.generateAnonymousUid();
    const sentryTrace = this.generateSentryTrace();

    const response = await this.instance.post("/core-api/v1/cartoon/create", {
      styleName: "cartoon",
      source: accessUrl
    }, {
      headers: {
        ...this.instance.defaults.headers.common,
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        origin: "https://airbrush.com",
        referer: "https://airbrush.com/photo-to-cartoon/result",
        "x-anonymous-uid": anonymousUid,
        "x-csrf-token": csrfToken,
        "x-tenant": "ab",
        baggage: `sentry-environment=production,sentry-release=lye2GcirR3MXm3BMjNqPw,sentry-public_key=abcd491e990f6b7131e31a895634fd74,sentry-trace_id=${sentryTrace},sentry-sample_rate=0.1,sentry-transaction=%2Fphoto-to-cartoon%2Fresult,sentry-sampled=false`,
        priority: "u=1, i",
        "sentry-trace": sentryTrace,
        cookie: this.instance.defaults.headers.common["cookie"]
      }
    });

    if (response.data && response.data.taskId) {
      return await this.pollTask(response.data.taskId);
    }

    return response.data;
  }
  async queryTask(taskId) {
    const csrfToken = await this.getCsrfToken();
    const response = await this.instance.get(`/core-api/v1/cartoon/query/${taskId}`, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "id-ID,id;q=0.9",
        referer: "https://airbrush.com/photo-to-cartoon/result",
        "user-agent": this.instance.defaults.headers.common["user-agent"],
        "x-anonymous-uid": this.generateAnonymousUid(),
        "x-csrf-token": csrfToken,
        "x-tenant": "ab",
        baggage: `sentry-environment=production,sentry-release=lye2GcirR3MXm3BMjNqPw,sentry-public_key=abcd491e990f6b7131e31a895634fd74,sentry-trace_id=${this.generateSentryTrace()},sentry-sample_rate=0.1,sentry-transaction=%2Fphoto-to-cartoon%2Fresult,sentry-sampled=false`,
        "sentry-trace": this.generateSentryTrace(),
        cookie: this.instance.defaults.headers.common["cookie"]
      }
    });
    return response.data;
  }
  async pollTask(taskId) {
    while (true) {
      const taskInfo = await this.queryTask(taskId);
      console.log("Status Task:", taskInfo.status);
      if (taskInfo.status === "success") {
        return taskInfo;
      } else if (taskInfo.status === "failed") {
        throw new Error(`Pembuatan kartun gagal. Task ID: ${taskId}`);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

  app.get("/ai/cartoonizer", checkApiKeyAndLimit, async (req, res) => {
    try {
      const { url: imageUrl } = req.query;

      if (!imageUrl) {
        return res.status(400).json({
          status: false,
          error: "Parameter 'url' wajib diisi!"
        });
      }

      const service = new AirbrushService();
      const result = await service.createCartoon({ imageUrl });
      res.status(200).json({
        status: true,
        creator: '@Maslent',
        model: 'Cartoonizer',
        result: result, // Perbaikan typo dari 'resul t'
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
