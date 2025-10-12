import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Link as LinkIcon } from "lucide-react";

interface AutomaticMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName?: string;
  artworkTitle?: string;
  buyerName?: string;
  orderId?: string;
}

const AutomaticMessageDialog: React.FC<AutomaticMessageDialogProps> = ({
  open,
  onOpenChange,
  sellerName = "Seller",
  artworkTitle = "Artwork",
  buyerName = "Buyer Name",
  orderId = "ORDER123",
}) => {
  const handleViewOrder = () => {
    console.log("View order details:", orderId);
    // Handle navigation or action here
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        {/* Chat Header */}
        <DialogHeader className="px-4 py-3 flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-base font-semibold">
            Automatic Message
          </DialogTitle>
        </DialogHeader>
        
        {/* Chat Area */}
        <div className="flex flex-col h-[400px]">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {/* System Message - Left Aligned */}
            <div className="flex justify-start">
              <div className="max-w-[50%]">
                {/* Sender Label */}
                <div className="text-xs text-muted-foreground mb-1 px-1">
                  System
                </div>
                
                {/* Message Bubble */}
                <div className="bg-card border rounded-2xl rounded-tl-sm shadow-sm p-4 space-y-3">
                  {/* Message Header */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="font-bold text-xs">New Order Received!</span>
                  </div>
                  
                  {/* Message Content */}
                  <div className="space-y-2.5 text-[11px] leading-relaxed">
                    <p>
                      Hello <span className="font-semibold">{sellerName}</span>,
                    </p>
                    
                    <p>
                      You've received a new order for your artwork{" "}
                      <span className="font-semibold text-primary">"{artworkTitle}"</span> from{" "}
                      <span className="font-semibold">{buyerName}</span>.
                    </p>
                    
                    <p className="italic text-[10px] text-muted-foreground">
                      Please coordinate directly with the buyer in this chat to discuss shipment method, 
                      delivery fee (if applicable), and expected delivery date.
                    </p>

                    {/* Order Link */}
                    <button
                      onClick={handleViewOrder}
                      className="flex items-center gap-2 text-blue-600 underline font-medium mt-3"
                    >
                      <LinkIcon className="w-4 h-4 text-blue-600" />
                      View Order Details
                    </button>

                    {/* Warning Box */}
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 mt-4">
                      <p className="text-[9px] text-amber-900 dark:text-amber-200">
                        <span className="font-semibold">⚠️ Reminder:</span> Make sure to confirm all delivery details with the buyer before sending the artwork.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutomaticMessageDialog;
