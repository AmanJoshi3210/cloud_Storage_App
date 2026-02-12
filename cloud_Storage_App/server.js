/*
  MERN STACK BACKEND
  ------------------
  To run this server locally:
  1. npm install express mongoose dotenv cors bcryptjs jsonwebtoken cloudinary
  2. Create a .env file with:
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/cloudgem
     JWT_SECRET=your_super_secret_key
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
  3. node server.js
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIG ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- MODELS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  width: Number,
  height: Number,
  description: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const File = mongoose.model('File', fileSchema);

// --- MIDDLEWARE ---
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// --- ROUTES ---

// 1. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user: { id: user._id, name, email }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid login credentials');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid login credentials');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ user: { id: user._id, name: user.name, email }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Get User Files
app.get('/api/files', auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Save File Metadata
app.post('/api/files', auth, async (req, res) => {
  try {
    const file = new File({ ...req.body, userId: req.user.id });
    await file.save();
    res.status(201).json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Delete File
app.delete('/api/files/:id', auth, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!file) return res.status(404).json({ error: 'File not found' });
    
    // Optional: Delete from Cloudinary here using cloudinary.uploader.destroy()
    
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Generate Cloudinary Signature (For secure uploads)
app.get('/api/cloudinary/sign', auth, (req, res) => {
  const timestamp = Math.round((new Date).getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp: timestamp, upload_preset: req.query.upload_preset },
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.json({ signature, timestamp, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
