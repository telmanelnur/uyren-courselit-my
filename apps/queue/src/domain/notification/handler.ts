import { InternalNotification } from "./models/notification";
import { notificationQueueManager } from "./notification-queue";

// export async function addMailJob({ to, subject, body, from }: MailJob) {
//     for (const recipient of to) {
//         await mailQueue.add("mail", {
//             to: recipient,
//             subject,
//             body,
//             from,
//         });
//     }
// }

export async function addNotificationJob(notification: InternalNotification) {
  await notificationQueueManager.addNotification(notification);
}
