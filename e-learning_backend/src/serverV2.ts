//@ts-ignore
import colors from 'colors';
//@ts-ignore
import { Server } from 'socket.io';
import app from './app';
import { errorLogger, logger } from './shared/logger';
import { config } from './config';
// //@ts-ignore
// import os from 'os';
// //@ts-ignore
// import cluster from 'cluster';
//@ts-ignore
import { createAdapter } from '@socket.io/redis-adapter';
//@ts-ignore
import http from "http";
import {
  startEmailWorker,
  startNotificationWorker,
} from './helpers/bullmq/bullmq'; // ⬅️ ADD THIS
import connectToDb from './config/mongoDbConfig';
import { startVideoProcessingWorker } from './services/video-processing-queue.service';
import {
  initializeRedis,
  redisClient,
  redisPubClient,
  redisSubClient,
} from './helpers/redis/redis';
import { SubscriptionPlanService } from './modules/payment.module/subscriptionPlan/subscriptionPlan.service';
import { seedAdminIfNeeded } from './utils/seedAdmin';
import { seedStudentIfNeeded } from './utils/seedStudent';
import { seedMentorIfNeeded } from './utils/seedMentor';
import 'dotenv/config';

const subscriptionPlanService = new SubscriptionPlanService();

//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

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
      await seedStudentIfNeeded();
      await seedMentorIfNeeded();
      await subscriptionPlanService.seedDefaultPlans();

      logger.info(colors.green('🎯 Database connected successfully'));
      const port =
        typeof config.port === 'number' ? config.port : Number(config.port);
      server = app.listen(port, config.backend.ip as string, () => {
        logger.info(
          colors.yellow(
            `♻️  Application listening on port ${config.backend.baseUrl}/v1`,
          ),
        );

        logger.info(
          colors.yellow(`♻️  Shobhoy port ${config.backend.shobhoyUrl}`),
        );
      });

      // Initialize Redis
      await initializeRedis();

      //socket
      // const io = new Server(server, {
      //   pingTimeout: 60000,
      //   cors: {
      //     origin: '*',
      //   },
      // });

      // const redisStateClient = createRedisClient(); // New Redis client for state management

      // --- SOCKET.IO ON DIFFERENT PORT --- go to postman and connect  newsheakh3000.sobhoy.com   for socket
      const socketPort = 6738; // 👈 choose your socket port
      const socketServer = http.createServer(); // independent HTTP server only for socket.io

      // Initialize Socket.IO with Redis state management
      // await socketService.initialize(
      //   // server,
      //   socketPort,
      //   socketServer,
      //   redisPubClient,
      //   redisSubClient,
      //   redisPubClient,
      // );

      // 🔥 Start BullMQ Worker (listens for schedule jobs)
      startEmailWorker();
      startNotificationWorker();
      startVideoProcessingWorker();
    } catch (error) {
      errorLogger.error(colors.red('Server bootstrap failed: '), error);
    }

    //handle unhandledRejection
    process.on('unhandledRejection', error => {
      if (server) {
        server.close(() => {
          errorLogger.error('UnhandledRejection Detected', error);
          process.exit(1);
        });
      } else {
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
