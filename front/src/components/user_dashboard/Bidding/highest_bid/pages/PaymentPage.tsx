import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PaymentProvider, usePayment } from "@/context/PaymentContext";
import { CreditCardPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/CreditCard";
import { GCashPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/Gcash";
import { PayPalPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/PayPal";

const PaymentContent = () => {
  const navigate = useNavigate();
  const { selectedPaymentMethod } = usePayment();

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case "creditCard":
        return <CreditCardPayment />;
      case "gcash":
        return <GCashPayment />;
      case "paypal":
        return <PayPalPayment />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Please select a payment method from the bid winner page first.</p>
            <Button 
              className="mt-4 bg-red-500 hover:bg-red-600" 
              onClick={() => navigate("/bid-winner")}
            >
              Go Back to Select Payment Method
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-12">
      {/* Header */}
      <header className="w-full border-b py-4 px-6 bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
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

      <div className="container max-w-md pt-20 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/bid-winner")}
          className="mb-6 hover:bg-transparent hover:text-red-500 pl-0 text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order Summary
        </Button>
        
        {renderPaymentForm()}
      </div>
    </div>
  );
};

const PaymentPage = () => {
  return (
    <PaymentProvider>
      <PaymentContent />
    </PaymentProvider>
  );
};

export default PaymentPage;
