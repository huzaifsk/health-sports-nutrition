<?php
/**
 * Plugin Name: PeakProtein — Staff Auth & RBAC
 * Description: Custom WordPress roles for PeakProtein staff, plus a small
 *              REST API (peakprotein/v1) that apps/admin uses for session
 *              login instead of WP's cookie-based admin auth. Sessions are
 *              opaque bearer tokens validated against a transient on every
 *              request — no shared secret needs to live in the Next.js app.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** ---------------------------------------------------------------------
 * Roles
 * ------------------------------------------------------------------- */

/**
 * The peakprotein_* capabilities are what apps/admin actually gates its
 * nav/pages/actions on (a *_view_* cap for read access, matched by a
 * *_manage_* cap for write access to the same area). The real WordPress/
 * WooCommerce capabilities (edit_products, edit_shop_orders, ...) ride
 * along on the same roles so WooCommerce's own REST/admin permission
 * checks stay consistent, but they are not what our app checks — see
 * apps/admin/lib/session.ts's can().
 */
function pp_capability_sets(): array {
	return array(
		// "Super Admin" = WordPress's own administrator role, left untouched.
		'store_manager'     => array(
			'read' => true, 'manage_woocommerce' => true, 'view_woocommerce_reports' => true,
			'edit_products' => true, 'edit_others_products' => true, 'publish_products' => true, 'delete_products' => true,
			'edit_product_terms' => true, 'assign_product_terms' => true,
			'edit_shop_orders' => true, 'edit_others_shop_orders' => true,
			'edit_shop_coupons' => true, 'edit_others_shop_coupons' => true,
			'list_users' => true,
			'peakprotein_view_products' => true, 'peakprotein_manage_products' => true,
			'peakprotein_view_orders' => true, 'peakprotein_manage_orders' => true,
			'peakprotein_view_customers' => true,
			'peakprotein_view_inventory' => true, 'peakprotein_manage_inventory' => true,
			'peakprotein_manage_coupons' => true,
			'peakprotein_manage_content' => true, 'peakprotein_view_analytics' => true,
		),
		'inventory_manager'  => array(
			'read' => true, 'edit_products' => true, 'edit_others_products' => true,
			'peakprotein_view_products' => true,
			'peakprotein_view_inventory' => true, 'peakprotein_manage_inventory' => true,
			'peakprotein_view_analytics' => true,
		),
		'order_manager'      => array(
			'read' => true, 'edit_shop_orders' => true, 'edit_others_shop_orders' => true,
			'view_woocommerce_reports' => true, 'list_users' => true,
			'peakprotein_view_orders' => true, 'peakprotein_manage_orders' => true,
			'peakprotein_view_customers' => true,
		),
		'marketing_manager'  => array(
			'read' => true, 'edit_posts' => true, 'edit_others_posts' => true, 'publish_posts' => true,
			'edit_shop_coupons' => true, 'edit_others_shop_coupons' => true,
			'peakprotein_manage_coupons' => true,
			'peakprotein_manage_content' => true, 'peakprotein_view_analytics' => true,
		),
		'support_agent'      => array(
			'read' => true, 'list_users' => true,
			'peakprotein_view_orders' => true, 'peakprotein_view_customers' => true,
		),
	);
}

/** Called once from wp-cli during provisioning — see scripts/provision-roles.php. */
function pp_install_roles(): void {
	foreach ( pp_capability_sets() as $role_slug => $caps ) {
		remove_role( $role_slug );
		add_role( $role_slug, pp_role_label( $role_slug ), $caps );
	}

	// Give the super admin (administrator) every custom capability from
	// every role, so it's always a strict superset — never gated out of
	// anything a narrower staff role can do.
	$admin = get_role( 'administrator' );
	if ( $admin ) {
		$all_custom_caps = array();
		foreach ( pp_capability_sets() as $caps ) {
			foreach ( array_keys( $caps ) as $cap ) {
				if ( str_starts_with( $cap, 'peakprotein_' ) ) {
					$all_custom_caps[ $cap ] = true;
				}
			}
		}
		foreach ( array_keys( $all_custom_caps ) as $cap ) {
			$admin->add_cap( $cap );
		}
	}
}

function pp_role_label( string $slug ): string {
	$labels = array(
		'store_manager'    => 'Store Manager',
		'inventory_manager' => 'Inventory Manager',
		'order_manager'    => 'Order Manager',
		'marketing_manager' => 'Marketing Manager',
		'support_agent'    => 'Support Agent',
	);
	return $labels[ $slug ] ?? $slug;
}

/** Roles apps/admin is allowed to assign to a user (never let it grant "administrator"). */
function pp_assignable_roles(): array {
	$roles = array( 'administrator' => 'Super Admin' );
	foreach ( array_keys( pp_capability_sets() ) as $slug ) {
		$roles[ $slug ] = pp_role_label( $slug );
	}
	return $roles;
}

/** ---------------------------------------------------------------------
 * Session tokens (opaque, validated server-side — no JWT/shared secret)
 * ------------------------------------------------------------------- */

const PP_SESSION_TTL = 7 * DAY_IN_SECONDS;

function pp_issue_session( int $user_id ): string {
	$token = wp_generate_password( 48, false, false );
	set_transient( 'pp_session_' . $token, $user_id, PP_SESSION_TTL );
	return $token;
}

function pp_user_from_token( ?string $token ) {
	if ( ! $token ) {
		return null;
	}
	$user_id = get_transient( 'pp_session_' . $token );
	if ( ! $user_id ) {
		return null;
	}
	return get_user_by( 'id', $user_id );
}

function pp_bearer_token_from_request( WP_REST_Request $request ): ?string {
	$header = $request->get_header( 'authorization' );
	if ( $header && preg_match( '/Bearer\s+(.+)/i', $header, $m ) ) {
		return trim( $m[1] );
	}
	return null;
}

function pp_serialize_user( WP_User $user ): array {
	$all_caps = array_keys( array_filter( $user->allcaps ) );
	return array(
		'id'           => $user->ID,
		'name'         => $user->display_name,
		'email'        => $user->user_email,
		'roles'        => array_values( $user->roles ),
		'capabilities' => $all_caps,
	);
}

/** ---------------------------------------------------------------------
 * REST routes
 * ------------------------------------------------------------------- */

add_action( 'rest_api_init', function () {
	register_rest_route( 'peakprotein/v1', '/login', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $request ) {
			$username = (string) $request->get_param( 'username' );
			$password = (string) $request->get_param( 'password' );

			$user = wp_authenticate( $username, $password );
			if ( is_wp_error( $user ) ) {
				return new WP_Error( 'pp_invalid_credentials', 'Invalid username or password.', array( 'status' => 401 ) );
			}
			if ( empty( array_intersect( $user->roles, array_merge( array( 'administrator' ), array_keys( pp_capability_sets() ) ) ) ) ) {
				return new WP_Error( 'pp_not_staff', 'This account does not have staff access.', array( 'status' => 403 ) );
			}

			$token = pp_issue_session( $user->ID );
			return array( 'token' => $token, 'user' => pp_serialize_user( $user ) );
		},
	) );

	register_rest_route( 'peakprotein/v1', '/me', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $request ) {
			$user = pp_user_from_token( pp_bearer_token_from_request( $request ) );
			if ( ! $user ) {
				return new WP_Error( 'pp_no_session', 'Not authenticated.', array( 'status' => 401 ) );
			}
			return array( 'user' => pp_serialize_user( $user ) );
		},
	) );

	register_rest_route( 'peakprotein/v1', '/logout', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => function ( WP_REST_Request $request ) {
			$token = pp_bearer_token_from_request( $request );
			if ( $token ) {
				delete_transient( 'pp_session_' . $token );
			}
			return array( 'ok' => true );
		},
	) );

	register_rest_route( 'peakprotein/v1', '/team', array(
		'methods'             => 'GET',
		'permission_callback' => function ( WP_REST_Request $request ) {
			$user = pp_user_from_token( pp_bearer_token_from_request( $request ) );
			return $user && user_can( $user, 'list_users' );
		},
		'callback'            => function () {
			$users = get_users( array( 'fields' => array( 'ID' ) ) );
			return array(
				'users'      => array_map( fn( $u ) => pp_serialize_user( get_user_by( 'id', $u->ID ) ), $users ),
				'assignable_roles' => pp_assignable_roles(),
			);
		},
	) );

	register_rest_route( 'peakprotein/v1', '/team/(?P<id>\d+)/role', array(
		'methods'             => 'POST',
		'permission_callback' => function ( WP_REST_Request $request ) {
			$user = pp_user_from_token( pp_bearer_token_from_request( $request ) );
			return $user && user_can( $user, 'promote_users' );
		},
		'callback'            => function ( WP_REST_Request $request ) {
			$target_id = (int) $request->get_param( 'id' );
			$new_role  = (string) $request->get_param( 'role' );
			if ( ! array_key_exists( $new_role, pp_assignable_roles() ) ) {
				return new WP_Error( 'pp_invalid_role', 'Unknown role.', array( 'status' => 400 ) );
			}
			$target = get_user_by( 'id', $target_id );
			if ( ! $target ) {
				return new WP_Error( 'pp_not_found', 'User not found.', array( 'status' => 404 ) );
			}
			$target->set_role( $new_role );
			return array( 'user' => pp_serialize_user( get_user_by( 'id', $target_id ) ) );
		},
	) );

	register_rest_route( 'peakprotein/v1', '/team/invite', array(
		'methods'             => 'POST',
		'permission_callback' => function ( WP_REST_Request $request ) {
			$user = pp_user_from_token( pp_bearer_token_from_request( $request ) );
			return $user && user_can( $user, 'create_users' );
		},
		'callback'            => function ( WP_REST_Request $request ) {
			$email = sanitize_email( (string) $request->get_param( 'email' ) );
			$name  = sanitize_text_field( (string) $request->get_param( 'name' ) );
			$role  = (string) $request->get_param( 'role' );

			if ( ! is_email( $email ) || ! array_key_exists( $role, pp_assignable_roles() ) ) {
				return new WP_Error( 'pp_invalid_input', 'Valid email and role are required.', array( 'status' => 400 ) );
			}
			if ( email_exists( $email ) ) {
				return new WP_Error( 'pp_exists', 'A user with that email already exists.', array( 'status' => 409 ) );
			}

			$username     = sanitize_user( current( explode( '@', $email ) ) . '-' . wp_rand( 100, 999 ), true );
			$temp_password = wp_generate_password( 16 );
			$user_id      = wp_insert_user( array(
				'user_login'   => $username,
				'user_email'   => $email,
				'display_name' => $name ?: $username,
				'user_pass'    => $temp_password,
				'role'         => $role,
			) );
			if ( is_wp_error( $user_id ) ) {
				return $user_id;
			}

			// No transactional email backend configured in this dev environment —
			// return the temporary password directly so the inviting admin can
			// share it out of band instead of it silently vanishing.
			return array(
				'user'          => pp_serialize_user( get_user_by( 'id', $user_id ) ),
				'temp_password' => $temp_password,
			);
		},
	) );
} );

/** ---------------------------------------------------------------------
 * CORS — apps/web (Store API cart/checkout) and apps/admin (session API)
 * call these REST namespaces directly from the browser, from different
 * localhost ports, so they need explicit cross-origin allowances.
 * ------------------------------------------------------------------- */

add_action( 'rest_api_init', function () {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
	add_filter( 'rest_pre_serve_request', function ( $value ) {
		$allowed_origins = array( 'http://localhost:3000', 'http://localhost:3001' );
		$origin          = get_http_origin();
		if ( $origin && in_array( $origin, $allowed_origins, true ) ) {
			header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
			header( 'Access-Control-Allow-Credentials: true' );
			header( 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS' );
			header( 'Access-Control-Allow-Headers: Authorization, Content-Type, Cart-Token, X-WC-Store-API-Nonce' );
			header( 'Access-Control-Expose-Headers: Cart-Token, X-WC-Store-API-Nonce' );
		}
		return $value;
	} );
}, 15 );
