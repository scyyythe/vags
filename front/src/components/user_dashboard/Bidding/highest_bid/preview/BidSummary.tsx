import { Bid } from "@/components/types/index";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface BidSummaryProps {
  bid: Bid;
}

export const BidDetails: React.FC<BidSummaryProps> = ({ bid }) => {
  const paymentDeadline = new Date(bid.paymentDeadline);
  const formattedDeadline = format(paymentDeadline, "MMMM d, yyyy 'at' h:mm a");
  const hoursRemaining = Math.ceil(
    (paymentDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60)
  );

  return (
    <div className="p-6">
      <h3 className="text-xs font-semibold text-gray-900 mb-4">Final Bid Details</h3>
      
      <div className="space-y-5">
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Your winning bid</p>
          <p className="text-xl font-bold text-red-700">
            {bid.currency}{bid.amount.toLocaleString()}
          </p>
        </div>
        
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Bidding reference number</p>
          <p className="text-xs font-medium text-gray-700">{bid.referenceNumber}</p>
        </div>
        
        <div>
          <p className="text-[11px] text-gray-500 mb-1">Auction ID</p>
          <p className="text-xs font-medium text-gray-700">{bid.auctionId}</p>
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
