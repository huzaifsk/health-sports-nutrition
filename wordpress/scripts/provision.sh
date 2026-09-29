#!/bin/bash
set -euo pipefail

WP="wp --allow-root --path=/var/www/html"
SITE_URL="http://localhost:8080"

echo "==> Waiting for WordPress core files..."
until [ -f /var/www/html/wp-load.php ]; do sleep 1; done

if ! $WP core is-installed 2>/dev/null; then
  echo "==> Installing WordPress core..."
  $WP core install \
    --url="$SITE_URL" \
    --title="PeakProtein" \
    --admin_user="admin" \
    --admin_password="peakprotein-admin" \
    --admin_email="admin@peakprotein.test" \
    --skip-email
else
  echo "==> WordPress already installed, skipping core install."
fi

echo "==> Setting permalink structure (required for the WooCommerce REST API)..."
$WP rewrite structure '/%postname%/'
$WP rewrite flush --hard

if ! $WP plugin is-active woocommerce 2>/dev/null; then
  echo "==> Installing and activating WooCommerce..."
  $WP plugin install woocommerce --activate
else
  echo "==> WooCommerce already active, skipping."
fi

echo "==> Configuring store defaults (India / INR)..."
$WP option update woocommerce_default_country "IN:MH"
$WP option update woocommerce_currency "INR"
$WP option update woocommerce_currency_pos "left"
$WP option update woocommerce_price_thousand_sep ","
$WP option update woocommerce_price_decimal_sep "."
$WP option update woocommerce_price_num_decimals "0"
$WP option update woocommerce_weight_unit "kg"
$WP option update woocommerce_onboarding_profile '{"skipped":true}' --format=json

echo "==> Seeding product categories and catalog..."
$WP eval-file /scripts/provision-products.php

echo "==> Setting up shipping zones..."
$WP eval-file /scripts/provision-shipping.php

echo "==> Creating real coupons..."
$WP eval-file /scripts/provision-coupons.php

echo "==> Installing PeakProtein staff roles and demo accounts..."
$WP eval-file /scripts/provision-roles.php

echo "==> Generating a REST API key pair for the Next.js storefront..."
$WP eval-file /scripts/provision-keys.php
