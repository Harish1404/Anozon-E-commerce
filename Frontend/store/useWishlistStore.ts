import { create } from "zustand"

interface WishlistStore {
  itemCount: number
  setItemCount: (count: number) => void
  resetWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
  resetWishlist: () => set({ itemCount: 0 }),
}))
