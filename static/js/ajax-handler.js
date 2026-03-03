


jQuery(document).ready(function($) {
  console.log('rest search triggered');

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
    
    const res_obj = getResults();
    let return_list = [];
    $.each(res_obj, function(index, item) {
      let volnum = "";
      if (item.volume.length>0) {
        if (item.number.length>0){
          volnum = `(Vol. ${item.volume}, No. ${item.number})`;
        }
      }

      let quantity = Number(item.quantity) ?? 0;
      let quant_display = "";
      if (quantity<3){
        quant_display = `<span class="simpui-badge danger sm">${item.quantity}</span>`;
      } else if (quantity>15) { 
        quant_display = `<span class="simpui-badge success sm">${item.quantity}</span>`;
      } else {
        quant_display = `<span class="simpui-badge subtle sm">${item.quantity}</span>`;
      }


      return_list.push(
        `<tr data-id="${item.id}">
          <td style="text-align: center;">${item.year}</td>
          <td style="text-align: left;"><b><a href="${item.url}">${item.title} ${volnum}</a><b></td>
          <td style="text-align: center;">${item.category}</td>
          <td style="text-align: center;"></td>
          <td>${item.type}</td>
          <td style="text-align: center;">${quant_display}</td>
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

    const res_obj = getResults();
    let return_list = [];
    $.each(res_obj, function(index, item) {
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
      
      let image_style = "object-fit: contain; object-position: 50% 0%;";

      let volnum = "";
      if (item.volume.length>0) {
        if (item.number.length>0){
          volnum = `Vol. ${item.volume}, No. ${item.number}`;
        }
      }
      
      let quantity = Number(item.quantity) ?? 0;
      let quant_display = "";
      if (quantity<3){
        quant_display = `<span class="simpui-badge danger sm">${item.quantity}</span>`;
      } else if (quantity>15) { 
        quant_display = `<span class="simpui-badge success sm">${item.quantity}</span>`;
      } else {
        quant_display = `<span class="simpui-badge subtle sm">${item.quantity}</span>`;
      }

      // ${conflabel}
      return_list.push(
        `<div class="short summary-card-wrapper" style="height: 265px; overflow: visible; position: relative;">
          <div class="summary-card" style="overflow: hidden;">
            <div class="thumbnail" style="position: relative;">
              <a href="${item.url}" class="hasimg" title="">
                <img decoding="async" loading="lazy" width="150" height="150" src="${item.image_one}" class="attachment-thumbnail size-thumbnail" alt="${item.title}" style="${image_style}">
              </a>
            </div>
            
            <div class="title" style="height: 55px; overflow: hidden;">
              <a href="${item.url}">${item.title} ${volnum}</a>
            </div>
            <div class="conference details">
              <a href="">${item.category}</a> | ${item.type}
            </div>
            <div class="categories details" style="display: flex; flex-direction: row; justify-content: flex-end; position: absolute; bottom: 4px; right: 4px; z-index: 500">
              <div style="width: fit-content;">Quantity: ${quant_display}</div>
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
      timeout: 5000,
      data: {
        action: 'fetch_search_results',
        query: embedded_page_state_object,
      },
      beforeSend: function() {
        $("#spinner").show();
        // console.log(ajax_obj);
      },
      success: function(data) {

        // HINT: Updating the global results object for tracking
        $('#results_object').text(JSON.stringify(data.data.results));
        
        // HINT: Add in missing bits
        const total_found = getStateItem('total_found') ?? 0;
        const current_page = getStateItem('page');
        const per_page = getStateItem('perpage');
        let count = 0;
        if (total_found > 0){
          count = total_found/Number(per_page);
        }
        
        // $('#state_object').text(JSON.stringify(ajax_obj.query_state));
        
        count = ~~count;
        const display_page_count = `${current_page} / ${count}`;
        $('#page_counter').text(display_page_count);
        
        console.log(data.data);
        if (getStateItem('mode') == 'list') {
          rebuildTable(data.data.results);
        }
        if (getStateItem('mode') == 'grid') {
          rebuildGrid(data.data.results);
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
      timeout: 5000,
      data: {
        action: 'fetch_search_results',
        query: ajax_obj.query_state,
      },
      beforeSend: function() {
        $("#spinner").show();
      },
      success: function(data) {
        console.log(data);
        // HINT: Updating the global results object for tracking
        $('#results_object').text(JSON.stringify(data.data.results));
        
        // HINT: Add in missing bits

        let tf = Object.hasOwn(data.data.context, 'total_found');
        if (tf) {
          let td = data.data.context['total_found'];
          console.log(`total_found exists? ${tf} ${td}`);
        }
        if (tf) { 
          let count = 0;
          const total_found = Number(data.data.context['total_found']) ?? 1;
          ajax_obj.query_state.total_found = total_found;
          
          const current_page = ajax_obj.query_state['page'];
          const per_page = ajax_obj.query_state['perpage'];
          if (total_found > 0){
            count = total_found/Number(per_page);
          }
          
          count = ~~count;
          ajax_obj.query_state.lastpage = count;
          ajax_obj.query_state.firstpage = 1;
          $('#state_object').text(JSON.stringify(ajax_obj.query_state));

          const display_page_count = `${current_page} / ${count}`;
          $('#page_counter').text(display_page_count);
        
        }
          
        if (ajax_obj.query_state.mode == 'list') {
          rebuildTable(data.data.results);
        }
        if (ajax_obj.query_state.mode == 'grid') {
          rebuildGrid(data.data.results);
        }
      },
    }).fail(function (response, textStatus, err) {
      console.log(response, textStatus, err);
    });;
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

  function getResults() {
    const res = JSON.parse($("#results_object").text());
    return res;
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

  // NOTE: Dropdown binding

  $("#current-filter").bind('dropDownEvent', function() {
    let newValue = this.textContent;
    console.log(this);
    setStateItem('filter', newValue);
  });

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
    console.log('state change:', getState());
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
