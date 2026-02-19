class DisplayButtonHandler {
  constructor(element_name, mode, sto) { 
    this.mode = mode;
    this.element_name = element_name;
    this.sto = sto;
    this.element = document.getElementById(element_name);
    this.element.addEventListener('click', this.handler);
  }
  handler = () => {
    this.sto.mode = this.mode;
    console.log(this.sto);
  }
}





jQuery(document).ready(function($) {
  console.log('ajax search triggered');

  // HINT: Function to call to change format of display, or reduce query amt.
  //       Increases in query will require and update too, but will be
  //       triggered after the ajax call for additional information.

  function rebuildTable(data) {
    $('#grid_content').hide()
    $('#grid_content').html("")
    // ------------------------
    $('#table-header').show();
    $('#custom_search_results').show();
    $('#main_table').show();

    $('#table-header').replaceWith(`
      <thead>
        <tr>
          <th>Year</th> <th style="text-align: left;">Title</th> <th>Category</th> <th></th> <th style="text-align: left;">Item Type</th> <th>Quantity</th>
        </tr>
      </thead>
      `);
    let return_list = [];
    $.each(data.data, function(index, item) {
      let volnum = "";
      if (item.volume.length>0) {
        if (item.number.length>0){
          volnum = `(Vol. ${item.volume}, No. ${item.number})`;
        }
      }
      return_list.push(
        `<tr data-id="${item.id}">
          <td style="text-align: center;">${item.year}</td>
          <td style="text-align: left;"><b><a href="${item.url}">${item.title} ${volnum}</a><b></td>
          <td style="text-align: center;">${item.category}</td>
          <td style="text-align: center;"></td>
          <td>${item.type}</td>
          <td style="text-align: center;">${item.quantity}</td>
        </tr>`);
    });
    $('#custom_search_results').html(return_list);
    $("#spinner").hide();
  }




  // NOTE: Grid

  function rebuildGrid(data) {
    console.log('rebuild grid called');
    $('#table-header').hide();
    $('#custom_search_results').hide();
    $('#custom_search_results').html("");
    // ------------------------
    $('#main_table').hide();
    $('#grid_content').show()

    let return_list = [];
    $.each(data.data, function(index, item) {
      let title = item.title;
      
      const siggraph = new RegExp("^SIGGRAPH\\s\\d{4}\\s", "g");
      const res = siggraph.exec(title);
      let conflabel = "";
      let cut_title = new String();
      if (res) {
        let cut_title = title.slice(res['0'].length, title.length);
        let prefix = title.slice(0, res['0'].length);
        conflabel = `<span class="simpui-badge subtle sm" style="border: 1px solid #595959; position: absolute; top: 143px; left: -4px; z-index: 500;">${prefix}</span>`;
      }
      
      let volnum = "";
      if (item.volume.length>0) {
        if (item.number.length>0){
          volnum = `Vol. ${item.volume}, No. ${item.number}`;
        }
      }
          // ${conflabel}
      return_list.push(
        `<div class="short summary-card-wrapper" style="height: 290px; overflow: visible; position: relative;">
          <div class="summary-card" style="overflow: hidden;">
            <div class="thumbnail" style="position: relative;">
              <a href="${item.url}" class="hasimg" title="">
                <img decoding="async" loading="lazy" width="150" height="150" src="${item.image_one}" class="attachment-thumbnail size-thumbnail" alt="${item.title}">
              </a>
            </div>
            
            <div class="title" style="height:160px;">
              <a href="${item.url}">${item.title} ${volnum}</a>
            </div>
            <div class="conference details">
              <a href="">${item.category}</a>
            </div>
            <div class="conference details">
              ${item.type}
            </div>
            <div class="categories details">
              Quantity: ${item.quantity}
            </div>
          </div>
        </div>`);
    });
    $('#grid_content').html(return_list);
    $("#spinner").hide();
  }



  function changePage(pnum){
    console.log(`current_page:....`);
    console.log(`change page number to ${pnum}`);
  }
  function updateResultsDisplay() {
    console.log();
    // 1. check if list or grid
    // 2. check how many results from state object
    // 3. delete/replace existing html with new results.
    // 4. if changing to grid mode, images should be lazy loaded
  // 5. and a placeholder is substituted to show loading.
  }






  // HINT: Function to change pages

  function changePageResults() {
    // * when new ajax search is warrented this is the function.
    
    const embedded_page_state_object = getState();
    jQuery.ajax({
      type: "post",
      dataType: "json",
      url: ajax_obj.ajaxurl,
      data: {
        action: 'fetch_search_results',
        nonce: ajax_obj.nonce,
        query: embedded_page_state_object,
      },
      beforeSend: function() {
        $("#spinner").show();
        // console.log(ajax_obj);
      },
      success: function(data) {

        // HINT: Updating the global results object for tracking
        $('#results_object').text(JSON.stringify(data));
        
        // HINT: Add in missing bits
        const total_found = getStateItem('total_found');
        const current_page = getStateItem('page');
        const per_page = getStateItem('perpage');
        let count = 0;
        if (total_found > 0){
          count = total_found/Number(per_page);
        }
        count = ~~count;
        const display_page_count = `${current_page} / ${count}`;
        $('#page_counter').text(display_page_count);
        
        console.log(data.data);
        if (getStateItem('mode') == 'list') {
          rebuildTable(data);
        }
        if (getStateItem('mode') == 'grid') {
          rebuildGrid(data);
        }
      },
    })
  }
  
  function initialResults() {
    // initialize search results.
    jQuery.ajax({
      type: "post",
      dataType: "json",
      url: ajax_obj.ajaxurl,
      data: {
        action: 'fetch_search_results',
        nonce: ajax_obj.nonce,
        query: ajax_obj.query_state,
      },
      beforeSend: function() {
        $("#spinner").show();
      },
      success: function(data) {

        // HINT: Updating the global results object for tracking
        $('#results_object').text(JSON.stringify(data));
        
        // HINT: Add in missing bits
        const total_found = Number(data.data[0]['total_found']);
        ajax_obj.query_state.total_found = total_found;
        
        const current_page = ajax_obj.query_state['page'];
        const per_page = ajax_obj.query_state['perpage'];
        let count = 0;
        if (total_found > 0){
          count = total_found/Number(per_page);
          console.log(count);
        }
        // count = Math.round(count);
        ajax_obj.query_state.lastpage = count;
        ajax_obj.query_state.firstpage = 1;
        $('#state_object').text(JSON.stringify(ajax_obj.query_state));

        const display_page_count = `${current_page} / ${count}`;
        $('#page_counter').text(display_page_count);

        
        console.log(data.data);
        if (ajax_obj.query_state.mode == 'list') {
          rebuildTable(data);
        }
        if (ajax_obj.query_state.mode == 'grid') {
          rebuildGrid(data);
        }
      },
    })
  }
  
  initialResults();




// NOTE: The state utility functions

  function getState() {
    const st = JSON.parse($("#state_object").text());
    return st;
  }
  
  function getStateItem(key) {
    const st = JSON.parse($("#state_object").text());
    return st[key];
  }

  function setState(data, trigger = true) {
    let st_obj = $("#state_object");
    st_obj.text(JSON.stringify(data));
    if (trigger == true) {
      st_obj.trigger('change');
    }
  }

  function setStateItem(key, value, trigger = true) {
    let st = getState();
    st[key] = value;
    let st_obj = $("#state_object");
    st_obj.text(JSON.stringify(st));
    if (trigger == true) {
      st_obj.trigger('change');
    }
  }


  //  NOTE:  Bindings to buttons and changes

  //  "pod": "archive_inventory",
  //  "mode": "list",
  //  "perpage": "15",
  //  "page": "1",
  //  "search": "false",
  //  "pagination": "true",
  //  "orderby": "inventory_year DESC"

  // NOTE:  Button bindings
  
  $('#list-button').bind('click', function() {
    st = getState();
    console.log(st);
    if (st.mode != 'list') {
      setStateItem('mode', 'list');
    }
  });
  
  $('#grid-button').bind('click', function() {
    st = getState();
    if (st.mode != 'grid') {
      setStateItem('mode', 'grid');
      console.log(st);
    }
  });
  // session = getState();
  // let list = new DisplayButtonHandler( "list-button", "list", session );
  // let grid = new DisplayButtonHandler( "grid-button", "grid", session );

  // NOTE: Dropdown binding

  $("#current-per-page").bind('dropDownEvent', function() {
    let newValue = this.textContent;
    console.log(this);
    setStateItem('perpage', newValue);
  });


  // NOTE: Bottom buttons bindings

  $('#goto_firstpage_button').bind('click', function() {
    st = getState();
    if (st.firstpage != st.page) {
      setStateItem('page', getState().firstpage);
    }
  });

  $('#goto_lastpage_button').bind('click', function() {
    st = getState();
    if (st.lastpage != st.page) {
      setStateItem('page', getState().lastpage);
    }
  });
  
  $('#back_onepage_button').bind('click', function() {
    st = getState();
    if (st.firstpage != st.page) {
    }
    back_page = Math.max(1, Number(st.page) - 1);
    setStateItem('page', back_page);
  });

  $('#forward_onepage_button').bind('click', function() {
    st = getState();
    st.lastpage
    st.page;
    forward_page = Math.min(Number(st.lastpage), Number(st.page) + 1);
    setStateItem('page', forward_page);
  });


  // Monitor changes in state object
  $('#state_object').bind('change', function() {
    console.log('standin for update function.', getState());
    changePageResults();
  });


  // setStateItem('mode', 'grid');
  // NOTE: Get the element
  let rpp_amt_hidden = document.getElementById("rpp_amt");

  // FUNC: Event listener for the dropdown results per-page
  rpp_amt_hidden.addEventListener('input', function (e) { console.log(e) });

})



// console.log(rpp_amt_hidden.value);
  // function old(){
  // $.ajax({
    // type: "post",
    // dataType: "json",
    // url: ajax_obj.ajaxurl,
    // data: {
    //   action: 'fetch_search_results',
    //   nonce: ajax_obj.nonce,
    //   query: ajax_obj.query_state,
    // },
    // beforeSend: function(data) {
    //   console.log(ajax_obj);
    // },
    // success: function(data) {
    //     let return_list = [];
    //     $.each(data.data, function(index, item) {
    //       let volnum = "";
    //       if (item.volume.length>0) {
    //         if (item.number.length>0){
    //           volnum = `(Vol. ${item.volume}, No. ${item.number})`;
    //         }
    //       }
        //   return_list.push(
        //     `<tr>
        //       <td style="text-align: center;">${item.year}</td>
        //       <td style="text-align: left;"><b><a href="${item.url}">${item.title} ${volnum}</a><b></td>
        //       <td style="text-align: center;">${item.category}</td>
        //       <td style="text-align: center;"></td>
        //       <td>${item.type}</td>
        //       <td style="text-align: center;">${item.quantity}</td>
        //     </tr>`);
        // });
        //
        // // TODO: replace header in the table
        //
        // $('#table-header').replaceWith(`
        //   <thead>
        //     <tr>
        //       <th>Year</th> <th style="text-align: left;">Title</th> <th>Category</th> <th></th> <th style="text-align: left;">Item Type</th> <th>Quantity</th>
        //     </tr>
        //   </thead>
        //   `);
        //
        // // TODO: generate results for page 1
        
        // $('#search-results').html(return_list);
        // $('#data-display')
    //   }
    // });
