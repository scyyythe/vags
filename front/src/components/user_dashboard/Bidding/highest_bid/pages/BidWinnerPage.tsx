import { useState } from "react";
import { PaymentProvider } from "@/context/PaymentContext";
import { usePayment } from "@/context/PaymentContext";
import { ArtworkSummary } from "@/components/user_dashboard/Bidding/highest_bid/preview/ArtworkSummary";
import { BidDetails } from "@/components/user_dashboard/Bidding/highest_bid/preview/BidSummary";
import { PaymentMethods } from "@/components/user_dashboard/Bidding/highest_bid/payment/PaymentMethods";
import { ShippingInfo } from "@/components/user_dashboard/Bidding/highest_bid/preview/ShippingInfo";
import { TermsReminder } from "@/components/user_dashboard/Bidding/highest_bid/preview/TermsReminder";
import { mockArtwork, mockBid } from "@/components/user_dashboard/Bidding/highest_bid/data/mockData";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { CreditCardPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/CreditCard";
import { GCashPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/Gcash";
import { StripePayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/Stripe";
import { PayPalPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/PayPal";
import { toast } from "sonner";

const BidWinnerPageContent = () => {
  const { selectedPaymentMethod } = usePayment(); 
  const [showModal, setShowModal] = useState(false);

  const renderSelectedPaymentComponent = () => {
    switch (selectedPaymentMethod) {
      case "creditCard":
        return <CreditCardPayment />;
      case "gcash":
        return <GCashPayment />;
      case "paypal":
        return <PayPalPayment />;
      case "stripe":
        return <StripePayment />;
      default:
        return (
          <div className="text-center text-sm text-gray-600 p-4">
            No payment method selected.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br pb-2">
      <header className="mb-20">
        <Header />
      </header>

      <div className="mb-3 ml-10">
        <button onClick={() => window.history.back()} className="flex items-center text-sm font-semibold">
          <i className="bx bx-chevron-left text-lg mr-2"></i>
          Back
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

          <div className="flex justify-end mt-4">
            <div
              onClick={() => {
                if (!selectedPaymentMethod) {
                  toast("Please select a payment method before proceeding.");
                } else {
                  setShowModal(true);
                }
              }}
              className="w-44 text-center bg-red-700 hover:bg-red-600 text-[11px] text-white px-2 py-2 rounded-full cursor-pointer overflow-hidden"
            >
              Confirm Purchase
            </div>
          </div>

          <div className="bg-white overflow-hidden">
            <TermsReminder />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white max-w-xs w-full rounded-xl shadow-lg p-4 relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            {renderSelectedPaymentComponent()}
          </div>
        </div>
      )}
    </div>
  );
};

const BidWinnerPage = () => {
  return (
    <>
      <PaymentProvider>
        <BidWinnerPageContent />
      </PaymentProvider>
      <Footer />
    </>
  );
};

export default BidWinnerPage;
