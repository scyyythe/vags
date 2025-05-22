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
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-6">
        <CardTitle className="flex items-center text-gray-900">
          <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 text-blue-500" fill="currentColor">
            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 10H4c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1z" />
          </svg>
          GCash Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="gcashNumber" className="text-gray-700">GCash Mobile Number</Label>
            <Input 
              id="gcashNumber" 
              placeholder="09XX XXX XXXX" 
              required 
              className="border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
            />
          </div>
              
          <div className="space-y-2">
            <Label htmlFor="gcashName" className="text-gray-700">Account Name</Label>
            <Input 
              id="gcashName" 
              placeholder="Full Name" 
              required 
              className="border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg py-6"
          >
            Pay ₱5,000.00
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
