const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { checkApiKeyAndLimit } = require('../../middleware');

const STYLES = [
  {
    name: "hijab",
    prompt: "Modifikasi karakter untuk mengenakan jilbab putih tradisional, seperti yang umum dikenakan oleh perempuan Muslim Indonesia. **Pilihan:** --hijab-draping: gaya busana modern yang sederhana, --folds: elegan, --fabric-flow: alami, --coverage: menutupi seluruh rambut, leher, dan telinga, --hair-visibility: tidak ada rambut yang terlihat sama sekali, --appearance: alami, terbalut rapi, sederhana, --color: lembut, warna putih alami (hindari putih mencolok dan artifisial), --hairstyle-original: tidak ada bagian dari gaya rambut asli yang terlihat. **Pertahankan:** wajah, ekspresi, pose, pakaian, dan latar belakang asli tetap utuh, memastikan modifikasi terintegrasi dengan sempurna dengan pencahayaan dan realisme gambar asli. --sole-modification: menambahkan jilbab yang menutupi seluruh bagian."
  },
  {
    name: "anime",
    prompt: "Ubah karakter menjadi gaya anime Jepang yang penuh warna. **Pilihan:** --eyes: besar dan ekspresif, --skin: mulus dan sedikit bercahaya, --shading: cel-shading khas anime, --background: tetap dikenali namun distilisasi ringan. **Pertahankan:** struktur wajah, warna kulit, ekspresi asli. --sole-modification: konversi gaya visual ke anime tanpa mengubah identitas asli secara berlebihan."
  },
  {
    name: "pixar",
    prompt: "Transformasi karakter menjadi tokoh animasi 3D ala Pixar. **Pilihan:** --face-shape: kontur wajah membulat, --eyes: besar dan bersahabat, --skin: lembut dan sedikit mengilap, --lighting: pencahayaan sinematik hangat, --style: tetap natural dalam batasan Pixar. **Pertahankan:** ekspresi, pose, dan gaya pakaian asli. --sole-modification: adaptasi ke karakter Pixar tanpa kartunisasi berlebihan."
  },
  {
    name: "cyberpunk",
    prompt: "Ganti karakter ke tema futuristik cyberpunk. **Pilihan:** --tattoo: neon menyala di wajah/leher, --implants: teknologi kecil di wajah, --texture: reflektif logam, --background: kota malam dengan billboard digital dan pantulan hujan, --colors: biru listrik, magenta, hitam pekat. **Pertahankan:** identitas wajah. --sole-modification: perubahan bertema masa depan gelap namun vivid."
  },
  {
    name: "lukisan_renaissance",
    prompt: "Ubah gambar menjadi lukisan cat minyak era Renaissance. **Pilihan:** --texture: sapuan kuas klasik, --tones: warna alami yang lembut, --lighting: teknik Baroque, --attire: kostum bangsawan Eropa lama, --canvas: efek tekstur realistis. **Pertahankan:** pose dan ekspresi wajah asli. --sole-modification: adaptasi visual ke lukisan tradisional klasik."
  },
  {
    name: "barbie_doll",
    prompt: "Konversi karakter menjadi boneka plastik ala Barbie. **Pilihan:** --skin: halus dan mengilap, --eyes: besar dengan bulu mata panjang, --lips: berkilau, --outfit: modis dan berwarna cerah, --background: warna pastel dan efek glitter. **Pertahankan:** proporsi wajah dan identitas asli. --sole-modification: transformasi ke tampilan boneka elegan tanpa hiperbola berlebihan."
  },
  {
    name: "kartun_barat",
    prompt: "Transformasi menjadi karakter kartun barat bergaya Disney atau Looney Tunes. **Pilihan:** --outline: garis tebal, --shading: lembut dan warna terang, --background: datar dan ekspresif seperti latar kartun klasik. **Pertahankan:** fitur wajah yang dikenali dan ekspresi asli. --sole-modification: pengubahan ke ilustrasi tangan klasik gaya Barat."
  },
  {
    name: "sketsa_pensil",
    prompt: "Ubah gambar menjadi sketsa pensil monokrom. **Pilihan:** --shading: arsiran realistis, --strokes: terlihat goresan pensil, --background: minimal dan kabur, --style: teknik sketsa tradisional tanpa digitalisasi. **Pertahankan:** wajah, pose, dan detail pakaian utama. --sole-modification: tampilan grafit klasik hitam-putih."
  },
  {
    name: "piksel_8bit",
    prompt: "Transformasi ke seni piksel 8-bit retro. **Pilihan:** --resolution: batas ukuran piksel kecil, --style: blok warna sederhana, --background: terbatas dalam warna dan bentuk, --anti-aliasing: tidak digunakan. **Pertahankan:** siluet wajah dan struktur dasar. --sole-modification: gaya grafis NES/Game Boy klasik."
  },
  {
    name: "elf_fantasi",
    prompt: "Ubah karakter menjadi elf fantasi tingkat tinggi. **Pilihan:** --ears: panjang dan runcing, --eyes: bersinar mistis, --attire: jubah dengan elemen kristal dan daun, --background: hutan magis atau reruntuhan kuno, --lighting: atmosfer lembut penuh sihir. **Pertahankan:** identitas wajah dan warna kulit. --sole-modification: modifikasi karakter menjadi makhluk magis realistis."
  }
];

module.exports = (app) => {
  app.get("/ai/mefusion", checkApiKeyAndLimit, async (req, res) => {
    try {
      const imageUrl = (req.query.url || "").trim();
      const requestedStyle = (req.query.style || "hijab").trim().toLowerCase();

      if (!imageUrl) {
        return res.status(400).json({ status: false, error: "Parameter 'url' wajib diisi!" });
      }

      const styleObj = STYLES.find(s => s.name.toLowerCase() === requestedStyle);

      if (!styleObj) {
        return res.status(400).json({
          status: false,
          error: `Style '${requestedStyle}' tidak ditemukan. Pilihan tersedia: ${STYLES.map(s => s.name).join(", ")}`
        });
      }

      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers["content-type"];

      const API_KEYS = [
        "AIzaSyDnBPd_EhBfr73NssnThVQZYiKZVhGZewU",
        "AIzaSyA94OZD-0V4quRbzPb2j75AuzSblPHE75M",
        "AIzaSyB5aTYbUg2VQ0oXr5hdJPN8AyLJcmM84-A",
        "AIzaSyB1xYZ2YImnBdi2Bh-If_8lj6rvSkabqlA",
        "AIzaSyB9DzI2olokERvU_oH0ASSO2OKRahleC7U",
        "AIzaSyDsyj9oOFJK_-bWQFLIR4yY4gpLvq43jd4",
        "AIzaSyDpqC3y2ZZNlU9O93do36_uijl1HIJ-XKw",
        "AIzaSyCwO0UWohpAKGu32A0YYJaxpbj5lVInjss"
      ];
      const randomApiKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];

      const genAI = new GoogleGenerativeAI(randomApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      });

      const result = await model.generateContent([
        { inlineData: { mimeType: contentType, data: imageBuffer.toString("base64") } },
        { text: styleObj.prompt }
      ]);

      const imagePart = result.response.candidates[0].content.parts.find(part => part.inlineData);
      if (!imagePart) throw new Error("Gagal menghasilkan gambar.");

      const outputImageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
      res.setHeader("Content-Type", "image/png");
      res.end(outputImageBuffer);

    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};