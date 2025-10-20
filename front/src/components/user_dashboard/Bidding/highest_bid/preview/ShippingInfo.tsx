import { usePayment } from "@/context/PaymentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Truck } from "lucide-react";
import useDefaultAddress from "@/hooks/users/address/useDefaultAddress";
import { useAddress } from "@/hooks/users/address/useAddress";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

export const ShippingInfo = () => {
  const { shippingInfo, updateShippingInfo, isEditingShipping, toggleEditShipping } = usePayment();
  const { address, saveAddress, loading } = useAddress(shippingInfo?.id);
  const [saving, setSaving] = useState(false);
  const { data: defaultAddress, isLoading } = useDefaultAddress();
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  // Translate fetched data for display in input fields
  const translatedFullName = useAutoTranslation(shippingInfo.fullName || "", language);
  const translatedPhoneNumber = useAutoTranslation(shippingInfo.phoneNumber || "", language);
  const translatedAddress = useAutoTranslation(shippingInfo.address || "", language);
  const translatedCity = useAutoTranslation(shippingInfo.city || "", language);
  const translatedState = useAutoTranslation(shippingInfo.state || "", language);
  const translatedPostalCode = useAutoTranslation(shippingInfo.postalCode || "", language);
  const translatedCountry = useAutoTranslation(shippingInfo.country || "", language);

  // Translation hooks
  const deliveryInformationText = useAutoTranslation("Delivery Information", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const editText = useAutoTranslation("Edit", language);
  const fullNameText = useAutoTranslation("Full Name", language);
  const phoneNumberText = useAutoTranslation("Phone Number", language);
  const addressText = useAutoTranslation("Address", language);
  const cityText = useAutoTranslation("City", language);
  const stateProvinceText = useAutoTranslation("State/Province", language);
  const postalCodeText = useAutoTranslation("Postal Code", language);
  const countryText = useAutoTranslation("Country", language);
  const enterFullNameText = useAutoTranslation("Enter your full name", language);
  const enterPhoneNumberText = useAutoTranslation("Enter your phone number", language);
  const enterStreetAddressText = useAutoTranslation("Enter your street address", language);
  const enterCityText = useAutoTranslation("Enter your city", language);
  const enterStateProvinceText = useAutoTranslation("Enter your state/province", language);
  const enterPostalCodeText = useAutoTranslation("Enter your postal code", language);
  const enterCountryText = useAutoTranslation("Enter your country", language);
  const savingText = useAutoTranslation("Saving...", language);
  const saveShippingInfoText = useAutoTranslation("Save Shipping Information", language);
  const noShippingInfoText = useAutoTranslation('No shipping information provided yet. Click "Edit" to add your details.', language);
  const notProvidedText = useAutoTranslation("Not provided", language);
  const estimatedDeliveryText = useAutoTranslation("Estimated delivery: 7-10 business days", language);
  const shippingInfoSavedText = useAutoTranslation("Shipping info saved and set as default!", language);
  const failedToSaveText = useAutoTranslation("Failed to save shipping info.", language);

  // Load default address
  useEffect(() => {
    if (defaultAddress && !isEditingShipping) {
      updateShippingInfo({
        fullName: defaultAddress.name,
        phoneNumber: defaultAddress.phone,
        address: defaultAddress.address,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postal_code,
        country: defaultAddress.country,
        id: defaultAddress.id, // save ID for updates
      });
    }
  }, [defaultAddress, isEditingShipping]);

  // Handle saving
  const handleSave = async () => {
    try {
      setSaving(true);
      const savedId = await saveAddress({ ...shippingInfo, setAsDefault: true });

      updateShippingInfo({ id: savedId || shippingInfo.id });

      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });

      toast.success(shippingInfoSavedText, { closeButton: true });
      toggleEditShipping();
    } catch (err) {
      toast.error(failedToSaveText, { closeButton: true });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Truck className="mr-2 h-4 w-4" />
          <span className="text-xs">{deliveryInformationText}</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEditShipping}
          className="h-6 flex items-center text-[10px] rounded-full"
        >
          <i className="bx bx-pencil text-[11px]"></i>
          {isEditingShipping ? cancelText : editText}
        </Button>
      </CardHeader>
      <CardContent>
        {isEditingShipping ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[11px]">
                {fullNameText}
              </Label>
              <Input
                id="fullName"
                value={translatedFullName}
                onChange={(e) => updateShippingInfo({ fullName: e.target.value })}
                placeholder={enterFullNameText}
                style={{ fontSize: "10px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-[11px]">
                {phoneNumberText}
              </Label>
              <Input
                id="phoneNumber"
                value={translatedPhoneNumber}
                onChange={(e) => updateShippingInfo({ phoneNumber: e.target.value })}
                placeholder={enterPhoneNumberText}
                style={{ fontSize: "10px" }}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-[11px]">
                {addressText}
              </Label>
              <Input
                id="address"
                value={translatedAddress}
                onChange={(e) => updateShippingInfo({ address: e.target.value })}
                placeholder={enterStreetAddressText}
                style={{ fontSize: "10px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-[11px]">
                {cityText}
              </Label>
              <Input
                id="city"
                value={translatedCity}
                onChange={(e) => updateShippingInfo({ city: e.target.value })}
                placeholder={enterCityText}
                style={{ fontSize: "10px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-[11px]">
                {stateProvinceText}
              </Label>
              <Input
                id="state"
                value={translatedState}
                onChange={(e) => updateShippingInfo({ state: e.target.value })}
                placeholder={enterStateProvinceText}
                style={{ fontSize: "10px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-[11px]">
                {postalCodeText}
              </Label>
              <Input
                id="postalCode"
                value={translatedPostalCode}
                onChange={(e) => updateShippingInfo({ postalCode: e.target.value })}
                placeholder={enterPostalCodeText}
                style={{ fontSize: "10px" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-[11px]">
                {countryText}
              </Label>
              <Input
                id="country"
                value={translatedCountry}
                onChange={(e) => updateShippingInfo({ country: e.target.value })}
                placeholder={enterCountryText}
                style={{ fontSize: "10px" }}
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-7 text-white text-[10px] bg-red-700 rounded-full"
              >
                {saving ? savingText : saveShippingInfoText}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {!shippingInfo.fullName ? (
              <p className="text-muted-foreground text-[11px] italic">
                {noShippingInfoText}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{fullNameText}</p>
                    <p className="font-medium text-[11px]">
                      <TranslatedText text={shippingInfo.fullName} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{phoneNumberText}</p>
                    <p className="font-medium text-[11px]">
                      {shippingInfo.phoneNumber ? <TranslatedText text={shippingInfo.phoneNumber} /> : notProvidedText}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground">{addressText}</p>
                  <p className="font-medium text-[11px]">
                    <TranslatedText text={shippingInfo.address} />
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">{cityText}</p>
                    <p className="font-medium text-[11px]">
                      <TranslatedText text={shippingInfo.city} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{stateProvinceText}</p>
                    <p className="font-medium text-[11px]">
                      {shippingInfo.state ? <TranslatedText text={shippingInfo.state} /> : notProvidedText}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{postalCodeText}</p>
                    <p className="font-medium text-[11px]">
                      {shippingInfo.postalCode ? <TranslatedText text={shippingInfo.postalCode} /> : notProvidedText}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{countryText}</p>
                    <p className="font-medium text-[11px]">
                      <TranslatedText text={shippingInfo.country} />
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-artwork-secondary text-[11px] font-medium">
                    {estimatedDeliveryText}
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
