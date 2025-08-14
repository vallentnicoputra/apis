const fetch = require("node-fetch");
const { checkApiKeyAndLimit } = require("../../middleware");

const OPENWEATHERMAP_API_KEY = "060a6bcfa19809c2cd4d97a212b19273";
const GEOCODING_URL = "http://api.openweathermap.org/geo/1.0/direct";
const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

function latLonToTile(lat, lon, zoom) {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

async function getWeatherData(lat, lon) {
  const params = new URLSearchParams({
    lat: lat,
    lon: lon,
    appid: OPENWEATHERMAP_API_KEY,
    units: "metric",
    lang: "id",
  });
  const res = await fetch(`${CURRENT_WEATHER_URL}?${params}`);
  if (!res.ok) throw new Error("Gagal mendapatkan data cuaca");
  return res.json();
}

async function getForecastData(lat, lon) {
  const params = new URLSearchParams({
    lat: lat,
    lon: lon,
    appid: OPENWEATHERMAP_API_KEY,
    units: "metric",
    lang: "id",
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error("Gagal mendapatkan data perkiraan cuaca");
  return res.json();
}

async function weather(text) {
  const geocodingParams = new URLSearchParams({
    q: text,
    limit: 1,
    appid: OPENWEATHERMAP_API_KEY,
  });
  const geocodingRes = await fetch(`${GEOCODING_URL}?${geocodingParams}`);
  if (!geocodingRes.ok) throw new Error("Gagal mendapatkan data geocoding");
  const [location] = await geocodingRes.json();
  if (!location) throw new Error("Lokasi tidak ditemukan");

  const { lat, lon, name, country } = location;

  const weatherData = await getWeatherData(lat, lon);
  const forecastData = await getForecastData(lat, lon);

  const { main, wind, weather: weatherArr, dt, sys } = weatherData;
  const weatherCondition = weatherArr[0];

  const iconUrl = `http://openweathermap.org/img/wn/${weatherCondition?.icon ?? "01d"}.png`;
  const tileUrl = latLonToTile(lat, lon, 12);
  const localtime = new Date(dt * 1000).toLocaleString("id-ID");
  const sunriseTime = new Date(sys.sunrise * 1000).toLocaleTimeString("id-ID");
  const sunsetTime = new Date(sys.sunset * 1000).toLocaleTimeString("id-ID");

  const forecastList = forecastData.list
    .slice(0, 5)
    .map((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString("id-ID");
      return `${date}: ${item.main.temp}°C, ${
        item.weather[0]?.description ?? "Tidak tersedia"
      }`;
    })
    .join("\n");

  const caption = `
🌦️ Cuaca saat ini: ${weatherCondition?.description ?? "Tidak tersedia"} 🌦️
📌 Nama: ${name ?? "Tidak tersedia"}
🌍 Negara: ${country ?? "Tidak tersedia"}
🌐 Lintang: ${lat ?? "Tidak tersedia"}
🌐 Bujur: ${lon ?? "Tidak tersedia"}
🕰️ Waktu Lokal: ${localtime}
🌡️ Suhu: ${main?.temp ?? "Tidak tersedia"} °C
🌡️ Terasa Seperti: ${main?.feels_like ?? "Tidak tersedia"} °C
💧 Kelembaban: ${main?.humidity ?? "Tidak tersedia"}%
🌬️ Kecepatan Angin: ${wind?.speed ?? "Tidak tersedia"} m/s
🧭 Arah Angin: ${wind?.deg ?? "Tidak tersedia"}°
🌡️ Tekanan: ${main?.pressure ?? "Tidak tersedia"} hPa
🌅 Waktu Matahari Terbit: ${sunriseTime ?? "Tidak tersedia"}
🌇 Waktu Matahari Terbenam: ${sunsetTime ?? "Tidak tersedia"}
📅 Perkiraan Cuaca (5 hari):
${forecastList}
`.trim();

  return { caption, iconUrl, tileUrl };
}

module.exports = (app) => {
  app.get("/tools/infocuaca", checkApiKeyAndLimit, async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'q' (nama lokasi) wajib diisi",
      });
    }
    try {
      const result = await weather(q);
      res.json({
        status: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message || "Gagal mengambil data cuaca",
      });
    }
  });
};