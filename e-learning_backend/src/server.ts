//@ts-ignore
import colors from 'colors';
//@ts-ignore
import mongoose from 'mongoose';
//@ts-ignore
import { Server } from 'socket.io';
import app from './app';
import { errorLogger, logger } from './shared/logger';
import { config } from './config';
//@ts-ignore
import os from 'os';
//@ts-ignore
import cluster from 'cluster';
//@ts-ignore
import { createAdapter } from '@socket.io/redis-adapter';

import {
  startEmailWorker,
  startNotificationWorker,
} from './helpers/bullmq/bullmq';
import connectToDb from './config/mongoDbConfig';
import { startVideoProcessingWorker } from './services/video-processing-queue.service';
import {
  initializeRedis,
  redisPubClient,
  redisSubClient,
} from './helpers/redis/redis';
import { SubscriptionPlanService } from './modules/payment.module/subscriptionPlan/subscriptionPlan.service';
import { seedAdminIfNeeded } from './utils/seedAdmin';

const subscriptionPlanService = new SubscriptionPlanService();

// in production, use all cores, but in development, limit to 2-4 cores
const numCPUs =
  config.environment === 'production'
    ? os.cpus().length
    : Math.max(0, Math.min(1, os.cpus().length));
//@ts-ignore
//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandleException Detected', error);
  //@ts-ignore
  process.exit(1);
});

if (cluster.isPrimary) {
  // isMaster (deprecated)
  // Fork workers for each CPU core
  logger.info(
    colors.green(`Master process started, forking ${numCPUs} workers...`),
  );

  // Fork workers for each core
  for (let i = 0; i < numCPUs; i++) {
    console.log('num of CPUs forking 🍴 numCPUs i', i);
    cluster.fork();
  }
  //@ts-ignore
  // When a worker dies, log it and fork a new worker
  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  let server: any;

  async function main() {
    try {
      // startMessageConsumer();

      // await mongoose.connect(config.database.mongoUrl as string, {
      //   serverSelectionTimeoutMS: 30000, // increase server selection timeout
      //   socketTimeoutMS: 45000, // increase socket timeout
      // });

      await connectToDb();
      await seedAdminIfNeeded();
      await subscriptionPlanService.seedDefaultPlans();

      logger.info(colors.green('🎯 Database connected successfully'));
      const port =
        typeof config.port === 'number' ? config.port : Number(config.port);
      server = app.listen(port, config.backend.ip as string, () => {
        // Large capsule video replaces (≤250 MB) need long-lived sockets
        server.headersTimeout = 16 * 60 * 1000;
        server.requestTimeout = 16 * 60 * 1000;
        server.timeout = 16 * 60 * 1000;
        logger.info(
          colors.yellow(
            `♻️  Application listening on port ${config.backend.baseUrl}/v1`,
          ),
        );

        // logger.info(
        //     colors.yellow(
        //       `♻️  Shobhoy port ${config.backend.shobhoyUrl}`,
        //     ),
        //   );
      });

      // Initialize Redis
      await initializeRedis();

      //socket
      const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
          origin: '*',
        },
      });

      // 🔥 CRITICAL: Use Redis adapter for cross-worker communication
      io.adapter(createAdapter(redisPubClient, redisSubClient));


      // @ts-ignore
      global.io = io;

      // 🔥 Start BullMQ Worker (listens for schedule jobs)

      startEmailWorker();
      startNotificationWorker();
      startVideoProcessingWorker();
    } catch (error) {
      errorLogger.error(colors.red("Server bootstrap failed: "));
    }
    //@ts-ignore
    //handle unhandledRejection
    process.on('unhandledRejection', error => {
      if (server) {
        server.close(() => {
          errorLogger.error('UnhandledRejection Detected', error);
          //@ts-ignore
          process.exit(1);
        });
      } else {
        //@ts-ignore
        process.exit(1);
      }
    });
  }

  main();

  //SIGTERM
  // process.on('SIGTERM', () => {
  //   logger.info('SIGTERM IS RECEIVE');
  //   if (server) {
  //     server.close();
  //   }
  // });
}
