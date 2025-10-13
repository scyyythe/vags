import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PaymentProvider } from "@/context/PaymentContext";
import { usePayment } from "@/context/PaymentContext";
import { ArtworkSummary } from "@/components/user_dashboard/Bidding/highest_bid/preview/ArtworkSummary";
import { BidDetails } from "@/components/user_dashboard/Bidding/highest_bid/preview/BidSummary";
import { PaymentMethods } from "@/components/user_dashboard/Bidding/highest_bid/payment/PaymentMethods";
import { ShippingInfo } from "@/components/user_dashboard/Bidding/highest_bid/preview/ShippingInfo";
import { TermsReminder } from "@/components/user_dashboard/Bidding/highest_bid/preview/TermsReminder";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { CreditCardPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/CreditCard";
import { GCashPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/Gcash";
import { StripePayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/Stripe";
import { PayPalPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/PayPal";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useFetchBiddingArtworkById } from "@/hooks/auction/useFetchAuctionDetails";
import ArtworkSummarySkeleton from "@/components/skeletons/artworks/ArtworkSummarySkeleton";
import BidDetailsSkeleton from "@/components/skeletons/bidding/BidDetailsSkeleton";
import { useArtistPaymentAccounts } from "@/hooks/accounts/useArtistPaymentAccounts";
const BidWinnerPageContent = () => {
  const { selectedPaymentMethod } = usePayment();
  const [showModal, setShowModal] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const { id: auctionId } = useParams<{ id: string }>();
  const { data: auctionData, isLoading, error } = useFetchBiddingArtworkById(auctionId || "");
  const artistId = auctionData?.artwork?.artist_id;
  const { accounts, loading: accountsLoading, error: accountsError } = useArtistPaymentAccounts(artistId ?? null);
  // Disable scrolling when modal OR receipt popup is open
  useEffect(() => {
    if (showModal || showReceiptPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, showReceiptPopup]);

  if (isLoading)
    return (
      <div className="min-h-screen container px-10 max-w-7xl space-y-8">
        <div className="bg-white rounded-xl overflow-hidden">
          <ArtworkSummarySkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border overflow-hidden">
              <BidDetailsSkeleton />
            </div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border overflow-hidden h-48 animate-pulse" />
            <div className="bg-white rounded-xl overflow-hidden h-48 animate-pulse" />
          </div>
        </div>
      </div>
    );

  if (error) return <div className="text-red-600">Error: {error.message}</div>;
  if (!auctionData) return <div>No auction found.</div>;

  const renderSelectedPaymentComponent = () => {
    switch (selectedPaymentMethod) {
      case "creditCard":
        return <CreditCardPayment />;
      case "gcash":
        return (
          <GCashPayment
            artistId={auctionData.artwork.artist_id}
            onClosePreviousModal={() => {
              setShowModal(false); // close payment modal
              setShowReceiptPopup(true); // show receipt popup
              setTimeout(() => setShowReceiptPopup(false), 10000);
            }}
          />
        );
      case "paypal":
        return (
          <PayPalPayment
            artId={auctionData.artwork.id}
            auctionId={auctionData.id}
            artistId={auctionData.artwork.artist_id}
            default_paypal_email={auctionData.artwork.default_paypal_email}
            amount={auctionData.highest_bid.amount.toString()}
          />
        );
      case "stripe":
        return <StripePayment />;
      default:
        return <div className="text-center text-sm text-gray-600 p-4">No payment method selected.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br pb-2">
      <header className="mb-20">
        <Header />
      </header>

      <div className="mb-3 ml-10">
        <button onClick={() => window.history.back()} className="flex items-center text-xs font-semibold">
          <i className="bx bx-chevron-left text-lg mr-2"></i>
          Back
        </button>
      </div>

      <div className="container px-10 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-sm md:text-md font-bold text-gray-900">Congratulations! You're the highest bidder</h1>
          <p className="text-[11px] text-gray-600 mt-2">Complete your purchase to claim this artwork</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl overflow-hidden">
            <ArtworkSummary />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl border overflow-hidden">
                <BidDetails />
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

          <div className="bg-white overflow-hidden">
            <TermsReminder />
          </div>

          <div className="flex justify-end -mt-4">
            <div
              onClick={() => {
                if (!selectedPaymentMethod) {
                  toast("Please select a payment method before proceeding.", { closeButton: true });
                } else {
                  setShowModal(true);
                }
              }}
              className="w-44 text-center bg-red-700 hover:bg-red-600 text-[11px] text-white px-2 py-2 rounded-full cursor-pointer overflow-hidden"
            >
              Confirm Purchase
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-white max-w-xs w-full rounded-xl shadow-lg p-4 relative">
            <button
              className="absolute top-5 right-3 text-gray-600 hover:text-black text-lg"
              onClick={() => setShowModal(false)}
            >
              <X className="w-4 h-4" />
            </button>
            {renderSelectedPaymentComponent()}
          </div>
        </div>
      )}

      {/* Receipt Popup */}
      {showReceiptPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 text-center max-w-xs mx-auto">
            <h2 className="text-sm font-semibold text-red-700 mb-2">Payment Complete!</h2>
            <p className="text-xs text-black">You can now send your receipt to the owner as proof.</p>
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
