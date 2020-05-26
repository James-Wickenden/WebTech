"use strict";

addEventListener('load', initHandler);

var currentFormFields;
var form;

// This is a script that handles clientside validation of an upload form, then submitting the form fields.
// If successful, a key is returned and it is used to submit the file data- the file and any screenshots.
// Serverside validation is also done as with any submission on the site.

function initHandler() {
  form = document.getElementById("upload_form");
  function handleForm(event) { submitForm(event); };
  form.addEventListener('submit', handleForm);
};

// Sets up the currentFormFields object which contains all the selected fields for that category.
// Then validates the fields and requests a submission.
async function submitForm(event) {
  event.preventDefault();

  if (!allFieldsFilled()) {
    updateStatusLabel(false, "One or more required fields are missing.")
    return;
  };

  console.log("Submitting file submission to server for validation...")
  updateStatusLabel(false, "")

  let cat_ext = form["s_cats"].value.split("_").pop();
  currentFormFields = {};

  currentFormFields.name = form["s_name_" + cat_ext].value;
  currentFormFields.file = form["s_file_" + cat_ext].files[0];
  currentFormFields.desc = form["s_desc_" + cat_ext].value;
  currentFormFields.category = form["s_cats"].value;
  currentFormFields.other_cat = form["s_cats_other"].value;
  currentFormFields.scsh_files = parseMultipleFileNames(form["s_scsh_" + cat_ext]);
  console.log(currentFormFields);

  requestFileSubmission();
};

// Updates the status label for user feedback
function updateStatusLabel(success, message) {
  let l_status = document.getElementById('l_status');
  if (success == true)  l_status.setAttribute("style", "color: green;");
  if (success == false) l_status.setAttribute("style", "color: red;");
  l_status.innerHTML = message;
}

// Requests a submission of the current form.
async function requestFileSubmission() {
  var xhttp_form = new XMLHttpRequest();
  xhttp_form.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveForm(this);
    }
  };
  xhttp_form.open("POST", "/post/content/form", true);
  xhttp_form.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp_form.send(getParams());

  updateStatusLabel(false, "");
};

// Writes the parameters to the POST request string.
function getParams() {
  let res = "user_id=";
  res += sessionStorage.getItem("user_id");
  res += "&sessionkey=";
  res += sessionStorage.getItem("sessionkey");
  res += "&cate=";
  res += form["s_cats"].value;
  res += getSpecificParams();
  return res;
}

// Writes the files to a FormData object once the request is approved.
function getFormData(key) {
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

  let user_id = sessionStorage.getItem("user_id");
  formData.append("user_id", user_id);
  let sessionkey = sessionStorage.getItem("sessionkey");
  formData.append("sessionkey", sessionkey);

  return formData;
};

// Receives the server response to the upload request.
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

// Receives the server response to the upload.
// On success, redirects to the newly uploaded page.
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

// Sends the formData with the upload key to the server.
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
  let formData = getFormData(key);
  //console.log(formData.get("file"));
  xhttp_data.send(formData);
};

function getSpecificParams() {
  let res = "";
  res += ("&name=" + currentFormFields.name);
  res += ("&file=" + currentFormFields.file.name);
  res += ("&desc=" + currentFormFields.desc);
  res += ("&scsh=" + currentFormFields.scsh_files);
  res += ("&cats=" + currentFormFields.other_cat);

  return res;
};

// Parses the uploaded screenshot filenames into a single string with | delimiters.
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

// Validates the required fields are filled.
function allFieldsFilled() {
  if (!(sessionStorage.getItem("user_id") > 0)) return false;

  if (currentFormFields.name == '') return false;
  if (currentFormFields.file === undefined) return false;
  if (currentFormFields.desc == '') return false;
  if (currentFormFields.category == '') return false;
  if (currentFormFields.other_cat == '' && currentFormFields.category == "o_other") return false;
  if (currentFormFields.scsh_files.split("|").length > 8) return false;

  console.log("All required fields filled.");
  return true;
};
