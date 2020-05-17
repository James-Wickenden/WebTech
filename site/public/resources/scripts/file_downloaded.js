"use strict";

addEventListener('load', initHandler);

function initHandler() {
  let dl = document.getElementById("download");
  function dlf(event) { downloadFile(event); };
  dl.addEventListener('click', dlf);
};

function downloadFile(event) {
  event.preventDefault();
  let contentid = parseInt(window.location.href.split('/').pop());
  if (contentid < 1) return;

  var xhttp_form = new XMLHttpRequest();
  xhttp_form.onreadystatechange = async function() {
    if (this.readyState == 4 && this.status == 200) {
      await receiveFile(this);
    }
  };
  xhttp_form.open("POST", "/post/download", true);
  xhttp_form.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp_form.send('contentid=' + contentid);
};

async function receiveFile(response) {
  console.log(response);
  //var filename = "hello.txt";

  //var blob = new Blob([content], {
  //  type: "text/plain;charset=utf-8"
  //});
};
