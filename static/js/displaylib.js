import {getState, getStateItem, setState, setStateItem, setResults, getResults } from './statelib.js';

var jQuery = window.jQuery;
var $ = jQuery;
  

export function rebuildTable(data) {
    console.log('rebuild table called');
    $('#grid_content').hide()
    $('#grid_content').html("")
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

    // loop through the items
    $.each(data, function(idx, item) {
      // console.log(index); 
      let category = item.category;
      let volnum = "";
      if (category == "Publications") {
        if (item.volume.length>0) {
          if (item.number.length>0){
            volnum = `(Vol. ${item.volume}, No. ${item.number})`;
          }
        }
      }

      let quantity = Number(item.amount) ?? 0;
      let quant_display = "";
      if (quantity<3){
        quant_display = `<span class="simpui-badge danger sm">${quantity}</span>`;
      } else if (quantity>15) { 
        quant_display = `<span class="simpui-badge success sm">${quantity}</span>`;
      } else {
        quant_display = `<span class="simpui-badge subtle sm">${quantity}</span>`;
      }

      // console.log( idx, item );
      let sub_type = item.item_type;

      return_list.push(
        `<tr data-id="${item.id}">
          <td style="text-align: center;">${item.year}</td>
          <td style="text-align: left;"><b><a href="${item.url}">${item.title} ${volnum}</a><b></td>
          <td style="text-align: center;">${category}</td>
          <td style="text-align: center;"></td>
          <td>${sub_type}</td>
          <td style="text-align: center;">${quant_display}</td>
        </tr>`);
    });
    $('#custom_search_results').html(return_list);
    $("#spinner").hide();
  }




  // NOTE: Grid
  export function rebuildGrid(data) {
    console.log('rebuild grid called');

    $('#table-header').hide();
    $('#custom_search_results').hide();
    $('#custom_search_results').html("");
    // ------------------------
    $('#main_table').hide();
    $('#grid_content').show()

    const res_obj = getResults();
    let return_list = [];

    $.each(data, function(idx, item) {
      let category = item.category;
      let th_volnum = "";
      if (category == "Publications") {
        if (item.volume.length>0) {
          if (item.number.length>0){
            th_volnum = `(Vol. ${item.volume}, No. ${item.number})`;
          }
        }
      }
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
      
      let quantity = Number(item.amount) ?? 0;
      let quant_display = "";
      if (quantity<3){
        quant_display = `<span class="simpui-badge danger sm">${quantity}</span>`;
      } else if (quantity>15) { 
        quant_display = `<span class="simpui-badge success sm">${quantity}</span>`;
      } else {
        quant_display = `<span class="simpui-badge subtle sm">${quantity}</span>`;
      }

      // console.log( idx, item );
      let sub_type = item.item_type;

          // ${conflabel}
      return_list.push(
        `<div class="short summary-card-wrapper" style="height: 265px; overflow: visible; position: relative;">
          <div class="summary-card" style="overflow: hidden;">
            <div class="thumbnail" style="position: relative;">
              <a href="${item.url}" class="hasimg" title="">
                <img decoding="async" loading="lazy" width="150" height="150" src="${item.image}" class="attachment-thumbnail size-thumbnail" alt="${item.title}" style="${image_style}">
              </a>
            </div>
            
            <div class="title" style="height: 55px; overflow: hidden;">
              <a href="${item.url}">${item.title} ${th_volnum}</a>
            </div>
            <div class="conference details">
              <a href="">${item.category}</a> | ${sub_type}
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

