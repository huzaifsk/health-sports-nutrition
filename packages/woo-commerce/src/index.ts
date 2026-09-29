import { MockCommerceAdapter } from "./adapters/mock";
import { WooCommerceAdapter } from "./adapters/woocommerce";
import { readWooCommerceCredentialsFromEnv } from "./client";
import { CategoryService } from "./services/category-service";
import { ProductService } from "./services/product-service";

export type { CommerceAdapter } from "./adapter";
export { adminCustomerService, adminOrderService } from "./services/admin-service";
export type { AdminCustomer, AdminOrder, AdminOrderLineItem, AdminOrderStatus } from "./services/admin-types";
export { ORDER_STATUSES } from "./services/admin-types";
export { CategoryService } from "./services/category-service";
export { createRealOrder, updateRealOrderStatus, WooCommerceOrderError } from "./services/checkout-service";
export type { CheckoutAddress, CheckoutLineItem, CreateOrderInput, CreatedOrder } from "./services/checkout-service";
export { ProductService } from "./services/product-service";

function createAdapter() {
  const credentials = readWooCommerceCredentialsFromEnv();
  return credentials ? new WooCommerceAdapter(credentials) : new MockCommerceAdapter();
}

/** Whether the app is currently reading from the real WooCommerce API vs mock data. */
export const isUsingLiveWooCommerce = readWooCommerceCredentialsFromEnv() !== null;

const adapter = createAdapter();

export const productService = new ProductService(adapter);
export const categoryService = new CategoryService(adapter);
