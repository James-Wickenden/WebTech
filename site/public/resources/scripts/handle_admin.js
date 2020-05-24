"use strict";

addEventListener('load', loadAdminPage);
var user_id, sessionkey;

async function loadAdminPage() {
  user_id = sessionStorage.getItem("user_id");
  if (user_id === null) user_id = -1;
  sessionkey = sessionStorage.getItem("sessionkey");

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveForm(this);
    }
  };
  xhttp.open("POST", "/post/adminpage", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("userid=" + user_id + "&sessionkey=" + sessionkey);
};

async function receiveForm(response) {
  let adminpage = document.getElementById('adminpage');
  adminpage.innerHTML = response.responseText;
};
