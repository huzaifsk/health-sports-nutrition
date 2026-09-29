<?php
/**
 * Real WooCommerce coupons matching what the storefront's cart UI already
 * advertises (packages/commerce/src/coupons.ts) — creating them here for
 * real means WooCommerce validates and applies them on checkout, not a
 * hardcoded client-side rules engine.
 */

function pp_upsert_coupon( string $code, array $props ): void {
	$existing_id = wc_get_coupon_id_by_code( $code );
	$coupon      = new WC_Coupon( $existing_id ?: 0 );
	$coupon->set_code( $code );
	foreach ( $props as $setter => $value ) {
		$coupon->{"set_{$setter}"}( $value );
	}
	$coupon->save();
	echo "  coupon ready: {$code}\n";
}

pp_upsert_coupon( 'FIRST20', array(
	'discount_type' => 'percent',
	'amount'        => '20',
	'description'   => "20% off your first order",
	'minimum_amount' => '999',
	'usage_limit_per_user' => 1,
) );

pp_upsert_coupon( 'WELCOME10', array(
	'discount_type' => 'fixed_cart',
	'amount'        => '200',
	'description'   => 'Flat ₹200 off orders above ₹1,500',
	'minimum_amount' => '1500',
) );
