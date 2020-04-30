// Run a node.js web server for local development of a static web site. Create a
// site folder, put server.js in it, create a sub-folder called "public", with
// at least a file "index.html" in it. Start the server with "node server.js &",
// and visit the site at the address printed on the console.
//     The server is designed so that a site will still work if you move it to a
// different platform, by treating the file system as case-sensitive even when
// it isn't (as on Windows and some Macs). URLs are then case-sensitive.
//     All HTML files are assumed to have a .html extension and are delivered as
// application/xhtml+xml for instant feedback on XHTML errors. Content
// negotiation is not implemented, so old browsers are not supported. Https is
// not supported. Add to the list of file types in defineTypes, as necessary.

// Change the port to the default 80, if there are no permission issues and port
// 80 isn't already in use. The root folder corresponds to the "/" url.
let port = 8080;
let root = "./public"

// Load the library modules, and define the global constants and variables.
// Load the promises version of fs, so that async/await can be used.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// The file types supported are set up in the defineTypes function.
// The paths variable is a cache of url paths in the site, to check case.

let fs = require("fs").promises;
let OK = 200, NotFound = 404, BadType = 415, Error = 500;
let types, paths;
var options = { setHeaders: deliverXHTML };

var express = require("express");
var session = require('express-session');
var app = express();

var sqlite = require("sqlite");
var db;


start();

async function start() {
  db = await sqlite.open("./db.sqlite");
  console.log(db);

  app.use(session({
  	secret: 'secret',
  	resave: true,
  	saveUninitialized: true
  }));

  var as;
  as = await db.all("select * from users;");
  console.log(as);
  as = await db.all("select * from uploads;");
  console.log(as);

  app.use(express.static("public", options));

  app.listen(80, "localhost");
  console.log("Visit http://localhost:80/");
}

async function addNewUser() {

  return true;
};

async function isLoggedIn() {

  return true;
}

// Returns true if there is already a user with that username
async function doesUserExist(username) {
  var ps = await db.prepare("select * from users where username=?");
  var as = await ps.all(username);
  if (as.length != 0) return true;
  return false;
};

// Deliver the file that has been read in to the browser.
function deliverXHTML(res, path, stat) {
  let url = path;
  console.log("url=", url);
  if (path.endsWith(".html")) {
    res.header("Content-Type", "application/xhtml+xml");
  }
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
  console.log("fail called");
  let textTypeHeader = { "Content-Type": "text/plain" };
  response.writeHead(code, textTypeHeader);
  response.write(text, "utf8");
  response.end();
}

// The most common standard file extensions are supported, and html is
// delivered as "application/xhtml+xml".  Some common non-standard file
// extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: add entries as needed or, for a more
// complete list, install the mime module and adapt the list it provides.
function defineTypes() {
    let types = {
        html : "application/xhtml+xml",
        css  : "text/css",
        js   : "application/javascript",
        mjs  : "application/javascript", // for ES6 modules
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged
        jpeg : "image/jpeg",   // for images copied unchanged
        jpg  : "image/jpeg",   // for images copied unchanged
        svg  : "image/svg+xml",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
        mp3  : "audio/mpeg",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: undefined,      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
    return types;
}
