# SecureFileStream Backend

This backend implements all frontend API routes under `http://localhost:5000`.

## Routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /files`
- `POST /files/upload`
- `GET /uploads/:filename`

## Run

```bash
cd backend
node src/server.js
```
