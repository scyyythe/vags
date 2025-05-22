import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PaymentProvider, usePayment } from "@/context/PaymentContext";
import { CreditCardPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/CreditCard";
import { GCashPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/Gcash";
import { StripePayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/Stripe";
import { PayPalPayment } from "@/components/user_dashboard/Bidding/highest_bid/payment/PayPal";
import Header from "@/components/user_dashboard/navbar/Header";

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
      case "stripe":
        return <StripePayment />;
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
       <header className="mb-20">
          <Header />
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
