"use strict";

let sourceFile = "/navbar.html";

addEventListener('load', loadhtml);

async function loadhtml() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveNavbar(this);
    }
  };
  xhttp.open("POST", "/post/navbar", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  let user_id = sessionStorage.getItem("user_id");
  if (user_id === null) user_id = -1;

  console.log("userid=" + user_id);
  xhttp.send("userid=" + user_id);
};

function receiveNavbar(response) {
  document.getElementById('navbar-div').innerHTML = "<div class='navbar'>" + response.responseText + "</div>";
  if (document.getElementById('logout') !== null) {
    document.getElementById('logout').addEventListener("click", function(event) {
      sessionStorage.setItem("user_id", -1); event.preventDefault(); location.reload();
    });
  };
};
