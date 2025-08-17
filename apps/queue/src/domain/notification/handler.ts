import { InternalNotification } from "./models/notification";
import { MailJob } from "./models/mail-job";
import { notificationQueueManager } from "./notification-queue";
import { mailQueueManager } from "./mail-queue";

export async function addNotificationJob(notification: InternalNotification) {
  await notificationQueueManager.addNotification(notification);
}

export async function addMailJob(mailJob: MailJob) {
  await mailQueueManager.addMailJob(mailJob);
}
