"use strict";

addEventListener('load', initFormOpener);

function initFormOpener() {
  console.log("Loading FormOpener...");

  let user_id = sessionStorage.getItem("user_id");
  if (user_id === null) user_id = -1;
  if (user_id == -1) notLoggedIn();

  let type = window.location.href.split("/").pop();
  if (type == "map" || type == "config" || type == "model" || type == "other") {
      document.getElementById('s_cats').value = "o_" + type;
  };
  formatCategory();
}

function formatCategory() {
  hideAllForms();

  let div_id = "t_" + document.getElementById('s_cats').value.split("_").pop();
  console.log("Loading upload template: " + div_id);
  unhideForm(div_id);
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
  if (category == "t_default") return;
  document.getElementById(category).setAttribute("style", "display: block;");
  document.getElementById('but_submit').setAttribute("style", "display: block;");
};

function notLoggedIn() {
  //document.getElementById("upload_form").setAttribute("style", "display: none;");
  document.getElementById("upload_form").innerHTML = "<p style='color:red'>You must be logged in to upload.</p>";
};
