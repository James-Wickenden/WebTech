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
let http = require("http");
let fs = require("fs").promises;
let OK = 200, NotFound = 404, BadType = 415, Error = 500;
let types, paths;

var sqlite = require("sqlite");
var db;

const { parse } = require('querystring');

// Start the server:
start();

// Check the site, giving quick feedback if it hasn't been set up properly.
// Start the http service. Accept only requests from localhost, for security.
// If successful, the handle function is called for each request.
async function start() {
  types = defineTypes();
  paths = new Set();
  paths.add("/");

  db = await sqlite.open("./db.sqlite");
  console.log(db);

  //let as = await db.all("select * from users");
  //console.log(as);

  await fs.access(root);
  await fs.access(root + "/index.html");

  let service = http.createServer(handle);
  service.listen(port, "localhost");
  let address = "http://localhost";
  if (port != 80) address = address + ":" + port;

  console.log("Visit http://localhost:80/");
}

// Serve a request by delivering a file.
async function handle(request, response) {
    let url = request.url;
    if (url.endsWith("/")) url = url + "index.html";
    console.log(url);

    if (url.includes("/post/")) return handlePOST(request, response);

    let ok = await checkPath(url);
    if (! ok) return fail(response, NotFound, "URL not found (check case)");
    let type = findType(url);
    if (type == null) return fail(response, BadType, "File type not supported");
    let file = root + url;
    let content = await fs.readFile(file);
    deliver(response, type, content);
}

function isEmpty(value){
  return (value == null || value.length === 0);
};

async function handlePOST(request, response) {
  await getRequestData(request, response, deliverPOST);
};

async function tryAddNewAccount(POSTData) {
  if (isEmpty(POSTData.name)) return 2;
  if (isEmpty(POSTData.pass)) return 3;

  let ps = await db.prepare("select * from users where username=?;");
  let as = await ps.all(POSTData.name);
  if (as.length > 0) return 5;

  try {
    let today = new Date;
    let todayStr = today.getFullYear() + "." + (today.getMonth() + 1) + "." + today.getDate();

    let ps_add = await db.prepare("insert into users values (?, ?, ?, false, ?, '', '');");
    await ps_add.run(undefined, POSTData.name, POSTData.pass, todayStr);

    as = await ps.all(POSTData.name);
    if (as.length == 1) return 1;
  } catch (e) { console.log(e); }

  return 0;
}

async function tryLogin(POSTData) {
  if (isEmpty(POSTData.name)) return false;
  if (isEmpty(POSTData.pass)) return false;

  let ps = await db.prepare("select * from users where username=?;");
  let as = await ps.all(POSTData.name);
  if (as.length != 1) return false;
  if (as[0].password != POSTData.pass) return false;

  return true;
};

async function deliverPOST(request, response, result) {
  let POSTData = result;
  let url = request.url;
  let status = 0;

  if (url == "/post/newuser") {
    status = await tryAddNewAccount(POSTData);
    return deliver(response, "text/plain", String(status));
  }
  else if (url == "/post/login") {
    let res = await tryLogin(POSTData)
    return deliver(response, "text/plain", String(res));
  };

  deliver(response, "text/plain", "aaa");
};

// written with help from:
// https://itnext.io/how-to-handle-the-post-request-body-in-node-js-without-using-a-framework-cd2038b93190?gi=d6a8f3e99295
function getRequestData(request, response, callback) {
  const FORM_URLENCODED = 'application/x-www-form-urlencoded';

  if(request.headers['content-type'] === FORM_URLENCODED) {
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });
    request.on('end', () => {
      callback(request, response, parse(body));
    });
  }
  else {
    callback(null);
  };
};

// Check if a path is in or can be added to the set of site paths, in order
// to ensure case-sensitivity.
async function checkPath(path) {
    if (! paths.has(path)) {
        let n = path.lastIndexOf("/", path.length - 2);
        let parent = path.substring(0, n + 1);
        let ok = await checkPath(parent);
        if (ok) await addContents(parent);
    }
    return paths.has(path);
}

// Add the files and subfolders in a folder to the set of site paths.
async function addContents(folder) {
    let folderBit = 1 << 14;
    let names = await fs.readdir(root + folder);
    for (let name of names) {
        let path = folder + name;
        let stat = await fs.stat(root + path);
        if ((stat.mode & folderBit) != 0) path = path + "/";
        paths.add(path);
    }
}

// Find the content type to respond with, or undefined.
function findType(url) {
    let dot = url.lastIndexOf(".");
    let extension = url.substring(dot + 1);
    return types[extension];
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, content) {
    let typeHeader = { "Content-Type": type };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
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
