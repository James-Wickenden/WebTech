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

  // TODO:
  //  send form data to server.js
  //  perform all validation and database handling server-side for security
  //  then get back status code for client response
  //
  //  e.g. status = server.handle(form);

  fetchData();

  switch (status) {
    case 1: {
      updateStatusLabel(l_status, true, "Account registered successfully!");
      break;
    }
    case 2: {
      updateStatusLabel(l_status, false, "Please fill out the Username field.");
      break;
    }
    case 3: {
      updateStatusLabel(l_status, false, "Please fill out the Password fields.");
      break;
    }
    case 4: {
      updateStatusLabel(l_status, false, "Password fields do not match.");
      break;
    }
    case 5: {
      updateStatusLabel(l_status, false, "That username is already taken.");
      break;
    }
    default: {
      updateStatusLabel(l_status, false, "There was an error in the form submission.");
      break;
    }
  };

};

function updateStatusLabel(l_status, success, message) {
  if (success == true)  l_status.setAttribute("style", "color: green;");
  if (success == false) l_status.setAttribute("style", "color: red;");
  l_status.innerHTML = message;
}

async function fetchData() {
  console.log("Submitting");
  await fetch("/data").then(receive);
};

async function receive(response) {
  console.log(response);
  console.log(response.responseText);
};
