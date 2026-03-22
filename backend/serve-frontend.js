const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(FRONTEND_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Frontend running at http://localhost:${PORT}`);
});
