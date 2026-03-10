<?php

function sfd_plugin_url() {
  $sfd_plugin_url = WP_PLUGIN_URL . "/search-filter-display";
  /* if ( is_dir( $spd_plugin_url ) ) { */
  /*   return $spd_plugin_url; */
  /* } */
  return $sfd_plugin_url;
}

function sfd_plugin_dir() {
  $sfd_plugin = WP_PLUGIN_DIR . "/search-filter-display";
  if ( is_dir( $sfd_plugin ) ) {
    return $sfd_plugin;
  }
}
$_URL = sfd_plugin_url();
define( 'THIS_PLUGIN_URL', $_URL );

$ROOT_PATH = sfd_plugin_dir();
define( 'THIS_PLUGIN_PATH', $ROOT_PATH );


// NOTE: Flatten Array helper
// --------------------------
function flatten_array($array_in){
  $array_out = []; 
  foreach ($array_in as $x => $y) {
    array_push($array_out, "$x: $y <br>");
  }
  return $array_out;
}


// NOTE: Logging helper
// --------------------
function write_log( $data ) {
  if ( $data != null ) {
    if ( true === WP_DEBUG ) {
        /* $data = esc_attr($data); */
        if ( is_array( $data ) || is_object( $data ) ) {
            error_log( print_r( $data, true ) );
        } else {
            error_log( $data );
        }
    }
  }
}


// NOTE: Log js helper
// -------------------
function log_to_js($s_any){
  echo '<script>console.log("This JavaScript is echoed from PHP!");</script>';
};

