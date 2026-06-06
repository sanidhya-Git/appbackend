import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, redis } from './config/redis';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Keep-alive: ping /health every 14 min so Render free tier never sleeps
  if (env.NODE_ENV === 'production') {
    setInterval(() => {
      http.get(`http://localhost:${env.PORT}/health`, (res) => {
        res.resume();
      }).on('error', () => {});
    }, 14 * 60 * 1000);
    logger.info('Keep-alive ping scheduled (14 min interval)');
  }

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Graceful shutdown...`);
    server.close(async () => {
      await disconnectDatabase();
      await redis.quit();
      logger.info('Server closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
}

bootstrap();
