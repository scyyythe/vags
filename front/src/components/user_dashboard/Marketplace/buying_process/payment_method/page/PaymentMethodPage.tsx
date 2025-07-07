import React from "react";
import { useNavigate } from "react-router-dom";
import PaymentMethod from "@/components/user_dashboard/Marketplace/buying_process/payment_method/PaymentMethod";

const PaymentMethodPage = () => {
  const navigate = useNavigate();

  return (
    <PaymentMethod
      onBack={() => navigate("/shipping")}
      onContinue={(formData) => {
        console.log("Payment Form Submitted:", formData);
        navigate("/checkout-confirmation");
      }}
    />
  );
};

export default PaymentMethodPage;
