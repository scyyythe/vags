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

type PaymentMethod = "PayPal" | "GCash";

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
    
    // Show confirmation screen
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div 
        ref={popupRef} 
        className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-fadeIn relative"
      >
        {step === "amount" && (
          <button 
            onClick={handleCancel}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}

        {step === "confirm" ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-6">Are you sure you want to send a donation?</h2>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleConfirmDonation} 
                className="bg-[#B5191D] hover:bg-[#9b1518] text-white font-medium py-2 px-8 rounded-full"
              >
                Yes
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-8 rounded-full"
              >
                No
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{artworkTitle}</h2>
              
              <div className="flex justify-center my-4">
                <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
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
              
              <p className="text-gray-600 text-sm mb-4">How much you wanna donate?</p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {predefinedAmounts.slice(0, 3).map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => handleAmountSelect(amount.value)}
                    className={cn(
                      "py-2 px-4 rounded-full text-sm font-medium transition-colors",
                      selectedAmount === amount.value
                        ? "bg-[#B5191D] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    )}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {predefinedAmounts.slice(3).map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => handleAmountSelect(amount.value)}
                    className={cn(
                      "py-2 px-4 rounded-full text-sm font-medium transition-colors",
                      selectedAmount === amount.value
                        ? "bg-[#B5191D] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    )}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
              
              <div className="text-center text-sm text-gray-500 mb-2">or</div>
              
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Enter amount manually"
                className="w-full p-2 border border-gray-300 rounded-md text-center mb-6"
              />
              
              <div className="mb-6">
                <p className="text-left text-sm font-medium mb-2">payment method</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentMethod === "PayPal"}
                      onChange={() => handlePaymentMethodSelect("PayPal")}
                      className="form-radio text-[#B5191D]"
                    />
                    <span className="text-sm">PayPal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentMethod === "GCash"}
                      onChange={() => handlePaymentMethodSelect("GCash")}
                      className="form-radio text-[#B5191D]"
                    />
                    <span className="text-sm">GCash</span>
                  </label>
                </div>
              </div>
              
              <Button
                onClick={handleProceedToDonate}
                className="w-full bg-[#B5191D] hover:bg-[#9b1518] text-white font-medium py-3 rounded-md"
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