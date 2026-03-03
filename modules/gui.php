<?php

require 'helpers.php';





// NOTE: Helper functions to build UI components/styles
//
// FUNC: build inline css style from array of properties
// -----------------------------------------------------
// expects array("key" => "value"); type
//
function style_from_array($arr) {
  $new = [];
  foreach($arr as $k => $v){
    array_push($new, "$k: $v;");
  }
  $s_new = implode(' ', $new);
  return $s_new;
}

write_log(THIS_PLUGIN_URL);

function make_button($src_icon, $b_id, $style_arr = null) {
  // work through optional params
  if(isset($style_arr)) {
    $style = style_from_array($style_arr);
  } else {
    $style = "padding: 2px; margin: 0px;";
  }
  // deal with loading the html component
  $b_url = THIS_PLUGIN_PATH . "/static/html/button.html";
  $buttonA = file_get_contents("$b_url");
  // load provided icon url into the html
  $b_icon = THIS_PLUGIN_URL . "$src_icon";
  $buttonB = preg_replace("/\[icon\]/", $b_icon, $buttonA);
  $buttonC = preg_replace("/\[id\]/", $b_id, $buttonB);
  $buttonD = preg_replace("/\[style\]/", $style, $buttonC);
  return $buttonD; 
}


// FUNC: Generate user interface
function search_filter_gui ($atts) {


  // NOTE:  Store initial state (set by shortcode options) as inline json
  $json_encoded_atts = json_encode($atts);
  $json_state_obj = "<script id='state_object' type='application/json'>$json_encoded_atts</script>";
  $json_results_obj = "<script id='results_object' type='application/json'></script>";

  // -------------------------------------------------------------------- load the button component ----
  $button_url = THIS_PLUGIN_PATH . "/static/html/button.html";
  $button = file_get_contents("$button_url");

  // ------------------------------------------------------------------ if the filter option is yes ----
  $filter_url = THIS_PLUGIN_PATH . "/static/html/filter_dropdown.html";
  if ($atts['filter'] == "true") {
    $filter_button = make_button("/static/svg/filter-funnel.svg", "filter");
    $filter_dropdown = file_get_contents("$filter_url");
    $filter_dropdown = preg_replace("/\[default\]/", "No filter",$filter_dropdown);

  } else {
    $filter_button = "";
  }

  // ------------------------------------------------------------------------- if search is enabled ----
  if ($atts['search'] == "true") {
    $search_icon = plugins_url( "/static/svg/simpui-search.svg", __FILE__  );
    $search_url = THIS_PLUGIN_PATH . "/static/html/search.html";
    $search = file_get_contents("$search_url");
    $search_bar = preg_replace("/\[icon\]/", $search_icon, $search);
  } else { 
    $search_bar = ""; 
  }
  
  // ---------------------------------------------------------------- top row grid and list buttons ----
  $list_button = make_button("/static/svg/layout-list.svg", "list-button");
  $grid_button = make_button("/static/svg/layout-grid.svg", "grid-button");
  $spinner = '<div class="loader"></div>';

  // [17-02-2026] ------------------------------------------------------- bottom pagination buttons ----
  $bottom_bar_style = array("padding" => "0.11rem", "margin" => "5px 2px");
  $goto_firstpage_button = make_button("/static/svg/push-chevron-left.svg", "goto_firstpage_button", $bottom_bar_style );
  $goto_lastpage_button = make_button("/static/svg/push-chevron-right.svg", "goto_lastpage_button", $bottom_bar_style );
  
  $back_onepage_button = make_button("/static/svg/chevron-left.svg", "back_onepage_button", $bottom_bar_style );
  $forward_onepage_button = make_button("/static/svg/chevron-right.svg", "forward_onepage_button", $bottom_bar_style );
  
  $page_buttons = "<div style='display:flex; flex-direction: row; align-items:center;'>
                    $goto_firstpage_button
                    $back_onepage_button
                   <div id='page_counter' style='height: fit-content; width: auto; margin: 4px; color: var(--simpui-placeholder); border-bottom: 1px dotted;'>
                   </div>
                    $forward_onepage_button$goto_lastpage_button
                   </div>";

  // [16-02-2026] ----------------------------------------------------------------------- container ----
  $container_url = THIS_PLUGIN_PATH . "/static/html/container.html";
  $container = file_get_contents("$container_url");

  // ----------------------------------------------------------------------------- results dropdown ----
  $dropdown_url = THIS_PLUGIN_PATH . "/static/html/rpp.html";
  $rpp = file_get_contents("$dropdown_url");
  $rpp = preg_replace("/\[default\]/", $atts['perpage'], $rpp);

  // ----------------------------------------------------------------------------------- bottom bar ----
  $bottombar_url = THIS_PLUGIN_PATH . "/static/html/bottombar.html";
  $bottombar = file_get_contents("$bottombar_url");
  $bottombar = preg_replace("/\[pagination\]/", "$page_buttons", $bottombar);

  // ------------------------------------------------------------------- compile the gui /static/html ----
  $tempA = preg_replace("/\[filter\]/", "$filter_dropdown", $container);
  $tempB = preg_replace("/\[search\]/", "$search_bar", $tempA);
  $tempC = preg_replace("/\[result_per_page\]/", "$rpp", $tempB);
  $topbar_gui_compiled = preg_replace("/\[display_buttons\]/", "$list_button$grid_button", $tempC);

  // -------------------------------------------------------------------- loading the table element ----
  $table_url = THIS_PLUGIN_PATH . "/static/html/table.html";
  $card_url = THIS_PLUGIN_PATH . "/static/html/card.html";
  $table = file_get_contents("$table_url");
  $section_cap = "</section>";
  $grid_content = "<div id='grid_content' style='margin: 10px 0px'></div>";

  // ----------------------------------------------------------------- inject the js and return gui ----
  $js_inline_template = '<script lang="javascript" src="[state]" type="module"></script>';
  $js_state_url = THIS_PLUGIN_URL . '/static/js/rest-handler.js';
  $js_state_inject = preg_replace("/\[state\]/", $js_state_url, $js_inline_template);


  // ------------------------------------------------------------------- return value from function ----
  return $json_state_obj . $json_results_obj . $topbar_gui_compiled . $table . $grid_content . $bottombar . $section_cap . $js_state_inject;
}



/* http://localhost/wp-includes/js/jquery/jquery.min.js */


// NOTE: Register the shortcode to the above gui function

function register_filter() {
  add_shortcode('sfd', __NAMESPACE__.'\search_filter_gui');
}

add_action('init', __NAMESPACE__.'\register_filter');
