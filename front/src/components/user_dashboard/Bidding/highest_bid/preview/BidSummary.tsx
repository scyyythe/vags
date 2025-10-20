import { Bid } from "@/components/types/index";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useParams } from "react-router-dom";
import { useFetchBiddingArtworkById } from "@/hooks/auction/useFetchAuctionDetails";
import BidDetailsSkeleton from "@/components/skeletons/bidding/BidDetailsSkeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

export const BidDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: bid, error, isLoading } = useFetchBiddingArtworkById(id || "");
  const { language } = useLanguage();

  // Translation hooks
  const errorLoadingBidText = useAutoTranslation("Error loading bid details", language);
  const noArtworkFoundText = useAutoTranslation("No artwork found", language);
  const finalBidDetailsText = useAutoTranslation("Final Bid Details", language);
  const yourWinningBidText = useAutoTranslation("Your winning bid", language);
  const biddingReferenceNumberText = useAutoTranslation("Bidding reference number", language);
  const auctionIdText = useAutoTranslation("Auction ID", language);
  const paymentDeadlineText = useAutoTranslation("Payment deadline", language);
  const pleasePayWithinText = useAutoTranslation("Please pay within", language);
  const hoursText = useAutoTranslation("hours", language);

  const sampleData = {
    paymentDeadline: "2025-06-01T18:00:00Z",
  };

  const paymentDeadline = new Date(sampleData.paymentDeadline);
  const formattedDeadline = format(paymentDeadline, "MMMM d, yyyy 'at' h:mm a");
  const hoursRemaining = Math.ceil((paymentDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  if (isLoading) {
    return <BidDetailsSkeleton />;
  }

  if (error) {
    return <p>{errorLoadingBidText}: {error.message}</p>;
  }

  if (!bid) {
    return (
      <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
        <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
        <p className="text-xs text-gray-500">{noArtworkFoundText}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-xs font-semibold text-gray-900 mb-4">{finalBidDetailsText}</h3>

      <div className="space-y-5">
        <div>
          <p className="text-[10px] text-gray-500 mb-1">{yourWinningBidText}</p>
          <p className="text-lg font-bold text-red-700">₱ {bid.highest_bid.amount.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 mb-1">{biddingReferenceNumberText}</p>
          <p className="text-[11px] font-medium text-gray-700">{"REF-2023-05-789"}</p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 mb-1">{auctionIdText}</p>
          <p className="text-[11px] font-medium text-gray-700">{bid.id}</p>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <Clock className="text-amber-500 mt-0.5" size={15} />
          <div>
            <p className="text-[11px] font-medium text-amber-900 mb-0.5">{paymentDeadlineText}</p>
            <p className="text-[9px] text-amber-700">
              {pleasePayWithinText} {hoursRemaining} {hoursText} ({formattedDeadline})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
