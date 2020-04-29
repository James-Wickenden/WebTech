"use strict";

addEventListener('load', initHandler);

function initHandler() {
  let form = document.getElementById("upload_form");
  function handleForm(event) { login(event); };
  form.addEventListener('submit', handleForm);
};

async function login(event) {
  event.preventDefault();

  let form = document.getElementById('upload_form');
  let status = 0;
  let l_status = document.getElementById('l_status');

  if (!allFieldsFilled(form)) {
    updateStatusLabel(l_status, false, "One or more required fields are missing.")
    return;
  };

  console.log("Submitting login data to server for validation...")

  // TODO:
  //  send form data to server.js
  //  perform all validation and database handling server-side for security
  //  then get back status code for client response
  //
  //  e.g. status = server.handle(form);

  if (status == 1) {
    updateStatusLabel(l_status, true, "Upload submitted successfully!");
  }
  else {
    updateStatusLabel(l_status, false, "There was an error in the form submission.");
  };
};

function updateStatusLabel(l_status, success, message) {
  if (success == true)  l_status.setAttribute("style", "color: green;");
  if (success == false) l_status.setAttribute("style", "color: red;");
  l_status.innerHTML = message;
}

function allFieldsFilled(form) {
  
  switch(form["s_cats"].value) {
    case "o_map": {
      if (form["s_name_map"].value == '') return false;
      //if (form["s_file_map"].value == '') return false;
      if (form["s_desc_map"].value == '') return false;
      //if (form["s_screenshots_map"].value == '') return false;
      //if (form["s_tags_map"].value == '') return false;
      break;
    }
    case "o_config": {
      if (form["s_name_config"].value == '') return false;
      //if (form["s_file_config"].value == '') return false;
      if (form["s_desc_config"].value == '') return false;
      //if (form["s_tags_config"].value == '') return false;
      break;
    }
    case "o_model": {
      if (form["s_name_model"].value == '') return false;
      //if (form["s_file_model"].value == '') return false;
      if (form["s_desc_model"].value == '') return false;
      //if (form["s_screenshots_model"].value == '') return false;
      //if (form["s_tags_model"].value == '') return false;
      break;
    }
    case "o_other": {
      if (form["s_name_other"].value == '') return false;
      if (form["s_cat_other"].value == '') return false;
      //if (form["s_file_other"].value == '') return false;
      if (form["s_desc_other"].value == '') return false;
      //if (form["s_tags_other"].value == '') return false;
      break;
    }
    default: {
      console.log("Unselected submission type");
      break;
    }
  };

  return true;
};
