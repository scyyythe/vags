import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "@/context/PaymentContext";

export const PayPalPayment = () => {
  const { confirmPurchase } = usePayment();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmPurchase();
  };

  return (
    <div className="overflow-hidden">
        <div className="p-4 text-center text-xs text-gray-900 font-semibold border-none -mb-6">
          PayPal Payment
        </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="paypalEmail" className="text-gray-700 text-[11px]">PayPal Email</Label>
            <Input 
              id="paypalEmail" 
              type="email"
              placeholder="email@example.com" 
              required 
              className="border-gray-300 rounded-full h-8"
              style={{fontSize:"10px"}}
            />
          </div>
          
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 rounded-xl p-4 w-full text-center">
              <p className="text-[10px] text-gray-600">You'll be redirected to PayPal to complete your payment securely.</p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-9 bg-blue-700 hover:bg-blue-600 rounded-full text-[11px]"
          >
            Pay with PayPal
          </Button>
        </form>
      </div>
    </div>
  );
};
