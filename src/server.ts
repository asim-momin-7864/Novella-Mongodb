//* server
import '#config/zod.config.js';
import app from './app.js';
import { env } from '#config/env.config.js';
import { logger } from '#utils/logger.js';
import { db } from '#db/index.js';

// server func
const startServer = async () => {
  // db start test
  try {
    await db.execute('select 1');
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error({ error }, 'Database connection failed');
    process.exit(1);
  }

  // Boot express server
  const server = app.listen(env.PORT, () => {
    logger.info(`Server booted in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // when 3rd party packages crashed
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection:${err.message}. Shutting down gracefully...`);
    // waiting to server close server first then, terminate executing
    server.close(() => {
      process.exit(1);
    });
  });

  // when synchronous uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error(`UncaughtException:${err.message}. Shutting down aggressivelly...`);
    // we are directly terminating execution/code
    process.exit(1);
  });
};

// execute function
startServer();
