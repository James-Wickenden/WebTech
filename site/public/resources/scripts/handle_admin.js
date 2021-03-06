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
  if (response.responseText.length == 45) return;
  document.getElementById('but_admin').addEventListener("click", submitChanges);
};

// Iterates through the tables, looking for moderators and deleted objects
// Writes these to separate delimited strings.
function getFormData() {
  let modusStr = "", delupStr = "", delusStr = "";
  let users = document.getElementsByClassName('user');
  let uploads = document.getElementsByClassName('upload');

  let maxuserid = parseInt(document.getElementById('maxuserid').innerHTML);
  for (let i = 0; i <= maxuserid; i++) {
    if (users[i] === undefined) continue;
    let is_moderator = document.getElementById('modid_' + (i + 1)).checked;
    let is_to_delete = document.getElementById('delusid_' + (i + 1)).checked;
    if (is_moderator) modusStr += i + "|";
    if (is_to_delete) delusStr += i + "|";
  };

  let maxuploadid = parseInt(document.getElementById('maxuploadid').innerHTML);
  for (let i = 0; i <= maxuploadid; i++) {
    if (document.getElementById('delupid_' + (i + 1)) === null) continue;
    let is_to_delete = document.getElementById('delupid_' + (i + 1)).checked;
    if (is_to_delete) delupStr += i + "|";
  };

  return "&modus=" + modusStr + "&delus=" + delusStr + "&delup=" + delupStr;
}

function submitChanges(event) {
  event.preventDefault();

  let formData = "";
  let user_id = sessionStorage.getItem("user_id");
  let sessionkey = sessionStorage.getItem("sessionkey");
  formData += "userid=" + user_id;
  formData += "&sessionkey=" + sessionkey;
  formData += getFormData();

  var xhttp_form = new XMLHttpRequest();
  xhttp_form.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveChanges(this);
    }
  };
  xhttp_form.open("POST", "/post/admin/update", true);
  xhttp_form.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp_form.send(formData);
};

function receiveChanges(response) {
  if (response.responseText == "success") location.reload();
};

// Minimises and maximises the admin tables.
function minimise(tableid) {
  let table = document.getElementById(tableid);
  if (table.style.display == "none") {
    table.style.display = "";
    document.getElementById(tableid + "caret").innerHTML = "<i class='fa fa-caret-up'></i>";
    document.getElementById(tableid + "break").innerHTML = "<br/><br/>";
  }
  else {
   table.style.display = "none";
   document.getElementById(tableid + "caret").innerHTML = "<i class='fa fa-caret-down'></i>";
   document.getElementById(tableid + "break").innerHTML = "";
  };
};
