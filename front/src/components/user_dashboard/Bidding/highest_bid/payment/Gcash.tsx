import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "@/context/PaymentContext";
import { ArrowLeft } from "lucide-react";

export const GCashPayment = () => {
  const { confirmPurchase } = usePayment();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmPurchase();
  };

  return (
    <div className="overflow-hidden">
        <div className="p-4 text-center text-xs text-gray-900 font-semibold border-none -mb-6">
          GCash Payment
        </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="gcashNumber" className="text-gray-700 text-[11px]">GCash Mobile Number</Label>
            <Input 
              id="gcashNumber" 
              placeholder="09XX XXX XXXX" 
              required 
              className="border-gray-300 rounded-full h-8"
              style={{fontSize:"10px"}}
            />
          </div>
              
          <div className="space-y-2">
            <Label htmlFor="gcashName" className="text-gray-700 text-[11px]">Account Name</Label>
            <Input 
              id="gcashName" 
              placeholder="Full Name" 
              required 
              className="border-gray-300 rounded-full h-8"
              style={{fontSize:"10px"}}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-9 bg-blue-700 hover:bg-blue-600 rounded-full text-[11px]"
          >
            Pay ₱5,000.00
          </Button>
        </form>
      </div>
    </div>
  );
};
