const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Temp directories
const UPLOAD_DIR = path.join(__dirname, 'temp', 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'temp', 'outputs');

[UPLOAD_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors());
app.use(express.json());

// Multer config
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const ALLOWED_TYPES = ['.mp4', '.mov', '.mkv'];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_TYPES.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`));
    }
  }
});

// Cleanup helper
function deleteFile(filePath) {
  fs.unlink(filePath, err => {
    if (err) console.error(`Failed to delete ${filePath}:`, err.message);
  });
}

// POST /upload
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.post('/upload', (req, res) => {
  upload.single('video')(req, res, (uploadErr) => {
    if (uploadErr) {
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
      }
      return res.status(400).json({ error: uploadErr.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const inputPath = req.file.path;
    const outputFilename = `${uuidv4()}_output.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    // EXACT FFmpeg command — only filenames replaced
    const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf scale=1080:1080 -aspect 1:1 -c:v libx264 -crf 23 -preset fast -c:a copy "${outputPath}"`;

    console.log('Running FFmpeg:', ffmpegCmd);

    exec(ffmpegCmd, (err, stdout, stderr) => {
      // Always delete input
      deleteFile(inputPath);

      if (err) {
        console.error('FFmpeg error:', stderr);
        return res.status(500).json({
          error: 'FFmpeg conversion failed.',
          details: stderr.slice(-500) // last 500 chars of stderr
        });
      }

      if (!fs.existsSync(outputPath)) {
        return res.status(500).json({ error: 'Output file was not created.' });
      }

      // Stream output file, then delete it
      res.setHeader('Content-Disposition', `attachment; filename="square_output.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');

      const stream = fs.createReadStream(outputPath);
      stream.pipe(res);
      stream.on('end', () => deleteFile(outputPath));
      stream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr);
        deleteFile(outputPath);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to send output file.' });
        }
      });
    });
  });
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, '0.0.0.0', () => {   // 0.0.0.0 not 127.0.0.1
  console.log(`Server running on port ${PORT}`);
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});