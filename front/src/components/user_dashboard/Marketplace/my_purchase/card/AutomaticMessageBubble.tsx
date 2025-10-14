import React from "react";
import { Package, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUserId } from "@/auth/decode";

interface AutomaticMessageBubbleProps {
  sellerName: string;
  artworkTitle: string;
  buyerName: string;
  orderId: string;
  onViewOrder?: () => void;
  isSender?: boolean;
}

const AutomaticMessageBubble: React.FC<AutomaticMessageBubbleProps> = ({
  sellerName,
  artworkTitle,
  buyerName,
  orderId,
  onViewOrder,
  isSender = false,
}) => {
  const navigate = useNavigate();
  const currentUserId = getLoggedInUserId();

  const handleViewOrder = () => {
    if (onViewOrder) {
      onViewOrder();
    } else {
      if (currentUserId) {
        navigate(`/userprofile/${currentUserId}`, {
          state: {
            activeTab: "onSale",
            mainTab: "myListings",
            activeSubGroup: "soldArtworks",
            subTab: "payment_received",
            highlightedOrderId: orderId,
          },
        });
      } else {
        console.log("View order details:", orderId);
      }
    }
  };

  // Dynamic color setup
  const textMain = isSender ? "text-white" : "text-gray-900";
  const textSecondary = isSender ? "text-white/80" : "text-gray-600";
  const textHighlight = "text-yellow-500";
  const borderColor = isSender ? "border-white/20" : "border-gray-300/50";
  const iconColor = isSender ? "text-yellow-400" : "text-blue-600";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className={`flex items-center gap-2 pb-2 border-b ${borderColor}`}>
        <Package className={`w-4 h-4 ${iconColor}`} />
        <span className={`font-bold text-xs ${textMain}`}>New Order Received!</span>
      </div>

      {/* Body */}
      <div className={`space-y-2.5 text-[11px] leading-relaxed ${textMain}`}>
        <p>
          Hello <span className={`font-semibold ${textMain}`}>{sellerName}</span>,
        </p>

        <p>
          You've received a new order for your artwork{" "}
          <span className={`font-semibold ${textHighlight}`}>“{artworkTitle}”</span> from{" "}
          <span className={`font-semibold ${textMain}`}>{buyerName}</span>.
        </p>

        <p className={`italic text-[10px] ${textSecondary}`}>
          Please coordinate directly with the buyer in this chat to discuss shipment method, delivery fee (if
          applicable), and expected delivery date.
        </p>

        <button
          onClick={handleViewOrder}
          className={`flex items-center gap-2 underline font-medium mt-3 transition-colors ${
            isSender ? "text-white hover:text-yellow-400" : "text-blue-600 hover:text-blue-700"
          }`}
        >
          <LinkIcon className={`w-4 h-4 ${iconColor}`} />
          View Order Details
        </button>

        <div
          className={`rounded-lg p-3 mt-4 ${
            isSender
              ? "bg-yellow-400/20 border border-yellow-300/30"
              : "bg-yellow-100/40 border border-yellow-400/50"
          }`}
        >
          <p className="text-[9px] text-yellow-700">
            <span className="font-semibold">⚠️ Reminder:</span> Make sure to confirm all delivery details with the buyer
            before sending the artwork.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutomaticMessageBubble;
