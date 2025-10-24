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
import ExhibitCardDetailSkeleton from "@/components/skeletons/exhibits/ExhibitCardDetail";
import Gallery3D from "@/components/gallery/Gallery3D";
import { useExhibitLike } from "@/hooks/interactions/exhibit_like/useExhibitLike";
import { useExhibitCards } from "@/hooks/exhibit/useCardExihibit";
import { getLoggedInUserId } from "@/auth/decode";
import Menu from "@/components/user_dashboard/own_profile/menu/exhibit_card/Menu";
import { useDeleteExhibit } from "@/hooks/exhibit/useDeleteExhibit";
import useExhibitReport from "@/hooks/mutate/report/useExhibitReport";
import useExhibitReportStatus from "@/hooks/mutate/report/useExhibitReportStatus";
import { useToggleHideExhibit } from "@/hooks/exhibit/useToggleHideExhibit";
import { useToggleVisibilityExhibit } from "@/hooks/exhibit/useToggleVisibilityExhibit";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
const ExhibitViewing = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const { data: exhibit, isLoading } = useExhibitCardDetail(id);
  const { data: exhibits = [] } = useExhibitCards();
  const loggedInUserId = getLoggedInUserId();
  const isOwner = loggedInUserId === exhibit?.ownerId;
  const isExhibitEnded = exhibit?.endDate ? new Date() > new Date(exhibit.endDate) : false;

  const { isLiked, likeCount, toggleLike } = useExhibitLike(
    id ?? "",
    exhibit?.user_has_liked_exhibit ?? false,
    exhibit?.exhibit_likes_count ?? 0
  );
  const { mutate: deleteExhibit } = useDeleteExhibit();
  const { mutate: submitExhibitReport } = useExhibitReport();
  const { mutate: toggleHideExhibit } = useToggleHideExhibit();
  const { mutate: toggleVisibilityExhibit } = useToggleVisibilityExhibit();
  // const { likedArtworks, likeCounts, toggleLike } = useContext(LikedArtworksContext);
  // const isLiked = likedArtworks[id] || false;
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

  // Translation hooks
  const artworkNotFoundText = useAutoTranslation("Artwork Not Found", language);
  const artworkNotFoundDescText = useAutoTranslation("The artwork you're looking for doesn't exist or has been removed.", language);
  const returnToHomeText = useAutoTranslation("Return to Home", language);
  const exhibitDetailsText = useAutoTranslation("Exhibit Details", language);
  const exploreGalleryText = useAutoTranslation("Explore Gallery", language);
  const byText = useAutoTranslation("by", language);
  const noDescriptionText = useAutoTranslation("No description available.", language);
  const showLessText = useAutoTranslation("Show Less", language);
  const showMoreText = useAutoTranslation("Show More", language);
  const exhibitEndedText = useAutoTranslation("This exhibit has ended. Commenting is disabled.", language);
  const relatedExhibitsText = useAutoTranslation("Related Exhibits", language);
  const noRelatedExhibitsText = useAutoTranslation("No related exhibits found.", language);
  const commentPostedText = useAutoTranslation("Comment posted", language);
  const artworkHiddenText = useAutoTranslation("Artwork hidden", language);
  const artworkReportedText = useAutoTranslation("Artwork reported", language);
  const artworkReportRemovedText = useAutoTranslation("Artwork report removed", language);
  const replyText = useAutoTranslation("Reply", language);
  const hideText = useAutoTranslation("Hide", language);
  const viewText = useAutoTranslation("View", language);
  const replyLowerText = useAutoTranslation("reply", language);
  const repliesText = useAutoTranslation("replies", language);
  const blockUserText = useAutoTranslation("Block User", language);
  const blockedUserText = useAutoTranslation("Blocked user", language);
  const reportContentText = useAutoTranslation("Report Content", language);
  const contentReportedText = useAutoTranslation("Content reported", language);
  const deleteConfirmText = useAutoTranslation("Are you sure you want to delete this exhibit?", language);
  const exhibitDeletedText = useAutoTranslation("Exhibit deleted successfully", language);
  
  // Dynamic content translations
  const translatedTitle = useAutoTranslation(exhibit?.title || "", language);
  const translatedDescription = useAutoTranslation(exhibit?.description || "", language);
  const translatedOwnerName = useAutoTranslation(exhibit?.owner?.name || "", language);

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
      toast(commentPostedText, { closeButton: true });
      setComment("");
    }
  };

  const handleHide = () => {
    setIsHidden(true);
    toast(artworkHiddenText, { closeButton: true });
    setMenuOpen(false);
  };

  // const handleLike = () => {
  //   if (id) {
  //     toggleLike(id);
  //   }
  // };

  const handleReport = () => {
    setIsReported(!isReported);
    toast(isReported ? artworkReportRemovedText : artworkReportedText, { closeButton: true });
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{artworkNotFoundText}</h2>
          <p className="mb-8 text-xs text-gray-600 dark:text-gray-300">{artworkNotFoundDescText}</p>
          <Link to="/explore" className="text-red-600 dark:text-red-400 text-xs hover:underline">
            {returnToHomeText}
          </Link>
        </div>
      </div>
    );
  }

  const renderComment = (commentItem: any, isReply = false) => (
    <div key={commentItem.id} className={`mb-6 relative ${isReply ? "ml-8 pl-4 border-l border-gray-200 dark:border-gray-600" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Avatar className={`${isMobile ? "h-6 w-6" : "h-3 w-3"} mr-2`}>
            <AvatarImage src={commentItem.userImage} alt={commentItem.user} />
            <AvatarFallback>{commentItem.user.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div>
            <p className={`${isMobile ? "text-xs" : "text-[9px]"} font-semibold text-gray-900 dark:text-gray-100`}>{commentItem.user}</p>
            <p className={`${isMobile ? "text-xs" : "text-[10px]"} text-gray-700 dark:text-gray-300 mt-1`}>{commentItem.text}</p>

            <div className={`flex items-center gap-2 ${isMobile ? "text-xs" : "text-[9px]"} text-gray-500 dark:text-gray-400 mt-1`}>
              <span>{formatDistanceToNow(new Date(commentItem.timestamp), { addSuffix: true })}</span>
              <span>·</span>
              <button
                onClick={() => handleReply(commentItem.id)}
                className="hover:underline text-gray-500 dark:text-gray-400 flex items-center gap-1"
              >
                <Reply size={isMobile ? 12 : 10} />
                {replyText}
              </button>
              <span>·</span>
              <button onClick={() => handleCommentLike(commentItem.id)} className="flex items-center gap-1">
                <Heart
                  size={isMobile ? 12 : 10}
                  className={likedComments[commentItem.id] ? "text-red-500 fill-red-500" : "text-gray-500 dark:text-gray-400"}
                  fill={likedComments[commentItem.id] ? "currentColor" : "none"}
                />
                {commentLikes[commentItem.id] || commentItem.likes || 0}
              </button>

              <div className="relative ml-1">
                <button
                  onClick={() => toggleCommentMenu(commentItem.id)}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  <MoreHorizontal size={isMobile ? 14 : 12} />
                </button>

                {commentMenus[commentItem.id] && (
                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
                    <button
                      className={`w-full text-left px-3 py-2 ${isMobile ? "text-xs" : "text-[8px]"} hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100`}
                      onClick={() => {
                        toast.success(`${blockedUserText} ${commentItem.user}`, { closeButton: true });
                        toggleCommentMenu(commentItem.id);
                      }}
                    >
                      {blockUserText}
                    </button>
                    <button
                      className={`w-full text-left px-3 py-2 ${isMobile ? "text-xs" : "text-[9px]"} hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100`}
                      onClick={() => {
                        toast.success(contentReportedText, { closeButton: true });
                        toggleCommentMenu(commentItem.id);
                      }}
                    >
                      {reportContentText}
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
            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-[10px] flex items-center gap-1"
          >
            {expandedComments[commentItem.id] ? hideText : viewText} {commentItem.replies.length}{" "}
            {commentItem.replies.length === 1 ? replyLowerText : repliesText}
          </button>
        </div>
      )}

      {!isReply && commentItem.replies && expandedComments[commentItem.id] && (
        <div className="mt-4">{commentItem.replies.map((reply: any) => renderComment(reply, true))}</div>
      )}
    </div>
  );

  if (!exhibit) {
    return <ExhibitCardDetailSkeleton />;
  }

  const closeExpandedView = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <div className="min-h-screen dark:bg-gray-900 pb-1">
        <Header />

          <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 pb-0">
            {/* Back button */}
          <div className={`mt-8 md:mt-12 ${isMobile ? "px-4 pt-8" : "md:ml-12"}`}>
            <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
              <i className="bx bx-chevron-left text-lg mr-2"></i>
              {exhibitDetailsText}
            </button>
          </div>

          <div className={` ${isMobile ? "flex flex-col" : "flex justify-center items-start space-x-2 mt-2"}`}>
            {/* Exhibit */}
            <div className={`${isMobile ? "w-full" : "flex justify-center items-start gap-1"}`}>
              {/* Artwork container */}
              <div className={`relative mr-8 ${isMobile ? "w-full" : "w-full max-w-[580px] min-w-[400px]"}`}>
                {/* Center - Artwork Image */}
                <div className={`relative z-0 mt-8 ${isMobile ? "px-4" : ""}`}>
                  <div className={`relative ${isMobile ? "w-full" : "inline-block -mb-6"}`}>
                    <div
                      className={`${
                        isMobile
                          ? "-mt-4"
                          : "w-[580px] h-[420px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl -mt-4"
                      }`}
                    >
                      <div className="w-full h-[420px] relative rounded-xl overflow-hidden bg-black">
                        <Gallery3D slotArtworkMap={exhibit?.slotArtworkMap || {}} artworks={exhibit?.artworks || []} />
                      </div>

                      {/* Expand Button Container */}
                      <div
                        className={`absolute bottom-3 right-3 ${isMobile ? "" : "z-10"} flex flex-col items-end gap-3`}
                      >
                        {/* Expand Icon */}
                        <div
                          className="group flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] hover:w-[120px] hover:pl-4 transition-[width,padding] ease-in-out duration-700 cursor-pointer"
                          onClick={() => setIsExpanded(true)}
                        >
                          <i className="bx bx-cube-alt text-[13px] mr-[6px] dark:text-black"></i>
                          <span className="mr-2 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ease-in-out duration-700 dark:text-black">
                            {exploreGalleryText}
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
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          if (!isExhibitEnded) toggleLike();
                        }}
                        disabled={isExhibitEnded}
                        className={`flex items-center space-x-1 rounded-3xl py-1.5 px-3 border ${
                          isExhibitEnded ? "cursor-not-allowed opacity-60 bg-gray-100 dark:bg-gray-700" : "text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <Heart
                          size={13}
                          className={isLiked ? "text-red-600 fill-red-600" : "text-gray-800 dark:text-gray-200"}
                          fill={isLiked ? "currentColor" : "none"}
                        />
                        {likeCount > 0 && <span className="text-[10px] text-gray-800 dark:text-gray-200">{likeCount}</span>}
                      </button>

                      {/* Views */}
                      <div className="flex items-center space-x-1 rounded-3xl py-1.5 px-3 border border-gray-200 dark:border-gray-600">
                        <i className="bx bx-show text-[15px] text-gray-800 dark:text-gray-200"></i>
                        <span className="text-[10px] text-gray-800 dark:text-gray-200">{exhibit.views}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <button className="py-3 mr-3 text-gray-500 dark:text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
                        <MoreHorizontal size={isMobile ? 14 : 14} />
                      </button>

                      {menuOpen && (
                        <>
                          {isOwner ? (
                            <Menu
                              isOpen={menuOpen}
                              artworkId={exhibit.id}
                              artworkTitle={exhibit.title}
                              isShared={exhibit.isShared}
                              isPublic={true}
                              onEdit={(id) => {
                                const searchParams = new URLSearchParams({ mode: "edit" });
                                navigate(`/edit-exhibit/${id}?${searchParams.toString()}`);
                              }}
                              onToggleVisibility={(newVisibility, id) => toggleVisibilityExhibit(id)}
                              onViewInsights={(id) => console.log("View insights for:", id)}
                              onDelete={(id) => {
                                if (confirm(deleteConfirmText)) {
                                  deleteExhibit(id, {
                                    onSuccess: (data) => {
                                      toast.success(exhibitDeletedText);
                                    },
                                  });
                                }
                              }}
                              className="-left-2 top-7"
                            />
                          ) : (
                            <ExhibitMenu
                              exhibitId={exhibit.id}
                              isOpen={menuOpen}
                              onHide={handleHide}
                              onReport={handleReport}
                              onUndoReport={handleReport}
                              isReported={isReported}
                              isShared={exhibit.isShared}
                              isHidden={isHidden}
                              className="-left-[10px] top-7"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <h1 className={`${isMobile ? "text-lg" : "text-md"} font-bold mb-2 text-gray-900 dark:text-gray-100`}>
                    {translatedTitle || exhibit.title || "The Distorted Face"}
                  </h1>

                  <p
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/userprofile/${exhibit.artistId}`)}
                    className={`${isMobile ? "text-xs" : "text-[10px]"} text-gray-600 dark:text-gray-300 mb-4`}
                  >
                    {byText} {translatedOwnerName || exhibit.owner.name || "Angel Ganev"}
                  </p>

                  <div className="relative mt-4">
                    <div
                      ref={descriptionRef}
                      className="text-[10px] text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out h-[100px] overflow-y-auto"
                      style={{ lineHeight: "1.1rem" }}
                    >
                      {translatedDescription || exhibit.description || noDescriptionText}
                    </div>

                    {isOverflowing && (
                      <button
                        onClick={() => setShowFullDescription((prev) => !prev)}
                        className="text-[9px] text-blue-500 dark:text-blue-400 hover:underline mt-1 block"
                      >
                        {showFullDescription ? showLessText : showMoreText}
                      </button>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Comment Section */}
                  {isExhibitEnded ? (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                      {exhibitEndedText}
                    </div>
                  ) : (
                    <CommentSection artworkId={id} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Artworks Section */}
        {exhibit && exhibit.category && exhibits && exhibits.length > 0 && (
          <div className="container md:px-6 mt-4 mb-6">
            <h2 className={`font-medium text-gray-900 dark:text-gray-100 ${isMobile ? "text-xs ml-1 mb-4" : "text-xs mb-4 -mt-4"}`}>{relatedExhibitsText}</h2>

            {(() => {
              const normalizedCategory = exhibit.category.trim().toLowerCase();

              const relatedExhibits = exhibits.filter((e) => {
                const eCategory = e.category?.trim().toLowerCase();
                return e.id !== exhibit.id && eCategory === normalizedCategory;
              });

              return relatedExhibits.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedExhibits.map((card) => (
                    <ExhibitCard
                      key={card.id}
                      exhibit={{
                        ...card,
                        category: card.category.charAt(0).toUpperCase() + card.category.slice(1),
                      }}
                      onClick={() => navigate(`/view-exhibit/${card.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-32 w-full">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{noRelatedExhibitsText}</p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Expanded artwork view */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black z-[100] flex justify-center items-center"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsExpanded(false);
              }
            }}
            tabIndex={0}
          >
            <div className="absolute inset-0 z-[100]">
              <Gallery3D slotArtworkMap={exhibit.slotArtworkMap || {}} artworks={exhibit.artworks || []} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ExhibitViewing;
