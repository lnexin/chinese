import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recognizeImageFilters } from './recognize.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = join(rootDir, 'dist');
const dataDir = join(rootDir, 'data');
const port = Number(process.env.API_PORT || process.env.PORT || 3003);
const serveStatic = process.env.SERVE_STATIC !== '0';
const maxBodyBytes = 8 * 1024 * 1024;

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
]);

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(data));
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      const error = new Error('上传图片过大');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

async function handleRecognize(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const conditions = await recognizeImageFilters(body.imageDataUrl);
    sendJson(response, 200, { conditions });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error.message || '识别失败',
    });
  }
}

async function serveFile(response, filePath) {
  if (!existsSync(filePath)) {
    sendJson(response, 404, { error: 'Not Found' });
    return;
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes.get(extname(filePath)) || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
}

async function handleStatic(request, response) {
  if (!serveStatic) {
    sendJson(response, 404, { error: 'Not Found' });
    return;
  }

  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/idiom.json') {
    await serveFile(response, join(dataDir, 'idiom.json'));
    return;
  }

  const rawPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = resolve(distDir, `.${rawPath}`);

  if (!filePath.startsWith(distDir)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  if (existsSync(filePath)) {
    await serveFile(response, filePath);
    return;
  }

  const fallback = join(distDir, 'index.html');
  if (existsSync(fallback)) {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(await readFile(fallback, 'utf8'));
    return;
  }

  sendJson(response, 404, { error: 'Not Found' });
}

const server = createServer(async (request, response) => {
  if (request.url?.startsWith('/api/recognize')) {
    await handleRecognize(request, response);
    return;
  }

  await handleStatic(request, response);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`API 端口 ${port} 已被占用。请关闭旧的开发服务，或使用 API_PORT=其它端口 npm run dev。`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
