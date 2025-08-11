import OngoingSequence from "@/models/OngoingSequence";
import RuleModel from "@/models/Rule";
import SequenceModel from "@/models/Sequence";
import { Constants, Rule, User, type Event } from "@workspace/common-models";
import mongoose from "mongoose";
import { Log } from "../logger";

export async function triggerSequences({
  user,
  event,
  data,
}: {
  user: User & {
    domain: mongoose.Types.ObjectId;
    subscribedToUpdates: boolean;
  };
  event: Event;
  data?: string;
}) {
  if (!user.subscribedToUpdates) {
    return;
  }

  try {
    const filter: Partial<Rule & { domain: mongoose.Types.ObjectId }> = {
      domain: user.domain,
      event,
    };
    if (data) {
      filter.eventData = data;
    }
    const rules: Rule[] = await RuleModel.find(filter).lean();

    for (const rule of rules) {
      const sequence = await SequenceModel.findOne({
        domain: user.domain,
        sequenceId: rule.sequenceId,
        status: Constants.sequenceStatus[1],
      }).lean();

      if (!sequence) {
        continue;
      }

      let firstPublishedEmail = null;
      for (let mailId of sequence.emailsOrder) {
        const email = sequence.emails.find((email) => email.emailId === mailId);
        if (!email) {
          continue;
        }
        if (email.published) {
          firstPublishedEmail = email;
          break;
        }
      }

      if (!firstPublishedEmail) {
        continue;
      }

      await OngoingSequence.create({
        domain: user.domain,
        sequenceId: sequence.sequenceId,
        userId: user.userId,
        nextEmailScheduledTime:
          new Date().getTime() + firstPublishedEmail.delayInMillis,
      });

      await SequenceModel.updateOne(
        { _id: sequence._id },
        { $addToSet: { entrants: user.userId } }
      );
    }
  } catch (err: any) {
    Log.error(err.message, {
      stack: err.stack,
    });
  }
}
