import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import BidMenu from "@/components/user_dashboard/Bidding/cards/BidMenu";
import OwnerBidMenu from "@/components/user_dashboard/own_profile/menu/bid_card/Menu";
import BidPopup from "../place_bid/BidPopup";
import Header from "@/components/user_dashboard/navbar/Header";
import { useArtworkContext } from "@/context/ArtworkContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import BidDetailsSkeleton from "@/components/skeletons/bidding/BidDetailsSkeleton";
import { useFetchBiddingArtworkById } from "@/hooks/auction/useFetchAuctionDetails";
import AuctionCountdown from "@/hooks/count/AuctionCountDown";

import BidCard from "@/components/user_dashboard/Bidding/cards/BidCard";
import useArtworkStatus from "@/hooks/interactions/useArtworkStatus";
import { useBidHistory } from "@/hooks/bid/useBidHistory";
import { getLoggedInUserId } from "@/auth/decode";
import useAuctions from "@/hooks/auction/useAuction";
import { useAuctionLike } from "@/hooks/interactions/auction_like/useAuctionLike";
import useAuctionSubmitReport from "@/hooks/mutate/report/useReportBid";
import useBidReportStatus from "@/hooks/mutate/report/useReportBidStatus";
import { reportCategories } from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import { useAuctionActions } from "@/hooks/auction/useAuctionActions";
import { useRestoreAuction } from "@/hooks/auction/useRestoreAuction";
import { getArtworkImageUrl } from "@/utils/imageUtils";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { autoTranslate } from "@/utils/autoTranslate";
import useRealTimeBids from "@/hooks/bid/useRealTimeBids";

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000_000_000_000) {
    return (amount / 1_000_000_000_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "Q";
  } else if (amount >= 1_000_000_000_000_000) {
    return (amount / 1_000_000_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "q";
  } else if (amount >= 1_000_000_000_000) {
    return (amount / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "T";
  } else if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "B";
  } else if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  } else if (amount >= 1_000) {
    return (amount / 1_000).toFixed(2).replace(/\.?0+$/, "") + "K";
  } else {
    return amount.toString();
  }
}

export interface BidCardData {
  id: string;
  title: string;
  currentBid: number;
  end_time: string;
  imageUrl: string;
  highestBid: number;
  viewers: string[];
  user_has_liked_auction: boolean;
  auction_likes_count: number;
}

// Component for bid item with translation
const BidItem = ({
  bid,
  byText,
  isOwner,
  formatBidDate,
  isMobile = false,
}: {
  bid: any;
  byText: string;
  isOwner: boolean;
  formatBidDate: (dateString: string) => string;
  isMobile?: boolean;
}) => {
  const { language } = useLanguage();
  const isAnonymous = bid.identity_type === "anonymous";
  const profilePicture = !isAnonymous && bid.user?.profile_picture ? bid.user.profile_picture : null;
  const avatarLetter = (bid.bidderFullName?.charAt(0) || "A").toUpperCase();

  // Translate bidder name
  const translatedBidderName = useAutoTranslation(bid.bidderFullName || "", language);

  const sizeClass = isMobile ? "w-5 h-5" : "w-4 h-4";
  const textSizeClass = isMobile ? "text-[10px]" : "text-[8px]";

  return (
    <div key={bid.id || bid.timestamp} className="flex items-center gap-2">
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={translatedBidderName || "Bidder"}
          className={`${sizeClass} rounded-full object-cover border`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-gray-300 flex items-center justify-center ${textSizeClass} font-semibold text-gray-700 border`}
        >
          {avatarLetter}
        </div>
      )}
      <div>
        <span className="font-semibold text-[11px] mr-1">
          <i className="bx bx-money text-[8px] text-gray-400"></i> {formatAmount(bid.amount)}
        </span>
        <span className="flex gap-1 text-[9px] text-gray-500 -mt-1">
          {byText} <p className="font-medium text-gray-700">{translatedBidderName}</p>
          {isOwner && isMobile && <span className="ml-1 text-[9px] text-gray-400">{formatBidDate(bid.timestamp)}</span>}
        </span>
      </div>
    </div>
  );
};

const BidDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: item, isLoading } = useFetchBiddingArtworkById(id!);
  const { data: allAuctions = [] } = useAuctions(1);
  const { data: reportInfo, isError } = useBidReportStatus(id);
  const [isReported, setIsReported] = useState(false);

  useEffect(() => {
    if (reportInfo?.reported !== undefined) {
      setIsReported(reportInfo.reported);
    }
  }, [reportInfo]);

  const { toggleLike } = useAuctionLike(id!, item?.user_has_liked_auction ?? false, item?.auction_likes_count ?? 0);

  const [views, setViews] = useState<number>(0);
  const [showBidPopup, setShowBidPopup] = useState(false);
  const location = useLocation();
  const artwork = location.state?.artwork || item?.artwork;

  const { artworks } = useArtworkContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const navigate = useNavigate();

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const [showReportOptions, setShowReportOptions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const artworkId = item?.artwork?.id ?? null;
  const artworkIds = artworks?.map((a) => a.id) || [];
  const { data } = useArtworkStatus(artworkIds);
  const { mutate: submitAuctionReport } = useAuctionSubmitReport();

  const { data: bids = [], error } = useBidHistory(artworkId);

  // Real-time bids hook for live updates
  const { hasNewBids, refreshBids } = useRealTimeBids(artworkId);

  // Owner menu hooks
  const { closeAuction, deleteAuction } = useAuctionActions();
  const { mutate: restoreAuction } = useRestoreAuction();

  // Translation hooks
  const { language } = useLanguage();
  const bidDetailsText = useAutoTranslation("Bid Details", language);
  const bidsText = useAutoTranslation("Bids", language);
  const noBidsYetText = useAutoTranslation("No bids yet.", language);
  const byText = useAutoTranslation("by", language);
  const expandText = useAutoTranslation("Expand", language);
  const noArtworkNameText = useAutoTranslation("No artwork name", language);
  const unknownText = useAutoTranslation("Unknown", language);
  const noDescriptionText = useAutoTranslation("No description available.", language);
  const showMoreText = useAutoTranslation("Show More", language);
  const hideText = useAutoTranslation("Hide", language);
  const artworkStyleText = useAutoTranslation("Artwork Style", language);
  const paintingText = useAutoTranslation("Painting", language);
  const mediumText = useAutoTranslation("Medium", language);
  const acrylicPaintText = useAutoTranslation("Acrylic Paint", language);
  const dimensionsText = useAutoTranslation("Dimensions", language);
  const noSizeText = useAutoTranslation("No Size", language);
  const cmText = useAutoTranslation("cm", language);
  const datePostedText = useAutoTranslation("Date Posted", language);
  const highestBidText = useAutoTranslation("Highest Bid", language);
  const noBidsText = useAutoTranslation("No bids yet", language);
  const placeABidText = useAutoTranslation("Place A Bid", language);
  const auctionClosedText = useAutoTranslation("Auction Closed", language);
  const relatedBidsText = useAutoTranslation("Related Bids", language);
  const noRelatedBidsText = useAutoTranslation("No related bids found.", language);
  const artworkHiddenText = useAutoTranslation("Artwork hidden", language);
  const alreadyReportedText = useAutoTranslation("You have already reported this auction.", language);
  const reportSubmittedText = useAutoTranslation(
    "Report submitted successfully. Thank you for your feedback.",
    language
  );
  const failedToCloseBiddingText = useAutoTranslation("Failed to close bidding", language);
  const reportSubmittedLabelText = useAutoTranslation("Report submitted:", language);
  const categoryText = useAutoTranslation("Category:", language);
  const optionText = useAutoTranslation("Option:", language);
  const infoText = useAutoTranslation("Info:", language);
  const inappropriateContentText = useAutoTranslation("Artwork contains inappropriate or offensive content.", language);
  const bidPlacedSuccessText = useAutoTranslation("Bid of", language);
  const phpPlacedText = useAutoTranslation("php placed successfully!", language);
  const auctionEndsInText = useAutoTranslation("Auction ends in", language);
  const hrsText = useAutoTranslation("hrs", language);
  const minsText = useAutoTranslation("mins", language);
  const secsText = useAutoTranslation("secs", language);
  const auctionWillStartOnText = useAutoTranslation("Auction will start on", language);
  const auctionHasEndedText = useAutoTranslation("Auction has ended", language);
  const anonymousText = useAutoTranslation("Anonymous", language);

  // Translate dynamic/fetched content
  const translatedArtworkTitle = useAutoTranslation(item?.artwork?.title || "", language);
  const translatedArtistName = useAutoTranslation(item?.artwork?.artist || "", language);
  const translatedDescription = useAutoTranslation(item?.artwork?.description || "", language);
  const translatedCategory = useAutoTranslation(item?.artwork?.category || "", language);
  const translatedMedium = useAutoTranslation(item?.artwork?.medium || "", language);

  // Month translations
  const januaryText = useAutoTranslation("January", language);
  const februaryText = useAutoTranslation("February", language);
  const marchText = useAutoTranslation("March", language);
  const aprilText = useAutoTranslation("April", language);
  const mayText = useAutoTranslation("May", language);
  const juneText = useAutoTranslation("June", language);
  const julyText = useAutoTranslation("July", language);
  const augustText = useAutoTranslation("August", language);
  const septemberText = useAutoTranslation("September", language);
  const octoberText = useAutoTranslation("October", language);
  const novemberText = useAutoTranslation("November", language);
  const decemberText = useAutoTranslation("December", language);
  const janText = useAutoTranslation("Jan", language);
  const febText = useAutoTranslation("Feb", language);
  const marText = useAutoTranslation("Mar", language);
  const aprText = useAutoTranslation("Apr", language);
  const mayShortText = useAutoTranslation("May", language);
  const junText = useAutoTranslation("Jun", language);
  const julText = useAutoTranslation("Jul", language);
  const augText = useAutoTranslation("Aug", language);
  const sepText = useAutoTranslation("Sep", language);
  const octText = useAutoTranslation("Oct", language);
  const novText = useAutoTranslation("Nov", language);
  const decText = useAutoTranslation("Dec", language);

  //LIST OF BIDS SECTION
  // Helper function to translate short month names
  const translateShortMonth = (monthShort: string): string => {
    const monthMap: { [key: string]: string } = {
      Jan: janText,
      Feb: febText,
      Mar: marText,
      Apr: aprText,
      May: mayShortText,
      Jun: junText,
      Jul: julText,
      Aug: augText,
      Sep: sepText,
      Oct: octText,
      Nov: novText,
      Dec: decText,
    };
    return monthMap[monthShort] || monthShort;
  };

  // Helper function to translate full month names
  const translateFullMonth = (monthFull: string): string => {
    const monthMap: { [key: string]: string } = {
      January: januaryText,
      February: februaryText,
      March: marchText,
      April: aprilText,
      May: mayText,
      June: juneText,
      July: julyText,
      August: augustText,
      September: septemberText,
      October: octoberText,
      November: novemberText,
      December: decemberText,
    };
    return monthMap[monthFull] || monthFull;
  };

  const formatBidDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const translatedMonth = translateShortMonth(month);
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${translatedMonth} ${year}, ${hour}:${minute}`;
  };

  const onReport = (issueDetails: string) => {
    setIsReported(true);
    toast(`${reportSubmittedLabelText} ${issueDetails}`, { closeButton: true });
  };

  const handleReportSubmit = (categoryId: string, optionId?: string) => {
    const selectedCategory = reportCategories.find((cat) => cat.id === categoryId);
    const selectedOption = selectedCategory?.options?.find((opt) => opt.id === optionId);

    const issueDetails = selectedOption
      ? `${categoryText} ${selectedCategory?.title} | ${optionText} ${selectedOption.text} | ${infoText} ${selectedOption.additionalInfo}`
      : selectedCategory
      ? `${categoryText} ${selectedCategory.title}`
      : inappropriateContentText;

    onReport(issueDetails);
    setShowReportOptions(false);
  };

  const currentUserId = getLoggedInUserId();

  const relatedBids = useMemo(() => {
    if (!item || !item.artwork?.category) return [];

    return allAuctions.filter(
      (art) =>
        art.status === "on_going" &&
        art.id !== item.id &&
        art.artwork?.category?.trim().toLowerCase() === item.artwork.category.trim().toLowerCase()
    );
  }, [item, allAuctions]);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isExpanded]);

  useEffect(() => {
    if (descriptionRef.current) {
      const isOver = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsOverflowing(isOver);
    }
  }, [artwork?.description, showFullDescription]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const monthName = date.toLocaleString("en-US", { month: "long" });
    const translatedMonth = translateFullMonth(monthName);
    const day = date.getDate();
    const year = date.getFullYear();

    return `${translatedMonth} ${day}, ${year}`;
  };

  const handleBidSubmit = (amount: number) => {
    if (!item?.id) return;
    toast.success(`${bidPlacedSuccessText} ${amount}${phpPlacedText}`, { closeButton: true });
  };

  const handleLike = () => {
    toggleLike();
  };

  const handleHide = () => {
    setIsHidden(true);
    toast(artworkHiddenText, { closeButton: true });
    setMenuOpen(false);
  };
  const handleReport = async ({
    category,
    option,
    description,
    additionalInfo,
  }: {
    category: string;
    option?: string;
    description?: string;
    additionalInfo?: string;
  }) => {
    if (reportInfo?.reported) {
      toast.error(alreadyReportedText, { closeButton: true });
      setMenuOpen(false);
      return;
    }

    try {
      await submitAuctionReport({
        auction_id: item?.id,
        category,
        option,
        description,
        additionalInfo,
      });
      toast.success(reportSubmittedText, { closeButton: true });
    } catch (error) {
      console.error("Auction report failed:", error);
    }

    setMenuOpen(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const closeExpandedView = () => {
    setIsExpanded(false);
  };

  if (isLoading || !artwork) {
    return <BidDetailsSkeleton />;
  }

  if (item) {
    const isOwner = currentUserId === item.artwork.artist_id;

    return (
      <>
        <div className="min-h-screen">
          <Header />
          {/* Back button */}
          <div
            className={` w-[200px] ${
              isMobile ? "ml-3 mt-20 px-4 whitespace-nowrap" : "md:ml-16 whitespace-nowrap mt-20"
            }`}
          >
            <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
              <i className="bx bx-chevron-left text-lg mr-2"></i>
              {bidDetailsText}
            </button>
          </div>

          <div className={` ${isMobile ? "flex flex-col" : "flex justify-center items-start space-x-2 mt-2"}`}>
            <div className={`${isMobile ? "w-full" : "flex justify-center items-start ml-[260px]"}`}>
              {/* Artwork container */}
              <div className={`mr-8 ${isMobile ? "w-full mt-3" : "w-full"}`}>
                {/* Sidebar (desktop) */}
                <div className="relative w-full">
                  {!isMobile && (
                    <div className="absolute top-3 z-20 left-[-250px] hidden lg:block" style={{ width: "150px" }}>
                      {/* Left Side - Bids Sidebar */}
                      <div className="p-3 text-left rounded-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="font-semibold text-xs">{bidsText}</h2>
                          {hasNewBids && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>New</span>
                            </div>
                          )}
                        </div>
                        <div className="max-h-[440px] overflow-y-auto pr-1 flex flex-col gap-2">
                          {bids.length > 0 ? (
                            bids.map((bid: any) => (
                              <BidItem
                                key={bid.id || bid.timestamp}
                                bid={bid}
                                byText={byText}
                                isOwner={isOwner}
                                formatBidDate={formatBidDate}
                                isMobile={false}
                              />
                            ))
                          ) : (
                            <div className="text-[11px] text-gray-400">{noBidsYetText}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Center - Artwork Image */}
                <div className={`relative z-0 ${isMobile ? "pl-5 mt-9" : "mt-8 w-[400px]"}`}>
                  <div
                    className={`inline-block transform scale-[1.10] -mb-6 relative ${
                      isMobile ? "pl-4" : "left-[-60px]"
                    }`}
                  >
                    <div className="w-[420px] h-[400px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl">
                      <img
                        src={getArtworkImageUrl(item.artwork.image_url)}
                        alt={item.artwork.title}
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
                            {expandText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Title, artist, description*/}
              <div
                className={` ${
                  isMobile ? "w-full mt-10 px-4 h-[540px]" : "w-[730px] -ml-[250px] mt-3 h-[450px]"
                }border`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleLike()}
                        className="flex items-center space-x-1 text-gray-800 rounded-3xl py-1.5 px-2 border border-gray-200"
                      >
                        <Heart
                          size={isMobile ? 13 : 13}
                          className={item.user_has_liked_auction ? "text-red-600 fill-red-600" : "text-gray-800"}
                          fill={item.user_has_liked_auction ? "currentColor" : "none"}
                        />
                        {item.auction_likes_count > 0 && (
                          <span className={`${isMobile ? "text-xs" : "text-[9px]"}`}>{item.auction_likes_count}</span>
                        )}
                      </button>

                      <div className="flex items-center space-x-2 text-xs">
                        <i className="bx bx-show text-[15px]"></i>
                        <span>{item?.viewers.length || 0}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <button className="py-3 pr-[11px] mr-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
                        <MoreHorizontal size={isMobile ? 14 : 14} />
                      </button>

                      {isOwner ? (
                        <OwnerBidMenu
                          isOpen={menuOpen}
                          onDelete={async () => {
                            try {
                              await deleteAuction.mutateAsync(item.id);
                            } catch {
                            } finally {
                              setMenuOpen(false);
                            }
                          }}
                          onCloseBid={async () => {
                            try {
                              await closeAuction.mutateAsync(item.id);
                            } catch {
                              toast.error(failedToCloseBiddingText);
                            } finally {
                              setMenuOpen(false);
                            }
                          }}
                          onRestore={(id) => {
                            restoreAuction(id);
                            setMenuOpen(false);
                          }}
                          onViewBids={() => {
                            setMenuOpen(false);
                          }}
                          bids={item.bid_history || []}
                          auctionId={item.id}
                          auctionTitle={item.artwork.title}
                          visibility={(item as any).visibility}
                          className="top-7 -left-[11px]"
                        />
                      ) : (
                        <BidMenu
                          isOpen={menuOpen}
                          onHide={handleHide}
                          onReport={handleReport}
                          isReported={isReported}
                          isShared={item.isShared}
                          auctionId={item.id}
                          className="top-7 -left-[11px]"
                        />
                      )}
                    </div>
                  </div>

                  <h1 className={`${isMobile ? "text-lg" : "text-xl"} font-bold mb-2`}>
                    {translatedArtworkTitle || noArtworkNameText}
                  </h1>

                  <p className={`${isMobile ? "text-[10px]" : "text-[10px]"} text-gray-600 mb-1`}>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/userprofile/${item.artwork.artist_id}`)}
                    >
                      {byText} {translatedArtistName || unknownText}
                    </span>
                  </p>

                  {/* Description */}
                  <div className="relative mt-2">
                    <div
                      ref={descriptionRef}
                      className={`
                      text-[10px] text-gray-700 transition-all duration-300 ease-in-out mb-2 h-[100px]
                      ${
                        showFullDescription
                          ? "max-h-[100px] overflow-y-auto pr-1"
                          : "max-h-[100px] overflow-y-auto pr-1 overflow-hidden"
                      }
                    `}
                      style={{ lineHeight: "1.25rem" }}
                    >
                      {translatedDescription || noDescriptionText}
                    </div>

                    {isOverflowing && (
                      <button
                        onClick={() => setShowFullDescription((prev) => !prev)}
                        className="text-[9px] text-blue-500 hover:underline mt-1 block"
                      >
                        {showFullDescription ? hideText : showMoreText}
                      </button>
                    )}
                  </div>

                  {/* Horizontal Sidebar Info */}
                  <div className="w-full py-3 mb-4 grid grid-cols-4 gap-4 text-center">
                    <div>
                      <h3 className="text-[10px] font-medium">{artworkStyleText}</h3>
                      <p className="text-[10px] text-gray-700">
                        {translatedCategory
                          ? translatedCategory.charAt(0).toUpperCase() + translatedCategory.slice(1)
                          : paintingText}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[9px] font-medium">{mediumText}</h3>
                      <p className="text-[9px] text-gray-700">{translatedMedium || acrylicPaintText}</p>
                    </div>

                    <div>
                      <h3 className="text-[9px] font-medium">{dimensionsText}</h3>
                      <p className="text-[9px] text-gray-700">
                        {item.artwork.size || noSizeText} {cmText}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[9px] font-medium">{datePostedText}</h3>
                      <p className="text-[9px] text-gray-700">
                        {item.artwork.created_at ? formatDate(item.artwork.created_at) : "March 25, 2023"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full border px-10 py-4 rounded-xl flex justify-between items-center text-center mt-4 mb-2">
                    {/* Highest Bid */}
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 mb-2 -mt-2">{highestBidText}</p>
                      <p className="text-lg font-semibold">
                        {item.highest_bid && item.highest_bid.amount != null
                          ? `₱${formatAmount(item.highest_bid.amount)}`
                          : noBidsText}
                      </p>
                    </div>

                    {/* Separator */}
                    <div className="w-[1px] h-12 bg-gray-200 mx-7" />

                    {/* Auction Timer */}
                    <div>
                      <div className="" style={{ minWidth: "140px", display: "inline-block" }}>
                        <AuctionCountdown
                          startTime={item.start_time}
                          endTime={item.end_time}
                          auctionEndsInText={auctionEndsInText}
                          hrsText={hrsText}
                          minsText={minsText}
                          secsText={secsText}
                          auctionWillStartOnText={auctionWillStartOnText}
                          auctionHasEndedText={auctionHasEndedText}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (item.status === "on_going") {
                        setShowBidPopup(true);
                      }
                    }}
                    disabled={item.status !== "on_going"}
                    className={`w-full text-white text-xs py-[11px] rounded-full mt-3 transition-colors ${
                      item.status !== "on_going" ? "bg-gray-400 cursor-not-allowed" : "bg-red-800 hover:bg-red-700"
                    }`}
                  >
                    {item.status === "on_going" ? placeABidText : auctionClosedText}
                  </button>
                </div>

                {/* Mobile Sidebar - Bids Section */}
                {isMobile && (
                  <div className="mt-6 w-full px-1">
                    <div className="border rounded-lg p-3 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="font-semibold text-xs">{bidsText}</h2>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2">
                        {bids.length > 0 ? (
                          bids.map((bid: any) => (
                            <BidItem
                              key={bid.id || bid.timestamp}
                              bid={bid}
                              byText={byText}
                              isOwner={isOwner}
                              formatBidDate={formatBidDate}
                              isMobile={true}
                            />
                          ))
                        ) : (
                          <div className="text-[11px] text-gray-400">{noBidsYetText}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Bids Section */}
          {relatedBids.length > 0 ? (
            <div className="container md:px-6 mt-2 mb-2">
              <h2 className={`font-medium border ${isMobile ? "text-xs mt-12 mb-4 -ml-3" : "text-xs mt-10 mb-6"}`}>
                {relatedBidsText}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedBids.map((art) => (
                  <div key={art.id} className="min-w-[200px] flex-shrink-0">
                    <BidCard
                      data={art}
                      onClick={() =>
                        navigate(`/bid/${art.id}`, {
                          state: { artwork: art.artwork },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="container md:px-6 mt-2 mb-2">
              <h2 className={`font-medium ${isMobile ? "text-xs mt-12 mb-4" : "text-xs mt-10 mb-4"}`}>
                {relatedBidsText}
              </h2>
              <p className={`text-gray-500 text-xs text-center ${isMobile ? "mb-6" : "mb-2 mt-2"}`}>
                {noRelatedBidsText}
              </p>
            </div>
          )}

          {showBidPopup && item.status === "on_going" && (
            <BidPopup
              isOpen={showBidPopup}
              onClose={() => setShowBidPopup(false)}
              data={item}
              artworkId={item.artwork.id}
              artworkTitle={item.artwork.title || "Artwork"}
              start_bid_amount={item.start_bid_amount}
            />
          )}

          {isExpanded && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center overflow-hidden">
              <button
                onClick={closeExpandedView}
                className="absolute top-4 right-6 z-[60] bg-white rounded-full px-1 shadow-md transition-colors duration-200"
              >
                <i className="bx bx-x text-xl text-black"></i>
              </button>

              <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
                <img
                  src={getArtworkImageUrl(item.artwork.image_url)}
                  alt="Expanded artwork"
                  className="max-h-[80vh] max-w-[90vw] object-contain"
                />
              </div>
            </div>
          )}
        </div>
        {/* Report Options Popup */}
        <ReportOptionsPopup
          isOpen={showReportOptions}
          onClose={() => setShowReportOptions(false)}
          onSubmit={handleReportSubmit}
        />
      </>
    );
  }
};

export default BidDetails;
