import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const children = new Set();

function canUsePort(port) {
  return new Promise((resolvePort) => {
    const server = createServer();
    server.once('error', () => resolvePort(false));
    server.once('listening', () => {
      server.close(() => resolvePort(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort) {
  let port = Number(startPort || 3003);
  while (!(await canUsePort(port))) {
    port += 1;
  }
  return String(port);
}

function start(name, command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: {
      ...process.env,
      ...env,
    },
    stdio: 'inherit',
  });

  children.add(child);

  child.on('exit', (code) => {
    children.delete(child);
    if (code) {
      console.error(`${name} exited with code ${code}`);
      shutdown();
    }
    process.exitCode = code || process.exitCode;
  });

  return child;
}

const apiPort = await findAvailablePort(process.env.API_PORT || '3003');
if (apiPort !== String(process.env.API_PORT || '3003')) {
  console.log(`API 端口 ${process.env.API_PORT || '3003'} 已被占用，改用 ${apiPort}`);
}

const api = start('api', process.execPath, ['server/index.js'], {
  API_PORT: apiPort,
  SERVE_STATIC: '0',
});
const vite = start('vite', process.execPath, ['node_modules/vite/bin/vite.js'], {
  API_PORT: apiPort,
});

function shutdown() {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill();
    }
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
