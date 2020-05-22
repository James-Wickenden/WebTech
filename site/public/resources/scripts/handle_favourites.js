"use strict";

addEventListener('load', loadContentUserStats);

async function loadContentUserStats() {
  let user_id = sessionStorage.getItem("user_id");
  if (user_id === null) user_id = -1;
  if (user_id == -1) return;
  let contentid = document.getElementById('content_id').innerHTML;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveHome(this);
    }
  };
  xhttp.open("POST", "/post/u_interaction", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("contentid=" + contentid + "&userid=" + user_id);
};

async function receiveHome(response) {
  let is_favourited = (response.responseText == "true");
  if (is_favourited) document.getElementById("hearted").style = "color:red";
};
