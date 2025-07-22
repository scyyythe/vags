import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import SellCard from "@/components/user_dashboard/Marketplace/cards/SellCard";
import SellCardSkeleton from "@/components/skeletons/SellCardSkeleton";
import useMySellArtCards from "@/hooks/artworks/sell/useMySellArtCards";
import useUserSellArtCards from "@/hooks/artworks/sell/useUserSellArtCards";
import { getLoggedInUserId } from "@/auth/decode";

import PurchasedArtworkCard from "@/components/user_dashboard/Marketplace/my_purchase/card/PurchasedArtworkCard";
import OrderDetailsModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/OrderDetailsModal";
import ReviewModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/ReviewModal";
import ReviewDetailsModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/ReviewDetailsModal";
import EditReviewModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/EditReviewModal";

const SellTab = () => {
  const { id: userId } = useParams();
  const loggedInUserId = getLoggedInUserId();
  const navigate = useNavigate();
  const isOwnProfile = String(userId) === String(loggedInUserId);

  const mySellArtData = useMySellArtCards();
  const userSellArtData = useUserSellArtCards(userId);

  const { myArtCards, isLoading } = isOwnProfile ? mySellArtData : userSellArtData;

  const [mainTab, setMainTab] = useState("myListings");
  const [activeSubGroup, setActiveSubGroup] = useState<"listings" | "soldArtworks">("listings");
  const [subTab, setSubTab] = useState("available");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewDetailsModal, setShowReviewDetailsModal] = useState(false);
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [reviewingArtwork, setReviewingArtwork] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleReview = (order) => {
    setReviewingArtwork({
      artworkImage: order.artworkImage,
      title: order.title,
      artist: order.artist,
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = (reviewData) => {
    toast.success("Review submitted successfully!");
    console.log("Review submitted:", reviewData);
  };

  const handleContact = () => toast.info("Redirecting to contact seller...");
  const handleTrackOrder = () => toast.info("Opening payment tracking...");
  const handleRequestRefund = () => toast.info("Refund request initiated...");
  const handleCancelOrder = () => toast.warning("Order cancelled successfully");

  const handleViewReview = (order) => {
    setSelectedReview({
      ...order.review,
      artwork: {
        artworkImage: order.artworkImage,
        title: order.title,
        artist: order.artist,
      },
    });
    setShowReviewDetailsModal(true);
  };

  const handleEditReview = () => {
    setShowReviewDetailsModal(false);
    setShowEditReviewModal(true);
  };

  const handleDeleteReview = () => {
    toast.success("Review deleted successfully!");
    setShowReviewDetailsModal(false);
    setSelectedReview(null);
  };

  const handleUpdateReview = (reviewData) => {
    toast.success("Review updated successfully!");
    console.log("Updated review:", reviewData);
    setShowEditReviewModal(false);
    setSelectedReview(null);
  };

  const onCardClick = useCallback(
    (id: string) => {
      if (!id) return;
      navigate(`/viewproduct/${id}/`);
    },
    [navigate]
  );

  const onLikeToggle = useCallback(() => {}, []);
  const statusMap: Record<string, string> = {
    available: "onsale",
    unlisted: "unlisted",
    deleted: "deleted",
  };

  const activeListingTabs = ["available", "unlisted"];
  const soldArtworksTabs = [
    "awaiting_payment",
    "payment_received",
    "in_progress",
    "completed",
    "cancelled",
    "refunded",
    "reviews",
  ];
  const myPurchaseTabs = [
    "pending_payment",
    "payment_processing",
    "paid",
    "failed",
    "cancelled",
    "completed",
    "refunded",
    "reviewed",
  ];

  // Mock data for purchased artworks
  const mockOrders = [
    {
      id: "ORD-001",
      artworkImage: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=300&fit=crop",
      title: "Starry Night Dreams",
      artist: "Emma Rodriguez",
      price: 75000,
      status: "pending_payment",
      orderDate: "2025-01-15",
      expectedDelivery: "2025-01-25",
      paymentMethod: "PayPal",
      shippingAddress: {
        name: "John Doe",
        address: "123 Art Street",
        city: "Metro Manila",
        postalCode: "1000",
      },
      artwork: {
        size: "16 x 12 inches",
        medium: "Acrylic on Canvas",
        style: "Abstract",
        edition: "Original (1 of 1)",
        yearCreated: 2024,
      },
      timeline: [
        { status: "Order Placed", date: "Jan 15, 2025", description: "Your order has been confirmed", completed: true },
        {
          status: "Payment Pending",
          date: "Jan 15, 2025",
          description: "Waiting for payment confirmation",
          completed: false,
        },
        { status: "Processing", date: "", description: "Order will be processed after payment", completed: false },
        { status: "Shipped", date: "", description: "Artwork will be shipped", completed: false },
        { status: "Delivered", date: "", description: "Artwork delivered to your address", completed: false },
      ],
    },
    {
      id: "ORD-002",
      artworkImage: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=300&fit=crop",
      title: "Golden Hour Forest",
      artist: "Marcus Chen",
      price: 120000,
      status: "payment_processing",
      orderDate: "2025-01-12",
      expectedDelivery: "2025-01-22",
      paymentMethod: "GCash",
      shippingAddress: {
        name: "John Doe",
        address: "123 Art Street",
        city: "Metro Manila",
        postalCode: "1000",
      },
      artwork: {
        size: "20 x 16 inches",
        medium: "Oil on Canvas",
        style: "Landscape",
        edition: "Limited Edition (5 of 50)",
        yearCreated: 2024,
      },
      timeline: [
        { status: "Order Placed", date: "Jan 12, 2025", description: "Your order has been confirmed", completed: true },
        {
          status: "Payment Processing",
          date: "Jan 12, 2025",
          description: "Payment is being processed",
          completed: true,
        },
        {
          status: "Processing",
          date: "",
          description: "Order will be processed after payment confirmation",
          completed: false,
        },
        { status: "Shipped", date: "", description: "Artwork will be shipped", completed: false },
        { status: "Delivered", date: "", description: "Artwork delivered to your address", completed: false },
      ],
    },
    {
      id: "ORD-003",
      artworkImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop",
      title: "Serene Lake Reflection",
      artist: "Sofia Williams",
      price: 95000,
      status: "paid",
      orderDate: "2025-01-08",
      expectedDelivery: "2025-01-18",
      paymentMethod: "Credit Card",
      shippingAddress: {
        name: "John Doe",
        address: "123 Art Street",
        city: "Metro Manila",
        postalCode: "1000",
      },
      artwork: {
        size: "18 x 14 inches",
        medium: "Watercolor",
        style: "Landscape",
        edition: "Original (1 of 1)",
        yearCreated: 2024,
      },
      timeline: [
        { status: "Order Placed", date: "Jan 8, 2025", description: "Your order has been confirmed", completed: true },
        {
          status: "Payment Confirmed",
          date: "Jan 8, 2025",
          description: "Payment received successfully",
          completed: true,
        },
        { status: "Processing", date: "Jan 9, 2025", description: "Order is being prepared", completed: true },
        { status: "Shipped", date: "", description: "Artwork will be shipped soon", completed: false },
        { status: "Delivered", date: "", description: "Artwork delivered to your address", completed: false },
      ],
    },
    {
      id: "ORD-004",
      artworkImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
      title: "Mountain Sunrise",
      artist: "David Park",
      price: 180000,
      status: "completed",
      orderDate: "2024-12-20",
      completedDate: "2025-7-01",
      expectedDelivery: "2024-12-30",
      paymentMethod: "PayPal",
      shippingAddress: {
        name: "John Doe",
        address: "123 Art Street",
        city: "Metro Manila",
        postalCode: "1000",
      },
      artwork: {
        size: "24 x 18 inches",
        medium: "Oil on Canvas",
        style: "Landscape",
        edition: "Original (1 of 1)",
        yearCreated: 2024,
      },
      timeline: [
        { status: "Order Placed", date: "Dec 20, 2024", description: "Your order has been confirmed", completed: true },
        {
          status: "Payment Confirmed",
          date: "Dec 20, 2024",
          description: "Payment received successfully",
          completed: true,
        },
        { status: "Processing", date: "Dec 21, 2024", description: "Order is being prepared", completed: true },
        { status: "Shipped", date: "Dec 25, 2024", description: "Artwork has been shipped", completed: true },
        { status: "Delivered", date: "Dec 30, 2024", description: "Artwork delivered successfully", completed: true },
      ],
    },
    {
      id: "ORD-005",
      artworkImage: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=300&fit=crop",
      title: "Abstract Blue",
      artist: "Luna Martinez",
      price: 65000,
      status: "failed",
      orderDate: "2025-01-10",
      paymentMethod: "Credit Card",
      shippingAddress: {
        name: "John Doe",
        address: "123 Art Street",
        city: "Metro Manila",
        postalCode: "1000",
      },
      artwork: {
        size: "12 x 12 inches",
        medium: "Acrylic on Canvas",
        style: "Abstract",
        edition: "Limited Edition (3 of 25)",
        yearCreated: 2024,
      },
      timeline: [
        { status: "Order Placed", date: "Jan 10, 2025", description: "Your order has been confirmed", completed: true },
        {
          status: "Payment Failed",
          date: "Jan 10, 2025",
          description: "Payment could not be processed",
          completed: false,
        },
      ],
    },
    {
      id: "ORD-006",
      artworkImage: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=300&fit=crop",
      title: "Autumn Memories",
      artist: "Isabella Torres",
      price: 85000,
      status: "cancelled",
      orderDate: "2025-01-05",
      paymentMethod: "Credit Card",
      shippingAddress: {
        name: "John Doe",
        address: "123 Art Street",
        city: "Metro Manila",
        postalCode: "1000",
      },
      artwork: {
        size: "14 x 18 inches",
        medium: "Oil on Canvas",
        style: "Landscape",
        edition: "Limited Edition (2 of 20)",
        yearCreated: 2024,
      },
      timeline: [
        { status: "Order Placed", date: "Jan 5, 2025", description: "Your order has been confirmed", completed: true },
        {
          status: "Order Cancelled",
          date: "Jan 5, 2025",
          description: "Order cancelled by customer request",
          completed: true,
        },
      ],
    },
    {
      id: "ORD-007",
      artworkImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop",
      title: "Ocean Waves",
      artist: "Carlos Mendez",
      price: 110000,
      status: "refunded",
      orderDate: "2024-12-15",
      paymentMethod: "PayPal",
      shippingAddress: {
        name: "John Doe",
        address: "123 Art Street",
        city: "Metro Manila",
        postalCode: "1000",
      },
      artwork: {
        size: "20 x 24 inches",
        medium: "Acrylic on Canvas",
        style: "Abstract",
        edition: "Original (1 of 1)",
        yearCreated: 2024,
      },
      timeline: [
        { status: "Order Placed", date: "Dec 15, 2024", description: "Your order has been confirmed", completed: true },
        {
          status: "Payment Confirmed",
          date: "Dec 15, 2024",
          description: "Payment received successfully",
          completed: true,
        },
        { status: "Processing", date: "Dec 16, 2024", description: "Order is being prepared", completed: true },
        { status: "Refund Requested", date: "Dec 18, 2024", description: "Customer requested refund", completed: true },
        {
          status: "Refund Processed",
          date: "Dec 20, 2024",
          description: "Refund completed successfully",
          completed: true,
        },
      ],
    },
    {
      id: "ORD-008",
      artworkImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
      title: "City Lights",
      artist: "Alexandra Kim",
      price: 150000,
      status: "reviewed",
      orderDate: "2024-11-25",
      completedDate: "2024-12-05",
      reviewDate: "2024-12-10",
      review: {
        id: "REV-001",
        rating: 5,
        comment:
          "Absolutely stunning artwork! The quality exceeded my expectations and the colors are so vibrant. The artist really captured the urban energy perfectly. Highly recommend!",
        photos: [
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop",
          "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=200&fit=crop",
        ],
        reviewDate: "2025-7-20",
        canEdit: differenceInDays(new Date(), new Date("2025-7-20")) <= 7, // 7 days to edit
        canDelete: differenceInDays(new Date(), new Date("2025-7-20")) <= 3, // 3 days to delete
      },
      expectedDelivery: "2024-12-05",
      paymentMethod: "GCash",
      shippingAddress: {
        name: "John Doe",
        address: "123 Art Street",
        city: "Metro Manila",
        postalCode: "1000",
      },
      artwork: {
        size: "22 x 16 inches",
        medium: "Mixed Media",
        style: "Urban",
        edition: "Limited Edition (1 of 10)",
        yearCreated: 2024,
      },
      timeline: [
        { status: "Order Placed", date: "Nov 25, 2024", description: "Your order has been confirmed", completed: true },
        {
          status: "Payment Confirmed",
          date: "Nov 25, 2024",
          description: "Payment received successfully",
          completed: true,
        },
        { status: "Processing", date: "Nov 26, 2024", description: "Order is being prepared", completed: true },
        { status: "Shipped", date: "Nov 30, 2024", description: "Artwork has been shipped", completed: true },
        { status: "Delivered", date: "Dec 5, 2024", description: "Artwork delivered successfully", completed: true },
        { status: "Reviewed", date: "Dec 10, 2024", description: "Customer left a 5-star review", completed: true },
      ],
    },
  ];

  const filteredOrders = mockOrders.filter((order) => order.status === subTab);
  const filteredArtworks = myArtCards.filter((art) => {
    const status = art.art_status?.toLowerCase?.() || "";
    const expectedStatus = statusMap[subTab]?.toLowerCase() || subTab.toLowerCase();
    return mainTab === "myListings" ? status === expectedStatus : false;
  });

  return (
    <div className="w-full">
      {/* MAIN TABS */}
      <div className="flex space-x-4 mb-4 text-[11px] font-semibold">
        {["myListings", "myPurchase"].map((tab) => (
          <button
            key={tab}
            className={`px-3 ${mainTab === tab ? "text-red-800" : "text-gray-600"}`}
            onClick={() => {
              setMainTab(tab);
              setSubTab(tab === "myListings" ? "available" : "pending_payment");
              setActiveSubGroup("listings");
              setShowDropdown(false);
            }}
          >
            {tab === "myListings" ? "MY LISTINGS" : "MY PURCHASE"}
          </button>
        ))}
      </div>

      {/* DROPDOWN + SUBTABS */}
      {mainTab === "myListings" ? (
        <div className="relative mb-6 flex flex-wrap items-center gap-4 text-[11px]">
          <div className="relative">
            <button
              className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-full text-gray-700"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{activeSubGroup === "listings" ? "Listings" : "Sold Artworks"}</span>
              <svg
                className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute z-10 bg-white border mt-2 rounded shadow text-[11px]">
                {["listings", "soldArtworks"].map((option) => (
                  <button
                    key={option}
                    className={`block px-4 py-2 w-full text-left ${
                      activeSubGroup === option ? "text-black font-medium" : "text-gray-600"
                    }`}
                    onClick={() => {
                      setActiveSubGroup(option as "listings" | "soldArtworks");
                      setSubTab(option === "listings" ? "available" : "awaiting_payment");
                      setShowDropdown(false);
                    }}
                  >
                    {option === "listings" ? "Listings" : "Sold"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {(activeSubGroup === "listings" ? activeListingTabs : soldArtworksTabs).map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1 border-b-2 ${
                  subTab === tab ? "border-red-800 text-red-800" : "border-transparent text-gray-600"
                }`}
                onClick={() => setSubTab(tab)}
              >
                {tab.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5 mb-6 text-[11px] font-normal">
          {myPurchaseTabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 border-b-2 ${
                subTab === tab ? "border-red-800 text-red-800" : "border-transparent text-gray-600"
              }`}
              onClick={() => setSubTab(tab)}
            >
              {tab.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {/* ARTWORK / ORDER DISPLAY */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
          {Array(6)
            .fill(0)
            .map((_, idx) => (
              <SellCardSkeleton key={idx} />
            ))}
        </div>
      ) : mainTab === "myPurchase" ? (
        filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <img src="/pics/empty.png" alt="No orders" className="w-32 h-32 mx-auto opacity-70 mb-4" />
            <p className="text-xs text-gray-500">No artworks found for this status.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <PurchasedArtworkCard
                key={order.id}
                {...order}
                onViewDetails={() => handleViewDetails(order)}
                onReview={() => handleReview(order)}
                onViewReview={() => handleViewReview(order)}
                onContact={handleContact}
                onTrackOrder={handleTrackOrder}
                onRequestRefund={handleRequestRefund}
                onCancelOrder={handleCancelOrder}
              />
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
          {filteredArtworks.map((art) => (
            <SellCard
              key={art.id}
              id={art.id}
              artworkImage={art.image_url?.[0] || "/placeholder.jpg"}
              price={art.discounted_price ?? art.price}
              originalPrice={art.discounted_price ? art.price : 0}
              title={art.title}
              category={art.category}
              edition="Original (1 of 1)"
              rating={art.total_ratings}
              isMarketplace
              onLike={onLikeToggle}
              onCardClick={() => onCardClick(art.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailsModal isOpen={showOrderDetails} onClose={() => setShowOrderDetails(false)} order={selectedOrder} />
      )}
      {reviewingArtwork && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
          artwork={reviewingArtwork}
        />
      )}
      {selectedReview && (
        <ReviewDetailsModal
          isOpen={showReviewDetailsModal}
          onClose={() => setShowReviewDetailsModal(false)}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
          review={selectedReview}
          artwork={selectedReview.artwork}
        />
      )}
      {selectedReview && (
        <EditReviewModal
          isOpen={showEditReviewModal}
          onClose={() => setShowEditReviewModal(false)}
          onSubmit={handleUpdateReview}
          artwork={selectedReview.artwork}
          existingReview={selectedReview}
        />
      )}
    </div>
  );
};

export default SellTab;
