// state.js - data-ui handler
// ken Stewart
// 2026


// NOTE: each entry should consist of the max info required for either grid/list

// CLASS: Handle interactivity on button
//        ------------------------------
class ButtonHandler {
  constructor(element_name, mode, sto) { 
    this.mode = mode;
    this.element_name = element_name;
    this.sto = sto;
    this.element = document.getElementById(element_name);
    this.element.addEventListener('click', this.handler);
  }
  // FUNC: Handler function
  //       ----------------
  handler = () => {
    this.sto.mode = this.mode;
    console.log(this.sto);
  }
}



// MAIN: Init the session, and add button handler
//       ----------------------------------------
const session = { 
  display: {
    mode: 'list', 
    search: false, 
    filter: false, 
    per_page: true}, 
  current_page: 1,
  query: 'archive_inventory',
  
};

let list = new ButtonHandler( "list-button", "list", session );
let grid = new ButtonHandler( "grid-button", "grid", session );



// NOTE: Get the element
let rpp_amt_hidden = document.getElementById("rpp_amt");



// FUNC: Event listener for the dropdown results per-page
//       ------------------------------------------------
rpp_amt_hidden.addEventListener('input', function (e) {
  console.log(e);
});



// TODO: Write handler for the Filter button and the search function
console.log(rpp_amt_hidden.value);

