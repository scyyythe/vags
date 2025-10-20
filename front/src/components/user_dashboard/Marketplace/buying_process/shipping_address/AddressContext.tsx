import { createContext, useContext, useState, useEffect } from "react";
import axios from "@/utils/apiClient";
import { useIsAuthenticated } from "@/auth/useIsAuthenticated";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  postalCode: string;
  isDefault?: boolean;
}

interface AddressContextType {
  addresses: Address[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  addOrUpdateAddress: (address: Address) => void;
  getAddressById: (id: string) => Address | undefined;
  loading: boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: React.ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useIsAuthenticated();

  // Language and translation
  const { language } = useLanguage();
  const failedToLoadAddressesText = useAutoTranslation("Failed to load addresses", language);

  const addOrUpdateAddress = (newAddress: Address) => {
    setAddresses((prev) => {
      const exists = prev.find((a) => a.id === newAddress.id);
      if (exists) {
        return prev.map((a) => (a.id === newAddress.id ? newAddress : a));
      }
      return [...prev, newAddress];
    });

    if (newAddress.isDefault || addresses.length === 0) {
      setSelectedAddressId(newAddress.id);
    }
  };
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await axios.get("/address/");
        const fetched = res.data;

        if (Array.isArray(fetched)) {
          setAddresses(fetched);
          const defaultAddr = fetched.find((addr: Address) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          }
        }
      } catch (err: any) {
        if (err.response?.status !== 401) {
          console.error(failedToLoadAddressesText, err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  const getAddressById = (id: string) => addresses.find((a) => a.id === id);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        addOrUpdateAddress,
        getAddressById,
        loading,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddressContext = () => {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddressContext must be used within AddressProvider");
  return ctx;
};
