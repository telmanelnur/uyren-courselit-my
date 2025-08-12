import { responses } from "@/config/strings";
import { ValidationException } from "@/server/api/core/exceptions";

export function verifyMandatoryTags(emailContent: EmailBlock[]) {
    const unsubscribeRegex = /{{\s*unsubscribe_link\s*}}/;
    const addressRegex = /{{\s*address\s*}}/;

    const hasUnsubscribeLink = emailContent.some(
        (block) =>
            block.settings &&
            JSON.stringify(block.settings).match(unsubscribeRegex),
    );
    const hasAddress = emailContent.some(
        (block) =>
            block.settings &&
            JSON.stringify(block.settings).match(addressRegex),
    );

    if (!hasUnsubscribeLink || !hasAddress) {
        throw new ValidationException(responses.mandatory_tags_missing);
    }
}
