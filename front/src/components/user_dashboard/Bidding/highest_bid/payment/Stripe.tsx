import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "@/context/PaymentContext";
import { ArrowLeft } from "lucide-react";

export const StripePayment = () => {
  const { confirmPurchase } = usePayment();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmPurchase();
  };

  return (
    <div className="overflow-hidden">
        <div className="p-4 text-center text-xs text-gray-900 font-semibold border-none -mb-6">
          Stripe Payment
        </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="stripeNumber" className="text-gray-700 text-[11px]">GCash Mobile Number</Label>
            <Input 
              id="stripeNumber" 
              placeholder="09XX XXX XXXX" 
              required 
              className="border-gray-300 rounded-full h-8"
              style={{fontSize:"10px"}}
            />
          </div>
              
          <div className="space-y-2">
            <Label htmlFor="stripeName" className="text-gray-700 text-[11px]">Account Name</Label>
            <Input 
              id="stripeName" 
              placeholder="Full Name" 
              required 
              className="border-gray-300 rounded-full h-8"
              style={{fontSize:"10px"}}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-9 bg-violet-700 hover:bg-violet-600 rounded-full text-[11px]"
          >
            Pay ₱5,000.00
          </Button>
        </form>
      </div>
    </div>
  );
};
