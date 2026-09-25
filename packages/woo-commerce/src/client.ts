import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export interface WooCommerceCredentials {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export function readWooCommerceCredentialsFromEnv(): WooCommerceCredentials | null {
  const url = process.env.WC_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;
  if (!url || !consumerKey || !consumerSecret) return null;
  return { url, consumerKey, consumerSecret };
}

/** Thin wrapper so the rest of the adapter only depends on our own types, not the SDK's. */
export function createWooCommerceClient(credentials: WooCommerceCredentials) {
  return new WooCommerceRestApi({
    url: credentials.url,
    consumerKey: credentials.consumerKey,
    consumerSecret: credentials.consumerSecret,
    version: "wc/v3",
    queryStringAuth: true,
  });
}
