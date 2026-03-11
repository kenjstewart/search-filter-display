<?php

/* require 'helpers.php'; */


//  NOTE: full custom endpoint

add_filter('rest_api_init', function() {
  register_rest_route('/sfd/v1', '/archive_inventory/', array(
    'methods' => 'GET',
    'callback' => 'sfd_archive_inventory_callback',
  ));

});


function getAllData($data) {
  $pod_name = $data['pod'];
  $id = $data['id'];
  $pod_obj = pods($pod_name);
  $condition = `id=${id}`;
  $params = array('limit' => 1, 'pagination' => true, 'page' => 1, 'where' => $condition);
  $pod_obj->find($params);
  $result = [];
  while ($pod_obj->fetch()) {  
    array_push($result, $pod_obj->export());
  }
  return $result;
}


//  NOTE: key pods search function
function sfd_pods($data) {
  $pod_name = $data['pod'];
  $limit = $data['limit'] ?? 10;
  $pagin = true;
  $current_page = $data['page'];
  $orderby = $data['orderby'] . " " . $data['order'];
  if (isset($data['filter'])) {
    $flt_arr = explode(",", $data['filter']);
    $filter_where = "$flt_arr[0]=$flt_arr[1]";
    $params = array('limit' => $limit, 'pagination' => $pagin, 'page' => $current_page, 'orderby' => $orderby, 'where' => $filter_where);
  } else {
    $params = array('limit' => $limit, 'pagination' => $pagin, 'page' => $current_page, 'orderby' => $orderby);
  }
  $pod_obj = pods($pod_name);
  $pod_obj->find($params);
  $total_records = $pod_obj->total_found();
  $proc = [];

  if ($total_records != 0) {
    $total_pages = $total_records/$limit;
    $total_pages = (int) $total_pages;
  } else {
    $total_pages = 'unknown';
  }

  while ($pod_obj->fetch()){

    $item_category = $pod_obj->field('inventory_item_main_type.name');
    if ($item_category == "Collectible") {
        $item_type = $pod_obj->display('inventory_collectible_type.name');
        $subtype = $pod_obj->display('inventory_collectible_subtype.name');
    } elseif ($item_category == "Publication") {
        $item_type = $pod_obj->display('inventory_publication_type.name');
        $subtype = $pod_obj->display('inventory_publication_subtype.name');
    } else {
      $item_type = "";
      $subtype = "";
    }
    $id = $pod_obj->field('id');
    $donated_by = $pod_obj->field('inventory_donated_by');
    $link = $pod_obj->field('permalink');
    $item = [
      "id" => $id,
      "url" => esc_url($link), 
      "year" => $pod_obj->display('inventory_year'),
      "title" => $pod_obj->field('inventory_title'),
      "sub_type" => $subtype,
      "cat_type" => $pod_obj->field('inventory_item_main_type.name'),
      "cat_id" => $pod_obj->field('inventory_item_main_type.term_id'),
      "volume" => $pod_obj->display('inventory_volume_raw'),
      "number" => $pod_obj->display('inventory_number_raw'),
      "type" => $item_type,
      "quantity" => $pod_obj->field('inventory_total_number_of_item'),
      "image" => $pod_obj->display('inventory_featured_image.guid'),
    ];
    array_push($proc, $item);
  }
  $results = [
    "entries" => $proc,
    "total_found" => $total_records,
    "filtered_by" => $filter_where,
    "pages" => $total_pages
  ];

  return $results;
}


function sfd_archive_inventory_callback( WP_REST_Request $request) {
  /* $param_list = $request->get_params(); */
  $param_list = $request->get_query_params();
  $q = $param_list['q'];
  $d = $param_list['d'];

  if (isset($q['filter'])) {
    $filter = $q['filter'];
  }
  if (isset($q['orderby'])) {
    $orderby = $q['orderby'];
  }
  if (isset($q['limit'])) {
    $limit = $q['limit'];
  }
  if (isset($q['page'])) {
    $page = $q['page'];
  }
  if (isset($q['order'])) {
    $order = $q['order'];
  }
  if (isset($d['dev'])) {
    $dev = $d['dev'];
  }
  if ($dev == true) {
    $pod_name = 'archive_inventory';
    if (isset($d['id'])) {
      $pod_params = array('id' => $d['id'], 'pod' => $pod_name);
    } else {
      $pod_params = array('pod' => $pod_name);
    }
    $sfd = getAllData($pod_params);
  } else {
    $pod_name = 'archive_inventory';
    $pod_params = array(
      'pod' => $pod_name,
      'filter' => $filter,
      'orderby' => $orderby,
      'order' => $order ?? 'DESC',
      'limit' => $limit,
      'page' => $page ?? '1');
    $sfd = sfd_pods($pod_params);
  }
  $response = new WP_REST_Response($sfd, 200);
  $response->header('X-WP-Total', $sfd['total_found']);
  $response->header('X-WP-Totalpages', $sfd['pages']);
  return $response;
}




add_filter( 'register_post_type_args', 'custom_inventory_args', 10, 2);
function custom_inventory_args ( $args, $post_type ) {
  if ('archive_inventory' === $post_type ) {
    $args['show_in_rest'] = true;
  }
  return $args;
}

function prefix_get_endpoint_phrase() {
}

// registers the filter hook
   
/* add_filter('rest_archive_inventory_query', 'filter_posts_by_field', 10, 2); */

/* function filter_posts_by_field( $args, $request ) { */
/*   if ( ! isset( $request['year'] ) ) { */
/*     return $args; */
/*   } */
/* /*   // http://localhost/wp-json/wp/v2/archive_inventory/?year=1990   works */
/*   $item_type_value = sanitize_)text_field( $request['year'] ); */
/*   $item_type_meta_query = array('key' => 'inventory_year', 'value' => $item_type_value); */
/*   if ( isset( $args['meta_query'] ) ) { */
/*     $args['meta_query']['relation'] = 'AND'; */
/*     $args['meta_query'][] = $item_type_meta_query; */
/*   } else { */
/*     $args['meta_query'] = array(); */
/*     $args['meta_query'][] = $item_type_meta_query; */
/*   } */
/**/
/*   $jj = var_dump($args); */
/*   write_log($jj); */
/*   return $args; */
/* } */

// NOTE: this would work on ALL types

/* add_action('rest_api_init', 'rest_api_filter_add_filters'); */
/* function rest_api_filter_add_filters() { */
/*   foreach (get_post_types(array('show_in_rest' => true), 'objects') as $post_type) { */
/* 		add_filter('rest_' . $post_type->name . '_query', 'rest_api_filter_add_filter_param', 10, 2); */
/*   } */
/* } */




















// NOTE: Implementation for just archive_inventory

add_filter('rest_archive_inventory_collection_params', function($params) {
  $fields = ["year","inventory_year","inventory_total_number_of_item","year"];
  foreach ($fields as $key => $value) {
    $params['orderby']['enum'][] = $value;
    }
    return $params;
    },
  10, 1 );



add_filter('rest_archive_inventory_query', function($args, $request) {
    /* $fields = ["inventory_year","inventory_total_number_of_item"]; */
    $f = $request->get_param( 'orderby' );
    if ( isset( $f ) && 'inventory_year' === $f ) {
      /* $args['meta_key'] = 'inventory_year'; */
      /* $args['orderby'] = 'meta_value_num'; */
    /* } */
  
      /* $args = array( */
      /*   'meta_query' => array( */
      /*     'relation' => 'AND', */
      /*     'filter' => array( */
      /*         'key' => 'inventory_item_main_type', */
      /*         'value' => '17270', */
      /*         'compare' => '=', */
      /*         'type' => 'META' */
      /*     ), */
      /*     'year_clause' => array( */
      /*         'key' => 'inventory_year', */
      /*         'compare' => 'EXISTS' */
      /*       ) */
      /*   ), */
      /*   'orderby' => array( */
      /*     'year_clause' => 'DESC', */
      /*   ), */
      /* ); */
    }
    /* $jj = var_dump($args); */
    /* write_log($jj); */
    return $args;
  }, 10, 2 );











/* add_action('rest_api_init', 'rest_api_custom_filters'); */
function rest_api_custom_filters() {
  add_filter('rest_archive_inventory_query', 'rest_archive_inventory_filter_param', 10, 2);
}


function rest_archive_inventory_filter_param($args, $request) {
  
  /* $fields = ["inventory_title","inventory_year","inventory_total_number_of_item"]; */
  /* $order_by = $request->get_param( 'orderby' ); */
  /* if ( isset( $order_by ) && in_array( $order_by, $fields ) ) { */
  /*   $args['meta_key'] = $order_by; */
  /*   $args['orderby'] = 'meta_value_num'; */
  /* } */
  if (empty($request['filter']) || ! is_array($request['filter'])) {
	  if (empty($request['orderby']) || ! is_array($request['orderby'])) {
	     return $args;
	   }
	}
  
  $filter = $request['filter'];
	if (isset($filter['posts_per_page']) && ((int) $filter['posts_per_page'] >= 1 && (int) $filter['posts_per_page'] <= 100)) {
		$args['posts_per_page'] = $filter['posts_per_page'];
  }
  global $wp;
  // allows us to modify the var array for query changes
  $vars = apply_filters('rest_query_vars', $wp->public_query_vars);

  function allow_meta_query($valid_vars) {

    $valid_vars = array_merge($valid_vars, array('meta_query', 'meta_key', 'meta_value', 'meta_compare'));
    return $valid_vars;
  }
  
  $vars = allow_meta_query($vars);

	foreach ($vars as $var) {
		if (isset($filter[$var])) {
		  $args[$var] = $filter[$var];
		}
  }

  /* $args['meta_key'] = $order_by; */
  /* $args['orderby'] = 'meta_value_num'; */

  /* $jj = var_dump($args); */
  /* write_log($jj); */

  /* hardwiring */
  /* $args['orderby'] = 'inventory_year'; */
  return $args;
}


      

