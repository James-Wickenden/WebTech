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

  console.log("Submitting user data to server for validation and account creation...")
  
  // TODO:
  //  send form data to server.js
  //  perform all validation and database handling server-side for security
  //  then get back status code for client response
  //
  //  e.g. status = server.handle(form);

  if (status == 1) {
    updateStatusLabel(l_status, true, "Account registered successfully!");
  }
  else if (status == 2) {
    updateStatusLabel(l_status, false, "Please fill out the Username field.");
  }
  else if (status == 3) {
    updateStatusLabel(l_status, false, "Please fill out the Password fields.");
  }
  else if (status == 4) {
    updateStatusLabel(l_status, false, "Password fields do not match.");
  }
  else if (status == 5) {
    updateStatusLabel(l_status, false, "That username is already taken.");
  };
};

function updateStatusLabel(l_status, success, message) {
  if (success == true)  l_status.setAttribute("style", "color: green;");
  if (success == false) l_status.setAttribute("style", "color: red;");
  l_status.innerHTML = message;
}
