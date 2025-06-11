import { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, MoreHorizontal, Reply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LikedArtworksContext } from "@/context/LikedArtworksProvider";
import ExhibitMenu from "@/components/user_dashboard/Exhibit/menu/ExhibitMenu";
import Header from "@/components/user_dashboard/navbar/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "@/components/user_dashboard/Explore/comment_sec/Comment";
import useFavorite from "@/hooks/interactions/useFavorite";
import ExhibitCard from "@/components/user_dashboard/Exhibit/card/ExhibitCard";
import { useExhibitCardDetail } from "@/hooks/exhibit/useCardDetail";
const ExhibitViewing = () => {
  const { id } = useParams<{ id: string }>();

  const {data:exhibit, isLoading}=useExhibitCardDetail(id);

  const { likedArtworks, likeCounts, toggleLike } = useContext(LikedArtworksContext);
  const isLiked = likedArtworks[id] || false;
  const { isFavorite, handleFavorite: toggleFavorite } = useFavorite(id);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [viewAll] = useState(false);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const [isReported, setIsReported] = useState(false);

  const [commentLikes, setCommentLikes] = useState<{ [commentId: string]: number }>({});
  const [likedComments, setLikedComments] = useState<{ [commentId: string]: boolean }>({});
  const [commentMenus, setCommentMenus] = useState<{ [commentId: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: `c${Date.now()}`,
        user: "You",
        userImage: "https://i.pravatar.cc/150?img=5",
        text: comment,
        likes: 0,
        timestamp: new Date().toISOString(),
        replies: [],
      };

      setComments((prev) => [...prev, newComment]);
      setCommentLikes((prev) => ({
        ...prev,
        [newComment.id]: 0,
      }));
      toast("Comment posted");
      setComment("");
    }
  };

  const handleHide = () => {
    setIsHidden(true);
    toast("Artwork hidden");
    setMenuOpen(false);
  };

  const handleLike = () => {
    if (id) {
      toggleLike(id);
    }
  };

  const handleReport = () => {
    setIsReported(!isReported);
    toast(isReported ? "Artwork report removed" : "Artwork reported");
    setMenuOpen(false);
  };

  const handleFavorite = () => {
    toggleFavorite();
    setMenuOpen(false);
  };
  const toggleDetailsPanel = () => {
    setIsDetailOpen(!isDetailOpen);
  };

  const handleCommentLike = (commentId: string) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + (likedComments[commentId] ? -1 : 1),
    }));
  };

  const toggleCommentMenu = (commentId: string) => {
    setCommentMenus((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReply = (commentId: string) => {
    const parentComment = comments.find((c) => c.id === commentId);
    if (parentComment) {
      setComment(`@${parentComment.user} `);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const onEmojiClick = (event: React.MouseEvent<Element, MouseEvent>, emojiObject: { emoji: string }) => {
    setComment((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4">Artwork Not Found</h2>
          <p className="mb-8 text-xs">The artwork you're looking for doesn't exist or has been removed.</p>
          <Link to="/explore" className="text-red-600 text-xs hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const renderComment = (commentItem: any, isReply = false) => (
    <div key={commentItem.id} className={`mb-6 relative ${isReply ? "ml-8 pl-4 border-l border-gray-200" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Avatar className={`${isMobile ? "h-6 w-6" : "h-3 w-3"} mr-2`}>
            <AvatarImage src={commentItem.userImage} alt={commentItem.user} />
            <AvatarFallback>{commentItem.user.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div>
            <p className={`${isMobile ? "text-xs" : "text-[9px]"} font-semibold`}>{commentItem.user}</p>
            <p className={`${isMobile ? "text-xs" : "text-[10px]"} text-gray-700 mt-1`}>{commentItem.text}</p>

            <div className={`flex items-center gap-2 ${isMobile ? "text-xs" : "text-[9px]"} text-gray-500 mt-1`}>
              <span>{formatDistanceToNow(new Date(commentItem.timestamp), { addSuffix: true })}</span>
              <span>·</span>
              <button
                onClick={() => handleReply(commentItem.id)}
                className="hover:underline text-gray-500 flex items-center gap-1"
              >
                <Reply size={isMobile ? 12 : 10} />
                Reply
              </button>
              <span>·</span>
              <button onClick={() => handleCommentLike(commentItem.id)} className="flex items-center gap-1">
                <Heart
                  size={isMobile ? 12 : 10}
                  className={likedComments[commentItem.id] ? "text-red-500 fill-red-500" : "text-gray-500"}
                  fill={likedComments[commentItem.id] ? "currentColor" : "none"}
                />
                {commentLikes[commentItem.id] || commentItem.likes || 0}
              </button>

              <div className="relative ml-1">
                <button
                  onClick={() => toggleCommentMenu(commentItem.id)}
                  className="p-1 text-gray-500 hover:text-black"
                >
                  <MoreHorizontal size={isMobile ? 14 : 12} />
                </button>

                {commentMenus[commentItem.id] && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                    <button
                      className={`w-full text-left px-3 py-2 ${isMobile ? "text-xs" : "text-[8px]"} hover:bg-gray-100`}
                      onClick={() => {
                        toast.success(`Blocked user ${commentItem.user}`);
                        toggleCommentMenu(commentItem.id);
                      }}
                    >
                      Block User
                    </button>
                    <button
                      className={`w-full text-left px-3 py-2 ${isMobile ? "text-xs" : "text-[9px]"} hover:bg-gray-100`}
                      onClick={() => {
                        toast.success("Content reported");
                        toggleCommentMenu(commentItem.id);
                      }}
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

      {!isReply && commentItem.replies && commentItem.replies.length > 0 && (
        <div className="mt-2 ml-8">
          <button
            onClick={() => toggleReplies(commentItem.id)}
            className="text-blue-500 hover:text-blue-600 text-[10px] flex items-center gap-1"
          >
            {expandedComments[commentItem.id] ? "Hide" : "View"} {commentItem.replies.length}{" "}
            {commentItem.replies.length === 1 ? "reply" : "replies"}
          </button>
        </div>
      )}

      {!isReply && commentItem.replies && expandedComments[commentItem.id] && (
        <div className="mt-4">{commentItem.replies.map((reply: any) => renderComment(reply, true))}</div>
      )}
    </div>
  );

  // Mock data for exhibits
  const mockExhibits = [
    {
      id: "1",
      title: "Code and Canvas",
      description: "Blending technology and creativity, the modern balance between digital algorithms — how AI can enhance and digital creativity.",
      image: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Digital Art",
      likes: 125,
      views: 1.5,
      isSolo: true,
      isShared: false,
    },
    {
      id: "2",
      title: "Beyond the Frame",
      description: "A collection of modern works that defy traditions, challenge norms, and break outside of the frame. Three pieces.",
      image: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Contemporary Art",
      likes: 118,
      views: 1.4,
      isSolo: false,
      isShared: false,
      collaborators: [
        { id: '1', name: 'Mark Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '2', name: 'Sara Williams', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '3', name: 'John Parker', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      ],
    },
    {
      id: "3",
      title: "Through the Lens of Now",
      description: "A visual journey of fleeting moments, raw emotions, and untold stories. These photographs freeze time and light.",
      image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Photography",
      likes: 94,
      views: 1.3,
      isSolo: true,
      isShared: false,
    },
    {
      id: "4",
      title: "Words in Motion",
      description: "This segment celebrates the power of the written word — poems, short stories, and excerpts that provoke thought.",
      image: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Literature",
      likes: 85,
      views: 1.1,
      isSolo: false,
      isShared: false,
      collaborators: [
        { id: '4', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '5', name: 'David Lee', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '6', name: 'Alice Wong', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      ],
    },
    {
      id: "5",
      title: "Urban Expressions",
      description: "Street art and urban culture collide in this vibrant collection of works from city artists around the world.",
      image: "https://images.unsplash.com/photo-1551913902-c92207136625?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Street Art",
      likes: 132,
      views: 1.7,
      isSolo: true,
      isShared: false,
    },
    {
      id: "6",
      title: "Abstract Realities",
      description: "Exploring the boundary between perception and reality through abstract forms and experimental techniques.",
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Abstract Art",
      likes: 107,
      views: 1.2,
      isSolo: false,
      isShared: false,
      collaborators: [
        { id: '7', name: 'Thomas White', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '8', name: 'Rebecca Smith', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '9', name: 'Michael Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      ],
    },
    {
      id: "7",
      title: "Cultural Heritage",
      description: "A celebration of traditional art forms and techniques passed down through generations of artisans.",
      image: "https://i.pinimg.com/736x/a1/a8/42/a1a842b4254e1c79b2491caa0f5520e1.jpg",
      category: "Traditional Art",
      likes: 99,
      views: 1.0,
      isSolo: true,
      isShared: false,
    },
    {
      id: "8",
      title: "Nature's Canvas",
      description: "Environmental art that showcases the beauty of natural landscapes and raises awareness about conservation.",
      image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Environmental Art",
      likes: 114,
      views: 1.3,
      isSolo: false,
      isShared: false,
      collaborators: [
        { id: '10', name: 'Jennifer Kim', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '11', name: 'Robert Davis', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '12', name: 'Sophie Miller', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      ],
    }
  ];

  // useEffect(() => {
  //   const found = mockExhibits.find((exhibit) => exhibit.id === id);
  //   if (found) {
  //     setExhibit(found);
  //   }
  // }, [id]);

  if (!exhibit) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500 text-sm">Loading exhibit...</p>
      </div>
    );
  }

  const closeExpandedView = () => {
    setIsExpanded(false);
  };

  return (
    <>
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Back button */}
        <div className={`mt-8 md:mt-12 ${isMobile ? "px-4 pt-8" : "md:ml-12"}`}>
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Go back
          </button>
        </div>

        <div className={` ${isMobile ? "flex flex-col" : "flex justify-center items-start space-x-2 mt-2"}`}>
          {/* Exhibit */}
          <div
            className={`${
              isMobile ? "w-full" : "flex justify-center items-start gap-1"
            }`}
          >
            {/* Artwork container */}
            <div className={`relative mr-8 ${isMobile ? "w-full" : "w-full max-w-[580px] min-w-[400px]"}`}>

              {/* Center - Artwork Image */}
              <div className={`relative z-0 mt-8 ${isMobile ? "px-4" : ""}`}>

                <div className={`relative ${isMobile ? "w-full" : "inline-block -mb-6"}`}>
                  <div className={`${isMobile ? "" : "w-[580px] h-[420px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl -mt-4"}`}>
                    <img
                      src={exhibit.image}
                      alt={exhibit.title}
                      className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
                    />

                    {/* Expand Button Container */}
                    <div
                      className={`absolute bottom-3 right-3 ${isMobile ? "" : "z-10"} flex flex-col items-end gap-3`}
                    >
                      {/* Expand Icon */}
                      <div
                        className="group flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] hover:w-[90px] hover:pl-4 transition-[width,padding] ease-in-out duration-700 cursor-pointer"
                        onClick={() => setIsExpanded(true)}
                      >
                        <i className="bx bx-expand-alt text-[12px] mr-[6px]"></i>
                        <span className="mr-3 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ease-in-out duration-700">
                          Expand
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Title, artist, description, comments */}
            <div className={`${isMobile ? "w-full mt-6 px-4" : "w-[530px] "}`}>
              <div className={`${isMobile ? "" : "relative top-5"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleLike}
                      className="flex items-center space-x-1 text-gray-800 rounded-3xl py-1.5 px-3 border border-gray-200"
                    >
                      <Heart
                        size={isMobile ? 13 : 13}
                        className={isLiked ? "text-red-600 fill-red-600" : "text-gray-800"}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                      {(likeCounts[id || ""] ?? exhibit.likes ?? 0) > 0 && (
                        <span className={`${isMobile ? "text-[10px]" : "text-[10px]"}`}>
                          {likeCounts[id || ""] ?? exhibit.likes}
                        </span>
                      )}
                    </button>

                    {/* Views */}
                    <div className="flex items-center space-x-1 rounded-3xl py-1.5 px-3 border border-gray-200">
                        <i className="bx bx-show text-[15px]"></i>
                        <span className="text-[10px]">{exhibit.views}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <button className="py-3 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
                      <MoreHorizontal size={isMobile ? 14 : 14} />
                    </button>

                    <ExhibitMenu
                      isOpen={menuOpen}
                      onHide={handleHide}
                      onReport={handleReport}
                      onUndoReport={handleReport}
                      isReported={isReported}
                      isShared = {exhibit.isShared}
                      isHidden={isHidden}
                    />
                  </div>
                </div>

                <h1 className={`${isMobile ? "text-lg" : "text-md"} font-bold mb-2`}>
                  {exhibit.title || "The Distorted Face"}
                </h1>

                <p
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/userprofile/${exhibit.artistId}`)}
                  className={`${isMobile ? "text-xs" : "text-[10px]"} text-gray-600 mb-4`}
                >
                  by {exhibit.artist || "Angel Ganev"}
                </p>

                <div className="relative mt-4">
                  <div
                    ref={descriptionRef}
                    className={`
                      text-[9px] text-gray-700 transition-all duration-300 ease-in-out 
                      ${showFullDescription ? "max-h-10 overflow-y-auto pr-1" : "max-h-10 overflow-hidden"}
                    `}
                    style={{ lineHeight: "1.1rem" }}
                  >
                    {exhibit.description || "No description available."}
                  </div>

                  {isOverflowing && (
                    <button
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="text-[9px] text-blue-500 hover:underline mt-1 block"
                    >
                      {showFullDescription ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Comment Section */}
                <CommentSection artworkId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Artworks Section */}
      {(() => {
        const related = mockExhibits.filter((e) => e.id !== id); // or use your own logic

        const filteredRelated = related.filter(
          (card) =>
            card.id !== id &&
            card.category?.trim().toLowerCase() === exhibit.category?.trim().toLowerCase()
        );

        return (
          related.length > 0 && (
            <div className="container md:px-6 mt-2 mb-2">
              <h2 className={`font-medium ${isMobile ? "text-xs ml-1" : "text-xs mb-4"}`}>Related Exhibits</h2>
              {filteredRelated && filteredRelated.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredRelated.map((card) => (
                    <ExhibitCard key={card.id} exhibit={card} onClick={() => navigate(`/view-exhibit/${card.id}`)} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-32 w-full">
                  <p className="text-gray-500 text-xs mb-2">No related exhibits found.</p>
                </div>
              )}
            </div>
          )
        );
      })()}

      {/* Expanded artwork view */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center overflow-hidden">
          <button
            onClick={closeExpandedView}
            className="absolute top-4 right-6 z-[60] bg-white rounded-full px-1 shadow-md transition-colors duration-200"
            >
            <i className="bx bx-x text-xl text-black"></i>
          </button>

          <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
            <img src={exhibit.image} alt="Expanded artwork" className="max-h-[80vh] max-w-[90vw] object-contain" />
          </div>
        </div>
      )}
    </div>
    
    </>
  );
};

export default ExhibitViewing;
