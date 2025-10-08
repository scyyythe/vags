import React, { useState, useEffect } from "react";
import SecurityNote from "./SecurityNote";
import { Maximize2, X } from "lucide-react";

interface GCashFormProps {
  number: string;
  onNumberChange: (value: string) => void;
}

const qrCodeUrl = "/pics/qr.jpg";

const GCashForm: React.FC<GCashFormProps> = ({ number, onNumberChange }) => {
const [isExpanded, setIsExpanded] = useState(false);

// Disable scrolling when modal OR receipt popup is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  return (
    <>
    <div className="space-y-4">

      {/* QR Code Container */}
      <div className="flex justify-center mb-2.5">
        <div className="relative inline-block group">
          <p className="text-gray-700 text-[11px] text-center mb-2">Scan to Pay via QR Code</p>
          <img
            src={qrCodeUrl}
            alt="GCash QR Code"
            className="w-60 h-60 object-cover rounded-md border border-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
          />

          {/* Expand Button */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            aria-label="Expand QR"
            className={
              "absolute bottom-2 right-2 rounded-full p-2 bg-black shadow-xl text-white " +
              "opacity-0 scale-95 pointer-events-none transition-all duration-200 " +
              "group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
            }
          >
            <Maximize2 className="w-3 h-3" />
          </button> */}
        </div>
      </div>

      {/* GCash Mobile Number */}
      <div className="text-center space-y-2">
        <p className="text-gray-700 text-[10px]">GCash Mobile Number</p>
        <p className="text-[13px] font-semibold text-black">09XX XXX XXXX</p>
      </div>

      <SecurityNote type="gcash" />
    </div>

    {isExpanded && (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center overflow-hidden">
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-4 right-6 z-[60] bg-white rounded-full p-1.5 shadow-md transition-colors duration-200"
          aria-label="Close expanded QR"
        >
          <X className="w-4 h-4 text-gray-900" />
        </button>
    
        <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
          <img
            src={qrCodeUrl}
            alt="Expanded QR Code"
            className="max-h-[80vh] max-w-[90vw] object-contain"
          />
        </div>
      </div>
    )}
    </>
  );
};

export default GCashForm;
