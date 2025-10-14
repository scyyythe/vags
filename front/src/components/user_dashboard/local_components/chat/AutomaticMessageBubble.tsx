import React from "react";
import { Package, Link as LinkIcon } from "lucide-react";

interface AutomaticMessageBubbleProps {
  sellerName: string;
  artworkTitle: string;
  buyerName: string;
  orderId: string;
  onViewOrder?: () => void;
}

const AutomaticMessageBubble: React.FC<AutomaticMessageBubbleProps> = ({
  sellerName,
  artworkTitle,
  buyerName,
  orderId,
  onViewOrder,
}) => {
  const handleViewOrder = () => {
    if (onViewOrder) {
      onViewOrder();
    } else {
      console.log("View order details:", orderId);
    }
  };

  return (
    <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm shadow-sm p-4 space-y-3">
      {/* Message Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/20">
        <Package className="w-4 h-4 text-white" />
        <span className="font-bold text-xs text-white">New Order Received!</span>
      </div>

      {/* Message Content */}
      <div className="space-y-2.5 text-[11px] leading-relaxed text-white">
        <p>
          Hello <span className="font-semibold text-white">{sellerName}</span>,
        </p>

        <p>
          You've received a new order for your artwork{" "}
          <span className="font-semibold text-yellow-200">"{artworkTitle}"</span> from{" "}
          <span className="font-semibold text-white">{buyerName}</span>.
        </p>

        <p className="italic text-[10px] text-white/80">
          Please coordinate directly with the buyer in this chat to discuss shipment method, delivery fee (if
          applicable), and expected delivery date.
        </p>

        {/* Order Link */}
        <button
          onClick={handleViewOrder}
          className="flex items-center gap-2 text-white underline font-medium mt-3 hover:text-yellow-200 transition-colors"
        >
          <LinkIcon className="w-4 h-4 text-white" />
          View Order Details
        </button>

        {/* Warning Box */}
        <div className="bg-yellow-400/20 border border-yellow-300/30 rounded-lg p-3 mt-4">
          <p className="text-[9px] text-yellow-100">
            <span className="font-semibold">⚠️ Reminder:</span> Make sure to confirm all delivery details with the buyer
            before sending the artwork.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutomaticMessageBubble;
