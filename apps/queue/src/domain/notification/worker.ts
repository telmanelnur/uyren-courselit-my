import { logger } from "@/core/logger";
import { RedisConfig } from "@/core/redis";
import { Worker } from "bullmq";
import { notificationEmitter } from "./emitters/notification";

const redisConfig = RedisConfig.getConnectionOptions();

const worker = new Worker(
  "notification",
  async (job) => {
    const notification = job.data;
    try {
      deliverInAppNotification(notification);
    } catch (err: any) {
      logger.error(err);
    }
  },
  { connection: redisConfig }
);

export default worker;

function deliverInAppNotification(notification: any) {
  notificationEmitter.emit("newNotification", notification);
}
