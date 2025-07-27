import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import SellCard from "@/components/user_dashboard/Marketplace/cards/SellCard";
import SellCardSkeleton from "@/components/skeletons/SellCardSkeleton";
import SalesSummary from "@/components/user_dashboard/Marketplace/sales_summary/SalesSummary";
import useMySellArtCards from "@/hooks/artworks/sell/useMySellArtCards";
import useUserSellArtCards from "@/hooks/artworks/sell/useUserSellArtCards";
import { getLoggedInUserId } from "@/auth/decode";

import PurchasedArtworkCard from "@/components/user_dashboard/Marketplace/my_purchase/card/PurchasedArtworkCard";
import OrderDetailsModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/OrderDetailsModal";
import ReviewModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/ReviewModal";
import ReviewDetailsModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/ReviewDetailsModal";
import EditReviewModal from "@/components/user_dashboard/Marketplace/my_purchase/modals/EditReviewModal";
import PaymentDetailsModal from "@/components/user_dashboard/Marketplace/my_listings/PaymentDetailsModal";
import RefundDetailsModal from "@/components/user_dashboard/Marketplace/my_listings/RefundDetailsModal";

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
const SellTab = () => {
  const { id: userId } = useParams();
  const loggedInUserId = getLoggedInUserId();
  const navigate = useNavigate();
  const isOwnProfile = String(userId) === String(loggedInUserId);
  const { data: myPurchases, isLoading: isMyPurchasesLoading } = useMyPurchases();
  const mySellArtData = useMySellArtCards();
  const userSellArtData = useUserSellArtCards(userId);

  const { myArtCards, isLoading } = isOwnProfile ? mySellArtData : userSellArtData;

  const [mainTab, setMainTab] = useState("myListings");
  const [activeSubGroup, setActiveSubGroup] = useState<"listings" | "soldArtworks">("listings");
  const [subTab, setSubTab] = useState("available");
  const [activeSubTab, setActiveSubTab] = useState("awaiting_payment");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [showRefundDetailsModal, setShowRefundDetailsModal] = useState(false);
  const [reviewingArtwork, setReviewingArtwork] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
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
    order: { id: string }
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
        artwork_id: reviewData.artworkId,
        purchase_id: selectedOrder?.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        photos: uploadedPhotoUrls,
      };

      if (!payload.purchase_id) {
        toast.error("Missing purchase ID for review.");
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

  const handleContact = () =>
    toast.info("Redirecting to contact seller...", {
      closeButton: true,
    });

  const handleTrackOrder = () =>
    toast.info("Opening payment tracking...", {
      closeButton: true,
    });

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
        edition: "Limited Edition",
        quantity: 5,
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
        edition: "Limited Edition",
        quantity: 3,
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
        edition: "Open Edition",
        quantity: 10,
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
        edition: "Open Edition",
        quantity: 6,
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

  // Mock data for sold artworks (seller POV)
  const mockSoldArtworks = [
    {
      id: "SALE-001",
      artworkImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      title: "Mystic Forest",
      buyer: "Sarah Johnson",
      price: 85000,
      status: "awaiting_payment",
      saleDate: "2025-01-20",
      paymentMethod: "PayPal",
      shippingAddress: {
        name: "Sarah Johnson",
        address: "456 Oak Avenue",
        city: "Quezon City",
      },
      artwork: {
        size: "16 x 20 inches",
        medium: "Oil on Canvas",
        style: "Abstract",
        edition: "Original (1 of 1)",
        yearCreated: 2024,
      },
    },
    {
      id: "SALE-002",
      artworkImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop",
      title: "Urban Sunset",
      buyer: "Michael Chen",
      price: 120000,
      status: "payment_received",
      saleDate: "2025-01-18",
      paymentMethod: "GCash",
      shippingAddress: {
        name: "Michael Chen",
        address: "789 Pine Street",
        city: "Makati City",
      },
      artwork: {
        size: "24 x 18 inches",
        medium: "Acrylic on Canvas",
        style: "Contemporary",
        edition: "Limited Edition",
        quantity: 8,
        yearCreated: 2024,
      },
    },
    {
      id: "SALE-003",
      artworkImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      title: "Ocean Dreams",
      buyer: "Emma Rodriguez",
      price: 95000,
      status: "in_progress",
      saleDate: "2025-01-15",
      paymentMethod: "Credit Card",
      shippingAddress: {
        name: "Emma Rodriguez",
        address: "321 Beach Road",
        city: "Cebu City",
      },
      artwork: {
        size: "20 x 16 inches",
        medium: "Watercolor",
        style: "Landscape",
        edition: "Original (1 of 1)",
        yearCreated: 2024,
      },
    },
    {
      id: "SALE-004",
      artworkImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop",
      title: "Mountain Vista",
      buyer: "David Kim",
      price: 150000,
      status: "completed",
      saleDate: "2024-12-10",
      completedDate: "2024-12-20",
      paymentMethod: "PayPal",
      shippingAddress: {
        name: "David Kim",
        address: "654 Hill Drive",
        city: "Baguio City",
      },
      artwork: {
        size: "30 x 24 inches",
        medium: "Oil on Canvas",
        style: "Realism",
        edition: "Original (1 of 1)",
        yearCreated: 2024,
      },
    },
    {
      id: "SALE-005",
      artworkImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      title: "Abstract Emotions",
      buyer: "Lisa Martinez",
      price: 75000,
      status: "cancelled",
      saleDate: "2025-01-12",
      paymentMethod: "GCash",
      shippingAddress: {
        name: "Lisa Martinez",
        address: "987 Art Street",
        city: "Davao City",
      },
      artwork: {
        size: "18 x 14 inches",
        medium: "Mixed Media",
        style: "Abstract",
        edition: "Open Edition",
        quantity: 20,
        yearCreated: 2024,
      },
    },
    {
      id: "SALE-006",
      artworkImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop",
      title: "City Reflections",
      buyer: "Carlos Mendoza",
      price: 110000,
      status: "refunded",
      saleDate: "2024-12-25",
      paymentMethod: "Credit Card",
      shippingAddress: {
        name: "Carlos Mendoza",
        address: "147 Urban Plaza",
        city: "Taguig City",
      },
      artwork: {
        size: "22 x 18 inches",
        medium: "Acrylic on Canvas",
        style: "Urban",
        edition: "Original (1 of 1)",
        yearCreated: 2024,
      },
    },
    {
      id: "SALE-007",
      artworkImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      title: "Golden Meadow",
      buyer: "Ana Torres",
      price: 135000,
      status: "reviews",
      saleDate: "2024-11-15",
      completedDate: "2024-11-25",
      paymentMethod: "PayPal",
      shippingAddress: {
        name: "Ana Torres",
        address: "258 Garden Lane",
        city: "Iloilo City",
      },
      artwork: {
        size: "26 x 20 inches",
        medium: "Oil on Canvas",
        style: "Impressionist",
        edition: "Limited Edition",
        quantity: 2,
        yearCreated: 2024,
      },
      review: {
        rating: 5,
        comment:
          "Absolutely beautiful artwork! The artist's technique is exceptional and the piece looks stunning in my living room. Highly recommend!",
        photos: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop"],
        reviewDate: "2024-11-30",
      },
    },
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
  const purchaseStatusMap: Record<string, string> = {
    pending_payment: "Pending",
    payment_processing: "Processing",
    paid: "Paid",
    failed: "Failed",
    cancelled: "Cancelled",
    completed: "Completed",
    refunded: "Refunded",
    reviewed: "Reviewed", // included just for consistency
  };

  const normalizedTab = subTab?.toLowerCase().trim();
  const expectedStatus = purchaseStatusMap[normalizedTab]?.toLowerCase();

  const filteredOrders = Array.isArray(myPurchases)
    ? myPurchases
        .filter((order) => {
          const status = order.status?.toLowerCase().trim();

          if (normalizedTab === "completed") {
            return status === "completed" || status === "reviewed";
          }

          return status === expectedStatus;
        })
        .map((order) => {
          if (normalizedTab === "completed" && order.status?.toLowerCase() === "reviewed") {
            return { ...order, status: "completed" };
          }
          return order;
        })
    : [];

  const soldArtworkStatusMap: Record<string, string> = {
    awaiting_payment: "Pending",
    payment_received: "Paid",
    in_progress: "Shipped",
    completed: "Completed",
    reviews: "reviewed",
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

          if (normalizedTab === "completed") {
            return status === "completed" || status === "reviewed";
          }

          if (normalizedTab === "reviews" || normalizedTab === "reviewed") {
            return status === "reviewed";
          }

          return status === mappedStatus?.toLowerCase();
        })
        .map((sale) => {
          if (normalizedTab === "completed" && sale.status?.toLowerCase() === "reviewed") {
            return { ...sale, status: "completed" };
          }
          return sale;
        })
    : [];

  const filteredArtworks = myArtCards
    .filter((art) => {
      const status = art.art_status?.toLowerCase?.();
      const expectedStatus = statusMap[subTab]?.toLowerCase();
      return (
        mainTab === "myListings" &&
        activeSubGroup === "listings" &&
        expectedStatus === "onsale" &&
        status === expectedStatus &&
        art.visibility !== "hidden"
      );
    })
    .map((art) => ({
      id: art.id,
      title: art.title,
      price: art.discounted_price ?? art.price,
      originalPrice: art.discounted_price ? art.price : 0,
      rating: art.total_ratings,
      category: art.category,
      artworkImage: art.image_url[0] || "",
      status: "active",
    }));

  // Seller actions for sold artworks
  const handleContactBuyer = (artwork) => {
    toast.info("Redirecting to contact buyer...");
  };

  const handleMarkAsShipped = (artwork) => {
    toast.success("Artwork marked as shipped!");
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
    setSelectedReview({
      ...artwork.review,
      reviewerName: artwork.buyer, // Show buyer's name as reviewer
      canEdit: false, // Sellers cannot edit buyer reviews
      canDelete: true, // Sellers can only delete inappropriate reviews
      artwork: {
        artworkImage: artwork.artworkImage,
        title: artwork.title,
        artist: "You", // This is the seller's artwork
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
        ))}

      {/* Content Display */}
      <div className="space-y-4">
        {mainTab === "salesSummary" ? (
          <SalesSummary />
        ) : mainTab === "myListings" && activeSubGroup === "soldArtworks" ? (
          filteredSoldArtworks.length === 0 ? (
            <div className="text-center py-12">
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
                price={artwork.price}
                status={artwork.status}
                saleDate={artwork.saleDate}
                completedDate={artwork.completedDate}
                paymentMethod={artwork.paymentMethod}
                shippingAddress={artwork.shippingAddress}
                artwork={artwork.artwork}
                review={artwork.review}
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
            <div className="text-center py-12">
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
                price={order.artwork?.price ?? 0}
                status={order.status === "Pending" ? "pending_payment" : order.status}
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
                      artworkId: order.artwork.id,
                      artworkImage: order.artwork.image_url?.[0],
                      title: order.artwork?.title || "Untitled",
                      artist: order.artwork?.artist_name || "Unknown",
                    },
                    order
                  )
                }
                onViewReview={() => handleViewReview(order)}
                onContact={handleContact}
                onTrackOrder={handleTrackOrder}
                onRequestRefund={handleRequestRefund}
                onCancelOrder={handleCancelOrder}
              />
            ))
          )
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-12">
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
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-12">
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
          order={formatOrderDetails(selectedOrder)}
          viewType={mainTab === "myListings" && activeSubGroup === "soldArtworks" ? "seller" : "buyer"}
          onContactBuyer={() => handleContactBuyer(selectedOrder)}
          onViewPayment={() => handleViewPayment(selectedOrder)}
          onMarkAsShipped={() => handleMarkAsShipped(selectedOrder)}
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
