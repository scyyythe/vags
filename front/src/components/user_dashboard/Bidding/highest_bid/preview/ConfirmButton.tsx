import { usePayment } from "@/context/PaymentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Send, FileText, User, Folder, ShoppingBag } from "lucide-react";
import { Pencil } from "./Pencil";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useFetchBiddingArtworkById } from "@/hooks/auction/useFetchAuctionDetails";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

export const PostAuctionActions = () => {
  const { confirmPurchase, toggleEditShipping, messageArtist, downloadInvoice } = usePayment();
  const { id: auctionId } = useParams<{ id: string }>();
  const { data: auctionData, isLoading } = useFetchBiddingArtworkById(auctionId || "");
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Translation hooks
  const postAuctionActionsText = useAutoTranslation("Post-Auction Actions", language);
  const confirmPurchaseText = useAutoTranslation("Confirm Purchase", language);
  const editShippingInfoText = useAutoTranslation("Edit Shipping Info", language);
  const messageSellerText = useAutoTranslation("Message Seller", language);
  const downloadInvoiceText = useAutoTranslation("Download Invoice", language);
  const moreOptionsText = useAutoTranslation("More Options", language);
  const viewArtistProfileText = useAutoTranslation("View Artist's Profile", language);
  const goToMyAuctionsText = useAutoTranslation("Go to My Auctions", language);
  const moreArtYouMayLikeText = useAutoTranslation("More Art You May Like", language);

  // Additional action handlers
  const viewArtistProfile = () => {
    navigate("/artist-profile");
  };

  const goToMyAuctions = () => {
    navigate("/my-auctions");
  };

  const browseMoreArt = () => {
    navigate("/art-recommendations");
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-5">{postAuctionActionsText}</h3>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            className="bg-red-500 hover:bg-red-600 justify-start h-12 rounded-lg"
            disabled={isLoading || !auctionData} // prevent clicks while data loads
            onClick={() => {
              confirmPurchase(uuidv4()); // only transactionId is needed now
            }}
          >
            <Check className="mr-2 h-5 w-5" /> {confirmPurchaseText}
          </Button>

          <Button
            variant="outline"
            className="justify-start h-12 border-gray-300 text-gray-700 rounded-lg"
            onClick={toggleEditShipping}
          >
            <Pencil className="mr-2 h-5 w-5" /> {editShippingInfoText}
          </Button>

          <Button
            variant="outline"
            className="justify-start h-12 border-gray-300 text-gray-700 rounded-lg"
            onClick={messageArtist}
          >
            <Send className="mr-2 h-5 w-5" /> {messageSellerText}
          </Button>

          <Button
            variant="outline"
            className="justify-start h-12 border-gray-300 text-gray-700 rounded-lg"
            onClick={downloadInvoice}
          >
            <FileText className="mr-2 h-5 w-5" /> {downloadInvoiceText}
          </Button>
        </div>

        <div className="pt-4">
          <p className="font-medium text-gray-900 mb-3">{moreOptionsText}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="ghost"
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={viewArtistProfile}
            >
              <User className="mr-2 h-4 w-4" /> {viewArtistProfileText}
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={goToMyAuctions}
            >
              <Folder className="mr-2 h-4 w-4" /> {goToMyAuctionsText}
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={browseMoreArt}
            >
              <ShoppingBag className="mr-2 h-4 w-4" /> {moreArtYouMayLikeText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
