import {
  CommunityComment,
  CommunityCommentReply,
} from "@workspace/common-models";

export function isCommunityComment(
  comment: CommunityComment | CommunityCommentReply
): comment is CommunityComment {
  return (comment as CommunityComment).postId !== undefined;
}
