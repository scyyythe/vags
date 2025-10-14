import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import SellCard from "@/components/user_dashboard/Marketplace/cards/SellCard";
import SellCardSkeleton from "@/components/skeletons/marketplace/SellCardSkeleton";
import SalesSummary from "@/components/user_dashboard/Marketplace/sales_summary/SalesSummary";
import useMySellArtCards from "@/hooks/artworks/sell/useMySellArtCards";
import useUserSellArtCards from "@/hooks/artworks/sell/useUserSellArtCards";
import { getLoggedInUserId } from "@/auth/decode";
import { memo } from "react";
import PurchasedArtworkCard from "@/components/user_dashboard/Marketplace/my_purchase/card/PurchasedArtworkCard";
import OrderDetailsModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/OrderDetailsModal";
import ReviewModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/ReviewModal";
import ReviewDetailsModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/ReviewDetailsModal";
import EditReviewModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/EditReviewModal";
import PaymentDetailsModal from "@/components/user_dashboard/Marketplace/my_listings/PaymentDetailsModal";
import RefundDetailsModal from "@/components/user_dashboard/Marketplace/my_listings/RefundDetailsModal";
import TrackPaymentModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/TrackPaymentModal";
import { useChat } from "@/context/ChatContext";
import apiClient from "@/utils/apiClient";

import SoldArtworkCard from "@/components/user_dashboard/Marketplace/sold_artworks/card/SoldArtworksCard";
import { useMyPurchases } from "@/hooks/purchase/useMyPurchases";
import { q } from "node_modules/framer-motion/dist/types.d-B50aGbjN";
import { useSubmitReview } from "@/hooks/review/useSubmitReview";
import { formatOrderDetails } from "@/utils/purchase/formatOrder";
import { uploadToCloudinary } from "@/hooks/review/useSubmitReview";
import { useMySoldArtworks } from "@/hooks/purchase/useMySoldArtworks";
import { formatSoldArtworks } from "@/utils/purchase/formatSoldArtwork";
import { useReviewByPurchase } from "@/hooks/review/useReviewByPurchase";
import { ReviewResponse } from "@/hooks/review/useReviewByPurchase";
import { useEditReview } from "@/hooks/review/useEditReview";
import { useDeleteReview } from "@/hooks/review/useDeleteReview";
import useMarkPurchaseCompleted from "@/hooks/purchase/useMarkPurchaseCompleted";
import useMarkAsShipped from "@/hooks/purchase/useMarkAsShipped";
type SellTabProps = {
  selectedPriceRange?: string;
  selectedStatus?: string;
  navigationState?: any;
};
const SellTab = ({ selectedPriceRange, selectedStatus, navigationState }) => {
  const { id: userId } = useParams();
  const loggedInUserId = getLoggedInUserId();
  const navigate = useNavigate();
  const isOwnProfile = String(userId) === String(loggedInUserId);
  const { data: myPurchases, isLoading: isMyPurchasesLoading } = useMyPurchases();
  const { openChat } = useChat();

  const { data: myArtCards = [], isLoading: isMyArtLoading, error: myArtError } = useMySellArtCards();
  const { data: userArtCards = [], isLoading: isUserArtLoading, error: userArtError } = useUserSellArtCards(userId);

  // Use appropriate data based on whether it's own profile or not
  const artCards = isOwnProfile ? myArtCards : userArtCards;
  const isLoading = isOwnProfile ? isMyArtLoading : isUserArtLoading;
  const error = isOwnProfile ? myArtError : userArtError;

  const [mainTab, setMainTab] = useState("myListings");
  const [activeSubGroup, setActiveSubGroup] = useState<"listings" | "soldArtworks">("listings");
  const [subTab, setSubTab] = useState("available");

  // Reset subTab to "available" if it's "unlisted" and viewing another user's profile
  React.useEffect(() => {
    if (!isOwnProfile && subTab === "unlisted") {
      setSubTab("available");
    }
  }, [isOwnProfile, subTab]);

  // Handle navigation state to set specific tabs
  React.useEffect(() => {
    if (navigationState) {
      const { mainTab: navMainTab, activeSubGroup: navActiveSubGroup, subTab: navSubTab } = navigationState;
      if (navMainTab) setMainTab(navMainTab);
      if (navActiveSubGroup) setActiveSubGroup(navActiveSubGroup);
      if (navSubTab) setSubTab(navSubTab);
    }
  }, [navigationState]);
  const [activeSubTab, setActiveSubTab] = useState("awaiting_payment");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTrackPaymentModal, setShowTrackPaymentModal] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null);

  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [showRefundDetailsModal, setShowRefundDetailsModal] = useState(false);
  const [reviewingArtwork, setReviewingArtwork] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<{
    artworkId: string;
    artworkImage: string;
    title: string;
    artist: string;
  } | null>(null);

  const [showSalesSummary, setShowSalesSummary] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(null);
  const [showReviewDetailsModal, setShowReviewDetailsModal] = useState(false);

  const { mutate: fetchReviewByPurchase, isPending } = useReviewByPurchase();
  const { mutateAsync: editReview, isPending: isUpdating } = useEditReview();
  const { mutateAsync: deleteReview } = useDeleteReview();
  const { mutate: submitReview } = useSubmitReview();
  const { mutate: markAsCompleted } = useMarkPurchaseCompleted();
  const { mutate: markAsShipped } = useMarkAsShipped();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleViewDetails = (artwork: any) => {
    setSelectedOrder(artwork);
    setShowOrderDetails(true);
  };

  const handleReviewClick = (
    artwork: {
      artworkId: string;
      artworkImage: string;
      title: string;
      artist: string;
    },
    order: any
  ) => {
    setSelectedArtwork(artwork);
    setSelectedOrder(order);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (reviewData: {
    artworkId: string;
    rating: number;
    comment: string;
    photos: string[];
  }) => {
    try {
      setIsSubmitting(true);

      const uploadedPhotoUrls: string[] = [];

      for (const localUrl of reviewData.photos) {
        const file = await fetch(localUrl)
          .then((r) => r.blob())
          .then((b) => new File([b], "review.jpg"));
        const uploadedUrl = await uploadToCloudinary(file);
        uploadedPhotoUrls.push(uploadedUrl);
      }

      const payload = {
        artwork_id: reviewData.artworkId || selectedOrder?.artwork?._id || selectedOrder?.artwork?.id,
        purchase_id: selectedOrder?.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        photos: uploadedPhotoUrls,
      };

      if (!payload.purchase_id) {
        toast.error("Missing purchase ID for review.");
        return;
      }
      if (!payload.artwork_id) {
        toast.error("Missing artwork ID for review.");
        return;
      }

      await submitReview(payload);
      toast.success("Review submitted successfully!", { closeButton: true });
      setReviewModalOpen(false);
    } catch (err) {
      console.error("❌ Review submission failed", err);
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContact = (order) => {
    const sellerId = order.artwork?.artist_id;
    const sellerName = order.artwork?.artist_name;

    if (!sellerId) {
      toast.error("Unable to contact seller - seller ID not found");
      return;
    }

    if (!sellerName) {
      toast.error("Unable to contact seller - seller name not found");
      return;
    }

    openChat(String(sellerId), sellerName, undefined, true);
    toast(`Opening conversation with ${sellerName}...`, { closeButton: true });
  };

  const handleTrackOrder = (order) => {
    setSelectedOrderForTracking(order);
    setShowTrackPaymentModal(true);
  };

  const handleRequestRefund = () =>
    toast.info("Refund request initiated...", {
      closeButton: true,
    });

  const handleReorder = () =>
    toast.success("Artwork reordered successfully!", {
      closeButton: true,
      description: "You can view it in your pending orders.",
    });

  const handleCancelOrder = () =>
    toast.warning("Order cancelled successfully", {
      closeButton: true,
    });

  const handleViewReview = (order: any) => {
    fetchReviewByPurchase(order.id, {
      onSuccess: (data) => {
        setSelectedReview({
          ...data,
          artwork: {
            artworkImage: order.artwork?.image_url?.[0] || "",
            title: order.artwork?.title || "Untitled",
            artist: order.artwork?.artist_name || "Unknown",
          },
        });
        setShowReviewDetailsModal(true);
      },
      onError: (err) => {
        toast.error("Failed to load review.");
        console.error(err);
      },
    });
  };

  const handleEditReview = () => {
    setShowReviewDetailsModal(false);
    setShowEditReviewModal(true);
  };

  const handleDeleteReview = async () => {
    if (!selectedReview?.id) {
      toast.error("No review selected to delete.");
      return;
    }

    try {
      await deleteReview(selectedReview.id);
      toast.warning("Review deleted successfully!", {
        closeButton: true,
      });

      setShowReviewDetailsModal(false);
      setSelectedReview(null);
    } catch (err) {
      console.error("❌ Failed to delete review:", err);
      toast.error("Failed to delete review.");
    }
  };

  const onCardClick = useCallback(
    (id: string) => {
      if (!id) return;
      navigate(`/viewproduct/${id}/`);
    },
    [navigate]
  );
  const handleUpdateReview = async (reviewData: { rating: number; comment: string; photos: string[] }) => {
    if (!selectedReview?.id) {
      toast.error("No review selected to update.");
      return;
    }

    try {
      await editReview({
        review_id: selectedReview.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        photos: reviewData.photos,
      });

      toast.success("Review updated successfully!", {
        closeButton: true,
      });

      setShowEditReviewModal(false);
      setSelectedReview(null);
    } catch (err) {
      console.error("Review update failed", err);
      toast.error("Failed to update review.");
    }
  };

  const onLikeToggle = useCallback(() => {}, []);
  const statusMap: Record<string, string> = {
    available: "onsale",
    unlisted: "unlisted",
    sold: "sold",
    deleted: "deleted",
    draft: "unlisted",
    inactive: "unlisted",
  };

  const activeListingTabs = isOwnProfile ? ["available", "unlisted", "sold"] : ["available", "sold"];
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
    // "pending_payment",
    // "payment_processing",
    "paid",
    "failed",
    "to receive",
    "completed",
    "refunded",
    "reviewed",
    "cancelled",
  ];

  // Mock data for payment details
  const mockPaymentDetails = {
    id: "PAY-001",
    amount: 120000,
    currency: "PHP",
    status: "completed",
    paymentMethod: "GCash",
    transactionId: "TXN-GC-2025012001",
    paymentDate: "2025-01-20T10:30:00Z",
    processingFee: 6000,
    netAmount: 114000,
    buyer: {
      name: "Michael Chen",
      email: "michael.chen@email.com",
    },
    billing: {
      address: "789 Pine Street",
      city: "Makati City",
      postalCode: "1234",
      country: "Philippines",
    },
  };

  // Mock data for refund details
  const mockRefundDetails = {
    id: "REF-001",
    originalAmount: 110000,
    refundAmount: 110000,
    currency: "PHP",
    status: "processed",
    reason:
      "Customer requested refund due to shipping damage. Item was damaged during transit and customer provided photos as evidence.",
    requestDate: "2024-12-18T14:30:00Z",
    processedDate: "2024-12-20T09:15:00Z",
    refundMethod: "Credit Card",
    transactionId: "REF-CC-2024122001",
    originalTransactionId: "TXN-CC-2024121501",
    buyer: {
      name: "Carlos Mendoza",
      email: "carlos.mendoza@email.com",
    },
    timeline: [
      { status: "Refund Requested", date: "Dec 18, 2024", description: "Customer requested refund", completed: true },
      { status: "Under Review", date: "Dec 18, 2024", description: "Refund request under review", completed: true },
      { status: "Approved", date: "Dec 19, 2024", description: "Refund request approved", completed: true },
      { status: "Processing", date: "Dec 19, 2024", description: "Refund being processed", completed: true },
      { status: "Completed", date: "Dec 20, 2024", description: "Refund processed successfully", completed: true },
    ],
  };
  const normalizedTab = subTab?.toLowerCase().trim();
  const normalizedKey = normalizedTab?.replace(/\s+/g, "_");

  const purchaseStatusMap: Record<string, string> = {
    pending_payment: "Pending",
    payment_processing: "Processing",
    paid: "Paid",
    failed: "Failed",
    to_receive: "To Receive",
    cancelled: "Cancelled",
    completed: "Completed",
    refunded: "Refunded",
    reviewed: "Reviewed",
  };

  const expectedStatus = purchaseStatusMap[normalizedKey];

  const filteredOrders = Array.isArray(myPurchases)
    ? myPurchases
        .filter((order) => {
          const rawStatus = order.status?.trim() || "";
          const normalizedStatus = rawStatus.toLowerCase().replace(/\s+/g, "_");

          if (normalizedKey === "completed") {
            const matched = normalizedStatus === "completed" || normalizedStatus === "reviewed";

            return matched;
          }

          const matched = normalizedStatus === normalizedKey;

          return matched;
        })
        .map((order) => {
          const overrideStatus =
            normalizedKey === "completed" && order.status?.trim() === "Reviewed" ? "Completed" : order.status;
          console.log("🧾 Final Status Used:", overrideStatus);
          return { ...order, status: overrideStatus };
        })
    : [];

  const soldArtworkStatusMap: Record<string, string> = {
    awaiting_payment: "Pending",
    payment_received: "Paid",
    in_progress: "To Receive",
    completed: "Completed",
    reviews: "Reviewed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };

  const mappedStatus = soldArtworkStatusMap[normalizedTab];

  const shouldPassStatusToBackend = !["completed", "reviews", "reviewed"].includes(normalizedTab);

  const { data: soldArtworks } = useMySoldArtworks(shouldPassStatusToBackend ? mappedStatus : undefined);

  const filteredSoldArtworks = Array.isArray(soldArtworks)
    ? formatSoldArtworks(soldArtworks)
        .filter((sale) => {
          const status = sale.status?.toLowerCase();

          if (normalizedTab === "reviews" || normalizedTab === "reviewed") {
            return status === "reviewed";
          }
          if (normalizedTab === "completed") {
            return status === "completed" || status === "reviewed";
          }

          if (normalizedTab === "reviews" || normalizedTab === "reviewed") {
            return status === "reviewed";
          }

          if (normalizedTab === "in_progress") {
            return status === "in_progress" || status === "to_receive";
          }

          return status === mappedStatus?.toLowerCase();
        })
        .map((sale) => {
          let updatedStatus = sale.status;

          if (normalizedTab === "completed" && sale.status?.toLowerCase() === "reviewed") {
            updatedStatus = "completed";
          }

          if (normalizedTab === "in_progress" && sale.status?.toLowerCase() === "to_receive") {
            updatedStatus = "in_progress";
          }

          return { ...sale, status: updatedStatus };
        })
    : [];

  const filteredSoldArtworksForListings =
    isOwnProfile && subTab === "sold"
      ? Array.isArray(soldArtworks)
        ? formatSoldArtworks(soldArtworks)
            .filter((sale) => {
              const status = sale.status?.toLowerCase();
              return status === "sold" || status === "completed" || status === "reviewed";
            })
            .map((sale) => ({
              id: sale.artwork_id,
              title: sale.title,
              artist_id: sale.artist_id,
              price: sale.price,
              originalPrice: sale.price,
              rating: sale.review ? sale.review.rating : 0,
              category: sale.artwork.style,
              artworkImage: sale.artworkImage,
              status: "sold",
            }))
        : []
      : [];

  let filteredArtworks = artCards
    .filter((art) => {
      // Apply status filter first (Archived, Deleted, etc.)
      if (selectedStatus && selectedStatus !== "Active") {
        if (selectedStatus === "Archived") {
          return art.visibility?.toLowerCase() === "archived";
        } else if (selectedStatus === "Deleted") {
          return art.visibility?.toLowerCase() === "deleted";
        } else if (selectedStatus === "Hidden") {
          // Backend already handles hidden filtering
          return true;
        }
        // For other statuses, continue with normal filtering
      }

      const status = (art.art_status || "").toLowerCase().trim();
      const tab = (subTab || "").toLowerCase().trim();

      if (tab === "unlisted") {
        return (
          isOwnProfile &&
          mainTab === "myListings" &&
          activeSubGroup === "listings" &&
          ["unlisted", "draft", "inactive"].includes(status)
        );
      }

      return (
        mainTab === "myListings" && activeSubGroup === "listings" && status === (statusMap[tab] || "").toLowerCase()
      );
    })
    .map((art) => ({
      id: art.id,
      title: art.title,
      artist_id: art.artist_id,
      price: art.discounted_price ?? art.price,
      originalPrice: art.discounted_price ? art.price : 0,
      rating: art.total_ratings,
      category: art.category,
      artworkImage: art.image_url[0] || "",
      status: (art.art_status || "").toLowerCase().trim(),
    }));

  if (selectedPriceRange === "Low to High") {
    filteredArtworks = filteredArtworks.slice().sort((a, b) => a.price - b.price);
  } else if (selectedPriceRange === "High to Low") {
    filteredArtworks = filteredArtworks.slice().sort((a, b) => b.price - a.price);
  }

  // Seller actions for sold artworks
  const handleContactBuyer = (artwork) => {
    const buyerId = artwork.buyer_id;
    const buyerName = artwork.buyer;

    if (!buyerId) {
      toast.error("Unable to contact buyer - buyer ID not found");
      return;
    }

    if (!buyerName) {
      toast.error("Unable to contact buyer - buyer name not found");
      return;
    }

    // Open direct conversation with buyer
    openChat(String(buyerId), buyerName, undefined, true);
    toast(`Opening conversation with ${buyerName}...`, { closeButton: true });
  };

  const handleMarkAsShipped = (artwork) => {
    markAsShipped(artwork.id);
  };

  const handleTrackProgress = (artwork: any) => {
    setSelectedOrder(artwork);
    setShowOrderDetails(true);
  };

  const handleViewSummary = (artwork: any) => {
    setSelectedOrder(artwork);
    setShowOrderDetails(true);
  };

  const handleViewPayment = (artwork) => {
    setSelectedPayment(mockPaymentDetails);
    setShowPaymentDetailsModal(true);
  };

  const handleProcessRefund = (artwork) => {
    setSelectedRefund(mockRefundDetails);
    setShowRefundDetailsModal(true);
  };

  const handleViewSellerReview = (artwork) => {
    if (!artwork.review) {
      toast.info("No review found for this sale.");
      return;
    }

    setSelectedReview({
      ...artwork.review,
      reviewerName: artwork.buyer,
      canEdit: false, // seller cannot edit buyer reviews
      canDelete: false, // seller usually shouldn’t delete reviews
      artwork: {
        artworkImage: artwork.artworkImage,
        title: artwork.title,
        artist: "You",
      },
    });
    setShowReviewDetailsModal(true);
  };

  return (
    <div className="w-full">
      {/* MAIN TABS */}
      <div className="flex justify-between items-center mb-4 text-[11px] font-semibold">
        {/* Left: MY LISTINGS + MY PURCHASE */}
        <div className="flex space-x-4">
          <button
            className={`px-3 ${mainTab === "myListings" ? "text-red-800" : "text-gray-600"}`}
            onClick={() => {
              setMainTab("myListings");
              setSubTab("available");
              setActiveSubGroup("listings");
              setShowDropdown(false);
            }}
          >
            MY LISTINGS
          </button>
          {isOwnProfile && (
            <button
              className={`px-3 ${mainTab === "myPurchase" ? "text-red-800" : "text-gray-600"}`}
              onClick={() => {
                setMainTab("myPurchase");
                setSubTab("paid");
                setActiveSubGroup("listings");
                setShowDropdown(false);
              }}
            >
              MY PURCHASE
            </button>
          )}
        </div>
        {/* Right: SALES SUMMARY */}
        <button
          className={`px-3 ${mainTab === "salesSummary" ? "text-red-800" : "text-gray-600"}`}
          onClick={() => {
            setMainTab("salesSummary");
          }}
        >
          SALES SUMMARY
        </button>
      </div>

      {/* DROPDOWN + SUBTABS */}
      {mainTab !== "salesSummary" &&
        (mainTab === "myListings" ? (
          isOwnProfile ? (
            // Owner: Show dropdown and both Listings/Sold Artworks subtabs
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
            // Not owner: Only show Listings subtabs, no dropdown
            <div className="flex flex-wrap gap-4 mb-6 text-[11px]">
              {activeListingTabs.map((tab) => (
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
          )
        ) : (
          // MY PURCHASE subtabs (already only visible to owner)
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
        ))}

      {/* Content Display */}
      <div className="space-y-4">
        {mainTab === "salesSummary" ? (
          <SalesSummary />
        ) : mainTab === "myListings" && activeSubGroup === "soldArtworks" ? (
          subTab === "reviews" ? (
            filteredSoldArtworks.length === 0 ? (
              <div className="text-xs text-center py-12">
                <p className="text-muted-foreground">No reviews yet on your sold artworks.</p>
              </div>
            ) : (
              filteredSoldArtworks.map((artwork) => (
                <SoldArtworkCard
                  key={artwork.id}
                  id={artwork.id}
                  artworkImage={artwork.artworkImage}
                  title={artwork.title}
                  buyer={artwork.buyer}
                  buyer_id={artwork.buyer_id}
                  price={artwork.price}
                  status="reviewed"
                  saleDate={artwork.saleDate}
                  completedDate={artwork.completedDate}
                  paymentMethod={artwork.paymentMethod}
                  shippingAddress={artwork.shippingAddress}
                  artwork={artwork.artwork}
                  review={artwork.review}
                  isHighlighted={navigationState?.highlightedOrderId === artwork.id}
                  onViewReview={() => handleViewSellerReview(artwork)}
                  onViewDetails={(artwork) => handleViewDetails(artwork)}
                  onContactBuyer={(artwork) => handleContactBuyer(artwork)}
                  onMarkAsShipped={(artwork) => handleMarkAsShipped(artwork)}
                  onViewPayment={(artwork) => handleViewPayment(artwork)}
                  onProcessRefund={(artwork) => handleProcessRefund(artwork)}
                  onTrackProgress={(artwork) => handleTrackProgress(artwork)}
                  onViewSummary={(artwork) => handleViewSummary(artwork)}
                />
              ))
            )
          ) : // default for other soldArtworks tabs
          filteredSoldArtworks.length === 0 ? (
            <div className="text-xs text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 opacity-50">{/* icon svg */}</div>
              <p className="text-muted-foreground">No sold artworks found for this status.</p>
            </div>
          ) : (
            filteredSoldArtworks.map((artwork) => (
              <SoldArtworkCard
                key={artwork.id}
                id={artwork.id}
                artworkImage={artwork.artworkImage}
                title={artwork.title}
                buyer={artwork.buyer}
                buyer_id={artwork.buyer_id}
                price={artwork.price}
                status={artwork.status}
                saleDate={artwork.saleDate}
                completedDate={artwork.completedDate}
                paymentMethod={artwork.paymentMethod}
                shippingAddress={artwork.shippingAddress}
                artwork={artwork.artwork}
                review={artwork.review}
                isHighlighted={navigationState?.highlightedOrderId === artwork.id}
                onViewDetails={(art) => handleViewDetails(art)}
                onContactBuyer={(art) => handleContactBuyer(art)}
                onMarkAsShipped={(art) => handleMarkAsShipped(art)}
                onViewPayment={(art) => handleViewPayment(art)}
                onProcessRefund={(art) => handleProcessRefund(art)}
                onViewReview={(art) => handleViewSellerReview(art)}
                onTrackProgress={(art) => handleTrackProgress(art)}
                onViewSummary={(art) => handleViewSummary(art)}
              />
            ))
          )
        ) : mainTab === "myPurchase" ? (
          filteredOrders.length === 0 ? (
            <div className="text-xs text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                <svg
                  className="w-full h-full text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">No orders found for this status.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <PurchasedArtworkCard
                key={order.id}
                id={order.id}
                artworkImage={order.artwork.image_url?.[0]}
                title={order.artwork?.title || "Untitled"}
                artist={order.artwork?.artist_name || "Unknown"}
                artistId={order.artwork?.artist_id}
                price={order.artwork?.price ?? 0}
                status={
                  order.status === "Pending" ? "pending_payment" : order.status?.toLowerCase().replace(/\s+/g, "_")
                }
                orderDate={order.created_at ? new Date(order.created_at).toLocaleDateString() : "Unknown"}
                completedDate="2025-07-10T10:00:00Z"
                expectedDelivery={
                  order.expectedDelivery
                    ? new Date(order.expectedDelivery).toLocaleDateString()
                    : order.created_at
                    ? new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                    : "Unknown"
                }
                onViewDetails={() => handleViewDetails(order)}
                onReview={() =>
                  handleReviewClick(
                    {
                      artworkId: order.artwork._id,
                      artworkImage: order.artwork.image_url?.[0],
                      title: order.artwork?.title || "Untitled",
                      artist: order.artwork?.artist_name || "Unknown",
                    },
                    order
                  )
                }
                onViewReview={() => handleViewReview(order)}
                onContact={() => handleContact(order)}
                onTrackOrder={() => handleTrackOrder(order)}
                onRequestRefund={handleRequestRefund}
                onCancelOrder={handleCancelOrder}
                onMarkCompleted={() => markAsCompleted(order.id)}
              />
            ))
          )
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <SellCardSkeleton key={idx} />
            ))}
          </div>
        ) : subTab === "sold" && isOwnProfile ? (
          filteredSoldArtworksForListings.length === 0 ? (
            <div className="text-xs text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                <svg
                  className="w-full h-full text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">No sold artworks found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredSoldArtworksForListings.map((art) => {
                return (
                  <SellCard
                    key={art.id}
                    id={art.id}
                    artworkImage={art.artworkImage}
                    title={art.title}
                    price={art.price}
                    originalPrice={art.originalPrice}
                    rating={art.rating}
                    category={art.category}
                    status="sold"
                    isMarketplace={true}
                    artistId={art.artist_id}
                    isOwner={isOwnProfile}
                    onCardClick={() => onCardClick(art.id)}
                  />
                );
              })}
            </div>
          )
        ) : filteredArtworks.length === 0 ? (
          <div className="text-xs text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 opacity-50">
              <svg
                className="w-full h-full text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">No active artworks found for this user.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredArtworks.map((art) => (
              <SellCard
                key={art.id}
                id={art.id}
                artworkImage={art.artworkImage}
                title={art.title}
                price={art.price}
                artistId={art.artist_id}
                originalPrice={art.originalPrice}
                rating={art.rating}
                category={art.category}
                status="active"
                isMarketplace={true}
                isOwner={isOwnProfile}
                onCardClick={() => onCardClick(art.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          key={selectedOrder.id}
          isOpen={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          order={
            mainTab === "myListings" && activeSubGroup === "soldArtworks"
              ? selectedOrder
              : formatOrderDetails(selectedOrder)
          }
          viewType={mainTab === "myListings" && activeSubGroup === "soldArtworks" ? "seller" : "buyer"}
          onContactBuyer={() => handleContactBuyer(selectedOrder)}
          onViewPayment={() => handleViewPayment(selectedOrder)}
          onMarkAsShipped={() => handleMarkAsShipped(selectedOrder)}
          onLeaveReview={(order) => {
            setReviewModalOpen(true);
            setReviewOrder(order);
            setSelectedArtwork({
              artworkId: order.artwork?._id || order.artwork?.id,
              artworkImage: order.artwork?.image_url?.[0] || order.artworkImage,
              title: order.artwork?.title || order.title,
              artist: order.artwork?.artist_name || order.artist || "Unknown",
            });
          }}
        />
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          isOpen={showPaymentDetailsModal}
          onClose={() => setShowPaymentDetailsModal(false)}
          payment={selectedPayment}
        />
      )}

      {/* Track Payment Modal */}
      {selectedOrderForTracking && (
        <TrackPaymentModal
          isOpen={showTrackPaymentModal}
          onClose={() => {
            setShowTrackPaymentModal(false);
            setSelectedOrderForTracking(null);
          }}
          order={{
            id: selectedOrderForTracking.id,
            artworkImage: selectedOrderForTracking.artwork.image_url?.[0] || "",
            title: selectedOrderForTracking.artwork?.title || "Untitled",
            artist: selectedOrderForTracking.artwork?.artist_name || "Unknown",
            price: selectedOrderForTracking.artwork?.price ?? 0,
            status: selectedOrderForTracking.status,
            orderDate: selectedOrderForTracking.created_at
              ? new Date(selectedOrderForTracking.created_at).toLocaleDateString()
              : "Unknown",
            paymentMethod: selectedOrderForTracking.payment_method || "Unknown",
          }}
        />
      )}

      {/* Refund Details Modal */}
      {selectedRefund && (
        <RefundDetailsModal
          isOpen={showRefundDetailsModal}
          onClose={() => setShowRefundDetailsModal(false)}
          refund={selectedRefund}
        />
      )}

      {/* Review Modal */}
      {selectedArtwork && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
          artwork={selectedArtwork}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Review Details Modal */}
      {selectedReview && (
        <ReviewDetailsModal
          isOpen={showReviewDetailsModal}
          onClose={() => setShowReviewDetailsModal(false)}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
          viewType={mainTab === "myListings" && activeSubGroup === "soldArtworks" ? "seller" : "buyer"}
          review={selectedReview}
          artwork={selectedReview.artwork}
        />
      )}

      {/* Edit Review Modal */}
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
