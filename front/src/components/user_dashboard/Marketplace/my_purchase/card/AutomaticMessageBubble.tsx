import React, { useState, useEffect, useCallback } from "react";
import { Package, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLoggedInUserId } from "@/auth/decode";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { autoTranslate } from "@/utils/autoTranslate";

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
  const { language } = useLanguage();

  // State for translated dynamic data
  const [translatedSellerName, setTranslatedSellerName] = useState(sellerName);
  const [translatedArtworkTitle, setTranslatedArtworkTitle] = useState(artworkTitle);
  const [translatedBuyerName, setTranslatedBuyerName] = useState(buyerName);

  // Translation hooks for static text
  const newOrderReceivedText = useAutoTranslation("New Order Received!", language);
  const helloText = useAutoTranslation("Hello", language);
  const youveReceivedText = useAutoTranslation("You've received a new order for your artwork", language);
  const fromText = useAutoTranslation("from", language);
  const pleaseCoordinateText = useAutoTranslation("Please coordinate directly with the buyer in this chat to discuss shipment method, delivery fee (if applicable), and expected delivery date.", language);
  const viewOrderDetailsText = useAutoTranslation("View Order Details", language);
  const reminderText = useAutoTranslation("⚠️ Reminder:", language);
  const reminderMessageText = useAutoTranslation("Make sure to confirm all delivery details with the buyer before sending the artwork.", language);

  // Effect to translate dynamic data
  useEffect(() => {
    const translateDynamicData = async () => {
      try {
        if (language.toLowerCase() !== "en") {
          const [translatedSeller, translatedArtwork, translatedBuyer] = await Promise.all([
            autoTranslate(sellerName, language.toLowerCase()),
            autoTranslate(artworkTitle, language.toLowerCase()),
            autoTranslate(buyerName, language.toLowerCase())
          ]);
          setTranslatedSellerName(translatedSeller);
          setTranslatedArtworkTitle(translatedArtwork);
          setTranslatedBuyerName(translatedBuyer);
        } else {
          setTranslatedSellerName(sellerName);
          setTranslatedArtworkTitle(artworkTitle);
          setTranslatedBuyerName(buyerName);
        }
      } catch (error) {
        console.warn("Failed to translate dynamic data:", error);
        // Fallback to original data
        setTranslatedSellerName(sellerName);
        setTranslatedArtworkTitle(artworkTitle);
        setTranslatedBuyerName(buyerName);
      }
    };

    translateDynamicData();
  }, [sellerName, artworkTitle, buyerName, language]);

  const handleViewOrder = useCallback(() => {
    if (onViewOrder) {
      onViewOrder();
    } else {
      if (currentUserId) {
        if (isSender) {
          // Buyer navigation - go to purchase history
          navigate(`/userprofile/${currentUserId}`, {
            state: {
              activeTab: "onSale",
              mainTab: "myPurchase",
              activeSubGroup: "purchasedArtworks",
              subTab: "paid",
              highlightedOrderId: orderId,
            },
          });
        } else {
          // Seller navigation - go to listings
          navigate(`/userprofile/${currentUserId}`, {
            state: {
              activeTab: "onSale",
              mainTab: "myListings",
              activeSubGroup: "soldArtworks",
              subTab: "payment_received",
              highlightedOrderId: orderId,
            },
          });
        }
      } else {
        console.log("View order details:", orderId);
      }
    }
  }, [onViewOrder, currentUserId, isSender, navigate, orderId, language]);

  // Dynamic color setup
  const textMain = isSender ? "text-white" : "text-gray-900 dark:text-gray-100";
  const textSecondary = isSender ? "text-white/80" : "text-gray-600 dark:text-gray-400";
  const textHighlight = "text-yellow-500";
  const borderColor = isSender ? "border-white/20" : "border-gray-300/50 dark:border-gray-600/50";
  const iconColor = isSender ? "text-yellow-400" : "text-blue-600 dark:text-blue-400";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className={`flex items-center gap-2 pb-2 border-b ${borderColor}`}>
        <Package className={`w-4 h-4 ${iconColor}`} />
        <span className={`font-bold text-xs ${textMain}`}>{newOrderReceivedText}</span>
      </div>

      {/* Body */}
      <div className={`space-y-2.5 text-[11px] leading-relaxed ${textMain}`}>
        <p>
          {helloText} <span className={`font-semibold ${textMain}`}>{translatedSellerName}</span>,
        </p>

        <p>
          {youveReceivedText}{" "}
          <span className={`font-semibold transition-colors ${
            isSender ? "text-yellow-300" : "text-blue-600 hover:text-blue-700"
          }`}>"{translatedArtworkTitle}"</span> {fromText}{" "}
          <span className={`font-semibold ${textMain}`}>{translatedBuyerName}</span>.
        </p>

        <p className={`italic text-[10px] ${textSecondary}`}>
          {pleaseCoordinateText}
        </p>

        <button
          onClick={handleViewOrder}
          className={`flex items-center gap-2 underline font-medium mt-3 transition-colors ${
            isSender ? "text-yellow-300 hover:text-yellow-200" : "text-blue-600 hover:text-blue-500"
          }`}
        >
          <LinkIcon className={`w-4 h-4 ${iconColor}`} />
          {viewOrderDetailsText}
        </button>

        <div
          className={`rounded-lg p-3 mt-4 ${
            isSender ? "bg-yellow-400/20 border border-yellow-300/30" : "bg-yellow-100/40 border border-yellow-400/50"
          }`}
        >
          <p className={`text-[9px] transition-colors ${
            isSender ? "text-white" : "text-yellow-700"
          }`}>
            <span className="font-semibold">{reminderText}</span> {reminderMessageText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutomaticMessageBubble;
