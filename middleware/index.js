const User = require('../models/User');
const chalk = require('chalk');

const DEFAULT_LIMIT_FREE = 15;

const checkApiKeyAndLimit = async (req, res, next) => {
    const { apikey } = req.query;
    if (!apikey) return res.status(401).json({ status: false, message: "Parameter 'apikey' diperlukan." });
    try {
        const user = await User.findOne({ apiKey: apikey });
        if (!user) return res.status(404).json({ status: false, message: "API Key tidak valid." });
        if (user.plan === 'premium') return next();
        if (user.limit <= 0) return res.status(429).json({ status: false, message: "Batas penggunaan API Anda telah habis." });
        user.limit -= 1;
        await user.save();
        console.log(chalk.yellow(`LIMIT UPDATE: ${user.username} sisa limit ${user.limit}`));
        next();
    } catch (error) {
        res.status(500).json({ status: false, message: "Terjadi kesalahan pada server." });
    }
};

module.exports = { checkApiKeyAndLimit };
