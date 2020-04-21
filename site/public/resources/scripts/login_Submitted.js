"use strict";

addEventListener('load', initHandler);

function initHandler() {
  let form = document.getElementById("account_form");
  function handleForm(event) { login(event); };
  form.addEventListener('submit', handleForm);
};

async function login(event) {
  event.preventDefault();

  let form = document.getElementById('account_form');
  let success = false;
  let l_status = document.getElementById('l_status');

  console.log("Submitting login data to server for validation...")

  // TODO:
  //  send form data to server.js
  //  perform all validation and database handling server-side for security
  //  then get back status code for client response
  //
  //  e.g. status = server.handle(form);

  if (!success) {
    l_status.setAttribute("style", "color: red;");
    l_status.innerHTML = "Username or password was incorrect.";
  }
};
