<?php
/*
Plugin Name:	Search Filter Display..
Plugin URI:
Description:	Heavily customizable search and filtration options per page via WP shortcodes. <a href="#"> "Sed ut perspiciatis </a> unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa?"
Version:		0.5.1
Author:			Ken Stewart
Author URI:		https:/kenstewart.ca
License:		MIT
 */


/* require 'vendor/autoload.php'; */


// DEFINE: Reference this as the full dir constant for this plugin

session_start();

define( 'THIS_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );


add_action( 'wp_head', 'search_filter_display' );

// FUNC: function to disable caching if possible
function search_filter_display() {
  if( is_single() ) {
?>
    <meta property="og:type" content="search" />
    <meta http-equiv="pragma" content="no-cache">
<?php
  }
}





// FUNC: Dependencies injected into the header
function inject_header_content() {
    wp_enqueue_script('jquery');
    $tables_css = plugins_url( 'css/tables.css', __FILE__ );
    $simpui_css = plugins_url( 'css/simpui.css', __FILE__ );
    $simpui_js  = plugins_url( 'js/simpui.js', __FILE__);
    /* $state_js  = plugins_url( 'js/state.js', __FILE__); */
    wp_enqueue_style('filtration-tables-style', $tables_css, [], null);
    wp_enqueue_style('filtration-buttons-style-v1', $simpui_css, [], null);
    wp_enqueue_script('filtration-buttons-v1', $simpui_js, ['jquery'], null, true);
    /* wp_enqueue_script('state_interaction_handler', $state_js, ['jquery'], null, true); */
}
add_action('wp_enqueue_scripts', 'inject_header_content');


// FUNC: build inline css style from array of properties
// expects array("key" => "value"); type
function style_from_array($arr) {
  $new = [];
  foreach($arr as $k => $v){
    array_push($new, "$k: $v;");
  }
  $s_new = implode(' ', $new);
  return $s_new;
}


function make_button($src_icon, $b_id, $style_arr = null) {
  // work through optional params
  if(isset($style_arr)) {
    //TODO:
    $style = style_from_array($style_arr);
  } else {
    $style = "padding: 2px; margin: 0px;";
  }
  // deal with loading the html component
  $b_url = THIS_PLUGIN_PATH . "components/button.html";
  $buttonA = file_get_contents("$b_url");
  // load provided icon url into the html
  $b_icon = plugins_url( $src_icon, __FILE__ );
  $buttonB = preg_replace("/\[icon\]/", $b_icon, $buttonA);
  $buttonC = preg_replace("/\[id\]/", $b_id, $buttonB);
  $buttonD = preg_replace("/\[style\]/", $style, $buttonC);
  return $buttonD; 
}



// FUNC: Generate user interface
function search_filter_gui ($atts) {

  // NOTE:  Safe storage in memory for the session
  $_SESSION['search_atts'] = $atts;
  // NOTE:  Store as inpage script
  $json_encoded_atts = json_encode($atts);
  $json_state_obj = "<script id='state_object' type='application/json'>$json_encoded_atts</script>";
  $json_results_obj = "<script id='results_object' type='application/json'></script>";
  // -------------------------------------------------------------------- load the button component ----
  $button_url = THIS_PLUGIN_PATH . "components/button.html";
  $button = file_get_contents("$button_url");
  // ------------------------------------------------------------------ if the filter option is yes ----
  if ($atts['filter'] == "true") {
    $filter_button = make_button("icons/filter-funnel.svg", "filter");
  } else {
    $filter_button = "";
  }
  // ------------------------------------------------------------------------- if search is enabled ----
  if ($atts['search'] == "true") {
    $search_icon = plugins_url( "icons/simpui-search.svg", __FILE__  );
    $search_url = THIS_PLUGIN_PATH . "components/search.html";
    $search = file_get_contents("$search_url");
    $search_bar = preg_replace("/\[icon\]/", $search_icon, $search);
  } else { 
    $search_bar = ""; 
  }
  // ---------------------------------------------------------------- top row grid and list buttons ----
  $list_button = make_button("icons/layout-list.svg", "list-button");
  $grid_button = make_button("icons/layout-grid.svg", "grid-button");
  $spinner = '<div class="loader"></div>';
  // [17-02-2026] ------------------------------------------------------- bottom pagination buttons ----
  $bottom_bar_style = array("padding" => "0.11rem", "margin" => "5px 2px");
  $goto_firstpage_button = make_button("icons/push-chevron-left.svg", "goto_firstpage_button", $bottom_bar_style );
  $goto_lastpage_button = make_button("icons/push-chevron-right.svg", "goto_lastpage_button", $bottom_bar_style );
  
  $back_onepage_button = make_button("icons/chevron-left.svg", "back_onepage_button", $bottom_bar_style );
  $forward_onepage_button = make_button("icons/chevron-right.svg", "forward_onepage_button", $bottom_bar_style );
  
  $page_buttons = "<div style='display:flex; flex-direction: row; align-items:center;'>
                    $goto_firstpage_button
                    $back_onepage_button
                   <div id='page_counter' style='height: fit-content; width: auto; margin: 4px; color: var(--simpui-placeholder); border-bottom: 1px dotted;'>
                   </div>
                    $forward_onepage_button$goto_lastpage_button
                   </div>";
  // [16-02-2026] ----------------------------------------------------------------------- container ----
  $container_url = THIS_PLUGIN_PATH . "components/container.html";
  $container = file_get_contents("$container_url");
  // ----------------------------------------------------------------------------- results dropdown ----
  $dropdown_url = THIS_PLUGIN_PATH . "components/rpp.html";
  $rpp = file_get_contents("$dropdown_url");
  $rpp = preg_replace("/\[default\]/", $atts['perpage'], $rpp);
  // ----------------------------------------------------------------------------------- bottom bar ----
  $bottombar_url = THIS_PLUGIN_PATH . "components/bottombar.html";
  $bottombar = file_get_contents("$bottombar_url");
  $bottombar = preg_replace("/\[pagination\]/", "$page_buttons", $bottombar);
  // ------------------------------------------------------------------- compile the gui components ----
  $tempA = preg_replace("/\[filter\]/", "$filter_button", $container);
  $tempB = preg_replace("/\[search\]/", "$search_bar", $tempA);
  $tempC = preg_replace("/\[result_per_page\]/", "$rpp", $tempB);
  $topbar_gui_compiled = preg_replace("/\[display_buttons\]/", "$list_button$grid_button", $tempC);
  // -------------------------------------------------------------------- loading the table element ----
  $table_url = THIS_PLUGIN_PATH . "components/table.html";
  $card_url = THIS_PLUGIN_PATH . "components/card.html";
  $table = file_get_contents("$table_url");
  $section_cap = "</section>";
  $grid_content = "<div id='grid_content' style='margin: 10px 0px'></div>";
  // ----------------------------------------------------------------- inject the js and return gui ----
  $js_inline_template = '<script lang="javascript" src="[state]"></script>';
  $js_state_url = plugins_url( 'js/state.js', __FILE__);
  $js_state_inject = preg_replace("/\[state\]/", $js_state_url, $js_inline_template);
  // ------------------------------------------------------------------- return value from function ----

  return $json_state_obj . $json_results_obj . $topbar_gui_compiled . $table . $grid_content . $bottombar . $section_cap;

  /* '<ul id="data-display"><li>' . $json_encoded_atts . '</li> */
  /*   <li>' . implode(', ', flatten_array($_SESSION['search_atts'])) . '</li></ul>'; */
}

function flatten_array($array_in){
  $array_out = []; 
  foreach ($array_in as $x => $y) {
    array_push($array_out, "$x: $y <br>");
  }
  return $array_out;
}
  /* $inv1 = pods_field_raw($pod_obj, 'inventory_volume'); */
  /* $inv2 = get_post_meta($id, 'inventory_volume', true); */
  /* $pod_obj = pods('archive_inventory'); */
  /* $params = array('limit' => 5, 'page' => 1, 'orderby' => 'inventory_year DESC'); */
  /* $pod_obj->find($params); */
  /* $dmp = var_dump(get_post_meta("209467")); */




// NOTE: Enables the shortcode to work

function register_filter() {
  add_shortcode('sfd', __NAMESPACE__.'\search_filter_gui');
}
add_action('init', __NAMESPACE__.'\register_filter');




// NOTE: enqueue_ajax_handler() - Register handler so we can run the ajax operation.

function enqueue_ajax_handler() {
  wp_register_script( 'ajax-handler', plugins_url( 'js/ajax-handler.js?=' . mt_rand(), __FILE__ ), array('jquery'));
  wp_localize_script( 'ajax-handler', 'ajax_obj', 
    array( 'ajaxurl' => admin_url( 'admin-ajax.php'), 'nonce' => wp_create_nonce('search_nonce'), 'query_state' => $_SESSION['search_atts']));

  wp_enqueue_script( 'jquery' );  
  wp_enqueue_script( 'ajax-handler', plugins_url( 'js/ajax-handler.js?=' . mt_rand(), __FILE__ ), array('jquery'));
}
add_action('wp_enqueue_scripts', 'enqueue_ajax_handler');






// NOTE: pq_execute() 
/**
 * @param array $q  <- A phpdoc parameter type annotation
 * @return string[] <- A phpdoc return type annotation with detail on the array element type
 **/
function pq_execute($data) {
  $pod_name = $data['pod'];
  $display_mode = $data['mode'];
  $per_page = $data['perpage'];
  $search = $data['search'];
  $pagin = $data['pagination'];
  $current_page = $data['page'];
  $orderby = $data['orderby'];

  $pod_obj = pods($pod_name);
  $params = array('limit' => $per_page, 'pagination' => $pagin, 'page' => $current_page, 'orderby' => $orderby);
  $pod_obj->find($params);
  $results = [];
  $test = $pod_obj->pagination( array( 'type' => 'advanced' ) );
  $total_records = $pod_obj->total_found();

  while ($pod_obj->fetch()){
    $item_category = $pod_obj->field('inventory_item_main_type.name');
    if ($item_category == "Collectibles") {
        $item_type = $pod_obj->display('inventory_collectible_type.name');
        $subtitle = $pod_obj->display('inventory_collectible_subtype.name');
    } elseif ($item_category == "Publications") {
        $item_type = $pod_obj->display('inventory_publication_type.name');
        $subtitle = $pod_obj->display('inventory_publication_subtype.name');
    } else {
      $item_type = "";
      $subtitle = "";
    }
    $id = $pod_obj->field('id');
    $donated_by = $pod_obj->field('inventory_donated_by');
    $link = $pod_obj->field('permalink');
    $item = [
      "id" => $id,
      "test" => $test,
      "q" => $_SESSION['query_temp'],
      "total_found" => $total_records,
      "url" => esc_url($link), 
      "size" => $pod_obj->display('inventory_item_size'),
      "color" => $pod_obj->display('inventory_color'),
      "donated_by" => $donated_by,
      "year" => $pod_obj->display('inventory_year'),
      "title" => $pod_obj->field('inventory_title'),
      "subtitle" => $subtitle,
      "category" => $item_category,
      "volume" => $pod_obj->display('inventory_volume_raw'),
      "number" => $pod_obj->display('inventory_number_raw'),
      "type" => $item_type,
      "quantity" => $pod_obj->field('inventory_total_number_of_item'),
      "image_one" => $pod_obj->display('inventory_image-one.guid'),
      "image_two" => $pod_obj->display('inventory_image-two.guid')
    ];
    array_push($results, $item);
  }
  return $results;
}

function log_to_js($s_any){
  echo '<script>console.log("This JavaScript is echoed from PHP!");</script>';
};



// NOTE: fetch_search_results() - handles incoming ajax request -> Pods Seatch & send results -> ajax javascript.

// FUNC: registered function that is called by js-script,
//       second in chain. reply to ajax request with data.
//
function fetch_search_results() {

  check_ajax_referer('search_nonce', 'nonce'); 
  $data = $_POST['query'];
  $_SESSION['query_temp'] = $data;
  if (empty($data)) {
      wp_send_json_error('No data received');
      wp_die();
  }
  $response = pq_execute($data);
  wp_send_json_success($response);
  wp_die();
}

add_action('wp_ajax_fetch_search_results', 'fetch_search_results');
add_action('wp_ajax_nopriv_fetch_search_results', 'fetch_search_results');






// NOTE: register method

register_activation_hook( __FILE__, 'search_filter_default_options' );

function search_filter_default_options() {
  if ( false === get_option(  'search_filter_field' ) ) {
    add_option( 'search_filter_field', 'name');
  }
}






register_activation_hook( __FILE__, 'search_filter_default_options_array' );

function search_filter_default_options_array() {
  search_filter_get_options();
}




// NOTE: search_filter_get_options() - Loads custom options for the plugin.

function search_filter_get_options() {
  $options = get_option( 'search_filter_options', array() );
  $new_options = [];
  $new_options['name'] = "Barney";
  $new_options['links'] = false;
  $new_options['number'] = "778-837-6320";
  $merged_options = wp_parse_args( $options, $new_options );

  $compare_options = array_diff_key( $new_options, $options );
  if ( empty( $options ) || !empty ( $compare_options) ) {
    update_option( 'search_filter_options', $merged_options );
  }
  return $merged_options;
}





// NOTE: search_filter_menu() - Build the admin menu and provide the config page callback. 

add_action( 'admin_menu', 'search_filter_menu' );

function search_filter_menu() {
  add_options_page('Search Filter Settings',
                   'Filter Settings',
                   'manage_options', 
                   'search-filter-settings', 
                   'search_filter_config_page');
}





// NOTE: search_filter_settings() - Register the filter settings we'll use to drive the search.

add_action( 'admin_init', 'search_filter_settings' );

function search_filter_settings() {
	register_setting( 'search-filter-settings-group', 'filter_name' );
	register_setting( 'search-filter-settings-group', 'fields_returned' );
	register_setting( 'search-filter-settings-group', 'results_per_page' );
}





// NOTE: search_filter_config_page() - Custom configuration page.

function search_filter_config_page() { ?>  
  <div class="wrap">
    <h2>Search & Filter Display Configuration</h2>

    <form method="post" action="options.php">
      <?php settings_fields( 'search-filter-settings-group' ); ?>
      <?php do_settings_sections( 'search-filter-settings-group' ); ?>
      <table class="form-table">
          <tr valign="top">
          <th scope="row">Filter Name</th>
          <td><input type="text" name="filter_name" value="<?php echo esc_attr( get_option('filter_name') ); ?>" /></td>
          </tr>
          <tr valign="top">
          <th scope="row">Fields Returned</th>
          <td><input type="text" name="fields_returned" value="<?php echo esc_attr( get_option('fields_returned') ); ?>" /></td>
          </tr>
          <tr valign="top">
          <th scope="row">Results per page</th>
          <td><input type="text" name="results_per_page" value="<?php echo esc_attr( get_option('results_per_page') ); ?>" /></td>
          </tr>
      </table>
      <?php submit_button(); ?>
    </form>
  </div> 
  <?php 
}





// NOTE: Adds in the settings link to the plugin row actions on the plugins page

function custom_plugin_action_links($links, $plugin_file) {
    // Add a custom action link for a plugin called "My Plugin"
    if ($plugin_file === 'search-filter-display/search-filter-display.php') {
        $custom_link = '<a href="' . admin_url('options-general.php?page=search-filter-settings') . '">Settings</a>';
        array_push($links, $custom_link);
    }
    return $links;
}
add_filter('plugin_action_links', 'custom_plugin_action_links', 10, 2);

