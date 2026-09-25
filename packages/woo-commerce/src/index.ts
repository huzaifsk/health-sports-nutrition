import { MockCommerceAdapter } from "./adapters/mock";
import { WooCommerceAdapter } from "./adapters/woocommerce";
import { readWooCommerceCredentialsFromEnv } from "./client";
import { CategoryService } from "./services/category-service";
import { ProductService } from "./services/product-service";

export type { CommerceAdapter } from "./adapter";
export { CategoryService } from "./services/category-service";
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
