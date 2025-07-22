import React, { createContext, useContext, useState } from "react";
import { PaymentMethod, ShippingInfo, PaymentState } from "@/components/types/index";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PaymentContextProps {
  selectedPaymentMethod: PaymentMethod | null;
  shippingInfo: ShippingInfo;
  isEditingShipping: boolean;
  selectPaymentMethod: (method: PaymentMethod) => void;
  updateShippingInfo: (info: Partial<ShippingInfo>) => void;
  toggleEditShipping: () => void;
  confirmPurchase: () => void;
  messageArtist: () => void;
  downloadInvoice: () => void;
  resendConfirmation: () => void;
  processStripePayment: () => void;
}

const defaultShippingInfo: ShippingInfo = {
  fullName: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phoneNumber: "",
};

const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PaymentState>({
    selectedPaymentMethod: localStorage.getItem("selectedPaymentMethod") as PaymentMethod | null,
    shippingInfo: defaultShippingInfo,
    isEditingShipping: false,
  });
  const navigate = useNavigate();

  const selectPaymentMethod = (method: PaymentMethod) => {
    setState((prev) => ({ ...prev, selectedPaymentMethod: method }));
    localStorage.setItem("selectedPaymentMethod", method); 
    toast.success("Payment method selected!", {
      description: `You've selected ${method} as your payment method.`,
      closeButton: true,
    });
  };

  const updateShippingInfo = (info: Partial<ShippingInfo>) => {
    setState((prev) => ({
      ...prev,
      shippingInfo: { ...prev.shippingInfo, ...info },
    }));
  };

  const toggleEditShipping = () => {
    setState((prev) => ({
      ...prev,
      isEditingShipping: !prev.isEditingShipping,
    }));
  };

  const confirmPurchase = () => {
    if (!state.selectedPaymentMethod) {
      toast.error("Payment method required", {
        description: "Please select a payment method to continue.",
        closeButton: true,
      });
      return;
    }

    if (
      !state.shippingInfo.fullName ||
      !state.shippingInfo.address ||
      !state.shippingInfo.city ||
      !state.shippingInfo.country
    ) {
      toast.error("Shipping information required", {
        description: "Please complete your shipping details to continue.",
        closeButton: true,
      });
      return;
    }

    toast.info("Processing Payment...", {
      description: "Please wait while we process your payment.",
      closeButton: true,
    });

    setTimeout(() => {
      toast.success("Payment Successful!", {
        description: "Your artwork purchase has been confirmed. Thank you!",
        closeButton: true,
      });

      setTimeout(() => navigate("/bid-winner"), 1500);
    }, 2000);
  };

  const messageArtist = () => {
    toast.success("Message Sent", {
      description: "Your message has been sent to the artist. They'll respond shortly.",
      closeButton: true,
    });
  };

  const downloadInvoice = () => {
    toast.success("Invoice Downloaded", {
      description: "Your invoice has been downloaded as a PDF.",
      closeButton: true,
    });
  };

  const resendConfirmation = () => {
    toast.success("Confirmation Resent", {
      description: "A confirmation email has been resent to your email address.",
      closeButton: true,
    });
  };

  const processStripePayment = () => {
    toast.info("Redirecting to Stripe", {
      description: "You'll be redirected to Stripe to complete your payment securely.",
      closeButton: true,
    });

    setTimeout(() => {
      toast.info("Stripe Integration Demo", {
        description: "In a real implementation, you would be redirected to Stripe's checkout page.",
        closeButton: true,
      });
    }, 1500);
  };

  return (
    <PaymentContext.Provider
      value={{
        ...state,
        selectPaymentMethod,
        updateShippingInfo,
        toggleEditShipping,
        confirmPurchase,
        messageArtist,
        downloadInvoice,
        resendConfirmation,
        processStripePayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextProps => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
