const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  limit: {
    type: Number,
    default: 0
  },
  // FIELD BARU UNTUK MEMBEDAKAN TIPE PENGGUNA
  plan: {
    type: String,
    enum: ['free', 'premium'], // Hanya bisa diisi 'free' atau 'premium'
    default: 'free' // Pengguna baru otomatis menjadi 'free'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
