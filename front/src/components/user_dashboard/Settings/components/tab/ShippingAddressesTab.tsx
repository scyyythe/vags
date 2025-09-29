import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Truck, Shield } from "lucide-react";
import { ShippingAddress, NewShippingAddressState } from "./accounts_setup/types/shipping";
import { ShippingAddressTable } from "./shipping/ShippingAddressTable";
import { useShippingAddresses } from "@/hooks/shipping/useShippingAddresses";

const ShippingAddressesTab = () => {
  const navigate = useNavigate();
  const { addresses, isLoading, addOrUpdateAddress, deleteAddress, setDefaultAddress } = useShippingAddresses();

  // Static labels (no translation)
  const myShippingAddressesLabel = "My Shipping Addresses";
  const addNewAddressLabel = "Add New Address";
  const editAddressLabel = "Edit Address";
  const addNewAddressDesc = "Add a new shipping address for your orders";
  const editAddressDesc = "Update your shipping address details";
  const setAsDefaultLabel = "Set as default shipping address";
  const updateAddressLabel = "Update Address";
  const addAddressLabel = "Add Address";
  const noAddressesLabel = "No shipping addresses configured";
  const addFirstAddressLabel = "Add your first shipping address to get started";
  const shippingInfoLabel = "Shipping Information";
  const deliveryProcessLabel = "Delivery Process";
  const deliveryDescLabel =
    "Your orders will be shipped to your default address. You can change the shipping address during checkout.";
  const addressSecurityLabel = "Address Security";
  const addressSecurityDescLabel =
    "Your shipping information is stored securely and only used for order fulfillment and delivery purposes.";

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [newAddress, setNewAddress] = useState<NewShippingAddressState>({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
    isDefault: false,
  });

  const resetForm = () => {
    setEditingAddress(null);
    setNewAddress({
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: "",
      isDefault: false,
    });
  };

  const handleAddOrUpdateAddress = async () => {
    addOrUpdateAddress({ newAddress, editing: editingAddress });
    resetForm();
    setShowAddForm(false);
  };

  // Navigate to edit page instead of opening modal
  const handleEditAddress = (address: ShippingAddress) => {
    console.log("Editing address:", address);
    navigate(`/edit-address/${address.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start mt-8">
        <div>
          <h3 className="text-xs font-semibold text-foreground">{myShippingAddressesLabel}</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Manage your shipping addresses for orders and deliveries. Set a default address for faster checkout.
          </p>
        </div>

        {/* Add New Address Button with navigation */}
        <button
          onClick={() => navigate("/add-address")}
          className="flex py-2 px-4 gap-2 text-[11px] text-white bg-red-700 rounded-full"
        >
          <Plus className="relative w-3 h-3 top-0.5" />
          {addNewAddressLabel}
        </button>

        {/* Dialog remains for now (used before for editing) */}
        <Dialog
          open={showAddForm}
          onOpenChange={(open) => {
            setShowAddForm(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-[15px]">
                {editingAddress ? editAddressLabel : addNewAddressLabel}
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                {editingAddress ? editAddressDesc : addNewAddressDesc}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border border-input"
              />
              <label htmlFor="isDefault" className="text-[11px]">
                {setAsDefaultLabel}
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 text-xs text-white rounded-full bg-red-700 hover:bg-red-800 px-4 py-2"
                onClick={handleAddOrUpdateAddress}
              >
                {editingAddress ? updateAddressLabel : addAddressLabel}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Addresses Table */}
      <div className="">
        <CardContent className="p-0">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">{noAddressesLabel}</p>
              <p className="text-xs">{addFirstAddressLabel}</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto pr-2">
              <ShippingAddressTable
                addresses={addresses}
                onEditAddress={handleEditAddress}
                onDeleteAddress={deleteAddress}
                onSetDefault={setDefaultAddress}
              />
            </div>
          )}
        </CardContent>
      </div>

      {/* Information Section */}
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-xs font-semibold">{shippingInfoLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Delivery Process */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-blue-50">
                <Truck className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-xs" style={{ fontSize: "11px" }}>
                  {deliveryProcessLabel}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{deliveryDescLabel}</p>
              </div>
            </div>

            {/* Address Security */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-green-50">
                <Shield className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-xs" style={{ fontSize: "11px" }}>
                  {addressSecurityLabel}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{addressSecurityDescLabel}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingAddressesTab;
