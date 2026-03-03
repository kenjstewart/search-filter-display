<?php

// NOTE: pq_execute() 
/**
 * @param array $q  <- A phpdoc parameter type annotation
 * @return string[] <- A phpdoc return type annotation with detail on the array element type
 **/
/* function pq_execute($data) { */
/*   $pod_name = $data['pod']; */
/*   $display_mode = $data['mode']; */
/*   $per_page = $data['perpage']; */
/*   $search = $data['search']; */
/*   $pagin = $data['pagination']; */
/*   $current_page = $data['page']; */
/*   $orderby = $data['orderby']; */
/**/
/*   $pod_obj = pods($pod_name); */
/*   $params = array('limit' => $per_page, 'pagination' => $pagin, 'page' => $current_page, 'orderby' => $orderby); */
/*   $pod_obj->find($params); */
/*   $proc = []; */
/*   $results = []; */
/*   /* $test = $pod_obj->pagination( array( 'type' => 'advanced' ) ); */
/*   $total_records = $pod_obj->total_found(); */
/**/
/*   $context = [ */
/*     "total_found" => $total_records, */
/*     "original_query" => $_SESSION['orig_query'], */
/*   ];  */
/**/
/*   while ($pod_obj->fetch()){ */
/*     $item_category = $pod_obj->field('inventory_item_main_type.name'); */
/*     if ($item_category == "Collectibles") { */
/*         $item_type = $pod_obj->display('inventory_collectible_type.name'); */
/*         $subtitle = $pod_obj->display('inventory_collectible_subtype.name'); */
/*     } elseif ($item_category == "Publications") { */
/*         $item_type = $pod_obj->display('inventory_publication_type.name'); */
/*         $subtitle = $pod_obj->display('inventory_publication_subtype.name'); */
/*     } else { */
/*       $item_type = ""; */
/*       $subtitle = ""; */
/*     } */
/*     $id = $pod_obj->field('id'); */
/*     $donated_by = $pod_obj->field('inventory_donated_by'); */
/*     $link = $pod_obj->field('permalink'); */
/*     $item = [ */
/*       "id" => $id, */
/*       "all" => $pod_obj->fields(), */
/*       "url" => esc_url($link),  */
/*       "size" => $pod_obj->display('inventory_item_size'), */
/*       "color" => $pod_obj->display('inventory_color'), */
/*       "donated_by" => $donated_by, */
/*       "year" => $pod_obj->display('inventory_year'), */
/*       "alt_name" => $pod_obj->fields('inventory_year'), */
/*       "title" => $pod_obj->field('inventory_title'), */
/*       "subtitle" => $subtitle, */
/*       "category" => $item_category, */
/*       "volume" => $pod_obj->display('inventory_volume_raw'), */
/*       "number" => $pod_obj->display('inventory_number_raw'), */
/*       "type" => $item_type, */
/*       "quantity" => $pod_obj->field('inventory_total_number_of_item'), */
/*       "image_one" => $pod_obj->display('inventory_featured_image.guid'), */
/*     ]; */
/*     array_push($proc, $item); */
/*   } */
/**/
/*   $results = [ */
/*     "results" => $proc, */
/*     "context" => $context */
/*   ]; */
/*   return $results; */
/* } */


/* function fetch_search_results() { */
/*   $data = $_POST['query']; */
/*   $_SESSION['orig_query'] = $data; */
/*   if (empty($data)) { */
/*       wp_send_json_error('No data received'); */
/*       wp_die(); */
/*   } */
/*   $response = pq_execute($data); */
/*   wp_send_json_success($response); */
/*   wp_die(); */
/* } */

/* add_action('wp_ajax_fetch_search_results', 'fetch_search_results'); */
/* add_action('wp_ajax_nopriv_fetch_search_results', 'fetch_search_results'); */







/* register_activation_hook( __FILE__, 'search_filter_default_options' ); */
/**/
/* function search_filter_default_options() { */
/*   if ( false === get_option(  'search_filter_field' ) ) { */
/*     add_option( 'search_filter_field', 'name'); */
/*   } */
/* } */






/* register_activation_hook( __FILE__, 'search_filter_default_options_array' ); */

/* function search_filter_default_options_array() { */
  /* search_filter_get_options(); */
/* } */




/* // NOTE: search_filter_get_options() - Loads custom options for the plugin. */
/**/
/* function search_filter_get_options() { */
/*   $options = get_option( 'search_filter_options', array() ); */
/*   $new_options = []; */
/*   $new_options['name'] = "Barney"; */
/*   $new_options['links'] = false; */
/*   $new_options['number'] = "778-837-6320"; */
/*   $merged_options = wp_parse_args( $options, $new_options ); */
/**/
/*   $compare_options = array_diff_key( $new_options, $options ); */
/*   if ( empty( $options ) || !empty ( $compare_options) ) { */
/*     update_option( 'search_filter_options', $merged_options ); */
/*   } */
/*   return $merged_options; */
/* } */
/**/

