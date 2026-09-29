"use client";

import type { Order } from "@repo/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updater: (order: Order) => Order) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (orderId, updater) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? updater(o) : o)),
        })),
    }),
    { name: "peakprotein-orders" },
  ),
);

export function useOrderByNumber(orderNumber: string | undefined) {
  return useOrdersStore((state) => state.orders.find((o) => o.orderNumber === orderNumber));
}
