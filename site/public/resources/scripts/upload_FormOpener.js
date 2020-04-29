"use strict";
console.log("starting");

function formatCategory() {

  hideAllForms();

  switch (document.getElementById('s_cats').value) {
    case "o_map": {
      console.log("Loading Map upload template")
      unhideForm('t_map');
      break;
    }
    case "o_config": {
      console.log("Loading Config upload template")
      unhideForm('t_config');
      break;
    }
    case "o_model": {
      console.log("Loading Model upload template")
      unhideForm('t_model');
      break;
    }
    case "o_other": {
      console.log("Loading Other upload template")
      unhideForm('t_other');
      break;
    }
    default: {
      console.log("Closing Form Templates")
      hideAllForms();
      break;
    }
  };

};

function hideAllForms() {
  document.getElementById('l_status').innerHTML = "";
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
