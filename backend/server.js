/*
  MERN STACK BACKEND — FIXED VERSION
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load ENV
dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.MONGO_URI) dotenv.config();

const User = require('./models/User');
const File = require('./models/File');
const auth = require('./middleware/auth');

const app = express();

// --- SECURITY MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Try again later."
}));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// --- CLOUDINARY CONFIG ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= AUTH ROUTES =================

// Register
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user: { id: user._id, name, email },
      token
    });

  } catch (err) {
    next(err);
  }
});

// Login
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "All fields required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: { id: user._id, name: user.name, email },
      token
    });

  } catch (err) {
    next(err);
  }
});

// ================= FILE ROUTES =================

// Get files
app.get('/api/files', auth, async (req, res, next) => {
  try {
    const files = await File
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (err) {
    next(err);
  }
});

// Save metadata
app.post('/api/files', auth, async (req, res, next) => {
  try {
    const file = await File.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json(file);
  } catch (err) {
    next(err);
  }
});

// Delete file + Cloudinary asset
app.delete('/api/files/:id', auth, async (req, res, next) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file)
      return res.status(404).json({ error: "File not found" });

    if (file.publicId) {
      await cloudinary.uploader.destroy(file.publicId);
    }

    res.json(file);

  } catch (err) {
    next(err);
  }
});

// ================= CLOUDINARY SIGNATURE =================

app.get('/api/cloudinary/sign', auth, (req, res) => {
  const allowedPreset = "mern_upload";

  if (req.query.upload_preset !== allowedPreset)
    return res.status(403).json({ error: "Invalid preset" });

  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, upload_preset: allowedPreset },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  });
});

// ================= GLOBAL ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ error: err.message || "Server error" });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
