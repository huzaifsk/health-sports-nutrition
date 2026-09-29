<?php
/**
 * Creates (or recreates) a single REST API key pair for the Next.js
 * storefront and writes it to /scripts/.wc-credentials on the host
 * (via the bind-mounted volume) so it can be copied into apps/web/.env.local.
 */

global $wpdb;

$description = 'PeakProtein Storefront';
$user        = get_user_by( 'login', 'admin' );

if ( ! $user ) {
	fwrite( STDERR, "Admin user not found — did core install run?\n" );
	exit( 1 );
}

// Idempotent: if a key already exists, leave it alone (the plaintext can't be
// recovered from the stored hash, so re-running this script must not rotate
// credentials out from under a running .env.local — delete the DB row first
// if you actually want a fresh pair).
$existing = $wpdb->get_var( $wpdb->prepare( "SELECT key_id FROM {$wpdb->prefix}woocommerce_api_keys WHERE description = %s", $description ) );
if ( $existing ) {
	echo "REST API key already exists (key_id {$existing}) — leaving it as-is. Delete it in WooCommerce > Settings > Advanced > REST API to regenerate.\n";
	exit( 0 );
}

$consumer_key    = 'ck_' . wc_rand_hash();
$consumer_secret = 'cs_' . wc_rand_hash();

$wpdb->insert(
	$wpdb->prefix . 'woocommerce_api_keys',
	array(
		'user_id'         => $user->ID,
		'description'     => $description,
		'permissions'     => 'read_write',
		'consumer_key'    => wc_api_hash( $consumer_key ),
		'consumer_secret' => $consumer_secret,
		'truncated_key'   => substr( $consumer_key, -7 ),
	),
	array( '%d', '%s', '%s', '%s', '%s', '%s' )
);

$env = "WC_URL=http://localhost:8080\n";
$env .= "WC_CONSUMER_KEY={$consumer_key}\n";
$env .= "WC_CONSUMER_SECRET={$consumer_secret}\n";

file_put_contents( '/scripts/.wc-credentials', $env );

echo "REST API credentials written to wordpress/scripts/.wc-credentials\n";
