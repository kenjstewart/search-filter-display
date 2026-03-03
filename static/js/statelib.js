// NOTE: The state utility functions


var jQuery = window.jQuery;
var $ = jQuery;

/**
 * Function to return state data object.
 * -------------------------------------
 * @param : none
 * @returns {object} State : { pagenum, per_page, show_filter, etc.. }
 */

export function getState() {
  let st = JSON.parse($("#state_object").text());
  return st;
}



export function getStateItem(key) {
  let st = JSON.parse($("#state_object").text());
  return st[key];
}



export function setState(data, trigger = true) {
  let st_obj = $("#state_object");
  st_obj.text(JSON.stringify(data));
  if (trigger == true) {
    st_obj.trigger('change');
  }
}



export function setStateItem(key, value, trigger = true) {
  let st = getState();
  st[key] = value;
  let st_obj = $("#state_object");
  st_obj.text(JSON.stringify(st));
  if (trigger == true) {
    st_obj.trigger('change');
  }
}



export function setResults(data) {
  let st_obj = $("#results_object");
  st_obj.text(JSON.stringify(data));
}



export function getResults() {
  const res = JSON.parse($("#results_object").text());
  return res;
}



export function getFunc(err){
  const called = err?.split('\n')[1]?.trim().split(' ')[1];
  const caller = err?.split('\n')[2]?.trim().split(' ')[1];
  return `${called} called by ${caller}`;
}

