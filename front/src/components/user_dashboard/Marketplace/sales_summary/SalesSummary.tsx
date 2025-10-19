import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SalesCard from "../cards/SellCard";
import SalesMetrics from "./SalesMetrics";
import BuyerActivity from "./BuyerActivity";
import { useSalesMetrics } from "@/hooks/purchase/useSalesMetrics";
import { useBuyerActivity } from "@/hooks/purchase/useBuyerActivity";
import { useRelistableArtworks } from "@/hooks/artworks/relist/useRelistableArtworks";
import { useRelistArtwork } from "@/hooks/artworks/relist/useRelistArtwork";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SalesSummary = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch real sales metrics from backend
  const { data: salesMetricsData, isLoading: isMetricsLoading, error: metricsError } = useSalesMetrics();

  // Fetch real buyer activity from transactions
  const { data: latestBuyerActivity = [], isLoading: isActivityLoading, error: activityError } = useBuyerActivity();

  // Fetch relistable artworks
  const {
    data: relistableArtworks = [],
    isLoading: isRelistableLoading,
    error: relistableError,
  } = useRelistableArtworks();

  // Debug logging
  console.log("🔍 SalesSummary - relistableArtworks:", relistableArtworks);
  console.log("🔍 SalesSummary - isRelistableLoading:", isRelistableLoading);
  console.log("🔍 SalesSummary - relistableError:", relistableError);
  console.log("🔍 SalesSummary - relistableArtworks.length:", relistableArtworks.length);

  // Relist artwork mutation
  const { mutate: relistArtwork } = useRelistArtwork();

  const handleRelistArtwork = (artworkId: string) => {
    relistArtwork(artworkId, {
      onSuccess: () => {
        // Show success message
        toast.success("Artwork relisted successfully!", {
          closeButton: true,
        });

        // Refetch relistable artworks to remove the relisted one
        queryClient.invalidateQueries({ queryKey: ["relistable-artworks"] });

        // Also refetch marketplace data to show the relisted artwork
        queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
        queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
        queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
        queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
      },
      onError: (error) => {
        console.error("Failed to relist artwork:", error);
        const errorMessage = error?.response?.data?.detail || "Failed to relist artwork. Please try again.";
        toast.error(errorMessage);
      },
    });
  };

  const getFilteredActivity = () => {
    if (statusFilter === "all") return latestBuyerActivity;
    return latestBuyerActivity.filter((activity) => {
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

  // Transform backend data to match SalesMetrics component interface
  const salesMetrics = salesMetricsData
    ? {
        totalArtworksSold: salesMetricsData.total_artworks_sold,
        totalEarnings: salesMetricsData.total_earnings,
        pendingSales: salesMetricsData.pending_sales,
        completedSales: salesMetricsData.completed_sales,
        cancelledSales: salesMetricsData.cancelled_sales,
        refundedSales: salesMetricsData.refunded_sales,
        currentMonthSales: salesMetricsData.current_month_sales,
        growthPercentage: salesMetricsData.growth_percentage,
      }
    : {
        totalArtworksSold: 0,
        totalEarnings: 0,
        pendingSales: 0,
        completedSales: 0,
        cancelledSales: 0,
        refundedSales: 0,
        currentMonthSales: 0,
        growthPercentage: 0,
      };

  // Show loading state
  if (isMetricsLoading || isActivityLoading || isRelistableLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (metricsError || activityError || relistableError) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">
            Failed to load data. {metricsError ? "Sales metrics error. " : ""}
            {activityError ? "Buyer activity error. " : ""}
            {relistableError ? "Relistable artworks error." : ""}
            Please try again.
          </p>
        </div>
      </div>
    );
  }

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
              <SelectItem value="all" className="text-[10px]">
                All
              </SelectItem>
              <SelectItem value="available" className="text-[10px]">
                Available
              </SelectItem>
              <SelectItem value="sold" className="text-[10px]">
                Sold
              </SelectItem>
              <SelectItem value="cancelled" className="text-[10px]">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Buyer Activity List */}
      <BuyerActivity activities={getFilteredActivity()} />

      {/* Relist Section */}
      <Card className="p-4 overflow-y-auto max-h-[450px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-foreground">Relist Unsold or Cancelled Artworks</h3>
          <span className="text-[11px] text-muted-foreground">
            {relistableArtworks.length} items available
            {isRelistableLoading && " (Loading...)"}
            {relistableError && " (Error loading)"}
          </span>
        </div>

        {isRelistableLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading relistable artworks...</p>
          </div>
        ) : relistableError ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error loading relistable artworks: {relistableError.message}</p>
          </div>
        ) : relistableArtworks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No artworks available for relisting.</p>
            <p className="text-xs text-gray-400 mt-1">
              Artworks with status "unlisted", "draft", or "inactive" can be relisted.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relistableArtworks.map((artwork) => (
              <SalesCard
                key={artwork.id}
                id={artwork.id}
                title={artwork.title}
                artworkImage={artwork.artworkImage}
                price={artwork.price}
                originalPrice={artwork.originalPrice}
                status={artwork.status}
                reason={artwork.reason}
                onRelist={handleRelistArtwork}
                isWishlistView={true}
                isMarketplace={true}
                isProfileView={false}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesSummary;
