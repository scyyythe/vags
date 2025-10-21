import React, { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MoreHorizontal, Send, Reply, X } from "lucide-react";
import { toZonedTime } from "date-fns-tz";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { useComments, useAddComment, useAddReaction } from "@/hooks/interactions/comments/useComments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { parseISO, formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { getLoggedInUserId } from "@/auth/decode";

interface Comment {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture?: string | null;
  };
  text: string;
  translatedText: string;
  likes: number;
  liked_by: string[];
  emoji_reactions: Record<string, number>;
  created_at: string;
  parentId?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  artworkId: string;
}

interface CommentItemProps {
  comment: Comment;
  isReply: boolean;
  isMobile: boolean;
  handleReply: (commentId: string, user: string) => void;
  handleCommentLike: (commentId: string) => void;
  toggleCommentMenu: (commentId: string) => void;
  commentMenus: { [commentId: string]: boolean };
  tReply: string;
  tBlockUser: string;
  tReport: string;
  tBlockedUser: string;
  tContentReported: string;
  setShowReportOptions: (show: boolean) => void;
  tViewAllReplies: string;
  tHideReplies: string;
  expandedReplies: { [key: string]: boolean };
  setExpandedReplies: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

function getTimeAgoText(createdAt: string, language: string) {
  // Ensure the timestamp is treated as UTC
  const commentDate = new Date(createdAt.endsWith("Z") ? createdAt : createdAt + "Z");

  const diffMs = Date.now() - commentDate.getTime();
  if (diffMs < 60 * 1000) return "just now";

  const timeText = formatDistanceToNow(commentDate, { addSuffix: true });
  return timeText;
}

const CommentItem: React.FC<CommentItemProps> = React.memo(
  ({
    comment,
    isReply,
    isMobile,
    handleReply,
    handleCommentLike,
    toggleCommentMenu,
    commentMenus,
    tReply,
    tBlockUser,
    tReport,
    tBlockedUser,
    tContentReported,
    setShowReportOptions,
    tViewAllReplies,
    tHideReplies,
    expandedReplies,
    setExpandedReplies,
  }) => {
    const { language } = useLanguage();
    const translatedText = useAutoTranslation(comment.text, language);
    const timeAgoText = getTimeAgoText(comment.created_at, language);
    const translatedTimeText = useAutoTranslation(timeAgoText, language);

    // Get current user ID from JWT token
    const currentUserId = getLoggedInUserId() || "";

    return (
      <div className={`mb-4 relative ${isReply ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <Avatar className={`${isMobile ? "h-4 w-4 " : "h-3 w-3"} mr-2`}>
              <AvatarImage src={comment.user.profile_picture} alt={comment.user.first_name} />
              <AvatarFallback>
                {`${comment.user?.first_name?.[0] || ""}${comment.user?.last_name?.[0] || ""}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className={`${isMobile ? "text-[9px]" : "text-[9px]"} font-semibold`}>
                {comment.user?.first_name || "Unknown"} {comment.user?.last_name || ""}
              </p>
              <p
                className={`${
                  isMobile ? "text-[10px]" : "text-[10px]"
                } text-gray-700 mt-1 break-words whitespace-pre-wrap`}
              >
                {translatedText}
              </p>

              <div className={`flex items-center gap-2 ${isMobile ? "text-[9px]" : "text-[9px]"} text-gray-500 mt-1`}>
                <span>{translatedTimeText}</span>
                <span>·</span>
                <button
                  onClick={() => handleReply(comment.id, comment.user.first_name)}
                  className="hover:underline text-gray-500 flex items-center gap-1"
                >
                  <Reply size={isMobile ? 12 : 10} />
                  {tReply}
                </button>

                <span>·</span>
                <button onClick={() => handleCommentLike(comment.id)} className="flex items-center gap-1">
                  <Heart
                    size={isMobile ? 12 : 10}
                    className={
                      comment.liked_by?.includes(currentUserId) ? "text-red-500 fill-red-500" : "text-gray-500"
                    }
                    fill={comment.liked_by?.includes(currentUserId) ? "currentColor" : "none"}
                  />
                  {comment.emoji_reactions?.["❤️"] || 0}
                </button>

                <div className="relative ml-1">
                  <button onClick={() => toggleCommentMenu(comment.id)} className="p-1 text-gray-500 hover:text-black">
                    <MoreHorizontal size={isMobile ? 12 : 12} />
                  </button>

                  {commentMenus[comment.id] && (
                    <div className="absolute left-6 -top-3 w-[70px] bg-white rounded-sm shadow-md z-10 overflow-hidden">
                      <button
                        className={`w-full text-left px-3 py-1 whitespace-nowrap ${
                          isMobile ? "text-[8px]" : "text-[8px]"
                        } hover:bg-gray-100 hover:text-black`}
                        onClick={() => {
                          toast.success(`${tBlockedUser} ${comment.user.first_name} ${comment.user.last_name}`, {
                            closeButton: true,
                          });
                          toggleCommentMenu(comment.id);
                        }}
                      >
                        {tBlockUser}
                      </button>
                      <button
                        className={`w-full text-left px-3 py-1 whitespace-nowrap ${
                          isMobile ? "text-[8px]" : "text-[8px] "
                        } hover:bg-gray-100 hover:text-black`}
                        onClick={() => {
                          setShowReportOptions(true);
                          toast.success(tContentReported, { closeButton: true });
                          toggleCommentMenu(comment.id);
                        }}
                      >
                        {tReport}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 ml-8">
            {!expandedReplies[comment.id] ? (
              <button
                onClick={() => setExpandedReplies((prev) => ({ ...prev, [comment.id]: true }))}
                className="text-gray-500 hover:text-gray-700 text-[10px] flex items-center gap-1"
              >
                {tViewAllReplies} ({comment.replies.length})
              </button>
            ) : (
              <>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    isMobile={isMobile}
                    handleReply={handleReply}
                    handleCommentLike={handleCommentLike}
                    toggleCommentMenu={toggleCommentMenu}
                    commentMenus={commentMenus}
                    tReply={tReply}
                    tBlockUser={tBlockUser}
                    tReport={tReport}
                    tBlockedUser={tBlockedUser}
                    tContentReported={tContentReported}
                    setShowReportOptions={setShowReportOptions}
                    tViewAllReplies={tViewAllReplies}
                    tHideReplies={tHideReplies}
                    expandedReplies={expandedReplies}
                    setExpandedReplies={setExpandedReplies}
                  />
                ))}
                <button
                  onClick={() => setExpandedReplies((prev) => ({ ...prev, [comment.id]: false }))}
                  className="text-gray-500 hover:text-gray-700 text-[10px] mt-1 flex items-center gap-1"
                >
                  {tHideReplies}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

const CommentSection: React.FC<CommentSectionProps> = ({ artworkId }) => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();

  // Translated strings
  const tCommentPosted = useAutoTranslation("Comment posted", language);
  const tYouLiked = useAutoTranslation("You liked this comment!", language);
  const tYouUnliked = useAutoTranslation("You unliked this comment!", language);
  const tBlockedUser = useAutoTranslation("Blocked user", language);
  const tContentReported = useAutoTranslation("Content reported", language);
  const tReply = useAutoTranslation("Reply", language);
  const tBlockUser = useAutoTranslation("Block User", language);
  const tReport = useAutoTranslation("Report", language);
  const tViewAllReplies = useAutoTranslation("View all replies", language);
  const tHideReplies = useAutoTranslation("Hide replies", language);
  const tComments = useAutoTranslation("Comments", language);
  const tNoComments = useAutoTranslation("No comments yet. Be the first!", language);
  const tHideComments = useAutoTranslation("Hide comments", language);
  const tViewAll = useAutoTranslation("View all", language);
  const tComment = useAutoTranslation("comment", language);
  const tAddComment = useAutoTranslation("Add a comment...", language);

  const [comment, setComment] = useState("");
  // const [comments, setComments] = useState<Comment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentLikes, setCommentLikes] = useState<{ [commentId: string]: number }>({});
  const [likedComments, setLikedComments] = useState<{ [commentId: string]: boolean }>({});
  const [commentMenus, setCommentMenus] = useState<{ [commentId: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [showAllComments, setShowAllComments] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [replyContext, setReplyContext] = useState<{ user: string; text: string } | null>(null);

  const queryClient = useQueryClient();

  // helper to build nested replies
  function buildCommentTree(comments: Comment[]): Comment[] {
    const map: { [key: string]: Comment & { replies: Comment[] } } = {};
    const roots: Comment[] = [];

    comments.forEach((c) => {
      map[c.id] = { ...c, replies: [] };
    });

    comments.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  }
  function normalizeComments(comments: any[]): Comment[] {
    const normalized = comments.map((c) => ({
      ...c,
      parentId: c.parent || null,
    }));

    return normalized;
  }

  const { data: rawComments = [] } = useComments("artwork", artworkId);
  const comments = useMemo(() => normalizeComments(rawComments), [rawComments]);
  const nestedComments = useMemo(() => buildCommentTree(comments), [comments]);

  const addComment = useAddComment("artwork", artworkId);
  const addReaction = useAddReaction("artwork", artworkId);

  const handleReportSubmit = async (category: string, reason?: string) => {
    console.log("Category:", category);
    console.log("Reason:", reason);
    setShowReportOptions(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addComment.mutate(
      { text: comment, parentId: replyingTo || undefined },
      {
        onSuccess: () => {
          toast.success(tCommentPosted, { closeButton: true });
          setComment("");
          setReplyingTo(null);
          setReplyContext(null);
          setShowEmojiPicker(false);
        },
      }
    );
  };
  const handleCommentLike = (commentId: string) => {
    apiClient
      .patch(`/comments/${commentId}/react/`, { emoji: "❤️" })
      .then((response) => {
        const action = response.data.action_performed;
        if (action === "like") {
          toast.success(tYouLiked);
        } else {
          toast.success(tYouUnliked);
        }
        queryClient.invalidateQueries({
          queryKey: ["comments", "artwork", artworkId],
        });
      })
      .catch((err) => {
        console.error("❌ Error liking comment:", err.response?.data || err.message);
      });
  };

  const toggleCommentMenu = (commentId: string) => {
    setCommentMenus((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleBlockUser = (commentId: string) => {
    const foundComment = comments.find((c) => c.id === commentId);
    if (foundComment) {
      toast.success(`${tBlockedUser} ${foundComment.user.first_name} ${foundComment.user.last_name}`, {
        closeButton: true,
      });
    }
    toggleCommentMenu(commentId);
  };

  const handleReportContent = (commentId: string) => {
    toast.success(tContentReported, { closeButton: true });
    toggleCommentMenu(commentId);
  };

  const handleReply = (commentId: string, user: string, commentText?: string) => {
    setReplyingTo(commentId);
    setComment(`@${user} `);

    // If replying from modal, close modal and set reply context
    if (showCommentsModal && commentText) {
      setShowCommentsModal(false);
      setReplyContext({ user, text: commentText });
    }
  };

  const handleModalReply = (commentId: string, user: string, commentText: string) => {
    handleReply(commentId, user, commentText);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Toggle the visibility of replies
    }));
  };

  const onEmojiClick = (emoji: any) => {
    setComment((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const visibleComments = showAllComments ? nestedComments : nestedComments.slice(0, 1);

  const hiddenCommentsCount = comments.length - 1;

  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showCommentsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCommentsModal]);

  return (
    <div className={`relative ${isMobile ? "h-56" : "h-[160px]"}`}>
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] font-semibold">{tComments}</p>
        {nestedComments.length > 1 && (
          <button onClick={() => setShowCommentsModal(true)} className="text-gray-500 hover:text-gray-700 text-[9px]">
            {tViewAll + ` ${comments.length - 1} ` + tComment + `${comments.length - 1 > 1 ? "s" : ""}`}
          </button>
        )}
      </div>
      {/* Scrollable comment container */}
      <div className={`overflow-y-auto h-[69%] custom-scrollbar`}>
        <div
          className={`transition-all duration-300 ${showAllComments ? "max-h-36" : ""}`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="hide-scrollbar overflow-y-auto p-1 max-h-full">
            {nestedComments.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic">{tNoComments}</p>
            ) : (
              <>
                {visibleComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isReply={false}
                    isMobile={isMobile}
                    handleReply={handleReply}
                    handleCommentLike={handleCommentLike}
                    toggleCommentMenu={toggleCommentMenu}
                    commentMenus={commentMenus}
                    tReply={tReply}
                    tBlockUser={tBlockUser}
                    tReport={tReport}
                    tBlockedUser={tBlockedUser}
                    tContentReported={tContentReported}
                    setShowReportOptions={setShowReportOptions}
                    tViewAllReplies={tViewAllReplies}
                    tHideReplies={tHideReplies}
                    expandedReplies={expandedReplies}
                    setExpandedReplies={setExpandedReplies}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fixed input at bottom */}
      <form onSubmit={handleCommentSubmit} className="absolute left-0 right-0 bg-white">
        {/* Reply Context Display */}
        {replyContext && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[9px] text-gray-600 mb-1">
                  Replying to <span className="font-semibold">{replyContext.user}</span>
                </p>
                <p className="text-[9px] text-gray-700 line-clamp-2">{replyContext.text}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplyContext(null);
                  setReplyingTo(null);
                  setComment("");
                }}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            placeholder={tAddComment}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`w-full border border-gray-200 rounded-full px-4 py-2 ${
              isMobile ? "text-[10px]" : "text-[10px]"
            } focus:outline-none focus:ring-1 focus:ring-gray-300 pr-16`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <div className="relative">
              <button type="button" className="text-gray-400" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <i className="bx bx-smile"></i>
              </button>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, y: 10 }}
                  animate={{ opacity: 1, scale: 0.6, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-10 right-0 z-50 origin-bottom-right rounded-md shadow-lg border border-gray-200 bg-white overflow-hidden"
                >
                  <Picker
                    data={data}
                    onEmojiSelect={onEmojiClick}
                    theme="light"
                    maxFrequentRows={0}
                    previewPosition="none"
                    skinTonePosition="none"
                    searchPosition="none"
                  />
                </motion.div>
              )}
            </div>
            <button
              type="submit"
              className={`
                ${isMobile ? "text-sm" : "text-[10px]"} 
                ${comment.trim() ? "text-black" : "text-gray-400"}
              `}
              disabled={!comment.trim()}
            >
              <Send className={`${isMobile ? "w-4 h-4" : "w-4 h-4"}`} />
            </button>
          </div>
        </div>
      </form>
      <ReportOptionsPopup
        isOpen={showReportOptions}
        onClose={() => setShowReportOptions(false)}
        onSubmit={handleReportSubmit}
      />

      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[90%] max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3">
              <h3 className="text-sm font-semibold">{tComments}</h3>
              <button onClick={() => setShowCommentsModal(false)} className="text-gray-500 hover:text-gray-700 p-1">
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {nestedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isReply={false}
                  isMobile={isMobile}
                  handleReply={(commentId, user) => handleModalReply(commentId, user, comment.text)}
                  handleCommentLike={handleCommentLike}
                  toggleCommentMenu={toggleCommentMenu}
                  commentMenus={commentMenus}
                  tReply={tReply}
                  tBlockUser={tBlockUser}
                  tReport={tReport}
                  tBlockedUser={tBlockedUser}
                  tContentReported={tContentReported}
                  setShowReportOptions={setShowReportOptions}
                  tViewAllReplies={tViewAllReplies}
                  tHideReplies={tHideReplies}
                  expandedReplies={expandedReplies}
                  setExpandedReplies={setExpandedReplies}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
