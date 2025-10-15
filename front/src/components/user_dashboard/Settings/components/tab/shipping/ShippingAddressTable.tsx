import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MapPin } from "lucide-react";
import { ShippingAddress } from "../accounts_setup/types/shipping";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

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
  const { language: selectedLanguage } = useLanguage();

  // Auto-translated labels
  const defaultLabel = useAutoTranslation("Default", selectedLanguage);
  const setAsDefaultLabel = useAutoTranslation("Set as Default", selectedLanguage);
  const editLabel = useAutoTranslation("Edit", selectedLanguage);
  const deleteLabel = useAutoTranslation("Delete", selectedLanguage);
  const deletePopupTitle = useAutoTranslation("Delete Address?", selectedLanguage);
  const deletePopupDesc = useAutoTranslation("Deleted address can't be recovered.", selectedLanguage);
  const keepBtnLabel = useAutoTranslation("Keep", selectedLanguage);
  const deleteBtnLabel = useAutoTranslation("Delete", selectedLanguage);

  const cityLabel = useAutoTranslation("City", selectedLanguage);
  const stateLabel = useAutoTranslation("State", selectedLanguage);
  const zipLabel = useAutoTranslation("ZIP Code", selectedLanguage);
  const countryLabel = useAutoTranslation("Country", selectedLanguage);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Disable scrollbar when delete popup is visible
  useEffect(() => {
    document.body.style.overflow = showDeletePopup ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeletePopup]);

  const formatAddress = (address: ShippingAddress) => {
    const parts = [
      address.addressLine1,
      address.addressLine2 ? address.addressLine2 : undefined,
      `${cityLabel}: ${address.city}, ${stateLabel}: ${address.state} ${zipLabel}: ${address.zipCode}`,
      `${countryLabel}: ${address.country}`,
    ].filter(Boolean);

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
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 flex items-center gap-1">
                    {defaultLabel}
                  </Badge>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground mb-1">{formatAddress(address)}</p>
              <p className="text-[11px] text-muted-foreground">{address.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!address.isDefault && (
              <button
                onClick={() => onSetDefault(address.id)}
                className="text-[10px] text-black hover:text-blue-600 hover:underline px-3"
              >
                {setAsDefaultLabel}
              </button>
            )}

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
              <p className="text-center text-sm font-semibold text-gray-800 mb-2">{deletePopupTitle}</p>
              <p className="text-center text-xs text-gray-600 mb-5">{deletePopupDesc}</p>
              <div className="flex justify-between space-x-3">
                <button
                  className="w-full px-4 py-1.5 text-[11px] rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowDeletePopup(false)}
                >
                  {keepBtnLabel}
                </button>
                <button
                  className="w-full px-4 py-1.5 text-[11px] rounded-full bg-red-800 text-white hover:bg-red-700"
                  onClick={handleDelete}
                >
                  {deleteBtnLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
