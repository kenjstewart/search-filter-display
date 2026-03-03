// NOTE: working document




inventory_all = "wp/v2/archive_inventory/";
inventory_item = "wp/v2/archive_inventory/209515/";
inventory_types = "wp/v2/types/archive_inventory/";
featured_media = "wp/v2/media/125744/";

let novel_query = {

};


async function getFromEndpoint(url, filter = null) {
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
    results_obj = {total, pages, results};

  } catch (err) {
    console.error('fetch error:', err);
  }
}




// NOTE: define which fields are needed to display in the table
// 	 also add functions for constructing the query and adding
// 	 filters to the results.

const _default = {
  pagenum: 1,
  per_page: 10,
  filt: '',
  fields: [
  'id',
  'type',
  'link',
  'inventory_title',
  'inventory_image-one',
  'inventory_item_main_type',
  'inventory_item_type',
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
    return ( item.rel === 'https://api.w.org/' );
    });
    var api_root = link[0].href;
    this.endpoint = `${api_root}${e}`;
  },

  queryCompile: function () {
    let comp = `${this.endpoint}?${this.filt}_embed&${this.fields.join(',')}&per_page=${this.per_page}&page=${this.pagenum}`;
    console.log({comp});
    return comp;
  },
  
  addFilter: function (key, val) {
    if (this.filt == '') { 
      this.filt += `filter[meta_key]=${key}&filter[meta_value]=${val}&`;
    } else {
      this.filt += `filter[meta_key]=${key}&filter[meta_value]=${val}&`;
    }
  },

  clearFilter: function () {
    this.filt = '';
  }
}




_default.pagenum = 1;
_default.setEndpoint(inventory_all)
// console.log(_default.queryCompile());

let results_obj;
getFromEndpoint(_default.queryCompile());
displayResults();




const container = document.getElementById('container');
var filter = document.getElementById('filter_select');

filter.addEventListener('change', function(e){
  
  // reactive change of the filter (naieve implementation)
  _default.clearFilter();
  let s = filter.options[filter.selectedIndex].text;
  console.log(s); 
  if (s == "Collectibles") {
    _default.addFilter('inventory_item_main_type', 17269);
  } else if (s == "Publications") { 
    _default.addFilter('inventory_item_main_type', 17270);
  } else {
    _default.clearFilter();
  }
  _default.pagenum = 1;
  _default.setEndpoint(inventory_all)
  
  console.log(_default.queryCompile());

  let results_obj;
  getFromEndpoint(_default.queryCompile());
  displayResults();
  
});





function displayResults() {
  // NOTE: workaround for async update

  var interval = setInterval(function() {  

    if (results_obj) {
      console.log(results_obj);
      clearInterval(interval);
      container.innerHTML = '';
      results_obj.results.forEach(function(item) {
		
	let new_div = document.createElement("div"); // wrapper
	let new_img = document.createElement("img"); // image
	new_img.src = item['inventory_image-one'].guid; // url
	new_img.setAttribute('style', 'width: 100px; height: 100px; object-fit: cover; object-position: 50% 0%;'); // fit the image thumb
       
	// NOTE: Handle the types
	const category = item.inventory_item_main_type;
	let item_type = "";
	if (category == "Publications") {
	   item_type = item.inventory_publication_type;
	} else if (category == "Collectibles") {
	   item_type = item.inventory_collectible_type;
	}
	// HINT: if theres an array object...
	if (item_type instanceof Array) {
	  item_type = item_type.join(', ')
	}
	new_div.innerHTML = `<p>${item.inventory_year} | ${category} | ${item.inventory_title} | ${item_type}</p>`;
	const amount_badge = document.createElement('span');
	amount_badge.setAttribute('class', 'simpui-badge danger sm');
	amount_badge.textContent = `${item.inventory_total_number_of_item}`;
	new_div.append(amount_badge);
	// new_div.append(new_img);
	container.append(new_div); 
      });
    }  }, 500);
	results_obj = null;
}

console.log('end');

