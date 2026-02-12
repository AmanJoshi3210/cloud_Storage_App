# Cloud Storage App (MERN + Cloudinary)

This project is now structured as **separate backend and frontend apps** so each can run independently.

## Project Structure

- `backend/` — Express + MongoDB API (authentication, file metadata, Cloudinary signature)
- `frontend/` — React + Vite UI
- `package.json` (root) — convenience scripts to run/install both apps

## Backend (`backend/`)

### Tech
- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- Cloudinary signed uploads

### Setup
1. Install dependencies:
   ```bash
   npm install --prefix backend
   ```
2. Copy `backend/.env.example` to `backend/.env` and update values:
   ```bash
   cp backend/.env.example backend/.env
   ```

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/cloudstorage
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
   Never commit real secrets to git. `.gitignore` excludes backend env files by default.

3. Start backend:
   ```bash
   npm run dev --prefix backend
   ```

The backend will run on: `http://localhost:5000`

## Frontend (`frontend/`)

### Tech
- React + TypeScript
- Vite
- Tailwind via CDN

### Setup
1. Install dependencies:
   ```bash
   npm install --prefix frontend
   ```
2. Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_USE_MOCK_BACKEND=false
   GEMINI_API_KEY=your_gemini_key
   ```
3. Start frontend:
   ```bash
   npm run dev --prefix frontend
   ```

The frontend will run on: `http://localhost:3000`

## Root convenience commands

From the project root:

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
npm run build:frontend
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/files` (auth)
- `POST /api/files` (auth)
- `DELETE /api/files/:id` (auth)
- `GET /api/cloudinary/sign` (auth)

## Notes

- Frontend now uses environment variables for API target and mock toggle.
- Set `VITE_USE_MOCK_BACKEND=true` if you want local demo mode without backend.
