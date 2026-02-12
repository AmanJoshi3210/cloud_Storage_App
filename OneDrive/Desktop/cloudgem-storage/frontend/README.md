<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SecureFileStream Frontend

## Run locally

1. Install frontend dependencies:
   ```bash
   npm install
   ```
2. (Optional) Override API URL:
   ```bash
   echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

The app expects a backend exposing:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /files`
- `POST /files/upload`
