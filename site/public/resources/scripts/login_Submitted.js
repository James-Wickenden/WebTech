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
  let l_status = document.getElementById('l_status');

  console.log("Submitting login data to server for validation...")

  if (form['l_username'].value == '' || form['l_password'].value == '') {
    unsuccessful(l_status);
    return;
  };

  l_status.innerHTML = "";
  requestLogin(form['l_username'].value, form['l_password'].value);
};

function unsuccessful(l_status) {
  l_status.setAttribute("style", "color: red;");
  l_status.innerHTML = "Username or password was incorrect.";
};

function successful(l_status) {
  l_status.setAttribute("style", "color: green;");
  l_status.innerHTML = "Login successful.";
};

async function requestLogin(username, password) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receive(this);
    }
  };
  xhttp.open("POST", "/post/login", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send(getParams(username, password));
};

function getParams(username, password) {
  let res = "name=";
  res += username;
  res += "&pass=";
  res += password;

  return res;
}

async function receive(response) {
  //console.log(response);
  //console.log(response.responseText);
  let l_status = document.getElementById('l_status');
  if (response.responseText == "false") return unsuccessful(l_status);
  window.location = "/home";
};
