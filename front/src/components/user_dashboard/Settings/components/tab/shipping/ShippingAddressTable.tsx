import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // <-- new import
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MapPin, Star } from "lucide-react";
import { ShippingAddress } from "../accounts_setup/types/shipping";

interface ShippingAddressTableProps {
  addresses: ShippingAddress[];
  onEditAddress: (address: ShippingAddress) => void;
  onDeleteAddress: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

export const ShippingAddressTable: React.FC<ShippingAddressTableProps> = ({
  addresses,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
}) => {
  // Static labels (no translation)
  const defaultLabel = "Default";
  const setAsDefaultLabel = "Set as Default";
  const editLabel = "Edit";
  const deleteLabel = "Delete";

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Disable scrollbar when delete popup is visible
  useEffect(() => {
    if (showDeletePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeletePopup]);

  const formatAddress = (address: ShippingAddress) => {
    const parts = [address.addressLine1];
    if (address.addressLine2) parts.push(address.addressLine2);
    parts.push(`${address.city}, ${address.state} ${address.zipCode}`);
    parts.push(address.country);
    return parts.join(", ");
  };

  const handleDelete = () => {
    if (selectedAddressId) {
      onDeleteAddress(selectedAddressId);
    }
    setShowDeletePopup(false);
    setSelectedAddressId(null);
  };

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-md bg-blue-50">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-xs">{address.name}</h4>
                {address.isDefault && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 flex items-center gap-1"
                  >
                    {defaultLabel}
                  </Badge>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground mb-1">
                {formatAddress(address)}
              </p>

              <p className="text-[11px] text-muted-foreground">{address.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Set as Default Button */}
            {!address.isDefault && (
              <button
                onClick={() => onSetDefault(address.id)}
                className="text-[10px] text-black hover:text-blue-600 hover:underline px-3"
              >
                {setAsDefaultLabel}
              </button>
            )}

            {/* Dropdown Menu for Edit/Delete */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={() => onEditAddress(address)}
                  className="text-[10px] cursor-pointer"
                >
                  {editLabel}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedAddressId(address.id);
                    setShowDeletePopup(true);
                  }}
                  className="text-[10px] cursor-pointer text-destructive"
                >
                  {deleteLabel}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      {/* Delete Popup */}
      {showDeletePopup &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-60 flex items-center justify-center z-[99999]"
            aria-modal="true"
            role="dialog"
            onClick={() => setShowDeletePopup(false)}
          >
            <div
              className="bg-white rounded-lg p-6 w-80 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-center text-sm font-semibold text-gray-800 mb-2">
                Delete Address?
              </p>
              <p className="text-center text-xs text-gray-600 mb-5">
                Deleted address can't be recovered.
              </p>
              <div className="flex justify-between space-x-3">
                <button
                  className="w-full px-4 py-1.5 text-[11px] rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowDeletePopup(false)}
                >
                  Keep
                </button>
                <button
                  className="w-full px-4 py-1.5 text-[11px] rounded-full bg-red-800 text-white hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
