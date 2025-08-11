import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import {
  CommunityComment,
  CommunityCommentReply,
  Membership,
} from "@workspace/common-models";
import { Link, useToast } from "@workspace/components-library";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { useEffect, useRef, useState } from "react";
import { useProfile } from "../contexts/profile-context";
import { Comment } from "./comment";

type PostType = NonNullable<
  GeneralRouterOutputs["communityModule"]["post"]["getByPostIdAndCommunityId"]
>;
type CommentType = NonNullable<
  GeneralRouterOutputs["communityModule"]["post"]["listComments"]["items"][number]
>;

const formatComment = (comment: any): Omit<CommentType, "createdAt" | "updatedAt"> & {
    createdAt: Date;
    updatedAt: Date;
} => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
    updatedAt: new Date(comment.updatedAt),
});

export default function CommentSection({
  communityId,
  postId,
  onPostUpdated,
  membership,
}: {
  communityId: string;
  postId: string;
  onPostUpdated: (postId: string, commentsCount: number) => void;
  membership: Pick<Membership, "status" | "role" | "rejectionReason"> | undefined;
}) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [content, setContent] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<PostType>();
  const { profile } = useProfile();
  const { toast } = useToast();

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  useEffect(() => {
    if (post && typeof post.commentsCount !== "undefined") {
      onPostUpdated(postId, post.commentsCount);
    }
  }, [post]);

  const loadPostQuery =
    trpc.communityModule.post.getByPostIdAndCommunityId.useQuery({
      data: {
        communityId,
        postId,
      },
    });
  useEffect(() => {
    if (loadPostQuery.data) {
      setPost(loadPostQuery.data);
    }
    if (loadPostQuery.error) {
      toast({
        title: "Error",
        description: loadPostQuery.error.message,
      });
    }
  }, [loadPostQuery.data, loadPostQuery.error]);

  const loadCommentsQuery = trpc.communityModule.post.listComments.useQuery({
    filter: {
      communityId,
      postId,
    },
  });
  useEffect(() => {
    if (loadCommentsQuery.data) {
      setComments(loadCommentsQuery.data.items);
    }
    if (loadCommentsQuery.error) {
      toast({
        title: "Error",
        description: loadCommentsQuery.error.message,
      });
    }
  }, [loadCommentsQuery.data, loadCommentsQuery.error]);

  const postCommentMutation =
    trpc.communityModule.post.addComment.useMutation();

  const handlePostComment = async () => {
    if (!content) return;
    try {
      const response = await postCommentMutation.mutateAsync({
        data: {
          communityId,
          postId,
          content,
        },
      });
      setComments((prevComments) => [...prevComments, response]);
      setContent("");
      setPost((prevPost) => {
        if (prevPost) {
          return {
            ...prevPost,
            commentsCount: prevPost.commentsCount + 1,
          };
        }
        return prevPost;
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleCommentReply = async (
    commentId: string,
    content: string,
    parentReplyId?: string
  ) => {
    try {
      const response = await postCommentMutation.mutateAsync({
        data: {
          communityId,
          postId,
          content,
          parentCommentId: commentId,
          parentReplyId,
        },
      });
      replaceComment(response);
      setPost((prevPost) => {
        if (prevPost) {
          return {
            ...prevPost,
            commentsCount: prevPost.commentsCount + 1,
          };
        }
        return prevPost;
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
      });
    }
  };

  //   const handleCommentLike = async (commentId: string) => {
  //     const query = `
  //             mutation ($communityId: String!, $postId: String!, $commentId: String!) {
  //                 comment: toggleCommentLike(communityId: $communityId, postId: $postId, commentId: $commentId) {
  //                     communityId
  //                     postId
  //                     commentId
  //                     content
  //                     user {
  //                         userId
  //                         name
  //                         avatar {
  //                             mediaId
  //                             file
  //                             thumbnail
  //                         }
  //                     }
  //                     media {
  //                         type
  //                         media {
  //                             mediaId
  //                             file
  //                             thumbnail
  //                         }
  //                     }
  //                     likesCount
  //                     replies {
  //                         replyId
  //                         content
  //                         user {
  //                             userId
  //                             name
  //                             avatar {
  //                                 mediaId
  //                                 file
  //                                 thumbnail
  //                             }
  //                         }
  //                         updatedAt
  //                         likesCount
  //                         hasLiked
  //                         deleted
  //                     }
  //                     hasLiked
  //                     updatedAt
  //                     deleted
  //                 }
  //             }
  //         `;
  //     const fetch = new FetchBuilder()
  //       .setUrl(`${address.backend}/api/graph`)
  //       .setPayload({
  //         query,
  //         variables: {
  //           communityId,
  //           postId,
  //           commentId,
  //         },
  //       })
  //       .setIsGraphQLEndpoint(true)
  //       .build();

  //     try {
  //       const response = await fetch.exec();
  //       if (response.comment) {
  //         replaceComment(response.comment);
  //       }
  //     } catch (err: any) {
  //       toast({
  //         title: "Error",
  //         description: err.message,
  //       });
  //     }
  //   };

  //   const handleReplyLike = async (commentId: string, replyId: string) => {
  //     const query = `
  //             mutation ($communityId: String!, $postId: String!, $commentId: String!, $replyId: String!) {
  //                 comment: toggleCommentReplyLike(communityId: $communityId, postId: $postId, commentId: $commentId, replyId: $replyId) {
  //                     communityId
  //                     postId
  //                     commentId
  //                     content
  //                     user {
  //                         userId
  //                         name
  //                         avatar {
  //                             mediaId
  //                             file
  //                             thumbnail
  //                         }
  //                     }
  //                     media {
  //                         type
  //                         media {
  //                             mediaId
  //                             file
  //                             thumbnail
  //                         }
  //                     }
  //                     likesCount
  //                     replies {
  //                         replyId
  //                         content
  //                         user {
  //                             userId
  //                             name
  //                             avatar {
  //                                 mediaId
  //                                 file
  //                                 thumbnail
  //                             }
  //                         }
  //                         updatedAt
  //                         likesCount
  //                         hasLiked
  //                         deleted
  //                     }
  //                     hasLiked
  //                     updatedAt
  //                     deleted
  //                 }
  //             }
  //         `;
  //     const fetch = new FetchBuilder()
  //       .setUrl(`${address.backend}/api/graph`)
  //       .setPayload({
  //         query,
  //         variables: {
  //           communityId,
  //           postId,
  //           commentId,
  //           replyId,
  //         },
  //       })
  //       .setIsGraphQLEndpoint(true)
  //       .build();

  //     try {
  //       const response = await fetch.exec();
  //       if (response.comment) {
  //         replaceComment(response.comment);
  //       }
  //     } catch (err: any) {
  //       toast({
  //         title: "Error",
  //         description: err.message,
  //       });
  //     }
  //   };

  const deleteCommentMutation =
    trpc.communityModule.post.deleteComment.useMutation();
  const handleDeleteComment = async (
    comment: CommunityComment | CommunityCommentReply
  ) => {
    try {
      const response = await deleteCommentMutation.mutateAsync({
        data: {
          communityId,
          postId,
          commentId: (comment as CommunityComment).commentId,
          replyId: (comment as CommunityCommentReply).replyId,
        },
      });
      if (!response) {
        removeComment(comment as CommunityComment);
      } else {
        replaceComment(response);
      }
      loadCommentsQuery.refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
      });
    }
  };

  const replaceComment = (comment: CommentType) => {
    setComments((prevComments) =>
      prevComments.map((c) => (c.commentId === comment.commentId ? comment : c))
    );
  };

  const removeComment = (comment: CommunityComment) => {
    setComments((prevComments) =>
      prevComments.filter((c) => c.commentId !== comment.commentId)
    );
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {comments.map((comment) => (
          <Comment
            communityId={communityId}
            key={comment.commentId}
            membership={membership}
            comment={comment}
            onLike={(commentId: string, replyId?: string) => {
              //   if (replyId) {
              //     handleReplyLike(commentId, replyId);
              //   } else {
              //     handleCommentLike(commentId);
              //   }
            }}
            onReply={(commentId, content, parentReplyId?: string) =>
              handleCommentReply(commentId, content, parentReplyId)
            }
            onDelete={handleDeleteComment}
          />
        ))}
        <div ref={commentsEndRef} />
      </div>
      {!profile.name && (
        <div className="text-center text-gray-500">
          Complete your{" "}
          <span className="underline">
            <Link href={"/dashboard/profile"}>profile</Link>
          </span>{" "}
          to join this community or post here
        </div>
      )}
      {profile.name && (
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={handlePostComment}>Post Comment</Button>
        </div>
      )}
    </div>
  );
}
