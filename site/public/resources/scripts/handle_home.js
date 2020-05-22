"use strict";

addEventListener('load', loadHomeSession);
var user_id;
var desc_editor;
async function loadHomeSession() {

  user_id = parseInt(window.location.pathname.split("/").pop());
  if (window.location.pathname == "/home"){
    user_id = sessionStorage.getItem("user_id");
  };

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveHome(this);
    }
  };
  xhttp.open("POST", "/post/userpage", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  if (user_id === null) user_id = -1;
  //console.log("userid=" + user_id);
  xhttp.send("userid=" + user_id);
};

async function receiveHome(response) {
  document.getElementById("userpage").innerHTML = response.responseText;
  formatDesc(user_id);
};

function formatDesc() {
  if (user_id === null || user_id == "-1") return;
  if (user_id != sessionStorage.getItem("user_id")) return;
  desc_editor = document.getElementById("edit_desc");

  document.getElementById("toggle_desc").style = "display:inline";
  document.getElementById("toggle_desc").addEventListener('click', toggleDesc);
};

function toggleDesc(event) {
  event.preventDefault();

  if (desc_editor.style.display == "inline") {

    desc_editor.style = "display:none";
  }
  else {
    desc_editor.style = "display:inline";
  };
};
