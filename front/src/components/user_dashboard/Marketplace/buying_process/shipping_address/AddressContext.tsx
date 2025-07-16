import { createContext, useContext, useState } from "react"
import { useEffect } from "react"
import axios from "@/utils/apiClient"

interface Address {
  id: string
  name: string
  address: string
  city: string
  phone: string
  postalCode: string
  isDefault?: boolean
}

interface AddressContextType {
  addresses: Address[]
  selectedAddressId: string | null
  setSelectedAddressId: (id: string | null) => void
  addOrUpdateAddress: (address: Address) => void
  getAddressById: (id: string) => Address | undefined
}

const AddressContext = createContext<AddressContextType | undefined>(undefined)

export const AddressProvider = ({ children }: { children: React.ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const addOrUpdateAddress = (newAddress: Address) => {
    setAddresses((prev) => {
      const exists = prev.find((a) => a.id === newAddress.id)
      if (exists) {
        return prev.map((a) => (a.id === newAddress.id ? newAddress : a))
      }
      return [...prev, newAddress]
    })

    if (newAddress.isDefault || addresses.length === 0) {
      setSelectedAddressId(newAddress.id)
    }
  }
useEffect(() => {
  const fetchAddresses = async () => {
    try {
      const res = await axios.get("/address/");
      const fetched = res.data;

      if (Array.isArray(fetched)) {
        setAddresses(fetched);

        // Auto-select default address if any
        const defaultAddr = fetched.find((addr: Address) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  fetchAddresses();
}, []);

  const getAddressById = (id: string) => addresses.find((a) => a.id === id)

  return (
    <AddressContext.Provider
      value={{ addresses, selectedAddressId, setSelectedAddressId, addOrUpdateAddress, getAddressById }}
    >
      {children}
    </AddressContext.Provider>
  )
}

export const useAddressContext = () => {
  const ctx = useContext(AddressContext)
  if (!ctx) throw new Error("useAddressContext must be used within AddressProvider")
  return ctx
}