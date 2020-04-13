"use strict";
console.log("starting");

function formatCategory() {
  hideAllForms();
  if (document.getElementById('s_cats').value == "o_map") {
    console.log("Loading Map upload template")
    unhideForm('t_map');
  }
  else if (document.getElementById('s_cats').value == "o_config") {
    console.log("Loading Config upload template")
    unhideForm('t_config');
  }
  else if (document.getElementById('s_cats').value == "o_model") {
    console.log("Loading Model upload template")
    unhideForm('t_model');
  }
  else if (document.getElementById('s_cats').value == "o_other") {
    console.log("Loading Other upload template")
    unhideForm('t_other');
  }
  else {
    console.log("Closing Form Templates")
    hideAllForms();
  }
};

function hideAllForms() {
  document.getElementById('t_map').setAttribute("style", "display: none;");
  document.getElementById('t_config').setAttribute("style", "display: none;");
  document.getElementById('t_model').setAttribute("style", "display: none;");
  document.getElementById('t_other').setAttribute("style", "display: none;");
  document.getElementById('but_submit').setAttribute("style", "display: none;");
};

function unhideForm(category) {
  document.getElementById(category).setAttribute("style", "display: block;");
  document.getElementById('but_submit').setAttribute("style", "display: block;");
};
