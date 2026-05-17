// store/useCartStore.ts
import { create } from "zustand"
import { CartItem } from "@/types"

interface CartStore {
  itemCount: number
  setItemCount: (count: number) => void
  incrementCount: () => void
  decrementCount: () => void
  resetCart: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
  incrementCount: () => set((s) => ({ itemCount: s.itemCount + 1 })),
  decrementCount: () => set((s) => ({ itemCount: Math.max(0, s.itemCount - 1) })),
  resetCart: () => set({ itemCount: 0 })
}))

