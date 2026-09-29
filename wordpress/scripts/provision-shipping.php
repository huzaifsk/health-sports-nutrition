<?php
/**
 * Real WooCommerce shipping zone/methods matching the flat-rate + free-
 * shipping-threshold logic that used to live only in packages/commerce
 * (FREE_SHIPPING_THRESHOLD / STANDARD_SHIPPING_FEE). Once this exists,
 * shipping is calculated by WooCommerce's Store API, not hardcoded JS.
 */

$existing = null;
foreach ( WC_Shipping_Zones::get_zones() as $zone_data ) {
	if ( 'India' === $zone_data['zone_name'] ) {
		$existing = WC_Shipping_Zones::get_zone( $zone_data['id'] );
		break;
	}
}

$zone = $existing ?: new WC_Shipping_Zone();
if ( ! $existing ) {
	$zone->set_zone_name( 'India' );
	$zone->set_zone_order( 0 );
	$zone_id = $zone->save();
	$zone->add_location( 'IN', 'country' );
	$zone->save();
	echo "  shipping zone created: India (#{$zone_id})\n";
} else {
	echo '  shipping zone already exists: India (#' . $zone->get_id() . ")\n";
}

$has_flat_rate = false;
$has_free      = false;
foreach ( $zone->get_shipping_methods() as $method ) {
	if ( 'flat_rate' === $method->id ) {
		$has_flat_rate = true;
	}
	if ( 'free_shipping' === $method->id ) {
		$has_free = true;
	}
}

function pp_configure_shipping_method( WC_Shipping_Zone $zone, int $instance_id, array $options ): void {
	// The zone was just mutated in the DB; reload it fresh so
	// get_shipping_methods() sees the instance we just added.
	$fresh = new WC_Shipping_Zone( $zone->get_id() );
	foreach ( $fresh->get_shipping_methods() as $method ) {
		if ( (int) $method->instance_id === $instance_id ) {
			foreach ( $options as $key => $value ) {
				$method->update_option( $key, $value );
			}
			return;
		}
	}
}

if ( ! $has_flat_rate ) {
	$instance_id = $zone->add_shipping_method( 'flat_rate' );
	pp_configure_shipping_method( $zone, $instance_id, array( 'cost' => '99', 'title' => 'Standard Shipping' ) );
	echo "  flat rate shipping added (₹99)\n";
}

if ( ! $has_free ) {
	$instance_id = $zone->add_shipping_method( 'free_shipping' );
	pp_configure_shipping_method( $zone, $instance_id, array( 'requires' => 'min_amount', 'min_amount' => '1999', 'title' => 'Free Shipping' ) );
	echo "  free shipping added (orders ≥ ₹1,999)\n";
}
