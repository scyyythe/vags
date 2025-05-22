import { usePayment } from "@/context/PaymentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Send, FileText, User, Folder, ShoppingBag } from "lucide-react";
import { Pencil } from "./Pencil";
import { useNavigate } from "react-router-dom";

export const PostAuctionActions = () => {
  const {
    confirmPurchase,
    toggleEditShipping,
    messageArtist,
    downloadInvoice,
  } = usePayment();
  
  const navigate = useNavigate();

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
      <h3 className="text-xl font-bold text-gray-900 mb-5">Post-Auction Actions</h3>
      
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="bg-red-500 hover:bg-red-600 justify-start h-12 rounded-lg" 
            onClick={confirmPurchase}
          >
            <Check className="mr-2 h-5 w-5" /> Confirm Purchase
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-12 border-gray-300 text-gray-700 rounded-lg" 
            onClick={toggleEditShipping}
          >
            <Pencil className="mr-2 h-5 w-5" /> Edit Shipping Info
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-12 border-gray-300 text-gray-700 rounded-lg" 
            onClick={messageArtist}
          >
            <Send className="mr-2 h-5 w-5" /> Message Seller
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-12 border-gray-300 text-gray-700 rounded-lg" 
            onClick={downloadInvoice}
          >
            <FileText className="mr-2 h-5 w-5" /> Download Invoice
          </Button>
        </div>
        
        <div className="pt-4">
          <p className="font-medium text-gray-900 mb-3">More Options</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="ghost" 
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={viewArtistProfile}
            >
              <User className="mr-2 h-4 w-4" /> View Artist's Profile
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={goToMyAuctions}
            >
              <Folder className="mr-2 h-4 w-4" /> Go to My Auctions
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={browseMoreArt}
            >
              <ShoppingBag className="mr-2 h-4 w-4" /> More Art You May Like
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
