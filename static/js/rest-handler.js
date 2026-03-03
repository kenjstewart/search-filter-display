
// Description:  Supporting js library for search and interactive display
// Version:      0.2b
// Last Change:  26 February 2026
// Author:       Ken Stewart <kengfx@gmail.com>
//
// This code is a supporting library only implementing functions to   
// call wordpress specific php and pod searches using REST API requests.         
// This was created expressly for the ACM SIGGRAPH History Archive at BGSU, 
// all software is provided as-is and is not licensed for commercial use 
// by anyone outside of the ACM unless explicitly authorized by the author
// or the presiding ACM Siggraph History Archive team.

// import jQuery from '../../../../../wp-includes/js/jquery/jquery.min.js';

import {getState, getStateItem, setState, setStateItem, setResults, getResults, getFunc} from './statelib.js';
import {rebuildTable, rebuildGrid} from './displaylib.js';



// NOTE: globally scoped vars and objects

var inventory_all = "wp/v2/archive_inventory/";
var inventory_types = "wp/v2/types/archive_inventory/";
var featured_media = "wp/v2/media/125744/";


var jQuery = window.jQuery;
var $ = jQuery;

function sanitize(data) {
  if (Array.isArray(data)) {
    data = data.join(', ');
  } else if (typeof data == String) {
    console.log(data);
  }
  return data;
};





// NOTE: Only trigger once the entire page has loaded its content
jQuery(document).ready(function($) {


  async function getFromEndpoint(url, filter = null) {

    console.log(getFunc(new Error().stack)); 
    try {
      if (filter != null) {
         url = url + filter;
      }
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Error: ${url}`);
      }
      const total = resp.headers.get("X-WP-Total");
      const pages = resp.headers.get("X-WP-Totalpages");
      const results = await resp.json();
      console.log(results); 
      let entries = [];
      $.each(results, (idx, item) => {
        // console.log(item); 
        // decide which sub-type to return
        let category = item.inventory_item_main_type[0].name;
        let item_type;
        if (category == "Publications") {
          item_type = item.inventory_publication_type;
        } else if (category == "Collectibles") {
          item_type = item.inventory_collectible_type[0].name;
        }
        if (Array.isArray(item_type)) {
          item_type = item_type.join(', ');
        }
        // hone the results down into a tight package 
        let entry = {
          id: item.id,
          title: item.inventory_title,
          image: item['inventory_image-one'].guid,
          category: category,
          year: item.inventory_year[0],
          url: item.link,
          item_type: item_type,
          item_type_id_fallback: item.inventory_main_type[0],
          item_type_id: item.inventory_item_main_type[0].term_id,
          volume: item.inventory_volume,
          number: item.inventory_number,
          amount: item.inventory_total_number_of_item
        };
        entries.push(entry);
      });
      
      results_obj = {total, pages, entries};
      
    } catch (err) {
      console.error('fetch error:', err);
    }
  }




  
  // NOTE: define which fields are needed to display in the table
  // 	 also add functions for constructing the query and adding
  // 	 filters to the results. Add defaults to the query.

  // const obj = { version: "22", who: "234234234234" };
  // const queryString = Object.entries(obj)
  // .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  // .join('&');

  // const myParams = {'foo': 'hi there', 'bar': '???'};
  // const u = new URLSearchParams(myParams).toString();
  // console.log(u);



  const QueryDetails = {
    pagenum: 1,
    per_page: 10,
    show_filter: "false",
    show_search: "false",
    mode: "list",
    orderby: "orderby=inventory_year",
    order: "DESC",
    pod: "",
    filt: "",
    fields: [
    'id',
    'type',
    'link',
    'inventory_title',
    'inventory_image-one',
    'inventory_item_main_type',
    'inventory_main_type',
    'inventory_year',
    'inventory_collectible_type',
    'inventory_publication_type',
    'inventory_volume',
    'inventory_number',
    'inventory_total_number_of_item',
    '_links'
    ],
    baseurl: 'localhost',
    endpoint: '',
    setEndpoint: function (e) {
      var links = document.getElementsByTagName( 'link' );
      var link = Array.prototype.filter.call( links, function ( item ) {
        return (item.rel === 'https://api.w.org/');
      });
      var api_root = link[0].href;
      this.endpoint = `${api_root}${e}`;
    },
    setPage: function (pnum) {
      let oldnum = this.pagenum;
      this.pagenum = pnum;
      console.log(`page: ${oldnum} changed to page: ${pnum}`);
    },
    setPerPage: function (per) {
      let oldper = this.per_page;
      this.per_page = per;
      console.log(`per_page: ${oldper} changed to per_page: ${per}`);
    },
    queryCompile: function () {
      const c = `&filter[orderby]=`;
      let comp = `${this.endpoint}?${this.filt}&_embed&_fields=${this.fields.join(',')}&per_page=${this.per_page}&page=${this.pagenum}&${this.orderby}`;
      console.log({comp});
      return comp;
    },
    addFilter: function (key, val) {
      if (this.filt === "") { 
        this.filt += `&filter[meta_key]=${key}&filter[meta_value]=${val}`;
      } else {
        this.filt += `&filter[meta_key]=${key}&filter[meta_value]=${val}`;
      }
      console.log(`filter is now: ${this.filt}`);
    },
    setOrderBy: function (orderby) {
      this.orderby = orderby;
    },
    clearFilter: function () {
      this.filt = "";
    }
  }



  // NOTE: Running as main thread

  // get the details from the json embedded in the page 
  let state_obj = $("#state_object");
  state_obj = JSON.parse(state_obj.text());
  console.log(state_obj); 

  // adjust query-details to match sfd
  QueryDetails.pagenum = state_obj.page;
  QueryDetails.per_page = state_obj.perpage;
  QueryDetails.show_filter = state_obj.filter;
  QueryDetails.show_search = state_obj.search;
  QueryDetails.mode = state_obj.mode;
  // QueryDetails.orderby = state_obj.orderby;
  QueryDetails.pod = state_obj.pod;
  QueryDetails.setEndpoint(inventory_all);

  // global result object
  let results_obj;

  // call the main REST endpoint request 
  getFromEndpoint(QueryDetails.queryCompile());

  // update the interface
  const container = $('#container');
  var initial_interval = setInterval(function() {
    if (results_obj) {
      clearInterval(initial_interval);
      $('#results_object').text(JSON.stringify(results_obj));
      // update on delivery
    } }, 500);
  updateResults();


  // NOTE: Dropdown binding

  // $("#current-filter").bind('dropDownEvent', function() {
  //   let newValue = this.textContent;
  //   console.log(this);
  //   setStateItem('filter', newValue);
  // });
  //
  //
  //
  // $("#current-per-page").bind('dropDownEvent', function() {
  //   let newValue = this.textContent;
  //   console.log(this);
  //   setStateItem('perpage', newValue);
  // });
  //

  const st_obj = $('#state_object');
  st_obj.bind('change', function() {
    console.log('STATE_OBJECT changed');
    if (! results_obj) {
      let results_obj;
    }
    updateQuery(st_obj);
  });


  let filter_option = $("#current-filter");
  filter_option.bind('dropDownEvent', function() { 
    console.log(`filter option changed: ${this.textContent}`);

    updateQuery();
  });


  // let rpp_amt_hidden = $("rpp_amt");
  // rpp_amt_hidden.bind('input', function() { 
  //   console.log('result amount changed'); 
  // });
  $("#current-per-page").bind('dropDownEvent', function() {
    let newValue = this.textContent;
    console.log(this);
    setStateItem('perpage', newValue);
  });


  function logger(log_message) {
      let logtime = new Date();
      const uuid = crypto.randomUUID();
      console.log(`[${logtime.toLocaleString()}] - ${log_message} [${uuid}]`);
  }


  function updateQuery() {
    /* updates query from html object */

    console.log(getFunc(new Error().stack)); 
    let st = getState();

    QueryDetails.pagenum = st.page;
    QueryDetails.per_page = st.perpage;
    QueryDetails.show_search = st.search;
    QueryDetails.mode = st.mode;
    // QueryDetails.orderby = st.orderby;
    QueryDetails.pod = st.pod;

    /* check filter options */
    QueryDetails.clearFilter();
    let selected_filter = $("#current-filter").text();
    if (selected_filter === "Publications") {
      QueryDetails.addFilter("inventory_item_main_type", "17270");
    } else if (selected_filter === "Collectibles") {
      QueryDetails.addFilter("inventory_item_main_type", "17269");
    } else if (selected_filter === "Other") {
      QueryDetails.addFilter("inventory_item_main_type", "17271");
    }
    
    /* kick off the search */
    let results_obj;
    let new_query = QueryDetails.queryCompile();
    console.log(new_query);
    getFromEndpoint(QueryDetails.queryCompile());
    updateResults();
  }



  function updateResults() {
    // NOTE: workaround for async update
    
    console.log(getFunc(new Error().stack)); 

    var interval = setInterval(function() {
      if (results_obj) {
        console.log(results_obj);

        // HINT: put in new results object
        clearInterval(interval);
        $('#results_object').text(JSON.stringify(results_obj));
        
        // every time the table is updated with results it updates the results object,
        // aswell as updating the state object with the page range and total entries found.
        setStateItem('firstpage', "1", false);
        setStateItem('lastpage', results_obj.pages, false);
        setStateItem('total_found', results_obj.total, false);

        container.innerHTML = '';

        // HINT: Get missing bits for pagination
        const total_found = getStateItem('total_found') ?? 0;
        const current_page = getStateItem('page');
        const per_page = getStateItem('perpage');
        let count = 0;
        if (total_found > 0){
          count = total_found/Number(per_page);
        }
        // update pagination
        count = ~~count;
        const display_page_count = `${current_page} / ${count}`;
        $('#page_counter').text(display_page_count);
        if (getStateItem('mode') == 'list') {
          logger('should rebuild table now');
          rebuildTable(results_obj.entries);
        }
        if (getStateItem('mode') == 'grid') {
          rebuildGrid(results_obj.entries);
        }
        // });
      }  
    }, 
    500);
    results_obj = null;
  }




  //  NOTE:  Bindings to buttons and changes


  //  NOTE:  Button bindings
  
  $('#list-button').bind('click', function() {
    let st = getState();
    console.log(st);
    if (st.mode != 'list') {
      setStateItem('mode', 'list');
    }
  });
  


  $('#grid-button').bind('click', function() {
    let st = getState();
    if (st.mode != 'grid') {
      setStateItem('mode', 'grid');
      console.log(st);
    }
  });


  // NOTE: Bottom buttons bindings

  $('#goto_firstpage_button').bind('click', function() {
    let st = getState();
    if (st.firstpage != st.page) {
      setStateItem('page', getState().firstpage);
    }
  });



  $('#goto_lastpage_button').bind('click', function() {
    let st = getState();
    if (st.lastpage != st.page) {
      setStateItem('page', getState().lastpage);
    }
  });
  

  
  $('#back_onepage_button').bind('click', function() {
    let st = getState();
    if (st.firstpage != st.page) {
    }
    let back_page = Math.max(1, Number(st.page) - 1);
    setStateItem('page', back_page.toString());
  });



  $('#forward_onepage_button').bind('click', function() {
    let st = getState();
    st.lastpage
    st.page;
    let forward_page = Math.min(Number(st.lastpage), Number(st.page) + 1);
    setStateItem('page', forward_page.toString());
  });

});
