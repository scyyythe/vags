import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SalesCard from "../cards/SellCard";
import SalesMetrics from "./SalesMetrics";
import BuyerActivity from "./BuyerActivity";

const SalesSummary = () => {
  const [statusFilter, setStatusFilter] = useState("all");

  const salesMetrics = {
    totalArtworksSold: 24,
    totalEarnings: 2850000,
    pendingSales: 5,
    completedSales: 19,
    cancelledSales: 3,
    refundedSales: 1
  };

  const latestBuyerActivity = [
    {
      id: 1,
      buyerName: "Sarah Johnson",
      action: "Purchased",
      artworkTitle: "Mystic Forest",
      price: 85000,
      timestamp: "2 hours ago",
      status: "payment_received"
    },
    {
      id: 2,
      buyerName: "Michael Chen",
      action: "Payment Confirmed",
      artworkTitle: "Urban Sunset",
      price: 120000,
      timestamp: "5 hours ago",
      status: "payment_received"
    },
    {
      id: 3,
      buyerName: "Emma Rodriguez",
      action: "Order Shipped",
      artworkTitle: "Ocean Dreams",
      price: 95000,
      timestamp: "1 day ago",
      status: "in_progress"
    },
    {
      id: 4,
      buyerName: "David Kim",
      action: "Order Completed",
      artworkTitle: "Mountain Vista",
      price: 150000,
      timestamp: "3 days ago",
      status: "completed"
    },
    {
      id: 5,
      buyerName: "Lisa Martinez",
      action: "Order Cancelled",
      artworkTitle: "Abstract Emotions",
      price: 75000,
      timestamp: "5 days ago",
      status: "cancelled"
    }
  ];

  const relistableArtworks = [
    {
      id: "ART-001",
      title: "Abstract Emotions",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      originalPrice: 75000,
      status: "cancelled",
      reason: "Buyer cancelled order"
    },
    {
      id: "ART-002",
      title: "Digital Dreams",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop",
      originalPrice: 60000,
      status: "unsold",
      reason: "Listing expired"
    },
    {
      id: "ART-003",
      title: "City Reflections",
      image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=300&fit=crop",
      originalPrice: 110000,
      status: "cancelled",
      reason: "Payment failed"
    }
  ];

  const handleRelistArtwork = (artworkId: string) => {
    console.log("Relisting artwork:", artworkId);
  };

  const getFilteredActivity = () => {
    if (statusFilter === "all") return latestBuyerActivity;
    return latestBuyerActivity.filter(activity => {
      switch (statusFilter) {
        case "available":
          return activity.status === "awaiting_payment";
        case "sold":
          return ["payment_received", "in_progress", "completed"].includes(activity.status);
        case "cancelled":
          return activity.status === "cancelled";
        default:
          return true;
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Sales Metrics */}
      <SalesMetrics metrics={salesMetrics} />

      {/* Status Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-foreground">Latest Buyer Activity</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Show:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8 text-[10px] rounded-full">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px]">All</SelectItem>
              <SelectItem value="available" className="text-[10px]">Available</SelectItem>
              <SelectItem value="sold" className="text-[10px]">Sold</SelectItem>
              <SelectItem value="cancelled" className="text-[10px]">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Buyer Activity List */}
      <BuyerActivity activities={getFilteredActivity()} />

      {/* Relist Section */}
      {relistableArtworks.length > 0 && (
        <Card className="p-4 overflow-y-auto max-h-[450px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-foreground">Relist Unsold or Cancelled Artworks</h3>
            <span className="text-[11px] text-muted-foreground">{relistableArtworks.length} items available</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relistableArtworks.map((artwork) => (
            <SalesCard
                key={artwork.id}
                id={artwork.id}
                title={artwork.title}
                artworkImage={artwork.image}
                price={artwork.originalPrice}
                originalPrice={artwork.originalPrice}
                status={artwork.status}
                reason={artwork.reason}
                onRelist={handleRelistArtwork}
                isWishlistView={true}
                isMarketplace={true}
            />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SalesSummary;
