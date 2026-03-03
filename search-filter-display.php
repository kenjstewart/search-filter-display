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

/* require 'modules/helpers.php'; */
require 'modules/rest_query.php';
require 'modules/gui.php';

// DEF: All the global functions
// ------------------------------




// FUNC: function to disable caching, tag with context and attach endpoint lookup
// ------------------------------------------------------------------------------
add_action( 'wp_head', 'search_filter_display_head' );
function search_filter_display_head() {
  if( is_single() ) {
?>
    <meta property="og:type" content="search" />
    <meta http-equiv="pragma" content="no-cache">
    <link rel='https://api.w.org/' href='http://localhost/wp-json/' />
<?php
  }
}




// FUNC: Dependencies injected into the header
// -------------------------------------------
function inject_header_content() {
  if ( is_page('inventory-view-all') ) {

    wp_enqueue_script('jquery');
    $tables_css = plugins_url( '/static/css/tables.css', __FILE__ );
    $simpui_css = plugins_url( '/static/css/simpui.css', __FILE__ );
    $simpui_js  = plugins_url( '/static/js/simpui.js', __FILE__);
    /* $rest_handler_js  = plugins_url( '/static/js/rest-handler.js', __FILE__); */
    wp_enqueue_style('sfd-css', $tables_css, [], null);
    wp_enqueue_style('sfd-simpui-css', $simpui_css, [], null);
    wp_enqueue_script('sfd-simpui-js', $simpui_js, ['jquery'], null, true);
    /* wp_enqueue_script('sfd-rest-handler-js', $rest_handler_js, ['jquery'], null, true); */
  }
}
add_action('wp_enqueue_scripts', 'inject_header_content');







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
    <h2>Search, Filter and Display Configuration</h2>
    <h3>This is non-functional currently. Check with author for development timeline.</h3>
    <form method="post" action="options.php" style="display: none;">
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

