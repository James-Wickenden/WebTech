"use strict";

addEventListener('load', initHandler);

function initHandler() {
  let form = document.getElementById("account_form");
  function handleForm(event) { addNewUser(event); };
  form.addEventListener('submit', handleForm);
};

async function addNewUser(event) {
   event.preventDefault();
   console.log("Attempting to find existing user with that name...");
   
 };
