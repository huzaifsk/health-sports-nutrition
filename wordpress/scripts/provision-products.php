<?php
/**
 * Seeds real WooCommerce categories + products matching
 * packages/woo-commerce/src/adapters/mock/data.ts, including nutrition/usage
 * meta keys read by packages/woo-commerce's WooCommerceAdapter mapper, and
 * product photos (same Unsplash set used by the mock catalog). Safe to
 * re-run: existing products/categories with the same slug are updated
 * in place rather than duplicated.
 */

require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

function pp_category( string $name, string $slug, string $description ): int {
	$existing = get_term_by( 'slug', $slug, 'product_cat' );
	if ( $existing ) {
		return (int) $existing->term_id;
	}
	$result = wp_insert_term( $name, 'product_cat', array( 'slug' => $slug, 'description' => $description ) );
	return (int) $result['term_id'];
}

function pp_category_image( int $term_id, string $url, string $alt ): void {
	if ( get_term_meta( $term_id, 'thumbnail_id', true ) ) {
		return;
	}
	$tmp_file = download_url( $url );
	if ( is_wp_error( $tmp_file ) ) {
		fwrite( STDERR, "  ! category image download failed for term {$term_id}: " . $tmp_file->get_error_message() . "\n" );
		return;
	}
	$file_array = array( 'name' => sanitize_title( $alt ) . '-category.jpg', 'tmp_name' => $tmp_file );
	$attachment_id = media_handle_sideload( $file_array, 0, $alt );
	if ( is_wp_error( $attachment_id ) ) {
		@unlink( $tmp_file );
		fwrite( STDERR, "  ! category image sideload failed for term {$term_id}: " . $attachment_id->get_error_message() . "\n" );
		return;
	}
	update_term_meta( $term_id, 'thumbnail_id', $attachment_id );
}

function pp_attach_image( int $product_id, string $url, string $alt ): void {
	if ( has_post_thumbnail( $product_id ) ) {
		return;
	}

	// media_sideload_image() requires a literal .jpg/.png in the URL *path*,
	// which Unsplash's query-string-only URLs don't have. Download manually
	// and hand media_handle_sideload() a fabricated filename instead.
	$tmp_file = download_url( $url );
	if ( is_wp_error( $tmp_file ) ) {
		fwrite( STDERR, "  ! image download failed for product {$product_id}: " . $tmp_file->get_error_message() . "\n" );
		return;
	}

	$file_array = array(
		'name'     => sanitize_title( $alt ) . '.jpg',
		'tmp_name' => $tmp_file,
	);

	$attachment_id = media_handle_sideload( $file_array, $product_id, $alt );
	if ( is_wp_error( $attachment_id ) ) {
		@unlink( $tmp_file );
		fwrite( STDERR, "  ! image sideload failed for product {$product_id}: " . $attachment_id->get_error_message() . "\n" );
		return;
	}

	set_post_thumbnail( $product_id, $attachment_id );
}

function pp_find_product_id( string $sku ): ?int {
	$id = wc_get_product_id_by_sku( $sku );
	return $id ? (int) $id : null;
}

// _wc_average_rating / _wc_review_count get recalculated from actual review
// comments by WooCommerce on every WC_Product::save(), so setting them via
// $product->update_meta_data() is clobbered immediately. Collect the desired
// values here and write them with plain update_post_meta() (bypassing the WC
// data-store save cycle entirely) once every product has already been saved.
if ( ! isset( $GLOBALS['pp_rating_queue'] ) ) {
	$GLOBALS['pp_rating_queue'] = array();
}

function pp_set_common_meta( WC_Product $product, array $args ): void {
	$GLOBALS['pp_rating_queue'][] = array( 'product' => $product, 'rating' => $args['rating'], 'reviews' => $args['reviews'] );
	if ( isset( $args['nutrition'] ) ) {
		$n = $args['nutrition'];
		$product->update_meta_data( 'nutrition_serving_size_g', $n['serving_size_g'] );
		$product->update_meta_data( 'nutrition_servings_per_container', $n['servings'] );
		$product->update_meta_data( 'nutrition_calories', $n['calories'] );
		$product->update_meta_data( 'nutrition_protein_g', $n['protein_g'] );
		$product->update_meta_data( 'nutrition_carbs_g', $n['carbs_g'] );
		$product->update_meta_data( 'nutrition_fat_g', $n['fat_g'] );
		$product->update_meta_data( 'nutrition_sugar_g', $n['sugar_g'] );
		$product->update_meta_data( 'nutrition_ingredients', $n['ingredients'] );
		$product->update_meta_data( 'nutrition_allergens', $n['allergens'] );
	}
	$product->update_meta_data( 'usage_instructions', $args['usage'] );
	$product->update_meta_data( 'storage_instructions', $args['storage'] );
}

$photo = fn( string $id ) => "https://images.unsplash.com/{$id}?auto=format&fit=crop&w=1600&q=80";

$categories = array(
	'whey-protein'    => pp_category( 'Whey Protein', 'whey-protein', 'Fast-absorbing whey protein concentrate blends for everyday recovery.' ),
	'protein-isolate' => pp_category( 'Protein Isolate', 'protein-isolate', 'Ultra-filtered, low-carb, low-fat isolate for lean muscle support.' ),
	'plant-protein'   => pp_category( 'Plant Protein', 'plant-protein', '100% vegan pea + rice protein blends, dairy-free.' ),
	'creatine'        => pp_category( 'Creatine', 'creatine', 'Micronized creatine monohydrate for strength and power output.' ),
	'mass-gainer'     => pp_category( 'Mass Gainer', 'mass-gainer', 'High-calorie blends for clean, consistent weight gain.' ),
	'pre-workout'     => pp_category( 'Pre-Workout', 'pre-workout', 'Focus and energy formulas dosed for training days.' ),
);

pp_category_image( $categories['whey-protein'], $photo( 'photo-1774793476310-fd7d843184c5' ), 'Whey Protein' );
pp_category_image( $categories['protein-isolate'], $photo( 'photo-1704650311190-7eeb9c4f6e11' ), 'Protein Isolate' );
pp_category_image( $categories['plant-protein'], $photo( 'photo-1693996045899-7cf0ac0229c7' ), 'Plant Protein' );
pp_category_image( $categories['creatine'], $photo( 'photo-1693996045435-af7c48b9cafb' ), 'Creatine' );
pp_category_image( $categories['mass-gainer'], $photo( 'photo-1704650311298-4d6915d34c64' ), 'Mass Gainer' );
pp_category_image( $categories['pre-workout'], $photo( 'photo-1693996046744-d7d7434bc777' ), 'Pre-Workout' );

echo "  categories ready.\n";

$whey_nutrition = array(
	'serving_size_g' => 30, 'servings' => 33, 'calories' => 120, 'protein_g' => 25,
	'carbs_g' => 3, 'fat_g' => 1.5, 'sugar_g' => 1,
	'ingredients' => 'Whey Protein Concentrate, Whey Protein Isolate, Cocoa Powder, Natural & Artificial Flavors, Lecithin, Sucralose.',
	'allergens' => 'Milk, Soy',
);
$isolate_nutrition = array(
	'serving_size_g' => 30, 'servings' => 30, 'calories' => 110, 'protein_g' => 27,
	'carbs_g' => 1, 'fat_g' => 0.5, 'sugar_g' => 0.5,
	'ingredients' => 'Whey Protein Isolate, Natural & Artificial Flavors, Lecithin, Sucralose.',
	'allergens' => 'Milk',
);
$plant_nutrition = array(
	'serving_size_g' => 34, 'servings' => 29, 'calories' => 130, 'protein_g' => 24,
	'carbs_g' => 4, 'fat_g' => 2, 'sugar_g' => 0.5,
	'ingredients' => 'Pea Protein Isolate, Brown Rice Protein, Natural Flavors, Stevia Leaf Extract.',
	'allergens' => '',
);
$mass_nutrition = array(
	'serving_size_g' => 150, 'servings' => 20, 'calories' => 650, 'protein_g' => 50,
	'carbs_g' => 90, 'fat_g' => 8, 'sugar_g' => 12,
	'ingredients' => 'Maltodextrin, Whey Protein Concentrate, Oat Flour, MCT Powder, Natural & Artificial Flavors.',
	'allergens' => 'Milk, Soy',
);

/** ---- Simple products ---- */

$simple_products = array(
	array(
		'slug' => 'raw-whey-protein-unflavored', 'sku' => 'WHEY-RAW-1KG', 'name' => 'Raw Whey Protein (Unflavored)',
		'category' => 'whey-protein', 'featured' => false,
		'short' => 'No additives, no sweeteners — just pure whey concentrate.',
		'description' => "For lifters who want full control over what goes in their shaker. Single-ingredient whey protein concentrate with nothing else added.",
		'price' => 2599, 'regular_price' => 2599, 'stock' => 34, 'rating' => 4.3, 'reviews' => 156,
		'nutrition' => array_merge( $whey_nutrition, array( 'sugar_g' => 0, 'ingredients' => '100% Whey Protein Concentrate.', 'allergens' => 'Milk' ) ),
		'usage' => 'Mix 1 scoop (30g) with 200-250ml cold water or milk.',
		'storage' => 'Store in a cool, dry place away from direct sunlight.',
		'image' => $photo( 'photo-1704650312191-005ab02786f5' ), 'tags' => array( 'unflavored', 'whey' ),
	),
	array(
		'slug' => 'micronized-creatine-monohydrate', 'sku' => 'CREA-MONO-250G', 'name' => 'Micronized Creatine Monohydrate',
		'category' => 'creatine', 'featured' => true,
		'short' => '5g pure creatine per serving. The most researched strength supplement.',
		'description' => 'Unflavored, micronized creatine monohydrate for improved strength, power output and training volume. Mixes easily into any shake or drink.',
		'price' => 899, 'regular_price' => 999, 'stock' => 120, 'rating' => 4.8, 'reviews' => 1042,
		'nutrition' => array(
			'serving_size_g' => 5, 'servings' => 50, 'calories' => 0, 'protein_g' => 0, 'carbs_g' => 0, 'fat_g' => 0, 'sugar_g' => 0,
			'ingredients' => '100% Micronized Creatine Monohydrate.', 'allergens' => '',
		),
		'usage' => 'Take 1 scoop (5g) daily with water, any time of day.',
		'storage' => 'Store in a cool, dry place away from direct sunlight.',
		'image' => $photo( 'photo-1693996045435-af7c48b9cafb' ), 'tags' => array( 'creatine', 'strength' ),
	),
	array(
		'slug' => 'ignite-pre-workout', 'sku' => 'PRE-IGNITE-300G', 'name' => 'Ignite Pre-Workout',
		'category' => 'pre-workout', 'featured' => true,
		'short' => '200mg caffeine, citrulline malate and beta-alanine for locked-in sessions.',
		'description' => 'A clinically dosed pre-workout formula built around caffeine, L-citrulline malate and beta-alanine to drive focus, pumps and endurance through your hardest sessions.',
		'price' => 1799, 'regular_price' => 1799, 'stock' => 8, 'rating' => 4.5, 'reviews' => 312,
		'nutrition' => array(
			'serving_size_g' => 10, 'servings' => 30, 'calories' => 5, 'protein_g' => 0, 'carbs_g' => 1, 'fat_g' => 0, 'sugar_g' => 0,
			'ingredients' => 'L-Citrulline Malate, Beta-Alanine, Caffeine Anhydrous, L-Tyrosine, Niacin, Natural Flavors.', 'allergens' => '',
		),
		'usage' => 'Mix 1 scoop with 200ml cold water 20-30 minutes before training.',
		'storage' => 'Store in a cool, dry place away from direct sunlight.',
		'image' => $photo( 'photo-1693996046744-d7d7434bc777' ), 'tags' => array( 'pre-workout', 'energy' ),
	),
);

foreach ( $simple_products as $p ) {
	$id = pp_find_product_id( $p['sku'] );
	$product = $id ? new WC_Product_Simple( $id ) : new WC_Product_Simple();
	$product->set_name( $p['name'] );
	$product->set_slug( $p['slug'] );
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'visible' );
	$product->set_sku( $p['sku'] );
	$product->set_short_description( $p['short'] );
	$product->set_description( $p['description'] );
	$product->set_regular_price( (string) $p['regular_price'] );
	$product->set_price( (string) $p['price'] );
	if ( $p['price'] < $p['regular_price'] ) {
		$product->set_sale_price( (string) $p['price'] );
	}
	$product->set_manage_stock( true );
	$product->set_stock_quantity( $p['stock'] );
	$product->set_stock_status( 'instock' );
	$product->set_featured( $p['featured'] );
	$product->set_category_ids( array( $categories[ $p['category'] ] ) );
	$product->set_tag_ids( array_map( fn( $t ) => wp_set_object_terms( 0, array(), 'product_tag' ) && false ? 0 : 0, array() ) );
	pp_set_common_meta( $product, array( 'rating' => $p['rating'], 'reviews' => $p['reviews'], 'nutrition' => $p['nutrition'], 'usage' => $p['usage'], 'storage' => $p['storage'] ) );
	$id = $product->save();
	wp_set_object_terms( $id, $p['tags'], 'product_tag' );
	pp_attach_image( $id, $p['image'], $p['name'] );
	echo "  simple product ready: {$p['name']} (#{$id})\n";
}

/** ---- Variable products ---- */

function pp_make_attribute( string $name, array $options ): WC_Product_Attribute {
	$attribute = new WC_Product_Attribute();
	$attribute->set_id( 0 );
	$attribute->set_name( $name );
	$attribute->set_options( $options );
	$attribute->set_position( 0 );
	$attribute->set_visible( true );
	$attribute->set_variation( true );
	return $attribute;
}

$variable_products = array(
	array(
		'slug' => 'gold-standard-whey-protein', 'sku' => 'WHEY-GOLD', 'name' => 'Gold Standard Whey Protein',
		'category' => 'whey-protein', 'featured' => true,
		'short' => '25g protein per serving. Mixes clean, tastes better than the leading brand.',
		'description' => "Our best-selling whey protein concentrate blend delivers 25g of high-quality protein per serving to support muscle recovery and growth. Fast-absorbing and low in sugar, it's built for daily training.",
		'rating' => 4.6, 'reviews' => 812, 'nutrition' => $whey_nutrition,
		'usage' => 'Mix 1 scoop (30g) with 200-250ml cold water or milk. Take 1-2 servings daily.',
		'storage' => 'Store in a cool, dry place away from direct sunlight. Reseal after each use.',
		'image' => $photo( 'photo-1774793476310-fd7d843184c5' ), 'tags' => array( 'bestseller', 'whey' ),
		'flavors' => array( 'Chocolate', 'Vanilla', 'Cookies & Cream' ), 'sale_flavors' => array( 'Chocolate' ),
		'sizes' => array( '1kg' => array( 1.0, 1000 ), '2kg' => array( 1.85, 2000 ) ), 'base_price' => 2999,
	),
	array(
		'slug' => 'peak-isolate-protein', 'sku' => 'ISO-PEAK', 'name' => 'Peak Isolate Protein',
		'category' => 'protein-isolate', 'featured' => true,
		'short' => '27g protein, near-zero fat and carbs. Ultra-filtered for lean gains.',
		'description' => 'Peak Isolate is cross-flow microfiltered to strip out excess fat and lactose, leaving a fast-digesting, high-purity protein source ideal for cutting phases and lactose-sensitive lifters.',
		'rating' => 4.7, 'reviews' => 431, 'nutrition' => $isolate_nutrition,
		'usage' => 'Mix 1 scoop (30g) with 200ml cold water. Best taken post-workout.',
		'storage' => 'Store in a cool, dry place. Keep lid tightly sealed.',
		'image' => $photo( 'photo-1704650311190-7eeb9c4f6e11' ), 'tags' => array( 'isolate', 'low-carb' ),
		'flavors' => array( 'Chocolate', 'Vanilla' ), 'sale_flavors' => array(),
		'sizes' => array( '1kg' => array( 1.0, 1000 ), '2kg' => array( 1.85, 2000 ) ), 'base_price' => 3999,
	),
	array(
		'slug' => 'pure-plant-protein', 'sku' => 'PLANT-PURE', 'name' => 'Pure Plant Protein',
		'category' => 'plant-protein', 'featured' => true,
		'short' => '24g plant-based protein. 100% dairy-free, soy-free.',
		'description' => 'A smooth-mixing blend of pea and brown rice protein delivering a complete amino acid profile without any animal products. Naturally sweetened with stevia.',
		'rating' => 4.4, 'reviews' => 268, 'nutrition' => $plant_nutrition,
		'usage' => 'Mix 1 scoop (34g) with 250ml plant milk or water.',
		'storage' => 'Store in a cool, dry place away from direct sunlight.',
		'image' => $photo( 'photo-1693996045899-7cf0ac0229c7' ), 'tags' => array( 'vegan', 'plant-based' ),
		'flavors' => array( 'Chocolate', 'Unflavored' ), 'sale_flavors' => array( 'Chocolate' ),
		'sizes' => array( '1kg' => array( 1.0, 1000 ), '2kg' => array( 1.85, 2000 ) ), 'base_price' => 2799,
	),
	array(
		'slug' => 'clean-bulk-mass-gainer', 'sku' => 'MASS-BULK', 'name' => 'Clean Bulk Mass Gainer',
		'category' => 'mass-gainer', 'featured' => false,
		'short' => '650 calories, 50g protein per serving for serious size gains.',
		'description' => 'A calorie-dense blend of complex carbs, whey protein and healthy fats designed for hardgainers who struggle to hit their calorie targets through food alone.',
		'rating' => 4.2, 'reviews' => 189, 'nutrition' => $mass_nutrition,
		'usage' => 'Mix 3 scoops (150g) with 400-500ml milk. 1-2 servings daily between meals.',
		'storage' => 'Store in a cool, dry place away from direct sunlight.',
		'image' => $photo( 'photo-1704650311298-4d6915d34c64' ), 'tags' => array( 'mass-gainer', 'bulk' ),
		'flavors' => array( 'Chocolate', 'Vanilla' ), 'sale_flavors' => array(),
		'sizes' => array( '3kg' => array( 1.0, 3000 ), '6kg' => array( 1.9, 6000 ) ), 'base_price' => 2499,
	),
);

foreach ( $variable_products as $p ) {
	$id = pp_find_product_id( $p['sku'] );
	$product = $id ? new WC_Product_Variable( $id ) : new WC_Product_Variable();
	$product->set_name( $p['name'] );
	$product->set_slug( $p['slug'] );
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'visible' );
	$product->set_sku( $p['sku'] );
	$product->set_short_description( $p['short'] );
	$product->set_description( $p['description'] );
	$product->set_featured( $p['featured'] );
	$product->set_category_ids( array( $categories[ $p['category'] ] ) );

	$size_labels = array_keys( $p['sizes'] );
	$product->set_attributes( array(
		pp_make_attribute( 'Flavor', $p['flavors'] ),
		pp_make_attribute( 'Size', $size_labels ),
	) );
	pp_set_common_meta( $product, array( 'rating' => $p['rating'], 'reviews' => $p['reviews'], 'nutrition' => $p['nutrition'], 'usage' => $p['usage'], 'storage' => $p['storage'] ) );

	$product_id = $product->save();
	wp_set_object_terms( $product_id, $p['tags'], 'product_tag' );
	pp_attach_image( $product_id, $p['image'], $p['name'] );

	// Remove variations that no longer match the current flavor/size matrix, then (re)create.
	foreach ( $product->get_children() as $child_id ) {
		wp_delete_post( $child_id, true );
	}

	foreach ( $p['flavors'] as $flavor ) {
		foreach ( $p['sizes'] as $size_label => [ $multiplier, $weight_g ] ) {
			$regular = (int) round( ( $p['base_price'] * $multiplier ) / 10 ) * 10;
			$on_sale = in_array( $flavor, $p['sale_flavors'], true );
			$sale    = $on_sale ? (int) round( ( $regular * 0.85 ) / 10 ) * 10 : null;

			$variation = new WC_Product_Variation();
			$variation->set_parent_id( $product_id );
			$variation->set_attributes( array( 'flavor' => $flavor, 'size' => $size_label ) );
			$variation->set_sku( strtoupper( $p['sku'] . '-' . substr( $flavor, 0, 3 ) . '-' . $size_label ) );
			$variation->set_regular_price( (string) $regular );
			if ( $sale ) {
				$variation->set_sale_price( (string) $sale );
			}
			$variation->set_manage_stock( true );
			$variation->set_stock_quantity( random_int( 10, 70 ) );
			$variation->set_stock_status( 'instock' );
			$variation->set_weight( (string) ( $weight_g / 1000 ) );
			$variation->save();
		}
	}

	// Sync parent price range + rebuild lookup tables from the variations we just wrote.
	WC_Product_Variable::sync( $product_id );
	$product = wc_get_product( $product_id );
	pp_attach_image( $product_id, $p['image'], $p['name'] );

	echo "  variable product ready: {$p['name']} (#{$product_id}, " . count( $p['flavors'] ) * count( $p['sizes'] ) . " variations)\n";
}

foreach ( $GLOBALS['pp_rating_queue'] as $entry ) {
	$id = $entry['product']->get_id();
	update_post_meta( $id, '_wc_average_rating', (string) $entry['rating'] );
	update_post_meta( $id, '_wc_review_count', (string) $entry['reviews'] );
	// get_rating_count() sums this star-bucketed array rather than reading
	// _wc_review_count directly, so it needs its own meta entry.
	update_post_meta( $id, '_wc_rating_count', array( (int) round( $entry['rating'] ) => (int) $entry['reviews'] ) );
}
echo '  ratings written for ' . count( $GLOBALS['pp_rating_queue'] ) . " products.\n";

echo "  catalog seeded.\n";
