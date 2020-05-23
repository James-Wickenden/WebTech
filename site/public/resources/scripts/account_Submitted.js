"use strict";

const statusMode = {
    ERROR: 0,
    SUCCESS: 1,
    MISSING_USERNAME: 2,
    MISSING_PASSWORD: 3,
    PASSWORD_MISMATCH: 4,
    USERNAME_TAKEN: 5,
    MISSING_FIELD: 6
};

addEventListener('load', initHandler);

function initHandler() {
  let form = document.getElementById("account_form");
  function handleForm(event) { addNewUser(event); };
  form.addEventListener('submit', handleForm);
};

async function addNewUser(event) {
  event.preventDefault();

  let form = document.getElementById('account_form');
  let l_status = document.getElementById('l_status');

  let all_fields_filled = true;

  if (form['l_username'].value == '') {
    all_fields_filled = false;
    handleStatusLabel(statusMode.MISSING_USERNAME);
  }
  else if (form['l_password_1'].value == '') {
    all_fields_filled = false;
    handleStatusLabel(statusMode.MISSING_PASSWORD);
  }
  else if (form['l_password_2'].value == '') {
    all_fields_filled = false;
    handleStatusLabel(statusMode.MISSING_PASSWORD);
  }
  else if (form['l_password_1'].value != form['l_password_2'].value) {
    all_fields_filled = false;
    handleStatusLabel(statusMode.PASSWORD_MISMATCH);
  };

  if (!all_fields_filled) return;

  updateStatusLabel(false, "")
  console.log("Submitting new user data to server for validation and account creation...")

  requestNewAccount(form['l_username'].value, form['l_password_1'].value);
};

function handleStatusLabel(status) {
  switch (parseInt(status[0])) {
    case statusMode.SUCCESS: {
      updateStatusLabel(true, "Account registered successfully!");

      let my_id = parseInt(status.split("&")[1].split("=")[1]);
      let sessionkey = parseInt(status.split("&")[2].split("=")[1]);
      sessionStorage.setItem("user_id", my_id);
      sessionStorage.setItem("sessionkey", sessionkey);
      window.location = "/home";
      break;
    }
    case statusMode.MISSING_USERNAME: {
      updateStatusLabel(false, "Please fill out the Username field.");
      break;
    }
    case statusMode.MISSING_PASSWORD: {
      updateStatusLabel(false, "Please fill out the Password fields.");
      break;
    }
    case statusMode.PASSWORD_MISMATCH: {
      updateStatusLabel(false, "Password fields do not match.");
      break;
    }
    case statusMode.USERNAME_TAKEN: {
      updateStatusLabel(false, "That username is already taken.");
      break;
    }
    case statusMode.MISSING_FIELD: {
      updateStatusLabel(false, "One or more required fields are missing.");
      break;
    }
    default: {
      updateStatusLabel(false, "There was an error in the form submission.");
      break;
    }
  };
};

function updateStatusLabel(success, message) {
  let l_status = document.getElementById('l_status');

  if (success == true)  l_status.setAttribute("style", "color: green;");
  if (success == false) l_status.setAttribute("style", "color: red;");
  l_status.innerHTML = message;
}

async function requestNewAccount(username, password) {

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receive(this);
    }
  };
  xhttp.open("POST", "/post/newuser", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send(getParams(username, password));

  updateStatusLabel(false, "");
};

function getParams(username, password) {
  let res = "name=";
  res += username;
  res += "&pass=";
  res += password;

  return res;
}

async function receive(response) {
  console.log(response.responseText);
  handleStatusLabel(response.responseText);
};
