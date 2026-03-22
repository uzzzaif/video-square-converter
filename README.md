# SQUARECUT — Video to 1080×1080 Converter

Converts any MP4/MOV/MKV video into a distorted 1080×1080 square using FFmpeg.

---

## Requirements

- **Node.js** v16+ → https://nodejs.org
- **FFmpeg** in PATH

### Install FFmpeg (Windows via winget)
```
winget install Gyan.FFmpeg
```
Then restart your terminal so `ffmpeg` is recognized in PATH.

Verify with:
```
ffmpeg -version
```

---

## Setup & Run

### 1 — Install dependencies
```
cd backend
npm install
```

### 2 — Start the backend (API server, port 3001)
```
node server.js
```

### 3 — Start the frontend server (port 3000) — in a new terminal
```
cd backend
node serve-frontend.js
```

### 4 — Open in browser
```
http://localhost:3000
```

---

## Project Structure

```
video-square-converter/
├── backend/
│   ├── server.js           ← Express API (POST /upload)
│   ├── serve-frontend.js   ← Static file server for frontend
│   ├── package.json
│   └── temp/               ← Created automatically, auto-cleaned
│       ├── uploads/
│       └── outputs/
└── frontend/
    └── index.html          ← Full UI (drag-drop, convert, download)
```

---

## FFmpeg Command Used

```
ffmpeg -i <input> -vf scale=1080:1080 -aspect 1:1 -c:v libx264 -crf 23 -preset fast -c:a copy <output>
```

- `scale=1080:1080` — forces exact 1080×1080 (distorts aspect ratio)
- `-aspect 1:1` — marks container aspect ratio as square
- `-c:v libx264` — re-encodes with H.264
- `-crf 23` — quality level (lower = better)
- `-preset fast` — encoding speed preset
- `-c:a copy` — copies audio without re-encoding

---

## Notes

- Max file size: **100 MB**
- Accepted formats: **MP4, MOV, MKV**
- Temp files are deleted automatically after conversion
- App runs on localhost only (127.0.0.1)
