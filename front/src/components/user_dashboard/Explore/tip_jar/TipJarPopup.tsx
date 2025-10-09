import { useState, useRef, useEffect } from "react";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import gcashLogo from "../../../../../public/pics/gcash.png";
import paypalLogo from "../../../../../public/pics/paypal.png";
import stripeLogo from "../../../../../public/pics/stripe.png";
import { usePayPalTip } from "@/hooks/paypal/usePayPalTip";
import { useStripeTip } from "@/hooks/tips/useStripeTip";
import { useGcashTip } from "@/hooks/tips/gcash/useGCashTip";
import apiClient from "@/utils/apiClient";
interface TipJarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  artworkTitle?: string;
  artworkImage?: string;
  artistName?: string;
  artistId: string;
  artId: string;
  default_paypal_email: string;
}

type PaymentMethod = "PayPal" | "GCash" | "Stripe";

const TipJarPopup = ({
  isOpen,
  onClose,
  artworkTitle = "Untitled Artwork",
  artworkImage = "",
  artistName = "",
  artistId = "",
  default_paypal_email = "",
  artId = "",
}: TipJarPopupProps) => {
  const [step, setStep] = useState<"amount" | "confirm" | "paypal">("amount");
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PayPal");
  const popupRef = useRef<HTMLDivElement>(null);
  const { createStripeSession } = useStripeTip();
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [artistAccounts, setArtistAccounts] = useState<any[]>([]);
  const gcashAccount = artistAccounts.find((acc) => acc.type === "gcash");
  const qrCodeUrl = gcashAccount?.qr_image_url || "/pics/qr.png";
  const [refreshKey, setRefreshKey] = useState(0);
  const { sendGcashTip } = useGcashTip();

  const predefinedAmounts = [
    { value: "250", label: "₱250" },
    { value: "500", label: "₱500" },
    { value: "750", label: "₱750" },
    { value: "1500", label: "₱1500" },
    { value: "2500", label: "₱2500" },
    { value: "3000", label: "₱3000" },
  ];
  useEffect(() => {
    if (!artistId) return;

    const fetchArtistAccounts = async () => {
      try {
        const res = await apiClient.get(`/payment/accounts/artist/${artistId}/`);
        setArtistAccounts(res.data);
      } catch (err) {
        console.error("Failed to fetch artist accounts:", err);
        toast.error("Failed to load artist payment accounts");
      }
    };

    fetchArtistAccounts();
  }, [artistId, refreshKey]);
  //Disable modal closing when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // Do nothing (prevent closing)
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Lock scroll when modal is open
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
      toast.error("Please select or enter an amount", { closeButton: true });
      return;
    }

    setStep("confirm");
  };

  const paypalRef = usePayPalTip({
    amount: selectedAmount || customAmount,
    default_paypal_email: default_paypal_email,
    artistId: artistId,
    id: artId,
    onSuccess: (details) => {
      toast.success("Thank you for your donation!", { closeButton: true });
      onClose();
    },
    onError: (error) => {
      toast.error("PayPal payment failed. Please try again.", { closeButton: true });
      console.error(error);
    },
  });

  const handleConfirmDonation = async () => {
    const amount = selectedAmount || customAmount;
    if (!amount) {
      toast.error("Invalid amount.");
      return;
    }

    if (paymentMethod === "PayPal") {
      setStep("paypal");
    } else if (paymentMethod === "Stripe") {
      try {
        await createStripeSession(amount, artistId, artId);
      } catch (err) {
        toast.error("Stripe payment failed. Try again.");
      }
    } else if (paymentMethod === "GCash") {
      try {
        await sendGcashTip(amount, artistId, artId);
        onClose();
      } catch {
        toast.error("Gcash payment failed. Try again.", { closeButton: true });
      }
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-6">
      <div
        ref={popupRef}
        className={cn(
          "bg-white rounded-lg w-full shadow-xl overflow-hidden animate-fadeIn relative",
          step === "confirm" ? "max-w-[350px]" : "max-w-sm"
        )}
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
          <div className="p-8 text-center relative">
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={14} />
            </button>

            {/* If NO PayPal account */}
            {paymentMethod === "PayPal" && !default_paypal_email ? (
              <div>
                <p className="text-md font-semibold text-red-700 mb-3">Unavailable</p>
                <p className="text-xs font-medium text-gray-800">Owner has not provided a PayPal account.</p>
                <p className="text-[10px] text-gray-500 mt-2">Please try a different payment method.</p>
              </div>
            ) : (
              <>
                {/* If account EXISTS */}
                <h2 className="text-md font-bold mb-6">Confirm Your Donation</h2>

                <div className="p-4 rounded-md mb-2 space-y-4">
                  {/* Artist */}
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-black">To:</p>
                    <p className="text-[12px] font-medium text-right">{artistName}</p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                  {/* Amount */}
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-black">Amount:</p>
                    <p className="text-lg font-bold text-red-700 text-right">₱{selectedAmount || customAmount}</p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                  {/* Payment Method + Detail */}
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] text-black mt-1">Payment Method:</p>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        {paymentMethod === "PayPal" && <img src={paypalLogo} className="w-4 h-4" />}
                        {paymentMethod === "GCash" && <img src={gcashLogo} className="w-4 h-4" />}
                        {paymentMethod === "Stripe" && <img src={stripeLogo} className="w-4 h-4" />}
                        <span className="text-xs font-medium">{paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Centered GCash number and QR code */}
                  {paymentMethod === "GCash" ? (
                    gcashAccount ? (
                      <div className="flex flex-col items-center justify-center mt-4 w-full">
                        <p className="text-[11px] text-gray-700 mt-1">Scan this QR to donate</p>

                        {/* QR container with hover expand button */}
                        <div className="relative group mt-2">
                          <img
                            src={qrCodeUrl}
                            alt="GCash QR Code"
                            className="w-48 h-48 text-xs rounded-md border border-gray-200 object-cover"
                          />

                          {/* Hidden by default, appears on hover */}
                          <button
                            onClick={() => setIsQrExpanded(true)}
                            aria-label="Expand QR"
                            className={
                              "absolute bottom-2 right-2 rounded-full p-2 bg-black shadow-xl text-white " +
                              "opacity-0 scale-95 pointer-events-none transition-all duration-200 " +
                              "group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
                            }
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-xs text-black text-center font-medium mt-2">
                          {" "}
                          {gcashAccount?.account_info || "09XX-XXX-XXXX"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center mt-6 text-center text-gray-600">
                        <p className="text-md font-semibold text-red-700 mb-2">Unavailable</p>
                        <p className="text-xs font-medium">No GCash details available from this user.</p>
                        <p className="text-[10px] text-gray-500 mt-1">Try using PayPal or Stripe instead.</p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-end justify-end">
                      <p className="text-[11px] text-gray-700">
                        {paymentMethod === "PayPal" && default_paypal_email}
                        {paymentMethod === "Stripe" && "********@gmail.com"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-between">
                  <Button
                    onClick={handleConfirmDonation}
                    className="w-full bg-[#B5191D] hover:bg-[#9b1518] text-white text-xs font-medium rounded-full py-1 px-4"
                    disabled={paymentMethod === "PayPal" && !default_paypal_email}
                  >
                    {paymentMethod === "GCash" ? "Donated" : "Donate"}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-6 px-16">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{artworkTitle}</h2>

              <div className="flex justify-center my-4">
                <div className="w-16 h-16 rounded-sm overflow-hidden border border-gray-200 shadow-lg">
                  {artworkImage ? (
                    <img src={artworkImage} alt={artworkTitle} className="w-full h-full object-cover" />
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
                      <img src={paypalLogo} className="w-6 h-6" />
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
                      <img src={gcashLogo} className="w-6 h-6" />
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
                      <img src={stripeLogo} className="w-6 h-6" />
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
                className="w-full bg-red-800 hover:bg-red-700 text-white text-xs font-medium py-3 rounded-full"
              >
                Donate Now
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* PayPal payment step */}
      {step === "paypal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-center">
            <h2 className="text-xs font-small mb-4">Pay with PayPal</h2>
            <div ref={paypalRef} className="mx-auto" />
            <button onClick={() => setStep("amount")} className="mt-4 text-xs text-gray-500 underline">
              Cancel and go back
            </button>
          </div>
        </div>
      )}

      {isQrExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-hidden">
          <button
            onClick={() => setIsQrExpanded(false)}
            className="absolute top-4 right-6 z-[60] bg-white rounded-full p-1.5 shadow-md transition-colors duration-200"
            aria-label="Close expanded QR"
          >
            <X className="w-4 h-4 text-gray-900" />
          </button>

          <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
            <img src={qrCodeUrl} alt="Expanded QR Code" className="max-h-[80vh] max-w-[90vw] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TipJarPopup;
