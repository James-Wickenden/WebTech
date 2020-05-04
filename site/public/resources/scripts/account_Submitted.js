"use strict";

addEventListener('load', initHandler);

function initHandler() {
  let form = document.getElementById("account_form");
  function handleForm(event) { addNewUser(event); };
  form.addEventListener('submit', handleForm);
};

async function addNewUser(event) {
  event.preventDefault();

  let form = document.getElementById('account_form');
  let status = 0;
  let l_status = document.getElementById('l_status');

  let all_fields_filled = true;

  if (form['l_username'].value == '') {
    //all_fields_filled = false;
  }
  else if (form['l_password_1'].value == '') {
    //all_fields_filled = false;
  }
  else if (form['l_password_2'].value == '') {
    //all_fields_filled = false;
  };

  if (!all_fields_filled) {
    updateStatusLabel(l_status, false, "One or more required fields are missing.")
    return;
  };

  updateStatusLabel(l_status, false, "")
  console.log("Submitting user data to server for validation and account creation...")

  requestNewAccount();
};

function handleStatusLabel(status) {
  switch (status) {
    case 1: {
      updateStatusLabel(true, "Account registered successfully!");
      break;
    }
    case 2: {
      updateStatusLabel(false, "Please fill out the Username field.");
      break;
    }
    case 3: {
      updateStatusLabel(false, "Please fill out the Password fields.");
      break;
    }
    case 4: {
      updateStatusLabel(false, "Password fields do not match.");
      break;
    }
    case 5: {
      updateStatusLabel(false, "That username is already taken.");
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

async function requestNewAccount() {
  console.log("Submitting");

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receive(this);
    }
  };
  xhttp.open("POST", "/post/newuser", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send(getParams());

  handleStatusLabel(0);
};

function getParams() {
  return "name=test1&pass=test2";
}

async function receive(response) {
  console.log(response);
  console.log(response.responseText);
};
