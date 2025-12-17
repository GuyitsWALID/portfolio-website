const http = require('http');
const url = require('url');

async function loadHandler() {
  const mod = await import('./api/github.js');
  return mod.default;
}

let handlerPromise = loadHandler();

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/api/github') {
    const handler = await handlerPromise;
    const fakeReq = { query: parsed.query, body: {} };
    try {
      await handler(fakeReq, res);
    } catch (err) {
      console.error('Handler error', err);
      if (!res.headersSent) res.writeHead(500).end('handler error');
    }
    return;
  }
  res.writeHead(404).end('not found');
});

const PORT = 4002;
server.listen(PORT, () => console.log(`Dev ESM API running on http://localhost:${PORT}/api/github`));
