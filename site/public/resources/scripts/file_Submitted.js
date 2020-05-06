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
    updateStatusLabel(false, "One or more required fields are missing.")
    return;
  };

  console.log("Submitting login data to server for validation...")

  updateStatusLabel(false, "")
  console.log("Submitting new user data to server for validation and account creation...")

  requestFileSubmission(form);
};

function updateStatusLabel(success, message) {
  let l_status = document.getElementById('l_status');
  if (success == true)  l_status.setAttribute("style", "color: green;");
  if (success == false) l_status.setAttribute("style", "color: red;");
  l_status.innerHTML = message;
}

async function requestFileSubmission(form) {

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receive(this);
    }
  };
  xhttp.open("POST", "/post/content", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send(getParams(form));

  updateStatusLabel(false, "");
};

function getParams(form) {
  let res = "userid=";
  res += String(1);
  res += "&cate=";
  res += form["s_cats"].value;
  res += getSpecificParams(form);
  return res;
}

async function receive(response) {
  console.log(response);
  console.log(response.responseText);
};

function getSpecificParams(form) {
  let res = "";

  switch(form["s_cats"].value) {
    case "o_map": {
      res += ("&name=" + form["s_name_map"].value);
      res += ("&file=" + form["s_file_map"].files[0].name);
      res += ("&desc=" + form["s_desc_map"].value);
      res += ("&scsh=" + parseMultipleFileNames(form["s_scsh_map"]));
      //res += ("&tags=" + form["s_tags_map"].value);
      break;
    }
    case "o_config": {
      res += ("&name=" + form["s_name_config"].value);
      res += ("&file=" + form["s_file_config"].files[0].name);
      res += ("&desc=" + form["s_desc_config"].value);
      //res += ("&tags=" + form["s_tags_config"].value);
      break;
    }
    case "o_model": {
      res += ("&name=" + form["s_name_model"].value);
      res += ("&file=" + form["s_file_model"].files[0].name);
      res += ("&desc=" + form["s_desc_model"].value);
      res += ("&scsh=" + parseMultipleFileNames(form["s_scsh_model"]));
      //res += ("&tags=" + form["s_tags_model"].value);
      break;
    }
    case "o_other": {
      res += ("&name=" + form["s_name_other"].value);
      res += ("&cats=" + form["s_cats_other"].value);
      res += ("&file=" + form["s_file_other"].files[0].name);
      res += ("&desc=" + form["s_desc_other"].value);
      //res += ("&tags=" + form["s_tags_other"].value);
      break;
    }
    default: {
      break;
    }
  };
  return res;
};

function parseMultipleFileNames(scsh) {
  let res = "";
  let name = "";
  for (var i = 0; i < scsh.files.length; ++i) {
    name = scsh.files.item(i).name;
    res += name;
    if (i < (scsh.files.length - 1)) res += "|";
  };
  return res;
};

function allFieldsFilled(form) {

  switch(form["s_cats"].value) {
    case "o_map": {
      if (form["s_name_map"].value == '') return false;
      if (form["s_file_map"].value == '') return false;
      if (form["s_desc_map"].value == '') return false;
      if (form["s_scsh_map"].value == '') return false;
      //if (form["s_tags_map"].value == '') return false;
      break;
    }
    case "o_config": {
      if (form["s_name_config"].value == '') return false;
      if (form["s_file_config"].value == '') return false;
      if (form["s_desc_config"].value == '') return false;
      //if (form["s_tags_config"].value == '') return false;
      break;
    }
    case "o_model": {
      if (form["s_name_model"].value == '') return false;
      if (form["s_file_model"].value == '') return false;
      if (form["s_desc_model"].value == '') return false;
      if (form["s_scsh_model"].value == '') return false;
      //if (form["s_tags_model"].value == '') return false;
      break;
    }
    case "o_other": {
      if (form["s_name_other"].value == '') return false;
      if (form["s_cats_other"].value == '') return false;
      if (form["s_file_other"].value == '') return false;
      if (form["s_desc_other"].value == '') return false;
      //if (form["s_tags_other"].value == '') return false;
      break;
    }
    default: {
      console.log("Unselected submission type");
      break;
    }
  };

  console.log("All required fields filled.");
  return true;
};
