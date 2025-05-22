import { usePayment } from "@/context/PaymentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Truck, Pencil } from "lucide-react";

export const ShippingInfo = () => {
  const {
    shippingInfo,
    updateShippingInfo,
    isEditingShipping,
    toggleEditShipping,
  } = usePayment();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Truck className="mr-2 h-4 w-4" />
          <span className="text-xs">Delivery Information</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEditShipping}
          className="h-6 flex items-center text-[10px] rounded-full"
        >
          <i className='bx bx-pencil text-[11px]'></i>
          {isEditingShipping ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        {isEditingShipping ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[11px]">Full Name</Label>
              <Input
                id="fullName"
                value={shippingInfo.fullName}
                onChange={(e) =>
                  updateShippingInfo({ fullName: e.target.value })
                }
                placeholder="Enter your full name"
                style={{fontSize:"10px"}}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-[11px]">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={shippingInfo.phoneNumber}
                onChange={(e) =>
                  updateShippingInfo({ phoneNumber: e.target.value })
                }
                placeholder="Enter your phone number"
                style={{fontSize:"10px"}}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-[11px]">Address</Label>
              <Input
                id="address"
                value={shippingInfo.address}
                onChange={(e) =>
                  updateShippingInfo({ address: e.target.value })
                }
                placeholder="Enter your street address"
                style={{fontSize:"10px"}}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-[11px]">City</Label>
              <Input
                id="city"
                value={shippingInfo.city}
                onChange={(e) => updateShippingInfo({ city: e.target.value })}
                placeholder="Enter your city"
                style={{fontSize:"10px"}}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-[11px]">State/Province</Label>
              <Input
                id="state"
                value={shippingInfo.state}
                onChange={(e) => updateShippingInfo({ state: e.target.value })}
                placeholder="Enter your state/province"
                style={{fontSize:"10px"}}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-[11px]">Postal Code</Label>
              <Input
                id="postalCode"
                value={shippingInfo.postalCode}
                onChange={(e) =>
                  updateShippingInfo({ postalCode: e.target.value })
                }
                placeholder="Enter your postal code"
                style={{fontSize:"10px"}}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-[11px]">Country</Label>
              <Input
                id="country"
                value={shippingInfo.country}
                onChange={(e) =>
                  updateShippingInfo({ country: e.target.value })
                }
                placeholder="Enter your country"
                style={{fontSize:"10px"}}
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <Button 
                onClick={toggleEditShipping}
                className="h-7 text-white text-[10px] bg-red-700 rounded-full"
              >
                Save Shipping Information
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {!shippingInfo.fullName ? (
              <p className="text-muted-foreground text-[11px] italic">No shipping information provided yet. Click "Edit" to add your details.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Full Name</p>
                    <p className="font-medium text-[11px]">{shippingInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Phone Number</p>
                    <p className="font-medium text-[11px]">
                      {shippingInfo.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground">Address</p>
                  <p className="font-medium text-[11px]">{shippingInfo.address}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">City</p>
                    <p className="font-medium text-[11px]">{shippingInfo.city}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      State/Province
                    </p>
                    <p className="font-medium text-[11px]">
                      {shippingInfo.state || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Postal Code</p>
                    <p className="font-medium text-[11px]">
                      {shippingInfo.postalCode || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Country</p>
                    <p className="font-medium text-[11px]">{shippingInfo.country}</p>
                  </div>
                </div>

                

                <div className="pt-2">
                  <p className="text-artwork-secondary text-[11px] font-medium">
                    Estimated delivery: 7-10 business days
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
