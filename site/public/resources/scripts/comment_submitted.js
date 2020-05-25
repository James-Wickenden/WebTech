"use strict";

addEventListener('load', commentHandler);
var form;
var comment_status;
function commentHandler() {
  form = document.getElementById("commentform");
  comment_status = document.getElementById("comment_status");

  function handleCommentForm(event) { submitCommentForm(event); };
  form.addEventListener('submit', handleCommentForm);
};

function submitCommentForm(event) {
  event.preventDefault();

  let userid = sessionStorage.getItem("user_id");
  let sessionkey = sessionStorage.getItem("sessionkey");
  let comment = form.add_comment.value;
  let upload_id = document.getElementById("content_id").innerHTML;

  if (!(userid > 0) || !(sessionkey > 0)) {
    comment_status.innerHTML = "Log in to submit a comment.";
    return;
  };

  var xhttp_comment = new XMLHttpRequest();
  xhttp_comment.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      receiveCommentSubmission(this);
    }
  };
  xhttp_comment.open("POST", "/post/comment", true);
  xhttp_comment.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp_comment.send("userid=" + userid + "&sessionkey=" + sessionkey + "&comment=" + comment + "&upload_id=" + upload_id);
};

function receiveCommentSubmission(response) {
  if (response.responseText == "failure") {
    comment_status.innerHTML = "Failed to submit comment.";
    return;
  };
  comment_status.style = "color: green";
  comment_status.innerHTML = "Comment submitted!";
};
