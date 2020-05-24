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
  xhttp.open("POST", "/post/admin/page", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("userid=" + user_id + "&sessionkey=" + sessionkey);
};

function receiveForm(response) {
  let adminpage = document.getElementById('adminpage');
  adminpage.innerHTML = response.responseText;
  document.getElementById('but_admin').addEventListener("click", submitChanges);
};

function submitChanges(event) {
  event.preventDefault();

  let formData = new FormData(document.getElementById('adminform'));
  let user_id = sessionStorage.getItem("user_id");
  formData.append("user_id", user_id);
  let sessionkey = sessionStorage.getItem("sessionkey");
  formData.append("sessionkey", sessionkey);

  console.log(formData);

  var xhttp_data = new XMLHttpRequest();
  xhttp_data.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveChanges(this);
    }
  };
  xhttp_data.open("POST", "/post/admin/update", true);
  xhttp_data.send(formData);
};

function receiveChanges(response) {
  console.log(response.responseText);
};

function minimise(tableid) {
  let table = document.getElementById(tableid);
  if (table.style.display == "none") {
    table.style.display = "block";
    document.getElementById(tableid + "caret").innerHTML = "<i class='fa fa-caret-up'></i>";
    document.getElementById(tableid + "break").innerHTML = "<br/><br/>";
  }
  else {
   table.style.display = "none";
   document.getElementById(tableid + "caret").innerHTML = "<i class='fa fa-caret-down'></i>";
   document.getElementById(tableid + "break").innerHTML = "";
  };
};
