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
import useSubmitCommentReport from "@/hooks/mutate/report/useSubmitCommentReport";
import useUndoCommentReport from "@/hooks/mutate/report/undo/useUndoCommentReport";
import useCommentReportStatus from "@/hooks/query/report/useCommentReportStatus";
import useBlockUser from "@/hooks/users/block/useBlockUser";
import useUnblockUser from "@/hooks/users/block/useUnblockUser";
import useBlockedUsers from "@/hooks/users/block/useBlockedUsers";

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
  tUnblockUser: string;
  tReport: string;
  tBlockedUser: string;
  tContentReported: string;
  tUndoReport: string;
  tBlocked: string;
  setShowReportOptions: (show: boolean) => void;
  setSelectedCommentForReport: (commentId: string | null) => void;
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
    tUnblockUser,
    tReport,
    tBlockedUser,
    tContentReported,
    tUndoReport,
    tBlocked,
    setShowReportOptions,
    setSelectedCommentForReport,
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

    // Comment report status
    const { data: reportStatus } = useCommentReportStatus(comment.id);
    const submitCommentReport = useSubmitCommentReport();
    const { handleUndoReport } = useUndoCommentReport();

    // Block user functionality
    const { data: blockedUsers = [] } = useBlockedUsers();
    const blockUserMutation = useBlockUser();
    const unblockUserMutation = useUnblockUser();

    // Check if the comment author is blocked
    const isUserBlocked = blockedUsers.some((blockedUser) => blockedUser.id === comment.user.id);

    // Check if the current user is trying to block themselves
    const isOwnComment = currentUserId === comment.user.id;

    // Enhanced validation function for blocking
    const handleBlockUser = () => {
      if (isOwnComment) {
        toast.error("You cannot block yourself");
        return;
      }
      if (!comment.user.id) {
        toast.error("Invalid user ID");
        return;
      }
      blockUserMutation.mutate(comment.user.id);
    };

    // Enhanced validation function for unblocking
    const handleUnblockUser = () => {
      if (isOwnComment) {
        toast.error("You cannot unblock yourself");
        return;
      }
      if (!comment.user.id) {
        toast.error("Invalid user ID");
        return;
      }
      unblockUserMutation.mutate(comment.user.id);
    };

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
              <div className="flex flex-col gap-1">
                <p className={`${isMobile ? "text-[9px]" : "text-[9px]"} font-semibold`}>
                  {comment.user?.first_name || "Unknown"} {comment.user?.last_name || ""}
                </p>
                <div className="flex items-center gap-2">
                  {isUserBlocked && (
                    <span className="text-[8px] text-red-500 bg-red-100 px-1 py-0.5 rounded">{tBlocked}</span>
                  )}
                </div>
              </div>
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
                      {!isOwnComment &&
                        (isUserBlocked ? (
                          <button
                            className={`w-full text-left px-3 py-1 whitespace-nowrap ${
                              isMobile ? "text-[8px]" : "text-[8px]"
                            } hover:bg-gray-100 hover:text-black`}
                            onClick={() => {
                              handleUnblockUser();
                              toggleCommentMenu(comment.id);
                            }}
                          >
                            {tUnblockUser}
                          </button>
                        ) : (
                          <button
                            className={`w-full text-left px-3 py-1 whitespace-nowrap ${
                              isMobile ? "text-[8px]" : "text-[8px]"
                            } hover:bg-gray-100 hover:text-black`}
                            onClick={() => {
                              handleBlockUser();
                              toggleCommentMenu(comment.id);
                            }}
                          >
                            {tBlockUser}
                          </button>
                        ))}
                      {reportStatus?.reported ? (
                        <button
                          className={`w-full text-left px-3 py-1 whitespace-nowrap ${
                            isMobile ? "text-[8px]" : "text-[8px]"
                          } hover:bg-gray-100 hover:text-black`}
                          onClick={(e) => {
                            handleUndoReport(e, comment.id);
                            toggleCommentMenu(comment.id);
                          }}
                        >
                          {tUndoReport}
                        </button>
                      ) : (
                        <button
                          className={`w-full text-left px-3 py-1 whitespace-nowrap ${
                            isMobile ? "text-[8px]" : "text-[8px] "
                          } hover:bg-gray-100 hover:text-black`}
                          onClick={() => {
                            setSelectedCommentForReport(comment.id);
                            setShowReportOptions(true);
                            toggleCommentMenu(comment.id);
                          }}
                        >
                          {tReport}
                        </button>
                      )}
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
                    tUnblockUser={tUnblockUser}
                    tReport={tReport}
                    tBlockedUser={tBlockedUser}
                    tContentReported={tContentReported}
                    tUndoReport={tUndoReport}
                    tBlocked={tBlocked}
                    setShowReportOptions={setShowReportOptions}
                    setSelectedCommentForReport={setSelectedCommentForReport}
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
  const tUndoReport = useAutoTranslation("Undo Report", language);
  const tUnblockUser = useAutoTranslation("Unblock User", language);
  const tBlocked = useAutoTranslation("Blocked", language);

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
  const [selectedCommentForReport, setSelectedCommentForReport] = useState<string | null>(null);

  // Separate state for modal
  const [modalComment, setModalComment] = useState("");
  const [modalShowEmojiPicker, setModalShowEmojiPicker] = useState(false);
  const [modalReplyingTo, setModalReplyingTo] = useState<string | null>(null);
  const [modalReplyContext, setModalReplyContext] = useState<{ user: string; text: string } | null>(null);
  const [modalCommentMenus, setModalCommentMenus] = useState<{ [commentId: string]: boolean }>({});
  const [modalExpandedReplies, setModalExpandedReplies] = useState<{ [key: string]: boolean }>({});

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
  const submitCommentReport = useSubmitCommentReport();

  const handleReportSubmit = async (category: string, reason?: string) => {
    // This will be called from the ReportOptionsPopup
    // We need to pass the comment ID to the parent component
    // For now, we'll store the selected comment ID in state
    if (selectedCommentForReport) {
      submitCommentReport.mutate({
        comment_id: selectedCommentForReport,
        category,
        option: reason,
      });
      setShowReportOptions(false);
      setSelectedCommentForReport(null);
    }
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
    setModalReplyingTo(commentId);
    setModalComment(`@${user} `);
    setModalReplyContext({ user, text: commentText });
  };

  const handleModalCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalComment.trim()) return;

    addComment.mutate(
      { text: modalComment, parentId: modalReplyingTo || undefined },
      {
        onSuccess: () => {
          toast.success(tCommentPosted, { closeButton: true });
          setModalComment("");
          setModalReplyingTo(null);
          setModalReplyContext(null);
          setModalShowEmojiPicker(false);
        },
      }
    );
  };

  const toggleModalCommentMenu = (commentId: string) => {
    setModalCommentMenus((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const onModalEmojiClick = (emoji: any) => {
    setModalComment((prev) => prev + emoji.native);
    setModalShowEmojiPicker(false);
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

  // Prevent body scrolling when modal is open and reset modal state when closed
  useEffect(() => {
    if (showCommentsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset modal state when modal is closed
      setModalComment("");
      setModalReplyingTo(null);
      setModalReplyContext(null);
      setModalShowEmojiPicker(false);
      setModalCommentMenus({});
      setModalExpandedReplies({});
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
                    tUnblockUser={tUnblockUser}
                    tReport={tReport}
                    tBlockedUser={tBlockedUser}
                    tContentReported={tContentReported}
                    tUndoReport={tUndoReport}
                    tBlocked={tBlocked}
                    setShowReportOptions={setShowReportOptions}
                    setSelectedCommentForReport={setSelectedCommentForReport}
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
                  toggleCommentMenu={toggleModalCommentMenu}
                  commentMenus={modalCommentMenus}
                  tReply={tReply}
                  tBlockUser={tBlockUser}
                  tUnblockUser={tUnblockUser}
                  tReport={tReport}
                  tBlockedUser={tBlockedUser}
                  tContentReported={tContentReported}
                  tUndoReport={tUndoReport}
                  tBlocked={tBlocked}
                  setShowReportOptions={setShowReportOptions}
                  setSelectedCommentForReport={setSelectedCommentForReport}
                  tViewAllReplies={tViewAllReplies}
                  tHideReplies={tHideReplies}
                  expandedReplies={modalExpandedReplies}
                  setExpandedReplies={setModalExpandedReplies}
                />
              ))}
            </div>

            {/* Modal Input Field */}
            <div className="px-4 pb-4">
              {/* Reply Context Display */}
              {modalReplyContext && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 mb-3 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[9px] text-gray-600 mb-1">
                        Replying to <span className="font-semibold">{modalReplyContext.user}</span>
                      </p>
                      <p className="text-[9px] text-gray-700 line-clamp-2">{modalReplyContext.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalReplyContext(null);
                        setModalReplyingTo(null);
                        setModalComment("");
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Comment Input Form */}
              <form onSubmit={handleModalCommentSubmit} className="relative">
                <input
                  type="text"
                  placeholder={tAddComment}
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  className={`w-full border border-gray-200 rounded-full px-4 py-2 ${
                    isMobile ? "text-[10px]" : "text-[10px]"
                  } focus:outline-none focus:ring-1 focus:ring-gray-300 pr-16`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <div className="relative">
                    <button type="button" className="text-gray-400" onClick={() => setModalShowEmojiPicker(!modalShowEmojiPicker)}>
                      <i className="bx bx-smile"></i>
                    </button>
                    {modalShowEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6, y: 10 }}
                        animate={{ opacity: 1, scale: 0.6, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-10 right-0 z-50 origin-bottom-right rounded-md shadow-lg border border-gray-200 bg-white overflow-hidden"
                      >
                        <Picker
                          data={data}
                          onEmojiSelect={onModalEmojiClick}
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
                      ${modalComment.trim() ? "text-black" : "text-gray-400"}
                    `}
                    disabled={!modalComment.trim()}
                  >
                    <Send className={`${isMobile ? "w-4 h-4" : "w-4 h-4"}`} />
                  </button>
                </div>
              </form>
            </div>

            {/* Report Options Popup - Overlay on top of modal */}
            <ReportOptionsPopup
              isOpen={showReportOptions}
              onClose={() => setShowReportOptions(false)}
              onSubmit={handleReportSubmit}
              zIndex={60}
            />
          </div>
        </div>
      )}

      {/* Report Options Popup for preview section */}
      <ReportOptionsPopup
        isOpen={showReportOptions && !showCommentsModal}
        onClose={() => setShowReportOptions(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default CommentSection;
