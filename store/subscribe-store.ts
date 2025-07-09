import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SubscribeStore {
  isOpen: boolean
  open: () => void
  close: () => void
  pendingAfterAuth: boolean
  setPendingAfterAuth: (pending: boolean) => void
}

export const useSubscribeStore = create<SubscribeStore>()(
  persist(
    (set) => ({
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false, pendingAfterAuth: false }),
      pendingAfterAuth: false,
      setPendingAfterAuth: (pending) => set({ pendingAfterAuth: pending }),
    }),
    {
      name: 'subscribe-modal-storage', // nom de la clé dans le localStorage
      partialize: (state) => ({ isOpen: state.isOpen, pendingAfterAuth: state.pendingAfterAuth })
    }
  )
) 