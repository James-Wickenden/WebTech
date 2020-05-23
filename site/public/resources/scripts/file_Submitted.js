"use strict";

addEventListener('load', initHandler);

function initHandler() {
  let form = document.getElementById("upload_form");
  function handleForm(event) { submitForm(event); };
  form.addEventListener('submit', handleForm);
};

async function submitForm(event) {
  event.preventDefault();

  let form = document.getElementById('upload_form');
  let status = 0;
  let l_status = document.getElementById('l_status');

  if (!allFieldsFilled(form)) {
    updateStatusLabel(false, "One or more required fields are missing.")
    return;
  };

  console.log("Submitting file submission to server for validation...")
  updateStatusLabel(false, "")

  requestFileSubmission(form);
};

function updateStatusLabel(success, message) {
  let l_status = document.getElementById('l_status');
  if (success == true)  l_status.setAttribute("style", "color: green;");
  if (success == false) l_status.setAttribute("style", "color: red;");
  l_status.innerHTML = message;
}

async function requestFileSubmission(form) {

  var xhttp_form = new XMLHttpRequest();
  xhttp_form.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveForm(this);
    }
  };
  xhttp_form.open("POST", "/post/content/form", true);
  xhttp_form.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp_form.send(getParams(form));

  updateStatusLabel(false, "");
};

function getParams(form) {
  let res = "user_id=";
  res += sessionStorage.getItem("user_id");
  res += "&cate=";
  res += form["s_cats"].value;
  res += getSpecificParams(form);
  return res;
}

function getFormData(form, key) {
  let formData = new FormData();
  let file;
  let scsh_str = "";
  switch(form["s_cats"].value) {
    case "o_map": file = form["s_file_map"].files[0]; scsh_str = "s_scsh_map"; break;
    case "o_config": file = form["s_file_config"].files[0]; scsh_str = "s_scsh_config"; break;
    case "o_model": file = form["s_file_model"].files[0]; scsh_str = "s_scsh_model"; break;
    case "o_other": file = form["s_file_other"].files[0]; scsh_str = "s_scsh_other"; break;
    default: console.log(form["s_cats"].value); break;
  };

  formData.append("file", file);

  for (var i = 0; i < form[scsh_str].files.length; ++i) {
    if (form[scsh_str].files[i].name != file.name) {
      formData.append("scsh_" + i, form[scsh_str].files[i]);
    };
  };

  let uploadName = form["s_name_map"].value + form["s_name_config"].value + form["s_name_model"].value + form["s_name_other"].value;
  console.log("uploadName=" + uploadName);
  formData.append("uploadName", uploadName);
  formData.append("key", key);
  return formData;
};

async function receiveForm(response) {
  //console.log(response);
  console.log(response.responseText);
  if (response.responseText == "-1") {
    console.log("Upload not approved.");
    updateStatusLabel(false, "The upload was not successful.");
    // TODO: use statuscodes to deliver informative fail messages
  }
  else {
    console.log("Upload approved. Sending data...")
    await sendFormData(response.responseText);
  };
};

async function receiveData(response) {
  if (response.responseText == -1) {
    console.log("Upload not successful.");
    updateStatusLabel(false, "The upload failed due to an unexpected error.");
    // TODO: use statuscodes to deliver informative fail messages
  }
  else {
    console.log("Upload successful.");
    updateStatusLabel(true, "Upload successful!.");
    window.location = "/content/" + response.responseText;
  };
};

async function sendFormData(key) {
  let form = document.getElementById("upload_form");
  //console.log(key);
  var xhttp_data = new XMLHttpRequest();
  xhttp_data.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveData(this);
    }
  };
  xhttp_data.open("POST", "/post/content/data", true);
  //xhttp_data.setRequestHeader("Content-Type", "multipart/form-data");
  let formData = getFormData(form, key);
  //console.log(formData.get("file"));
  xhttp_data.send(formData);
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
      res += ("&scsh=" + parseMultipleFileNames(form["s_scsh_config"]));
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
      res += ("&scsh=" + parseMultipleFileNames(form["s_scsh_other"]));
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
  if (!(sessionStorage.getItem("user_id") > 0)) return false;
  switch(form["s_cats"].value) {
    case "o_map": {
      if (form["s_name_map"].value == '') return false;
      if (form["s_file_map"].value == '') return false;
      if (form["s_desc_map"].value == '') return false;
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
