import { createContext, useContext, useState } from "react"

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