// ===================================================
//                 1. IMPOR MODUL & KONFIGURASI
// ===================================================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const chalk = require("chalk");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();
require("./helpers.js");

// ===================================================
//                 2. INISIALISASI & PENGATURAN AWAL
// ===================================================
const app = express();
const PORT = process.env.PORT || 3000;
const USER_LIMIT = 100;
const DEFAULT_LIMIT_FREE = 15;
const DEFAULT_LIMIT_PREMIUM = 1000;



// 1. TAMBAHKAN DUA BARIS INI DI BAWAH const User = require("./models/User");

const User = require("./models/User");
// --- BARIS BARU: Memuat data endpoint untuk validasi ---
const endpointsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'api', 'endpoints.json'), 'utf-8'));
const allApiPaths = Object.values(endpointsData).flat();


// 2. HAPUS FUNGSI checkApiKeyAndLimit LAMA ANDA, LALU GANTI DENGAN YANG INI:


// ===================================================
//                 3. KONEKSI DATABASE & LAYANAN
// ===================================================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log(chalk.bgGreen.hex("#333").bold(" Terhubung ke MongoDB ✓ "));
}).catch(err => {
  console.error(chalk.bgRed.hex("#333").bold(" Gagal terhubung ke MongoDB: "), err);
  process.exit(1);
});

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});
console.log(chalk.bgCyan.hex("#333").bold(" Konfigurasi email dimuat."));

// ===================================================
//                         4. MIDDLEWARE
// ===================================================
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "ui")));
app.use("/api", express.static(path.join(__dirname, "api")));


const checkApiKeyAndLimit = async (req, res, next) => {
    const { apikey } = req.query;
    if (!apikey) {
        return res.status(401).json({ status: false, message: "Parameter 'apikey' diperlukan." });
    }

    try {
        const user = await User.findOne({ apiKey: apikey });
        if (!user) {
            return res.status(404).json({ status: false, message: "API Key tidak valid." });
        }

        // Cari informasi endpoint yang sedang diakses
        const requestedPath = req.path; // contoh: /api/openai/chatgpt
        const endpointInfo = allApiPaths.find(api => api.path.startsWith(requestedPath));

        // Jika endpoint ditandai sebagai premium, periksa plan pengguna
        if (endpointInfo && endpointInfo.premium) {
            if (user.plan === 'free') {
                return res.status(403).json({ 
                    status: false, 
                    message: "Maaf, fitur ini hanya untuk pengguna Basic dan Premium. Silakan upgrade di halaman profil Anda." 
                });
            }
        }

        // Jika pengguna adalah free, lanjutkan dengan pemeriksaan dan pengurangan limit
        if (user.plan === 'free') {
            if (user.limit <= 0) {
                return res.status(429).json({ status: false, message: "Batas penggunaan harian Anda telah habis." });
            }
            // Kurangi limit untuk pengguna free
            user.limit -= 1;
            await user.save();
            console.log(chalk.yellow(`LIMIT UPDATE: ${user.username} sisa limit ${user.limit}`));
        }
        
        // Izinkan akses jika pengguna premium/basic, atau jika pengguna free & limitnya masih ada
        next();

    } catch (error) {
        console.error("Error di middleware checkApiKeyAndLimit:", error);
        res.status(500).json({ status: false, message: "Terjadi kesalahan pada server." });
    }
};

// ===================================================
//                 5. DEFINISI RUTE-RUTE
// ===================================================

// --- Rute Autentikasi ---
app.post('/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ status: false, message: "Username/Email dan Password harus diisi." });
    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user) return res.status(404).json({ status: false, message: "Pengguna tidak terdaftar." });
        if (!user.isVerified) return res.status(403).json({ status: false, message: "Akun Anda belum diverifikasi." });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ status: false, message: "Password salah." });
        
        console.log(chalk.bgGreen.hex("#333").bold(` PENGGUNA LOGIN: Username: ${user.username} `));
        res.status(200).json({ status: true, message: "Login berhasil!", result: { apiKey: user.apiKey } });
    } catch (error) {
        res.status(500).json({ status: false, message: "Terjadi kesalahan pada server." });
    }
});


app.post("/auth/register", async (req, res) => {
  
  // 2. Validasi Kompleksitas Password
  // Regex: Minimal 1 huruf besar, 1 huruf kecil, 1 angka, 1 simbol, dan panjang minimal 8 karakter.
  
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ status: false, message: "Semua field harus diisi!" });
  try {
    const userCount = await User.countDocuments();
    if (userCount >= USER_LIMIT) return res.status(403).json({ status: false, message: "Pendaftaran telah ditutup." });
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(409).json({ status: false, message: "Username atau email sudah terdaftar." });
    const allowedDomains = ['@gmail.com', '@yahoo.com'];
  const emailDomain = email.substring(email.lastIndexOf('@'));
  if (!allowedDomains.includes(emailDomain)) {
      return res.status(400).json({ status: false, message: "Pendaftaran hanya diizinkan menggunakan email @gmail.com atau @yahoo.com." });
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
      return res.status(400).json({ status: false, message: "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol." });
  }
  
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword, otp, otpExpires });
    const mailOptions = {
      from: `"Maslent API Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Kode Verifikasi Akun API Anda',
      html: `<div style="font-family: 'Poppins', sans-serif; background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%); padding: 40px 20px; text-align: center;">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  </style>
  <div style="max-width: 500px; margin: auto; background: rgba(255, 255, 255, 0.6); border-radius: 24px; padding: 40px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15); animation: fadeIn 0.8s ease-out;">
    <div style="animation: pulse 2.5s infinite ease-in-out; width: 80px; height: 80px; background-color: #4f46e5; border-radius: 50%; margin: 0 auto 20px auto; display: grid; place-items: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
    </div>
    <h2 style="color: #1a202c; font-size: 28px; font-weight: 700; margin: 0 0 10px 0;">Kode Verifikasi Anda</h2>
    <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Gunakan kode di bawah ini untuk menyelesaikan proses verifikasi akun Anda.</p>
    <div style="background-color: #ffffff; padding: 15px 25px; margin: 30px auto; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
      <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #4f46e5; font-family: 'Courier New', Courier, monospace;">${otp}</span>
    </div>
    <p style="color: #6b7280; font-size: 14px;">Kode ini hanya berlaku selama <b>10 menit</b>. Demi keamanan, jangan bagikan kode ini kepada siapapun.</p>
    <div style="margin: 30px 0; height: 1px; background: linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent);"></div>
    <p style="color: #9ca3af; font-size: 12px;">Email ini dikirim otomatis oleh <b>Maslent API Service</b></p>
  </div>
</div>
`,
    };
    await transporter.sendMail(mailOptions);
    await newUser.save();
    console.log(chalk.bgGreen.hex("#333").bold(` PENGGUNA BARU DISIMPAN: ${newUser.username}`));
    res.status(201).json({ status: true, message: `Pendaftaran berhasil! Kode verifikasi telah dikirim.`, result: { userId: newUser._id } });
  } catch (error) {
    res.status(500).json({ status: false, message: "Gagal mengirim email verifikasi." });
  }
});

app.post("/auth/verify", async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ status: false, message: "User ID dan OTP diperlukan." });
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ status: false, message: "User tidak ditemukan." });
        if (user.otp !== otp || user.otpExpires < Date.now()) return res.status(400).json({ status: false, message: "Kode OTP salah atau kedaluwarsa." });
        user.isVerified = true;
        user.apiKey = uuidv4();
        user.limit = DEFAULT_LIMIT_FREE;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        console.log(chalk.bgBlue.white.bold(` PENGGUNA DIVERIFIKASI: ${user.username}`));
        res.status(200).json({ status: true, message: "Akun berhasil diverifikasi!", result: { apiKey: user.apiKey } });
    } catch (error) {
        res.status(500).json({ status: false, message: "Terjadi kesalahan pada server." });
    }
});

app.get('/auth/me', async (req, res) => {
    const apikey = req.query.apikey;
    if (!apikey) return res.status(401).json({ status: false, message: "API Key diperlukan." });
    try {
        const user = await User.findOne({ apiKey: apikey });
        if (!user) return res.status(404).json({ status: false, message: "User tidak ditemukan" });
        res.json({
            status: true,
            result: {
                username: user.username,
                email: user.email,
                apiKey: user.apiKey,
                limit: user.limit,
                plan: user.plan,
                requests: user.plan === 'free' ? (DEFAULT_LIMIT_FREE - user.limit) : 'Unlimited'
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server error" });
    }
});

// --- RUTE BARU UNTUK UPDATE API KEY ---
app.post('/auth/update-apikey', async (req, res) => {
    const { currentApiKey, newApiKey } = req.body;

    // 1. Validasi Input
    if (!currentApiKey || !newApiKey) {
        return res.status(400).json({ status: false, message: "API Key lama dan baru diperlukan." });
    }
    if (newApiKey.length < 10) {
        return res.status(400).json({ status: false, message: "API Key baru harus minimal 10 karakter." });
    }

    try {
        // 2. Cari pengguna berdasarkan API Key saat ini
        const user = await User.findOne({ apiKey: currentApiKey });
        if (!user) {
            return res.status(404).json({ status: false, message: "API Key Anda saat ini tidak valid." });
        }

        // 3. Periksa apakah pengguna berhak (bukan 'free')
        if (user.plan === 'free') {
            return res.status(403).json({ status: false, message: "Fitur ini hanya untuk pengguna Basic dan Premium." });
        }
        
        // 4. Periksa apakah API Key baru sudah digunakan
        const keyExists = await User.findOne({ apiKey: newApiKey });
        if (keyExists) {
            return res.status(409).json({ status: false, message: "API Key baru sudah digunakan oleh pengguna lain." });
        }

        // 5. Update API Key
        user.apiKey = newApiKey;
        await user.save();

        console.log(chalk.bgBlue.white.bold(` API KEY DIUBAH: ${user.username} `));
        res.status(200).json({
            status: true,
            message: "API Key berhasil diperbarui!",
            result: { apiKey: user.apiKey }
        });

    } catch (error) {
        console.error("Error saat update API Key:", error);
        res.status(500).json({ status: false, message: "Terjadi kesalahan internal pada server." });
    }
});
// --- AKHIR RUTE BARU ---


// --- RUTE BARU: UNTUK STATUS WEBSITE ---
app.get('/api/status', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const endpointsPath = path.join(__dirname, 'api', 'endpoints.json');
        const endpointsData = JSON.parse(fs.readFileSync(endpointsPath, 'utf-8'));
        const totalEndpoints = Object.values(endpointsData).flat().length;

        res.json({
            status: true,
            result: {
                totalUsers: totalUsers,
                totalEndpoints: totalEndpoints
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal memuat status." });
    }
});


// --- RUTE SPESIFIK UNTUK MENYEDIAKAN DAFTAR ENDPOINT ---
app.get('/api/endpoints.json', (req, res) => {
    const endpointsPath = path.join(__dirname, 'api', 'endpoints.json');
    res.sendFile(endpointsPath, (err) => {
        if (err) {
            res.status(404).json({ status: false, message: "File endpoints.json tidak ditemukan." });
        }
    });
});

// --- PEMUAT RUTE DINAMIS ---
let totalRoutes = 0;
const apiFolder = path.join(__dirname, "./api");
if (fs.existsSync(apiFolder)) {
    fs.readdirSync(apiFolder).forEach((subfolder) => {
        const subfolderPath = path.join(apiFolder, subfolder);
        if (fs.statSync(subfolderPath).isDirectory()) {
            fs.readdirSync(subfolderPath).forEach((file) => {
                if (path.extname(file) === ".js") {
                    try {
                        require(path.join(subfolderPath, file))(app);
                        totalRoutes++;
                        console.log(chalk.bgHex("#FFFF99").hex("#333").bold(` Memuat Route: ${path.basename(file)} `));
                    } catch (e) {
                        console.error(chalk.red(`Gagal memuat route ${file}: ${e.message}`));
                    }
                }
            });
        }
    });
    console.log(chalk.bgHex("#90EE90").hex("#333").bold(` Total Route API Dimuat: ${totalRoutes} `));
}
app.get('/favicon.ico', (req, res) => res.status(204).end());
// --- Rute Halaman Statis ---
app.get("/user/login", (req, res) => res.sendFile(path.join(__dirname, "ui", "user", "login.html")));
app.get("/user/register", (req, res) => res.sendFile(path.join(__dirname, "ui", "user", "register.html")));
app.get("/user/verify", (req, res) => res.sendFile(path.join(__dirname, "ui", "user", "verify.html")));
app.get("/user/profil", (req, res) => res.sendFile(path.join(__dirname, "ui", "user", "profil.html")));
app.get("/docs", (req, res) => res.sendFile(path.join(__dirname, "ui", "docs", "index.html")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// ===================================================
//                 6. PENJADWALAN RESET LIMIT
// ===================================================
cron.schedule('0 0 * * *', async () => {
  console.log(chalk.bgMagenta.white.bold(' RESET LIMIT HARIAN DIMULAI PADA 00:00 WITA '));
  try {
    await User.updateMany({ plan: 'free', isVerified: true }, { $set: { limit: DEFAULT_LIMIT_FREE } });
    await User.updateMany({ plan: 'premium', isVerified: true }, { $set: { limit: DEFAULT_LIMIT_PREMIUM } });
    console.log(chalk.bgGreen.hex("#333").bold(' Reset limit harian berhasil diselesaikan. '));
  } catch (error) {
    console.error(chalk.bgRed.hex("#333").bold(' Gagal melakukan reset limit harian: '), error);
  }
}, { scheduled: true, timezone: "Asia/Makassar" });

// ===================================================
//                         7. MULAI SERVER
// ===================================================
app.listen(PORT, () => {
  console.log(chalk.bgHex("#90EE90").hex("#333").bold(` Server berjalan di port ${PORT} `));
});

module.exports = app;
