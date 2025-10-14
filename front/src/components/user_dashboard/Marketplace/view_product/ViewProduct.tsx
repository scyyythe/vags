import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LikedArtworksProvider } from "@/context/LikedArtworksProvider";
import { DonationProvider } from "@/context/DonationContext";
import Header from "@/components/user_dashboard/navbar/Header";
import SellCardMenu from "@/components/user_dashboard/Marketplace/cards/SellCardMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import ReviewModal from "@/components/user_dashboard/Marketplace/reviews/ReviewModal";
import PreviewModal from "../buying_process/preview/PreviewModal";
import { useWishlist } from "@/components/user_dashboard/Marketplace/wishlist/WishlistContext";
import { useSellArtworkDetail } from "@/hooks/artworks/sell/useSellArtworkDetail";
import ProductViewingSkeleton from "@/components/skeletons/marketplace/ProductViewingSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import SellMenu from "../../own_profile/menu/sell_card/Menu";
import useMarkArtworkAsUnlisted from "@/hooks/purchase/useMarkArtworkAsUnlisted";
import useToggleArtworkStatus from "@/hooks/purchase/useMarkArtworkAsSold";
import { useLocation } from "react-router-dom";
import { useArtworkReviews } from "@/hooks/review/useArtworkReviews";
import useSubmitReport from "@/hooks/mutate/report/useSubmitReport";
import useArtworkReportStatus from "@/hooks/mutate/report/useArtworkReportStatus";
import useFetchArtCards from "@/hooks/artworks/sell/useFetchArtCards";
import SellCard from "../cards/SellCard";
const ProductViewingContent = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useSellArtworkDetail(id);
  const submitReportMutation = useSubmitReport();
  const { data: reportStatus, isLoading: reportLoading, error: reportError } = useArtworkReportStatus(id || "");

  const { reviews, loading: reviewsLoading, error: reviewsError } = useArtworkReviews(id || "");
  const { data: allArtworks = [] } = useFetchArtCards();
  const relatedArtworks = allArtworks.filter(
    (art) => art.category === product?.artwork_style && art.id !== product?.id
  );

  const loggedInUserId = getLoggedInUserId();
  const isOwner = product?.artist?.id && String(product.artist.id) === String(loggedInUserId);
  const location = useLocation();
  const artistId = location.state?.artistId;

  const markAsSoldMutation = useToggleArtworkStatus();
  const markAsUnlistedMutation = useMarkArtworkAsUnlisted();
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [localIsReported, setLocalIsReported] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { likedItems, toggleWishlist } = useWishlist();

  const handleWishlistToggle = () => {
    if (!id) return;
    toggleWishlist(id);
    toast(likedItems.has(id) ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleUndoReport = () => {
    // Update local state immediately for visual feedback
    setLocalIsReported(false);
    setMenuOpen(false);
  };

  const handleUndoReportRevert = () => {
    // Revert local state if undo fails
    setLocalIsReported(true);
  };

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
    if (reportStatus) {
      setIsReported(reportStatus.reported);
      setLocalIsReported(reportStatus.reported);
    }
  }, [reportStatus]);

  // Mock reviews data
  const mockReviews = [
    {
      id: "1",
      user: "Jimuel Clamonte",
      userImage: "",
      rating: 5,
      comment:
        "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
      timestamp: "2024-05-01T10:00:00Z",
      verified: true,
    },
    {
      id: "2",
      user: "Jimuel Clamonte",
      userImage: "",
      rating: 5,
      comment:
        "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
      timestamp: "2024-05-01T10:00:00Z",
      verified: true,
    },
    {
      id: "3",
      user: "Jimuel Clamonte",
      userImage: "",
      rating: 5,
      comment:
        "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
      timestamp: "2024-05-01T10:00:00Z",
      verified: true,
    },
  ];

  if (isLoading) {
    return <ProductViewingSkeleton />;
  }

  if (error || !product) {
    return <div>Product not found.</div>;
  }

  const goToPrevious = () => {
    if (product?.image_urls?.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? product.image_urls.length - 1 : prev - 1));
    }
  };

  const goToNext = () => {
    if (product?.image_urls?.length > 1) {
      setCurrentImageIndex((prev) => (prev === product.image_urls.length - 1 ? 0 : prev + 1));
    }
  };

  const closeExpandedView = () => {
    setIsExpanded(false);
  };

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const renderStars = (rating: number, size: string = "text-sm") => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className={`text-yellow-400 ${size}`}>
        {index < rating ? "★" : "☆"}
      </span>
    ));
  };
  // Compute average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Count reviews by star
  const reviewCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    const rating = Math.round(r.score);
    if (rating >= 1 && rating <= 5) {
      reviewCounts[rating]++;
    }
  });
  const formatPrice = (price: number) => {
    if (price >= 1_000_000) {
      return `₱${(price / 1_000_000).toFixed(1)}M`;
    } else if (price >= 10_000) {
      return `₱${(price / 1_000).toFixed(1)}k`;
    } else {
      return `₱${price.toLocaleString()}`;
    }
  };
  const capitalizeWords = (text: string) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderRatingBar = (star: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center space-x-2 text-xs">
        <span className="w-2">{star}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4">Artwork Not Found</h2>
          <p className="mb-8 text-xs">The artwork you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-red-600 text-xs hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4">Artwork Not Found</h2>
          <p className="mb-8 text-xs text-red-500">{error}</p>
          <Link to="/" className="text-red-600 text-xs hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Header />
        <p className="text-gray-500 text-sm">Loading exhibit...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Back button */}
        <div className={`mt-8 md:mt-12 ${isMobile ? "px-4 pt-8" : "md:ml-12"}`}>
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Product Details
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artwork container */}
          <div className={`relative ${isMobile ? "w-full" : "w-full max-w-[580px] min-w-[400px] ml-14"}`}>
            {/* Artwork Image Hover Group */}
            <div className={`relative z-0 ${isMobile ? "px-4 mt-4" : "mt-8"} group/artwork`}>
              <div className={`relative ${isMobile ? "w-full" : "inline-block -mb-6"}`}>
                <div
                  className={`${
                    isMobile
                      ? "h-[475px]"
                      : "w-[530px] h-[475px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl -mt-4"
                  }`}
                >
                  {/* Artwork image */}
                  <img
                    src={product.image_urls[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
                  />

                  {/* Chevron Buttons (on hover of artwork only) */}
                  {product.image_urls.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 
                            bg-white/70 backdrop-blur-md rounded-full p-2 shadow-md hover:bg-white 
                            opacity-0 group-hover/artwork:opacity-100 transition-opacity duration-300"
                      >
                        <ChevronLeft size={15} className="text-black" />
                      </button>

                      <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 
                            bg-white/70 backdrop-blur-md rounded-full p-2 shadow-md hover:bg-white 
                            opacity-0 group-hover/artwork:opacity-100 transition-opacity duration-300"
                      >
                        <ChevronRight size={15} className="text-black" />
                      </button>
                    </>
                  )}

                  {/* Expand Button */}
                  <div className={`absolute bottom-3 right-3 ${isMobile ? "" : "z-10"} flex flex-col items-end gap-3`}>
                    <div
                      className="group/expand flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] hover:w-[90px] hover:pl-4 transition-[width,padding] ease-in-out duration-700 cursor-pointer"
                      onClick={() => setIsExpanded(true)}
                    >
                      <i className="bx bx-expand-alt text-[12px] mr-[6px]"></i>
                      <span className="mr-3 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 group-hover/expand:translate-x-0 group-hover/expand:opacity-100 transition-all ease-in-out duration-700">
                        Expand
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Product Info */}
          <div
            className={`relative space-y-[30px] ${isMobile ? "w-full " : "w-full max-w-[550px] min-w-[400px] mt-4"}`}
          >
            {/* Title and Actions */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => navigate(`/userprofile/${product.artist.id}`)}
                >
                  <Avatar className="w-4 h-4 border">
                    <AvatarImage
                      src={product?.artist?.profile_picture || undefined}
                      alt={product?.artist?.name || "Artist"}
                    />
                    <AvatarFallback>{product?.artist?.name?.charAt(0) || "?"}</AvatarFallback>
                    <span>{product?.artist?.name || "Unknown Artist"}</span>
                  </Avatar>
                  <span className="text-black text-[10px]">{product.artist.name}</span>
                </div>
              </div>
              <div className="relative">
                {/* MENU */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  className="p-2 rounded-full"
                >
                  <MoreHorizontal
                    size={15}
                    className={`${
                      localIsReported ? "text-red-600" : menuOpen ? "text-black" : "text-gray-500"
                    } hover:text-black`}
                  />
                </button>
                {isOwner ? (
                  <SellMenu
                    isOpen={menuOpen}
                    artworkId={id}
                    onEdit={() => {
                      navigate(`/sell-update/${id}`, {
                        state: {
                          id: product.id,
                          title: product.title,
                          year_created: product.year_created || "",
                          style: product.artwork_style || "",
                          medium: product.medium || "",
                          height: product.size?.split("x")?.[0] || "",
                          width: product.size?.split("x")?.[1] || "",
                          description: product.description || "",
                          price: String(product.price || 0),
                          edition: product.edition || "Original (1 of 1)",
                          quantity: quantity,
                          mainImageUrl: product.image_urls?.[0],
                          additionalImagesUrls: product.image_urls?.slice(1) || [],
                        },
                      });
                    }}
                    onToggleVisibility={(newVisibility, artworkId) => {
                      if (newVisibility === "Unlisted") {
                        markAsUnlistedMutation.mutate(artworkId);
                      } else {
                        toast(`Set visibility to ${newVisibility}`, { closeButton: true });
                      }
                    }}
                    onDelete={() => toast("Delete clicked", { closeButton: true })}
                    onMarkAsSold={() => markAsSoldMutation.mutate(id)}
                    onViewInsights={() => toast("Viewing insights", { closeButton: true })}
                    className="-right-1 top-5"
                  />
                ) : (
                  <SellCardMenu
                    isOpen={menuOpen}
                    isReported={localIsReported}
                    artworkId={id}
                    onUndoReport={handleUndoReport}
                    onReport={(data) => {
                      if (!id) return;

                      // Update local state immediately for visual feedback
                      setLocalIsReported(true);

                      submitReportMutation.mutate(
                        {
                          art_id: id,
                          category: data.category,
                          option: data.option,
                          description: data.description,
                          additionalInfo: data.additionalInfo,
                        },
                        {
                          onSuccess: () => {
                            setIsReported(true);
                            setMenuOpen(false);
                          },
                          onError: () => {
                            // Revert local state if submission fails
                            setLocalIsReported(false);
                          },
                        }
                      );
                    }}
                  />
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              {product.price > 0 && (
                <div className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</div>
              )}
              {product.discounted_price > 0 && product.discounted_price !== product.price && (
                <div className="text-lg text-gray-400 line-through">{formatPrice(product.discounted_price)}</div>
              )}
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-4 gap-4 text-center border py-[18px] rounded-md">
              <div>
                <h3 className="text-[10px] font-medium text-gray-500 mb-1">Artwork Style</h3>
                <p className="text-[10px] text-gray-900">{capitalizeWords(product.artwork_style)}</p>
              </div>

              <div className="border-l border-gray-300 pl-4">
                <h3 className="text-[10px] font-medium text-gray-500 mb-1">Dimensions</h3>
                <p className="text-[10px] text-gray-900">{product.size} cm</p>
              </div>

              <div className="border-l border-gray-300 mr-2">
                <h3 className="text-[10px] font-medium text-gray-500 mb-1">Edition</h3>
                <p className="text-[10px] text-gray-900">{product.edition}</p>
              </div>

              <div className="border-l border-gray-300 mr-2">
                <h3 className="text-[10px] font-medium text-gray-500 mb-1">Year Created</h3>
                <p className="text-[10px] text-gray-900">{product.year_created}</p>
              </div>
            </div>

            <div className="w-full">
              {/* Custom Tab Headers */}
              <div className="flex text-[10px] font-medium">
                <button
                  className={`px-4 py-2 ${
                    activeTab === "description" ? "border-b-2 border-black text-black" : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  About this Artwork
                </button>

                {product.edition !== "Original (1 of 1)" && (
                  <button
                    className={`px-4 py-2 ml-4 ${
                      activeTab === "review" ? "border-b-2 border-black text-black" : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("review")}
                  >
                    Review
                  </button>
                )}
              </div>

              {/* Tab Content Container */}
              <div className="mt-5 -mb-4 bg-white px-2 h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-hide">
                {/* Description Content */}
                {activeTab === "description" && (
                  <div className="pt-2 space-y-2">
                    {/* Medium Info Block */}
                    <div className=" flex gap-2">
                      <h3 className="text-[10px] font-medium text-gray-500 mb-1">Medium :</h3>
                      <p className="text-[10px] text-gray-900">{product.medium}</p>
                    </div>

                    {/* Description Text */}
                    <p className="text-[10px] text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Reviews Content */}
                {activeTab === "review" && product.edition !== "Original (1 of 1)" && (
                  <div className="relative flex flex-col md:h-[110px] sm:flex-row gap-4 pr-4">
                    {/* View All Reviews Button - Top Right Corner */}
                    <div className="absolute right-0 top-0">
                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="text-[9px] text-gray-600 hover:underline flex items-center"
                      >
                        View all reviews
                        <ChevronRight size={10} className="ml-1" />
                      </button>
                    </div>

                    {/* Rating Summary */}
                    <div className="min-w-[120px] mt-6 sm:mt-6">
                      <div className="flex items-end space-x-1 mb-1">
                        <span className="text-[24px] font-semibold">{averageRating}</span>
                        <span className="text-[10px] text-gray-500 mb-1">out of 5</span>
                      </div>
                      <div className="flex items-center space-x-0.5 mb-1">
                        {renderStars(Math.round(Number(averageRating)))}
                      </div>
                      <p className="text-[10px] text-gray-500">({reviews.length} reviews)</p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="flex-1 pt-1 sm:mt-6">
                      <div className="space-y-0.5 text-[9px]">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviewCounts[star];
                          const percent = reviews.length ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center space-x-2">
                              <span className="w-2">{star}</span>
                              <div className="flex-1 h-[6px] bg-gray-200 rounded-full overflow-hidden">
                                <div className="bg-yellow-400 h-full" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="w-6 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity, Buy Now, Wishlist */}

            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-3">
                {/* Show quantity selector only if edition is "Open Edition" */}
                {product.edition === "Open Edition" && (
                  <div className="flex items-center gap-1.5 border border-gray-300 rounded-full overflow-hidden text-xs">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-8 h-8 pl-1.5 flex items-center justify-center text-black"
                    >
                      −
                    </button>

                    <div className="w-px h-3 bg-gray-300" />

                    <span className="w-8 text-center font-medium text-black">{quantity}</span>

                    <div className="w-px h-3 bg-gray-300" />

                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-8 h-8 pr-1.5 flex items-center justify-center text-black"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  className="w-full bg-red-800 hover:bg-red-700 text-white py-2 text-xs font-medium rounded-full"
                  onClick={() => setIsModalOpen(true)}
                >
                  <i className="bx bx-cart text-[15px] relative top-0.5 mr-3"></i>
                  Buy Now
                </button>

                <button onClick={handleWishlistToggle} className="py-1.5 px-2.5 border border-gray-300 rounded-full">
                  <img
                    src={
                      likedItems.has(id)
                        ? "https://img.icons8.com/puffy-filled/32/B10303/like.png"
                        : "https://img.icons8.com/puffy/32/like.png"
                    }
                    className="w-5 h-5 object-contain"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Artworks Section */}
      <div className="container md:px-6 mb-4">
        <h2 className={`font-medium ${isMobile ? "text-sm -ml-6 mb-4 mt-4" : "text-xs mb-4 -mt-2"}`}>
          Related Artworks
        </h2>
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : relatedArtworks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedArtworks.slice(0, 8).map((art) => (
              <SellCard
                key={art.id}
                id={art.id}
                artworkImage={art.image_url?.[0]}
                title={art.title}
                artist={art.artist}
                artistId={art.artist_id}
                price={art.price}
                edition={art.edition}
                size={art.size}
                yearCreated={art.year_created}
                medium={art.medium}
                category={art.category}
                onCardClick={() => navigate(`/viewproduct/${art.id}`)}
                isMarketplace={true}
                status="active"
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No other artworks in this style.</p>
        )}
      </div>

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
            <img
              src={product.image_urls[currentImageIndex]}
              alt="Expanded artwork"
              className="max-h-[80vh] max-w-[90vw] object-contain"
            />

            {/* Chevron navigation */}
            {product.image_urls.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-50"
                >
                  <ChevronLeft size={15} className="text-black" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-50"
                >
                  <ChevronRight size={15} className="text-black" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviews={reviews}
        totalReviews={reviews.length}
      />

      {/* Preview Modal */}
      {product && (
        <PreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProceedToCheckout={() => {
            setIsModalOpen(false);
          }}
          artwork={{
            id: product.id || "",
            artworkImage: product.image_urls?.[0] || "/images/placeholder.jpg",
            title: product.title || "Untitled",
            artist: product.artist?.name || "Unknown Artist",
            medium: product.medium || "Unknown",
            style: product.artwork_style || "Unknown",
            edition: product.edition || "Unknown",
            size: product.size ? `${product.size} cm` : "Unknown",
            yearCreated: product.year_created || "Unknown",
            price: product.price || 0,
          }}
        />
      )}
    </div>
  );
};

const ProductViewing = () => {
  return (
    <LikedArtworksProvider>
      <DonationProvider>
        <ProductViewingContent />
      </DonationProvider>
    </LikedArtworksProvider>
  );
};

export default ProductViewing;
