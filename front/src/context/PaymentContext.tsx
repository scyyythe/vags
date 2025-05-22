import React, { createContext, useContext, useState } from "react";
import { PaymentMethod, ShippingInfo, PaymentState } from "@/components/types/index";
import { useToast } from "@/components/ui/use-toast";
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
    selectedPaymentMethod: null,
    shippingInfo: defaultShippingInfo,
    isEditingShipping: false,
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectPaymentMethod = (method: PaymentMethod) => {
    setState((prev) => ({ ...prev, selectedPaymentMethod: method }));
    toast({
      title: "Payment Method Selected",
      description: `You've selected ${method} as your payment method.`,
    });
    
    // Automatically navigate to payment page when a method is selected
    navigate('/payment');
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
      toast({
        title: "Payment method required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (
      !state.shippingInfo.fullName ||
      !state.shippingInfo.address ||
      !state.shippingInfo.city ||
      !state.shippingInfo.country
    ) {
      toast({
        title: "Shipping information required",
        description: "Please complete your shipping details to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate payment processing
    toast({
      title: "Processing Payment...",
      description: "Please wait while we process your payment.",
    });
    
    // Simulate successful payment after a short delay
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: "Your artwork purchase has been confirmed. Thank you!",
      });
      
      // Navigate back to bid winner page to show the confirmation
      setTimeout(() => navigate("/bid-winner"), 1500);
    }, 2000);
  };

  const messageArtist = () => {
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the artist. They'll respond shortly.",
    });
  };

  const downloadInvoice = () => {
    toast({
      title: "Invoice Downloaded",
      description: "Your invoice has been downloaded as a PDF.",
    });
  };

  const resendConfirmation = () => {
    toast({
      title: "Confirmation Resent",
      description: "A confirmation email has been resent to your email address.",
    });
  };
  
  const processStripePayment = () => {
    // This would normally call a backend API to create a Stripe checkout session
    toast({
      title: "Redirecting to Stripe",
      description: "You'll be redirected to Stripe to complete your payment securely.",
    });
    
    // Simulate redirect to Stripe checkout
    setTimeout(() => {
      toast({
        title: "Stripe Integration Demo",
        description: "In a real implementation, you would be redirected to Stripe's checkout page.",
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
