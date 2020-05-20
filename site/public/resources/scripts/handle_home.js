"use strict";

addEventListener('load', loadHomeSession);

async function loadHomeSession() {
  let user_id = parseInt(window.location.pathname.split("/").pop());
  if (window.location.pathname == "/home"){

    user_id = sessionStorage.getItem("user_id");
  };

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receivePage(this);
    }
  };
  xhttp.open("POST", "/post/userpage", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  if (user_id === null) user_id = -1;
  console.log("userid=" + user_id);
  xhttp.send("userid=" + user_id);
};

async function receivePage(response) {
  document.getElementById("userpage").innerHTML = response.responseText;
};
