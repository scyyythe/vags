import React, { useState, useEffect } from "react";
import { Plus, Maximize2, X } from "lucide-react";
import { useNavigate } from "react-router-dom"
import SecurityNote from "./SecurityNote";

interface GCashFormProps {
  number?: string;
  qrCodeUrl?: string;
  onNumberChange?: (value: string) => void;
}

const GCashForm: React.FC<GCashFormProps> = ({
  number,
  qrCodeUrl = "/pics/qr.jpg",
  onNumberChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate()

  // Disable scrolling when expanded
  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  // Empty state if no number or QR is saved
  if (!number) {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <svg
              className="w-16 h-16 text-muted-foreground/40"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.485 2 2 6.485 2 12s4.485 10 10 10 10-4.485 10-10S17.515 2 12 2zm.75 5v4.25H17v1.5h-4.25V17h-1.5v-4.25H7v-1.5h4.25V7h1.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground mb-2">
              No GCash Account Added
            </h3>
            <p className="text-xs text-muted-foreground">
              Add your GCash QR or mobile number to receive payments easily
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings/billing")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-[11px] transition-colors"
          >
            <Plus size={14} />
            Set Up GCash Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* QR Code Section */}
        <div className="flex justify-center mb-2.5">
          <div className="relative inline-block group">
            <p className="text-gray-700 text-[11px] text-center mb-2">
              Scan to Pay via QR Code
            </p>

            {/* QR Image (Click to Expand) */}
            <img
              src={qrCodeUrl}
              alt="GCash QR Code"
              className="w-60 h-60 object-cover rounded-md border border-gray-200 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(true);
              }}
            />

            {/* Expand Button (Hover to show) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(true);
              }}
              aria-label="Expand QR"
              className="absolute bottom-2 right-2 rounded-full p-2 bg-black/70 text-white 
                         opacity-0 scale-95 pointer-events-none transition-all duration-200 
                         group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* GCash Number */}
        <div className="text-center space-y-2">
          <p className="text-gray-700 text-[10px]">GCash Mobile Number</p>
          <p className="text-[13px] font-semibold text-black">
            {number || "09XX XXX XXXX"}
          </p>
        </div>

        <SecurityNote type="gcash" />
      </div>

      {/* Expanded QR Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center overflow-hidden">
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
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GCashForm;
