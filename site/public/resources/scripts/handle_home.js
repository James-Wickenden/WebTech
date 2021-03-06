"use strict";

addEventListener('load', loadHomeSession);
var user_id, sessionkey;
var desc_editor, cur_desc;

// Sends a request to the server for user page data.
async function loadHomeSession() {
  user_id = parseInt(window.location.pathname.split("/").pop());
  if (window.location.pathname == "/home"){
    user_id = sessionStorage.getItem("user_id");
  };
  if (user_id === null) user_id = -1;
  sessionkey = sessionStorage.getItem("sessionkey");

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveHome(this);
    }
  };
  xhttp.open("POST", "/post/userpage", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("userid=" + user_id);
};

async function receiveHome(response) {
  document.getElementById("userpage").innerHTML = response.responseText;
  formatDesc(user_id);
};

// Handles submitting a new personal description
function formatDesc() {
  if (user_id === null || user_id == "-1") return;
  if (user_id != sessionStorage.getItem("user_id")) return;

  desc_editor = document.getElementById("edit_desc");
  cur_desc = document.getElementById("cur_desc");

  document.getElementById("newdesc").placeholder = cur_desc.innerHTML;
  document.getElementById("toggle_desc").style = "display:inline";
  document.getElementById("toggle_desc").addEventListener('click', toggleDesc);
  desc_editor.addEventListener('submit', submitNewDesc);
};

// Toggles the form for updating the user description.
function toggleDesc(event) {
  event.preventDefault();

  if (desc_editor.style.display == "block") {
    cur_desc.style = "display:block";
    desc_editor.style = "display:none";
  }
  else {
    cur_desc.style = "display:none";
    desc_editor.style = "display:block";
  };
};

function submitNewDesc(event) {
  event.preventDefault();
  let newdesc = document.getElementById("newdesc").value;

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveNewDesc(this);
    }
  };
  xhttp.open("POST", "/post/newdesc", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("userid=" + user_id + "&newdesc=" + newdesc + "&sessionkey=" + sessionkey);
};

function receiveNewDesc(response) {
  if (response.responseText == "success") {
    location.reload();
  };
};
