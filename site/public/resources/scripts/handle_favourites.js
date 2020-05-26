"use strict";

var contentid;
var sessionkey;
var user_id;

addEventListener('load', loadContentUserStats);

// Asks the server if the user has favourited this upload when the page is loaded.
async function loadContentUserStats() {
  document.getElementById("heart_link").addEventListener("click", clickFavourite);
  document.getElementById("down_link").addEventListener("click", clickDownload);

  user_id = sessionStorage.getItem("user_id");
  if (user_id === null) user_id = -1;
  if (user_id == -1) return;
  contentid = document.getElementById('content_id').innerHTML;
  sessionkey = sessionStorage.getItem("sessionkey");

  document.getElementById("heart_link").innerHTML = "Favourite";

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      setFav(this);
    }
  };
  xhttp.open("POST", "/post/getfav", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("contentid=" + contentid + "&userid=" + user_id + "&sessionkey=" + sessionkey);
};

// Updates the favourite colour and counter as it is changed.
function setFav(response) {
  console.log(response.responseText);
  let is_favourited = (response.responseText.split("|")[0] == "true");

  if (response.responseText.split("|")[1] == "set") {
    let curval = parseInt(document.getElementById("d_faved").innerHTML);
    if (is_favourited) document.getElementById("d_faved").innerHTML = curval + 1;
    else document.getElementById("d_faved").innerHTML = curval - 1;
  }
  if (is_favourited) document.getElementById("hearted").style = "color:red";
  else document.getElementById("hearted").style = "color:grey";
};

// Sets the new favourite counter status, and updates it on the page.
function clickFavourite(event) {
  event.preventDefault();
  console.log("Clicked favourite");

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      setFav(this);
    }
  };
  xhttp.open("POST", "/post/setfav", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("contentid=" + contentid + "&userid=" + user_id + "&sessionkey=" + sessionkey);
};

// Updates the download counter to increment.
function clickDownload(event) {
  let curval = parseInt(document.getElementById("d_saved").innerHTML);
  document.getElementById("d_saved").innerHTML = curval + 1;
};
