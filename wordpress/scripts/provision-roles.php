<?php
/**
 * Installs PeakProtein's custom roles and creates one demo staff account
 * per role so RBAC can be exercised end-to-end without manually creating
 * users first. Safe to re-run.
 */

pp_install_roles();
echo "  roles installed: " . implode( ', ', array_keys( pp_capability_sets() ) ) . " (+ administrator as Super Admin)\n";

$demo_staff = array(
	array( 'login' => 'sarah.manager', 'name' => 'Sarah Store', 'email' => 'sarah@peakprotein.test', 'role' => 'store_manager' ),
	array( 'login' => 'ravi.inventory', 'name' => 'Ravi Kumar', 'email' => 'ravi@peakprotein.test', 'role' => 'inventory_manager' ),
	array( 'login' => 'priya.orders', 'name' => 'Priya Shah', 'email' => 'priya@peakprotein.test', 'role' => 'order_manager' ),
	array( 'login' => 'aman.marketing', 'name' => 'Aman Gupta', 'email' => 'aman@peakprotein.test', 'role' => 'marketing_manager' ),
	array( 'login' => 'neha.support', 'name' => 'Neha Verma', 'email' => 'neha@peakprotein.test', 'role' => 'support_agent' ),
);

$demo_password = 'peakprotein-demo';

foreach ( $demo_staff as $staff ) {
	$existing = get_user_by( 'login', $staff['login'] );
	if ( $existing ) {
		$existing->set_role( $staff['role'] );
		echo "  demo user ready: {$staff['login']} ({$staff['role']})\n";
		continue;
	}
	$user_id = wp_insert_user( array(
		'user_login'   => $staff['login'],
		'user_email'   => $staff['email'],
		'display_name' => $staff['name'],
		'user_pass'    => $demo_password,
		'role'         => $staff['role'],
	) );
	if ( is_wp_error( $user_id ) ) {
		fwrite( STDERR, "  ! failed to create {$staff['login']}: " . $user_id->get_error_message() . "\n" );
		continue;
	}
	echo "  demo user created: {$staff['login']} ({$staff['role']}) password={$demo_password}\n";
}
