import { PaymentProvider, usePayment } from "@/context/PaymentContext";
import { ArtworkSummary } from "@/components/user_dashboard/Bidding/highest_bid/preview/ArtworkSummary";
import { BidDetails } from "@/components/user_dashboard/Bidding/highest_bid/preview/BidSummary";
import { PaymentMethods } from "@/components/user_dashboard/Bidding/highest_bid/payment/PaymentMethods";
import { ShippingInfo } from "@/components/user_dashboard/Bidding/highest_bid/preview/ShippingInfo";
import { TermsReminder } from "@/components/user_dashboard/Bidding/highest_bid/preview/TermsReminder";
import { mockArtwork, mockBid } from "@/components/user_dashboard/Bidding/highest_bid/data/mockData";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { toast } from "sonner";

const ConfirmPurchaseButton = () => {
  const navigate = useNavigate();
  const { selectedPaymentMethod } = usePayment();

  const handleConfirmClick = () => {
    if (!selectedPaymentMethod) {
      toast("Please select a payment method before proceeding.");
      return;
    }
    navigate("/payment");
  };

  return (
    <div className="flex justify-end mt-4">
      <div
        onClick={() => {
          if (selectedPaymentMethod) {
            navigate("/payment");
          } else {
            toast("Please select a payment method before proceeding.");
          }
        }}
        className="w-44 text-center bg-red-700 hover:bg-red-600 text-[11px] text-white px-2 py-2 rounded-full cursor-pointer overflow-hidden"
      >
        Confirm Purchase
      </div>
    </div>
  );
};

const BidWinnerPage = () => {
  return (
    <>
      <PaymentProvider>
        <div className="min-h-screen bg-gradient-to-br pb-2">
          {/* Header */}
          <header className="mb-20">
            <Header />
          </header>

          {/* Back Button */}
          <div className="mb-3 ml-10">
            <button onClick={() => window.history.back()} className="flex items-center text-sm font-semibold">
              <i className="bx bx-chevron-left text-lg mr-2"></i>
            </button>
          </div>

          <div className="container px-10 max-w-7xl">
            <div className="text-center mb-8">
              <h1 className="text-sm md:text-md font-bold text-gray-900">
                Congratulations! You're the highest bidder
              </h1>
              <p className="text-[11px] text-gray-600 mt-2">
                Complete your purchase to claim this artwork
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-xl overflow-hidden">
                <ArtworkSummary artwork={mockArtwork} bid={mockBid} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <BidDetails bid={mockBid} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border overflow-hidden">
                      <PaymentMethods />
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden">
                      <ShippingInfo />
                    </div>
                  </div>
                </div>
              </div>

              <ConfirmPurchaseButton />

              <div className="bg-white overflow-hidden">
                <TermsReminder />
              </div>
            </div>
          </div>
        </div>
      </PaymentProvider>
      <Footer />
    </>
  );
};

export default BidWinnerPage;
