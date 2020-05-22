"use strict";

addEventListener('load', loadContentUserStats);

async function loadContentUserStats() {
  document.getElementById("heart_link").addEventListener("click", clickFavourite);
  document.getElementById("down_link").addEventListener("click", clickDownload);

  let user_id = sessionStorage.getItem("user_id");
  if (user_id === null) user_id = -1;
  if (user_id == -1) return;
  let contentid = document.getElementById('content_id').innerHTML;

  document.getElementById("heart_link").innerHTML = "Favourite";

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      setFav(this);
    }
  };
  xhttp.open("POST", "/post/getfav", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("contentid=" + contentid + "&userid=" + user_id);
};

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

function clickFavourite(event) {
  event.preventDefault();
  console.log("Clicked favourite");

  let user_id = sessionStorage.getItem("user_id");
  if (user_id === null) user_id = -1;
  if (user_id == -1) return;
  let contentid = document.getElementById('content_id').innerHTML;

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      setFav(this);
    }
  };
  xhttp.open("POST", "/post/setfav", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.send("contentid=" + contentid + "&userid=" + user_id);
};

function clickDownload(event) {
  let curval = parseInt(document.getElementById("d_saved").innerHTML);
  document.getElementById("d_saved").innerHTML = curval + 1;
};
