import http from 'http';
import express, { Request, Response, NextFunction } from 'express';

interface ServerConfig {
  port: number;
  host: string;
  env: string;
}

function getConfig(): ServerConfig {
  const parsedPort = parseInt(process.env.PORT || '3000', 10);
  const port = isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535 ? 3000 : parsedPort;
  const host = process.env.HOST || '0.0.0.0';
  const env = process.env.NODE_ENV || 'development';
  return { port, host, env };
}

const config = getConfig();
const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (_req: Request, res: Response): void => {
  const memory = process.memoryUsage();
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
    },
  });
});

app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = res.statusCode >= 400 && res.statusCode < 600 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
});

const server = http.createServer(app);

function startServer(): Promise<http.Server> {
  return new Promise((resolve) => {
    server.listen(config.port, config.host, () => {
      resolve(server);
    });
  });
}

function shutdown(signal: string): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      resolve();
    });

    const forceTimeout = setTimeout(() => {
      process.exit(1);
    }, 10000);

    if (forceTimeout.unref) {
      forceTimeout.unref();
    }
  });
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM').then(() => process.exit(0));
});

process.on('SIGINT', () => {
  shutdown('SIGINT').then(() => process.exit(0));
});

if (require.main === module) {
  startServer();
}

export { app, server, config, startServer, shutdown };