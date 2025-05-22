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
          <Truck className="mr-2 h-5 w-5" />
          <span>Delivery Information</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEditShipping}
          className="flex items-center"
        >
          <Pencil className="mr-2 h-4 w-4" />
          {isEditingShipping ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        {isEditingShipping ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={shippingInfo.fullName}
                onChange={(e) =>
                  updateShippingInfo({ fullName: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={shippingInfo.phoneNumber}
                onChange={(e) =>
                  updateShippingInfo({ phoneNumber: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={shippingInfo.address}
                onChange={(e) =>
                  updateShippingInfo({ address: e.target.value })
                }
                placeholder="Enter your street address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={shippingInfo.city}
                onChange={(e) => updateShippingInfo({ city: e.target.value })}
                placeholder="Enter your city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={shippingInfo.state}
                onChange={(e) => updateShippingInfo({ state: e.target.value })}
                placeholder="Enter your state/province"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={shippingInfo.postalCode}
                onChange={(e) =>
                  updateShippingInfo({ postalCode: e.target.value })
                }
                placeholder="Enter your postal code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={shippingInfo.country}
                onChange={(e) =>
                  updateShippingInfo({ country: e.target.value })
                }
                placeholder="Enter your country"
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <Button 
                onClick={toggleEditShipping}
                className="bg-artwork-primary hover:bg-artwork-secondary"
              >
                Save Shipping Information
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!shippingInfo.fullName ? (
              <p className="text-muted-foreground italic">No shipping information provided yet. Click "Edit" to add your details.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{shippingInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">
                      {shippingInfo.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{shippingInfo.address}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{shippingInfo.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      State/Province
                    </p>
                    <p className="font-medium">
                      {shippingInfo.state || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Postal Code</p>
                    <p className="font-medium">
                      {shippingInfo.postalCode || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{shippingInfo.country}</p>
                </div>

                <div className="pt-2">
                  <p className="text-artwork-secondary font-medium">
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
