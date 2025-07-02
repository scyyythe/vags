import type { Environment } from "@/components/types"

// Mock environments data with different slot capacities
export const environments: Environment[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slots: 4,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slots: 6,
  },
  {
    id: 3,
    image: "../../pics/slots-10.PNG",
    slots: 10,
  },
]
