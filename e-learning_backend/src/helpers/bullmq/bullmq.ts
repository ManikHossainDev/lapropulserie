//@ts-ignore
import { Queue, Worker, QueueScheduler, Job } from "bullmq"; 
import { errorLogger, logger } from "../../shared/logger";
import { Notification } from "../../modules/notification/notification.model";
import { INotification } from "../../modules/notification/notification.interface";
import { redisConnectionOptions } from "../redis/redis";
import { TRole } from "../../middlewares/roles";
//@ts-ignore
import mongoose from 'mongoose';
import { buildTranslatedField } from "../../utils/buildTranslatedField";
import { sendEmail } from "../emailService";

export interface IEmailJobData {
  to: string;
  subject: string;
  html: string;
}

// Lazy queue initialization - only create when accessed
let _emailQueue: Queue<IEmailJobData> | null = null;
let _notificationQueue: Queue | null = null;

function getEmailQueue(): Queue<IEmailJobData> {
  if (!_emailQueue) {
    _emailQueue = new Queue<IEmailJobData>("email-queue-e-learning", {
      connection: redisConnectionOptions as any,
    });
  }
  return _emailQueue;
}

function getNotificationQueue(): Queue {
  if (!_notificationQueue) {
    _notificationQueue = new Queue("notificationQueue-e-learning", {
      connection: redisConnectionOptions as any,
    });
  }
  return _notificationQueue;
}

export const emailQueue = {
  get get() { return getEmailQueue(); }
} as any;

export const enqueueEmailJob = async (data: IEmailJobData) => {
  const queue = getEmailQueue();
  await queue.add("send-email" as any, data, {
    attempts: 3,
    removeOnComplete: 100,
    removeOnFail: 100,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};

export const startEmailWorker = () => {
  const worker = new Worker<IEmailJobData>(
    "email-queue-e-learning",
    async (job: Job<IEmailJobData>) => {
      await sendEmail(job.data);
    },
    { connection: redisConnectionOptions as any }
  );

  worker.on("completed", (job: Job) =>
    logger.info(`Email job ${job.id} (${job.name}) completed`)
  );

  worker.on("failed", (job: Job | undefined, err: Error) =>
    errorLogger.error(`Email job ${job?.id} (${job?.name}) failed`, err)
  );
};

/*-─────────────────────────────────
|  Notification Queue
└──────────────────────────────────*/
export const notificationQueue = new Proxy({} as Queue, {
  get(_target, prop, receiver) {
    const queue = getNotificationQueue();
    const value = Reflect.get(queue, prop, receiver);
    return typeof value === 'function' ? value.bind(queue) : value;
  },
});
// new QueueScheduler("notificationQueue", { connection: redisConnectionOptions });

type NotificationJobName = "sendNotification";


interface IScheduleJobForNotification {
  name: string;
  data : INotification,
  id: string
}

export const startNotificationWorker = () => {
  const worker = new Worker(
    "notificationQueue-e-learning",
    async (job: any) => {
      console.log("job.data testing startNotificationWorker::", job.data)
      const { id, name, data } = job;
      logger.info(`Processing notification job ${id} ⚡ ${name}`, data);

      try {

        // Translate multiple properties dynamically
        const [titleObj] : [any]  = await Promise.all([
          buildTranslatedField(data.title as any)
        ]);

        const notification = await Notification.create({
          title: titleObj,
          senderId: data.senderId,
          receiverId: data.receiverId,
          receiverRole: data.receiverRole,
          type: data.type,
          linkFor: data.linkFor,
          linkId: data.linkId,
          referenceFor: (data as any).referenceFor,
          referenceId: (data as any).referenceId,
        });

        logger.info(
          `✅ Notification created for ${data.receiverRole} :: `,
          notification,
        );
        
        let eventName;
        let emitted;

        // 🎨 GUIDE FOR FRONTEND .. if admin then listen for notification::admin event  
        if(data.receiverRole == TRole.admin){
          
          eventName = `notification::admin`;

          // emitted = socketService.emitToRole(
          //   data.receiverRole,
          //   eventName,
          //   {
          //     title: data.title,
          //     senderId: data.senderId,
          //     receiverId: null,
          //     receiverRole: data.receiverRole,
          //     type: data.type,
          //     linkFor: data.linkFor,
          //     linkId: data.linkId,
          //     referenceFor: (data as any).referenceFor,
          //     referenceId: (data as any).referenceId,
          //   }            
          // );
          emitted = false;

          if (emitted) {
            logger.info(`🔔 Real-time notification sent to ${data.receiverRole}`);
          } else {
            logger.info(`📴 ${data.receiverRole} is offline, notification saved in DB only`);
          }

        }else{
        
          const receiverId = (data.receiverId || '').toString();
          eventName = `notification::${receiverId}`;

          // Try to emit to the user
          // emitted = await socketService.emitToUser(
          //   receiverId,
          //   eventName,
          //   {
          //     title: data.title,
          //     senderId: data.senderId,
          //     receiverId: data.receiverId,
          //     receiverRole: data.receiverRole,
          //     type: data.type,
          //     linkFor: data.linkFor,
          //     linkId: data.linkId,
          //     referenceFor: (data as any).referenceFor,
          //     referenceId: (data as any).referenceId,
          //   }
          // );
          emitted = false;

          if (emitted) {
            logger.info(`🔔 Real-time notification sent to user ${receiverId}`);
          } else {
            logger.info(`📴 User ${receiverId} is offline, notification saved in DB only`);
          }
        }

      } catch (err: any) {
        console.log("⭕ error block hit  of notification worker", err)
        errorLogger.error(
          `❌ Notification job ${id} failed: ${err.message}`
        );
        throw err; // ensures retry/backoff
      }
    },
    { connection: redisConnectionOptions as any }
  );
  //@ts-ignore
  worker.on("completed", (job) =>
    logger.info(`✅ Notification job ${job.id} (${job.name}) completed`)
  );
  //@ts-ignore
  worker.on("failed", (job, err) =>
    errorLogger.error(`❌ Notification job ${job?.id} (${job?.name}) failed`, err)
  );
};


