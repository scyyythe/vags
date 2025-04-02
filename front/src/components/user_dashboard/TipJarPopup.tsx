import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TipJarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  artworkTitle?: string;
  artworkImage?: string;
  artistName?: string;
}

type PaymentMethod = "PayPal" | "GCash" | "Stripe"; 

const TipJarPopup = ({ 
  isOpen, 
  onClose, 
  artworkTitle = "Untitled Artwork",
  artworkImage = "",
  artistName = ""
}: TipJarPopupProps) => {
  const [step, setStep] = useState<"amount" | "confirm">("amount");
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PayPal");
  const popupRef = useRef<HTMLDivElement>(null);

  console.log("TipJarPopup - isOpen:", isOpen);
  console.log("TipJarPopup - artworkTitle:", artworkTitle);

  const predefinedAmounts = [
    { value: "250", label: "₱250" },
    { value: "500", label: "₱500" },
    { value: "750", label: "₱750" },
    { value: "1500", label: "₱1500" },
    { value: "2500", label: "₱2500" },
    { value: "3000", label: "₱3000" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep("amount");
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setStep("amount");
      setSelectedAmount(null);
      setCustomAmount("");
      setPaymentMethod("PayPal");
    }
  }, [isOpen]);

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleProceedToDonate = () => {
    const amount = selectedAmount || customAmount;
    if (!amount) {
      toast.error("Please select or enter an amount");
      return;
    }
    
    // Show confirmation
    setStep("confirm");
  };
  
  const handleConfirmDonation = () => {
    const amount = selectedAmount || customAmount;
    toast.success(`Donation of ₱${amount} sent via ${paymentMethod}!`);
    onClose();
  };

  const handleCancel = () => {
    if (step === "confirm") {
      setStep("amount");
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-6">
      <div 
        ref={popupRef} 
        className="bg-white rounded-sm max-w-md w-full shadow-xl overflow-hidden animate-fadeIn relative"
      >
        {step === "amount" && (
          <button 
            onClick={handleCancel}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        {step === "confirm" ? (
          <div className="p-8 text-center">
            <h2 className="text-sm font-small mb-6">Are you sure you want to send a donation?</h2>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleConfirmDonation} 
                className="w-[35%] bg-[#B5191D] hover:bg-[#9b1518] text-white text-xs font-medium rounded-full py-1 px-4"
              >
                Yes
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel} 
                className="w-[35%] bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded-full py-1 px-4"
              >
                No
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 px-16">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{artworkTitle}</h2>
              
              <div className="flex justify-center my-4">
                <div className="w-16 h-16 rounded-sm overflow-hidden border border-gray-200 shadow-lg">
                  {artworkImage ? (
                    <img 
                      src={artworkImage} 
                      alt={artworkTitle} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-xs mb-6">How much you wanna donate?</p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {predefinedAmounts.slice(0, 3).map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => handleAmountSelect(amount.value)}
                    className={cn(
                      "py-2 px-4 rounded-sm text-[10px] font-medium transition-colors",
                      selectedAmount === amount.value
                        ? "bg-[#B5191D] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    )}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-5">
                {predefinedAmounts.slice(3).map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => handleAmountSelect(amount.value)}
                    className={cn(
                      "py-2 px-4 rounded-sm text-[10px] font-medium transition-colors",
                      selectedAmount === amount.value
                        ? "bg-[#B5191D] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    )}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
              

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs">or</span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>
              
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Enter amount manually"
                className="w-full p-2 text-[10px] border border-gray-300 rounded-sm text-center mb-6"
              />
              
              <div className="mb-6">
                <p className="text-left text-xs font-medium mb-4">payment method</p>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <img src="./pics/paypal.png" className="w-6 h-6" />
                      <span className="text-[10px] mt-1">PayPal</span>
                    </div>
                    <input
                      type="radio"
                      checked={paymentMethod === "PayPal"}
                      onChange={() => handlePaymentMethodSelect("PayPal")}
                      className="form-radio accent-red-900 h-3 w-3 cursor-pointer"
                      />
                  </label>
                  <label className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <img src="./pics/gcash.png" className="w-6 h-6" />
                      <span className="text-[10px] mt-1">GCash</span>
                    </div>
                    <input
                      type="radio"
                      checked={paymentMethod === "GCash"}
                      onChange={() => handlePaymentMethodSelect("GCash")}
                      className="form-radio accent-red-900 h-3 w-3 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <img src="./pics/stripe.png" className="w-6 h-6" />
                      <span className="text-[10px] mt-1">Stripe</span>
                    </div>
                    <input
                      type="radio"
                      checked={paymentMethod === "Stripe"}
                      onChange={() => handlePaymentMethodSelect("Stripe")}
                      className="form-radio accent-red-900 h-3 w-3 cursor-pointer"
                    />
                    
                  </label>
                </div>
              </div>
              
              <Button
                onClick={handleProceedToDonate}
                className="w-full bg-[#B5191D] hover:bg-[#9b1518] text-white text-xs font-medium py-3 rounded-sm"
              >
                Donate Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TipJarPopup;