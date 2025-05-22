import { Bid } from "@/components/types/index";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useParams } from "react-router-dom";
import { useFetchBiddingArtworkById } from "@/hooks/auction/useFetchAuctionDetails";

export const BidDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: bid, error, isLoading } = useFetchBiddingArtworkById(id || "");

  const sampleData = {
    paymentDeadline: "2025-06-01T18:00:00Z",
  };

  const paymentDeadline = new Date(sampleData.paymentDeadline);
  const formattedDeadline = format(paymentDeadline, "MMMM d, yyyy 'at' h:mm a");
  const hoursRemaining = Math.ceil((paymentDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  if (isLoading) {
    return <p>Loading bid details...</p>;
  }

  if (error) {
    return <p>Error loading bid details: {error.message}</p>;
  }

  if (!bid) {
    return <p>No bid data found.</p>;
  }

  if (!bid.highest_bid) {
    return <p>No highest bid found.</p>;
  }
  return (
    <div className="p-6">
      <h3 className="text-xs font-semibold text-gray-900 mb-4">Final Bid Details</h3>

      <div className="space-y-5">
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Your winning bid</p>
          <p className="text-lg font-bold text-red-700">₱ {bid.highest_bid.amount.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 mb-1">Bidding reference number</p>
          <p className="text-[11px] font-medium text-gray-700">{"REF-2023-05-789"}</p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 mb-1">Auction ID</p>
          <p className="text-[11px] font-medium text-gray-700">{bid.id}</p>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <Clock className="text-amber-500 mt-0.5" size={15} />
          <div>
            <p className="text-[11px] font-medium text-amber-900 mb-0.5">Payment deadline</p>
            <p className="text-[9px] text-amber-700">
              Please pay within {hoursRemaining} hours ({formattedDeadline})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
