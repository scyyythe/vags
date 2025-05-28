import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MoreHorizontal, Send, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";

interface Comment {
  id: string;
  user: string;
  userImage: string;
  text: string;
  likes: number;
  timestamp: string;
  parentId?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  artworkId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ artworkId }) => {
  const isMobile = useIsMobile();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentLikes, setCommentLikes] = useState<{ [commentId: string]: number }>({});
  const [likedComments, setLikedComments] = useState<{ [commentId: string]: boolean }>({});
  const [commentMenus, setCommentMenus] = useState<{ [commentId: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [showAllComments, setShowAllComments] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  
  const handleReportSubmit = async (category: string, reason?: string) => {
    console.log("Category:", category);
    console.log("Reason:", reason);
    setShowReportOptions(false);
  };

  useEffect(() => {
    setComments([]);
    // TODO: fetch comments from backend using artworkId
  }, []);  
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment: Comment = {
        id: `c${Date.now()}`,
        user: "You",
        userImage: "https://i.pravatar.cc/150?img=5",
        text: comment,
        likes: 0,
        timestamp: new Date().toISOString(),
        parentId: replyingTo || undefined,
        replies: []
      };
  
      if (replyingTo) {
        setComments(prevComments => {
          return prevComments.map(c => {
            if (c.id === replyingTo) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment]
              };
            }
            return c;
          });
        });
  
        setExpandedComments(prev => ({
          ...prev,
          [replyingTo]: true 
        }));
      } else {
        setComments(prev => [...prev, newComment]);
      }
  
      setCommentLikes(prev => ({
        ...prev,
        [newComment.id]: 0 
      }));
      toast("Comment posted");
      setComment(""); 
      setReplyingTo(null); 
      setShowEmojiPicker(false);
    }
  };
  
  const handleCommentLike = (commentId: string) => {
    const isLiked = likedComments[commentId];
  
    setCommentLikes(prevLikes => ({
      ...prevLikes,
      [commentId]: (prevLikes[commentId] || 0) + (isLiked ? -1 : 1),
    }));
  
    setLikedComments(prevLiked => ({
      ...prevLiked,
      [commentId]: !isLiked,
    }));
  };
  
  const toggleCommentMenu = (commentId: string) => {
    setCommentMenus(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleBlockUser = (commentId: string) => {
    const foundComment = comments.find(c => c.id === commentId);
    if (foundComment) {
      toast.success(`Blocked user ${foundComment.user}`);
    }
    toggleCommentMenu(commentId);
  };

  const handleReportContent = (commentId: string) => {
    toast.success("Content reported");
    toggleCommentMenu(commentId);
  };

  const handleReply = (commentId: string) => {
    const parentComment = comments.find(c => c.id === commentId);
    if (parentComment) {
      setReplyingTo(commentId);
      setComment(`@${parentComment.user} `);
      // Automatically show the replies if replying
      setExpandedComments(prev => ({
        ...prev,
        [commentId]: true,
      }));
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId] // Toggle the visibility of replies
    }));
  };

  const onEmojiClick = (emoji: any) => {
    setComment(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };  

  const getTimeAgoText = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
  
    if (diffInSeconds < 60) {
      return "Just now";
    }
  
    return formatDistanceToNow(time, { addSuffix: true });
  };

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const visibleComments = showAllComments ? comments : comments.slice(0, 1);
  const hiddenCommentsCount = comments.length - 1;

  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`mb-2 relative ${isReply ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Avatar className={`${isMobile ? 'h-4 w-4 ' : 'h-3 w-3'} mr-2`}>
            <AvatarImage src={comment.userImage} alt={comment.user} />
            <AvatarFallback>{comment.user.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
  
          <div>
            <p className={`${isMobile ? 'text-[9px]' : 'text-[9px]'} font-semibold`}>{comment.user}</p>
            <p className={`${isMobile ? 'text-[10px]' : 'text-[10px]'} text-gray-700 mt-1 break-words whitespace-pre-wrap`}>
              {comment.text}
            </p>
  
            <div className={`flex items-center gap-2 ${isMobile ? 'text-[9px]' : 'text-[9px]'} text-gray-500 mt-1`}>
              <span>{getTimeAgoText(comment.timestamp)}</span>
              <span>·</span>
              <button 
                onClick={() => handleReply(comment.id)} 
                className="hover:underline text-gray-500 flex items-center gap-1"
              >
                <Reply size={isMobile ? 12 : 10} />
                Reply
              </button>
              <span>·</span>
              <button
                onClick={() => handleCommentLike(comment.id)}
                className="flex items-center gap-1"
              >
                <Heart
                  size={isMobile ? 12 : 10}
                  className={likedComments[comment.id] ? 'text-red-500 fill-red-500' : 'text-gray-500'}
                  fill={likedComments[comment.id] ? 'currentColor' : 'none'}
                />
                {commentLikes[comment.id] || 0}
              </button>
              
              <div className="relative ml-1">
                <button
                  onClick={() => toggleCommentMenu(comment.id)}
                  className="p-1 text-gray-500 hover:text-black"
                >
                  <MoreHorizontal size={isMobile ? 12 : 12} />
                </button>

                {commentMenus[comment.id] && (
                  <div className="absolute left-6 -top-3 w-[70px] bg-white rounded-sm shadow-md z-10 overflow-hidden">
                    <button
                      className={`w-full text-left px-3 py-1 whitespace-nowrap ${
                        isMobile ? "text-[8px]" : "text-[8px]"
                      } hover:bg-gray-100 hover:text-black`}
                      onClick={() => {
                        toast.success(`Blocked user ${comment.user}`);
                        toggleCommentMenu(comment.id);
                      }}
                    >
                      Block User
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1 whitespace-nowrap ${
                        isMobile ? "text-[8px]" : "text-[8px] "
                      } hover:bg-gray-100 hover:text-black`}
                      onClick={() => {
                        setShowReportOptions(true);
                        setOptionsOpen(false);
                        toast.success("Content reported");
                        toggleCommentMenu(comment.id);
                      }} 
                    >
                      Report
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
              onClick={() =>
                setExpandedReplies((prev) => ({ ...prev, [comment.id]: true }))
              }
              className="text-gray-500 hover:text-gray-700 text-[10px] flex items-center gap-1"
            >
              View all replies ({comment.replies.length})
            </button>
          ) : (
            <>
              {comment.replies.map((reply) => renderComment(reply, true))}
              <button
                onClick={() =>
                  setExpandedReplies((prev) => ({ ...prev, [comment.id]: false }))
                }
                className="text-gray-500 hover:text-gray-700 text-[10px] mt-1 flex items-center gap-1"
              >
                Hide replies
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );  
  
  return (
    <div className="relative h-56 md:h-56 sm:h-44 p-1">
      <p className="text-[10px] font-semibold mb-4">
          Comments
      </p>
      {/* Scrollable comment container */}
      <div
        className={`overflow-y-auto h-[60%] pb-20 custom-scrollbar`}
      >
        <div
          className={`transition-all duration-300 ${
            showAllComments ? 'max-h-48' : ''
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="hide-scrollbar overflow-y-auto p-1 max-h-full">
          {comments.length === 0 ? (
            <p className="text-[10px] text-gray-500 italic">
              No comments yet. Be the first!
            </p>
          ) : (
            <>
              {visibleComments.map(comment => renderComment(comment))}
            </>
          )}
          </div>
        </div>

        {comments.length > 1 && (
          <button
            onClick={() => setShowAllComments(prev => !prev)}
            className="text-gray-500 hover:text-gray-700 text-[10px] mb-4 px-4"
          >
            {showAllComments
              ? "Hide comments"
              : `View all ${comments.length - 1} comment${comments.length - 1 > 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* Fixed input at bottom */}
      <form
        onSubmit={handleCommentSubmit}
        className="absolute bottom-0 left-0 right-0 bg-white py-3"
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`w-full border border-gray-200 rounded-full px-4 py-2 ${isMobile ? 'text-[10px]' : 'text-[10px]'} focus:outline-none focus:ring-1 focus:ring-gray-300 pr-16`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <div className="relative">
              <button 
                type="button" 
                className="text-gray-400"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <i className='bx bx-smile'></i>
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
                ${isMobile ? 'text-sm' : 'text-[10px]'} 
                ${comment.trim() ? 'text-black' : 'text-gray-400'}
              `}
              disabled={!comment.trim()}
            >
              <Send className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
            </button>

          </div>
        </div>
      </form>
      <ReportOptionsPopup
        isOpen={showReportOptions}
        onClose={() => setShowReportOptions(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default CommentSection;
