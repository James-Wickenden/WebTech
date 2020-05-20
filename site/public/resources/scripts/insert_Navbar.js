"use strict";

let sourceFile = "/navbar.html";

addEventListener('load', loadhtml);

function loadhtml() {
  var req = new XMLHttpRequest();
  req.open('GET', sourceFile, true);
  req.onreadystatechange= function() {
      if (this.readyState != 4) return;
      if (this.status != 200) return;
      document.getElementById('navbar-div').innerHTML = "<div class='navbar'>" + this.responseText + "</div>";
  };
  //console.log(sessionStorage.getItem("user_id"));
  req.send();
}
