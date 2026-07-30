import EventEmitter from 'events';
import { enqueueEmailJob } from './bullmq/bullmq';

export type EmailJobPayload = {
  to: string;
  subject: string;
  html: string;
};

const EMAIL_JOB_EVENT = 'email:queue';

export const emailEventEmitter = new EventEmitter();

emailEventEmitter.on(EMAIL_JOB_EVENT, async (payload: EmailJobPayload) => {
  await enqueueEmailJob(payload);
});

export const emitEmailJob = (payload: EmailJobPayload) => {
  emailEventEmitter.emit(EMAIL_JOB_EVENT, payload);
};
