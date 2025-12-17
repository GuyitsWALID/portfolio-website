const http = require('http');
const url = require('url');
const handler = require('./api/github.cjs');

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/api/github') {
    const fakeReq = { query: parsed.query, body: {} };
    Promise.resolve(handler(fakeReq, res)).catch(err => {
      console.error('Handler error', err);
      if (!res.headersSent) res.writeHead(500).end('handler error');
    });
    return;
  }
  res.writeHead(404).end('not found');
});

const PORT = 4001;
server.listen(PORT, () => console.log(`Dev API running on http://localhost:${PORT}/api/github`));
