import { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LikedArtworksContext, LikedArtworksProvider } from "@/context/LikedArtworksProvider";
import { useDonation, DonationProvider } from "@/context/DonationContext";
import Header from "@/components/user_dashboard/navbar/Header";
import SellCardMenu from "@/components/user_dashboard/Marketplace/cards/SellCardMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import useFavorite from "@/hooks/interactions/useFavorite";
import ReviewModal from "@/components/user_dashboard/Marketplace/reviews/ReviewModal";
import { mockArtworks } from "@/components/user_dashboard/Marketplace/mock_data/mockArtworks";

const ProductViewingContent = () => {
    const { id } = useParams<{ id: string }>();
    const { likedArtworks, toggleLike } = useContext(LikedArtworksContext);
    const isLiked = likedArtworks[id || ""] || false;
    const { isFavorite, handleFavorite: toggleFavorite } = useFavorite(id);
    const [product, setProduct] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("description");
    const [menuOpen, setMenuOpen] = useState(false);
    const [isReported, setIsReported] = useState(false);
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    // Mock reviews data
    const mockReviews = [
        {
        id: "1",
        user: "Jimuel Clamonte",
        userImage: "",
        rating: 5,
        comment: "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
        timestamp: "2024-05-01T10:00:00Z",
        verified: true
        },
        {
        id: "2",
        user: "Jimuel Clamonte",
        userImage: "",
        rating: 5,
        comment: "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
        timestamp: "2024-05-01T10:00:00Z",
        verified: true
        },
        {
        id: "3",
        user: "Jimuel Clamonte",
        userImage: "",
        rating: 5,
        comment: "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
        timestamp: "2024-05-01T10:00:00Z",
        verified: true
        }
    ];

    useEffect(() => {
    if (id) {
        const found = mockArtworks.find((artwork) => String(artwork.id) === String(id));
        if (found) {
        const productWithImages = {
            ...found,
            images: Array.isArray(found.images) ? found.images : [found.artworkImage],
        };
        setProduct(productWithImages);
        } else {
        setProduct(null);
        }
    }
    }, [id]);

    if (!product) {
        return <div>Product not found.</div>;
    }

    const goToPrevious = () => {
        if (product?.images?.length > 1) {
        setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
        }
    };

    const goToNext = () => {
        if (product?.images?.length > 1) {
        setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
        }
    };

    const closeExpandedView = () => {
        setIsExpanded(false);
    };

    const handleQuantityChange = (change: number) => {
        setQuantity(prev => Math.max(1, prev + change));
    };

    const handleLike = () => {
        if (id) {
        toggleLike(id);
        }
    };

    const renderStars = (rating: number, size: string = "text-sm") => {
        return Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={`text-yellow-400 ${size}`}>
            {index < rating ? "★" : "☆"}
        </span>
        ));
    };

    const renderRatingBar = (star: number, count: number, total: number) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
        <div className="flex items-center space-x-2 text-xs">
            <span className="w-2">{star}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
                className="bg-yellow-400 h-2 rounded-full" 
                style={{ width: `${percentage}%` }}
            />
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
                <div className={`${isMobile ? "h-[475px]" : "w-[530px] h-[475px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl -mt-4"}`}>
                    
                    {/* Artwork image */}
                    <img
                    src={product.images[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
                    />

                    {/* Chevron Buttons (on hover of artwork only) */}
                    {product.images.length > 1 && (
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

                    {/* ✅ Expand Button (always visible, not affected by hover) */}
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
            <div className={`relative space-y-[30px] ${isMobile ? "w-full " : "w-full max-w-[550px] min-w-[400px] mt-4"}`}>
                
            {/* Title and Actions */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                    <div className="flex items-center space-x-2">
                    <Avatar className="w-3 h-3 border">
                        <AvatarImage src="" alt={product.artist} />
                        <AvatarFallback className="text-[10px]">{product.artist?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-black text-[9px] cursor-pointer">{product.artist}</span>
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
                    <MoreHorizontal size={15} className="text-gray-500 hover:text-black" />
                </button>

                <SellCardMenu
                    isOpen={menuOpen}
                    isReported={isReported}
                    onReport={(data) => {
                    console.log("Report submitted:", data);
                    toast("Report submitted. Thank you!");
                    setIsReported(true);
                    setMenuOpen(false);
                    }}
                />
                </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-900">
                ₱ {product.currency}{product.price?.toLocaleString()}k
              </div>
              {product.originalPrice && (
                <div className="text-lg text-gray-400 line-through">
                  ₱ {product.currency}{product.originalPrice?.toLocaleString()}k
                </div>
              )}
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-4 gap-4 text-center border py-[18px] rounded-md">
                <div>
                    <h3 className="text-[10px] font-medium text-gray-500 mb-1">Artwork Style</h3>
                    <p className="text-[10px] text-gray-900">{product.artworkStyle}</p>
                </div>
                
                <div className="border-l border-gray-300 pl-4">
                    <h3 className="text-[10px] font-medium text-gray-500 mb-1">Medium</h3>
                    <p className="text-[10px] text-gray-900">{product.medium}</p>
                </div>
                
                <div className="border-l border-gray-300 pl-4">
                    <h3 className="text-[10px] font-medium text-gray-500 mb-1">Size</h3>
                    <p className="text-[10px] text-gray-900">{product.size}</p>
                </div>
                
                <div className="border-l border-gray-300 mr-2">
                    <h3 className="text-[10px] font-medium text-gray-500 mb-1">Edition</h3>
                    <p className="text-[10px] text-gray-900">{product.edition}</p>
                </div>
            </div>

            <div className="w-full">

            {/* Custom Tab Headers */}
            <div className="flex text-[10px] font-medium">
                <button
                    className={`px-4 py-2 ${
                        activeTab === "description"
                        ? "border-b-2 border-black text-black"
                        : "text-gray-400"
                    }`}
                    onClick={() => setActiveTab("description")}
                    >
                    Description
                </button>

                {product.edition !== "Original (1 of 1)" && (
                <button
                    className={`px-4 py-2 ml-4 ${
                    activeTab === "review"
                        ? "border-b-2 border-black text-black"
                        : "text-gray-400"
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
                    <p className="text-[10px] text-gray-700 leading-relaxed pt-2">
                    {product.description}
                    </p>
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
                        <span className="text-[24px] font-semibold">{product.rating}</span>
                        <span className="text-[10px] text-gray-500 mb-1">out of 5</span>
                        </div>
                        <div className="flex items-center space-x-0.5 mb-1">
                        {renderStars(Math.floor(product.rating))}
                        </div>
                        <p className="text-[10px] text-gray-500">({product.totalReviews} reviews)</p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="flex-1 pt-1 sm:mt-6">
                        <div className="space-y-0.5 text-[9px]">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = product.reviewBreakdown[star] || 0;
                            const percent = product.totalReviews
                            ? (count / product.totalReviews) * 100
                            : 0;
                            return (
                            <div key={star} className="flex items-center space-x-2">
                                <span className="w-2">{star}</span>
                                <div className="flex-1 h-[6px] bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="bg-yellow-400 h-full"
                                    style={{ width: `${percent}%` }}
                                />
                                </div>
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
                    <div className="flex items-center gap-1.5 border border-gray-300 rounded-full overflow-hidden text-xs">
                        <button
                            onClick={() => handleQuantityChange(-1)}
                            className="w-8 h-8 pl-1.5 flex items-center justify-center text-black"
                        >
                            −
                        </button>

                        <div className="w-px h-3 bg-gray-300" />

                        <span className="w-8 text-center font-medium text-black">
                            {quantity}
                        </span>

                        <div className="w-px h-3 bg-gray-300" />

                        <button
                            onClick={() => handleQuantityChange(1)}
                            className="w-8 h-8 pr-1.5 flex items-center justify-center text-black"
                        >
                            +
                        </button>
                    </div>


                    <button 
                        className="w-full bg-red-800 hover:bg-red-700 text-white py-2 text-xs font-medium rounded-full"
                        onClick={() => toast("Added to cart!")}
                    >
                        <i className='bx bx-cart text-[15px] relative top-0.5 mr-3'></i>
                        Buy Now
                    </button>
                    
                    <button
                    onClick={handleLike}
                    className="py-1.5 px-2.5 border border-gray-300 rounded-full"
                    >
                        <img
                            src={
                            isLiked
                                ? "https://img.icons8.com/puffy-filled/32/B10303/like.png"
                                : "https://img.icons8.com/puffy/32/like.png"
                            }
                            alt="Heart"
                            className="w-5 h-5 object-contain"
                        />
                    </button>

                </div>
                
            </div>

            </div>
            </div>
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
                src={product.images[currentImageIndex]}
                alt="Expanded artwork"
                className="max-h-[80vh] max-w-[90vw] object-contain"
            />

            {/* Chevron navigation */}
            {product.images.length > 1 && (
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
            reviews={mockReviews}
            totalReviews={product.totalReviews}
        />
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
