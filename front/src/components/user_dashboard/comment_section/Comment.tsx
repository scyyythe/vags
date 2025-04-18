import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MoreHorizontal, Send, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Comment {
  id: string;
  user: string;
  userImage: string;
  text: string;
  likes: number;
  timestamp: string;
  parentId?: string;
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

  useEffect(() => {
    const initialComments = [{
      id: 'comment1',
      user: "Jai Anoba",
      userImage: "https://i.pravatar.cc/150?img=3",
      text: "I love it!",
      likes: 90,
      timestamp: new Date().toISOString()
    }];
  
    setComments(initialComments);
  
    const initialLikes: { [commentId: string]: number } = {};
    initialComments.forEach(comment => {
      initialLikes[comment.id] = comment.likes;
    });
  
    setCommentLikes(initialLikes);
  }, []);
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment: Comment = {
        id: `c${comments.length + 1}`,
        user: "You",
        userImage: "https://i.pravatar.cc/150?img=5",
        text: comment,
        likes: 0,
        timestamp: new Date().toISOString(),
        parentId: replyingTo || undefined
      };
  
      setComments([...comments, newComment]);
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
  
    // Update the like count
    setCommentLikes(prevLikes => ({
      ...prevLikes,
      [commentId]: (prevLikes[commentId] || 0) + (isLiked ? -1 : 1),
    }));
  
    // Toggle like status
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
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      toast.success(`Blocked user ${comment.user}`);
      // Here you would typically call an API to block the user
    }
    toggleCommentMenu(commentId);
  };

  const handleReportContent = (commentId: string) => {
    toast.success("Content reported");
    // Here you would typically call an API to report the content
    toggleCommentMenu(commentId);
  };

  const handleReply = (commentId: string) => {
    const parentComment = comments.find(c => c.id === commentId);
    if (parentComment) {
      setReplyingTo(commentId);
      setComment(`@${parentComment.user} `);
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setComment(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className={`mb-6 relative ${comment.parentId ? 'ml-8' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Avatar className={`${isMobile ? 'h-6 w-6' : 'h-3 w-3'} mr-2`}>
            <AvatarImage src={comment.userImage} alt={comment.user} />
            <AvatarFallback>{comment.user.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div>
            <p className={`${isMobile ? 'text-xs' : 'text-[9px]'} font-semibold`}>{comment.user}</p>
            <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-700 mt-1`}>{comment.text}</p>

            <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-[9px]'} text-gray-500 mt-1`}>
              <span>{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span>
              <span>·</span>
              <button onClick={() => handleReply(comment.id)} className="hover:underline text-gray-500 flex items-center gap-1">
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
                  <MoreHorizontal size={isMobile ? 14 : 12} />
                </button>

                {commentMenus[comment.id] && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                    <button
                      className={`w-full text-left px-3 py-2 ${isMobile ? 'text-xs' : 'text-[8px]'} hover:bg-gray-100`}
                      onClick={() => handleBlockUser(comment.id)}
                    >
                      Block User
                    </button>
                    <button
                      className={`w-full text-left px-3 py-2 ${isMobile ? 'text-xs' : 'text-[9px]'} hover:bg-gray-100`}
                      onClick={() => handleReportContent(comment.id)}
                    >
                      Report Content
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Display Comments */}
      {comments.map(comment => renderComment(comment))}

      {/* Add comment form */}
      <form onSubmit={handleCommentSubmit} className="relative">
        {replyingTo && (
          <div className="mb-2">
            <span className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-500`}>
              Replying to comment - click to cancel
              <button 
                onClick={() => {
                  setReplyingTo(null);
                  setComment("");
                }}
                className="ml-2 text-blue-500 hover:underline"
              >
                ×
              </button>
            </span>
          </div>
        )}
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={`w-full border border-gray-200 rounded-full px-4 py-2 ${isMobile ? 'text-sm' : 'text-[10px]'} focus:outline-none focus:ring-1 focus:ring-gray-300 pr-16`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
          <div className="relative">
            <button 
              type="button" 
              className="text-gray-400"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-10 right-0 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className={`${isMobile ? 'text-sm' : 'text-[10px]'} text-gray-400`} 
            disabled={!comment.trim()}
          >
            <Send className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
