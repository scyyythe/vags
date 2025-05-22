import { PaymentProvider } from "@/context/PaymentContext";
import { ArtworkSummary } from "@/components/user_dashboard/Bidding/highest_bid/preview/ArtworkSummary";
import { BidDetails } from "@/components/user_dashboard/Bidding/highest_bid/preview/BidSummary";
import { PaymentMethods } from "@/components/user_dashboard/Bidding/highest_bid/payment/PaymentMethods";
import { ShippingInfo } from "@/components/user_dashboard/Bidding/highest_bid/preview/ShippingInfo";
import { PostAuctionActions } from "@/components/user_dashboard/Bidding/highest_bid/preview/ConfirmButton";
// import { NotificationConfirmation } from "@/components/NotificationConfirmation";
import { TermsReminder } from "@/components/user_dashboard/Bidding/highest_bid/preview/TermsReminder";
import { mockArtwork, mockBid } from "@/components/user_dashboard/Bidding/highest_bid/data/mockData";
import { Separator } from "@/components/ui/separator";

const BidWinnerPage = () => {
  return (
    <PaymentProvider>
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
        {/* Header */}
        <header className="w-full border-b py-4 px-6 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="w-8 h-8">
              <svg viewBox="0 0 24 24" className="text-red-500 w-8 h-8" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.83-3.4 8.94-7 10-3.6-1.06-7-5.17-7-10V6.3l7-3.12z" />
              </svg>
            </div>
            <div className="hidden md:flex space-x-2">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Explore</button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Exhibits</button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Bidding</button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Marketplace</button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </header>

        <div className="container py-8 px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Congratulations! You're the highest bidder</h1>
            <p className="text-gray-600 mt-2">
              Complete your purchase to claim this artwork
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <ArtworkSummary artwork={mockArtwork} bid={mockBid} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <BidDetails bid={mockBid} />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <PaymentMethods />
                  </div>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <ShippingInfo />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <PostAuctionActions />
            </div>
            
            {/* <div className="bg-artwork-muted rounded-xl shadow-sm overflow-hidden">
              <NotificationConfirmation />
            </div> */}
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <TermsReminder />
            </div>
          </div>
        </div>
      </div>
    </PaymentProvider>
  );
};

export default BidWinnerPage;
