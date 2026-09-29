"use client";

import type { Address, CustomerProfile } from "@repo/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomerState {
  profile: CustomerProfile | null;
  setProfile: (profile: CustomerProfile) => void;
  addAddress: (address: Address) => void;
  removeAddress: (index: number) => void;
  logout: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      addAddress: (address) =>
        set((state) =>
          state.profile
            ? { profile: { ...state.profile, addresses: [...state.profile.addresses, address] } }
            : state,
        ),
      removeAddress: (index) =>
        set((state) =>
          state.profile
            ? {
                profile: {
                  ...state.profile,
                  addresses: state.profile.addresses.filter((_, i) => i !== index),
                },
              }
            : state,
        ),
      logout: () => set({ profile: null }),
    }),
    { name: "peakprotein-customer" },
  ),
);
