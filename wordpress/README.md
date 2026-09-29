# Local WooCommerce backend

A real WordPress + WooCommerce instance for local development, seeded with the
same catalog as `packages/woo-commerce`'s mock adapter (same products,
categories, prices, variations, nutrition data, and photos) so switching
`apps/web` from mock data to this live backend is a no-op for the UI.

## Start it

```bash
cd wordpress
docker compose up -d
docker compose exec wpcli bash /scripts/provision.sh
```

The provisioning script is idempotent — re-run it any time after changing
`scripts/provision-products.php` to update the catalog. It:

- Installs WordPress core + activates WooCommerce
- Sets the store to India / INR
- Seeds 6 categories and 7 products (3 simple, 4 variable with flavor/size
  variations), including nutrition/usage/storage meta and product photos
- Generates a REST API key pair (once — re-running won't rotate it) and
  writes it to `scripts/.wc-credentials` (gitignored)

## Connect the storefront to it

Copy the generated credentials into `apps/web/.env.local`:

```
WC_URL=http://localhost:8080
WC_CONSUMER_KEY=...
WC_CONSUMER_SECRET=...
```

`packages/woo-commerce`'s adapter factory automatically switches from the
mock adapter to the real `WooCommerceAdapter` once these are set — see
`packages/woo-commerce/src/index.ts`. No app code changes needed.

Note: WooCommerce requires OAuth 1.0a signing for REST requests over plain
HTTP (no SSL locally), which the `@woocommerce/woocommerce-rest-api` client
handles automatically — but it means you can't just `curl` the API with
`-u key:secret` the way you could over HTTPS. Use the Node client library
(or a browser hitting `http://localhost:8080/wp-admin`) to interact with it
directly.

## wp-admin

`http://localhost:8080/wp-admin` — `admin` / `peakprotein-admin`. This is
WooCommerce's own admin: products, orders, customers, coupons, inventory are
all manageable here today, ahead of the custom `apps/admin` app the PRD
calls for.

## Stop it

```bash
docker compose down       # keeps data (db_data/wp_data volumes)
docker compose down -v    # wipes data too
```
