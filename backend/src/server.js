import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev_access_secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

const users = [];
const files = [];
const refreshTokens = new Map();

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, cookie) => {
      const [key, ...rest] = cookie.split('=');
      acc[key] = decodeURIComponent(rest.join('='));
      return acc;
    }, {});

const setRefreshCookie = (res, token) => {
  res.setHeader('Set-Cookie', `refreshToken=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);
};

const clearRefreshCookie = (res) => {
  res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
};

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });
const accessTokenFor = (u) => jwt.sign({ sub: u.id, email: u.email, name: u.name }, ACCESS_SECRET, { expiresIn: '15m' });
const refreshTokenFor = (u) => jwt.sign({ sub: u.id }, REFRESH_SECRET, { expiresIn: '7d' });

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing access token' });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
};

app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });
  const normalizedEmail = String(email).toLowerCase().trim();
  if (users.some((u) => u.email === normalizedEmail)) return res.status(409).json({ message: 'Email is already registered' });

  const user = { id: randomUUID(), name: String(name).trim(), email: normalizedEmail, password: String(password) };
  users.push(user);

  const refreshToken = refreshTokenFor(user);
  refreshTokens.set(refreshToken, user.id);
  setRefreshCookie(res, refreshToken);

  return res.status(201).json({ accessToken: accessTokenFor(user), user: publicUser(user) });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === String(email).toLowerCase().trim());
  if (!user || user.password !== String(password)) return res.status(401).json({ message: 'Invalid email or password' });

  const refreshToken = refreshTokenFor(user);
  refreshTokens.set(refreshToken, user.id);
  setRefreshCookie(res, refreshToken);

  return res.json({ accessToken: accessTokenFor(user), user: publicUser(user) });
});

app.post('/auth/refresh', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies.refreshToken;
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: 'Missing or invalid refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });
    return res.json({ accessToken: accessTokenFor(user), user: publicUser(user) });
  } catch {
    refreshTokens.delete(refreshToken);
    clearRefreshCookie(res);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

app.post('/auth/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.refreshToken) refreshTokens.delete(cookies.refreshToken);
  clearRefreshCookie(res);
  return res.status(204).send();
});

const parseMultipartFile = (req) => {
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) throw new Error('Missing multipart boundary');
  const boundary = `--${boundaryMatch[1]}`;

  const raw = req.body.toString('binary');
  const parts = raw.split(boundary).filter((part) => part.includes('Content-Disposition'));
  const filePart = parts.find((part) => part.includes('name="file"'));
  if (!filePart) throw new Error('No file field found');

  const headerEnd = filePart.indexOf('\r\n\r\n');
  const headers = filePart.slice(0, headerEnd);
  const body = filePart.slice(headerEnd + 4).replace(/\r\n--$/, '').replace(/\r\n$/, '');

  const filenameMatch = headers.match(/filename="([^"]+)"/);
  const typeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
  const filename = filenameMatch ? filenameMatch[1] : `upload-${Date.now()}`;
  const mimetype = typeMatch ? typeMatch[1].trim() : 'application/octet-stream';
  const buffer = Buffer.from(body, 'binary');

  return { filename, mimetype, buffer };
};

app.get('/files', requireAuth, (req, res) => {
  res.json(files.filter((file) => file.ownerId === req.user.sub));
});

app.post('/files/upload', requireAuth, express.raw({ type: 'multipart/form-data', limit: '10mb' }), (req, res) => {
  try {
    const parsed = parseMultipartFile(req);
    const savedFilename = `${Date.now()}-${randomUUID()}${path.extname(parsed.filename)}`;
    const absolutePath = path.join(uploadDir, savedFilename);
    fs.writeFileSync(absolutePath, parsed.buffer);

    const fileItem = {
      id: randomUUID(),
      name: parsed.filename,
      size: parsed.buffer.length,
      type: parsed.mimetype,
      url: `http://localhost:${PORT}/uploads/${savedFilename}`,
      createdAt: new Date().toISOString(),
      ownerId: req.user.sub,
    };

    files.push(fileItem);
    res.status(201).json(fileItem);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to parse upload' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
