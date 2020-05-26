"use strict";

let sourceFile = "/navbar.html";

addEventListener('load', loadhtml);

// Once the page is loaded, makes a request to the server for the dynamic navbar.
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
  let sessionkey = sessionStorage.getItem("sessionkey");
  if (user_id === null) user_id = -1;

  console.log("userid=" + user_id);
  console.log("sessionkey=" + sessionkey);
  xhttp.send("userid=" + user_id + "&sessionkey=" + sessionkey);
};

// Inserts the navbar html and adds a handler for logout.
function receiveNavbar(response) {
  document.getElementById('navbar-div').innerHTML = "<div class='navbar'>" + response.responseText + "</div>";
  if (document.getElementById('logout') !== null) {
    document.getElementById('logout').addEventListener("click", function(event) {
      event.preventDefault();
      sessionStorage.setItem("user_id", -1);
      sessionStorage.setItem("sessionkey", -1);
      location.reload();
    });
  };
};
