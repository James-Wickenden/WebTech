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

let port = 8080;
let root = "./public"
let OK = 200, NotFound = 404, BadType = 415, Error = 500;
let types, paths;

let http = require("http");
let fs = require("fs").promises;
let fs_sync = require("fs");
var sqlite = require("sqlite");
var multiparty = require('multiparty');
var {parse} = require('querystring');

// file handling packages
var mkdirp = require('mkdirp');
var rimraf = require("rimraf");
var ncp = require('ncp').ncp;

var uploadstmp  = process.cwd() + "\\public\\uploadstmp\\";
var db;

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

  await fs.access(root);
  await fs.access(root + "/index.html");

  let service = http.createServer(handle);
  service.listen(port, "localhost");
  let address = "http://localhost";
  if (port != 80) address = address + ":" + port;

  console.log("Visit http://localhost:80/");
}

// These functions relate to handling and delivering pages.
// --------------------------------

// Serve a request by delivering a file.
// Requests containing "/post/" are handled by the handlePOST function which then handles each POST request.
async function handle(request, response) {
    let url = request.url;
    console.log(url);

    if (url == "/" || url == "/maps" || url == "/configs" || url == "/models" || url == "/other"){
      return handleMain(request, response);
    };

    if (url == "/random") url = await getRandomUrl();

    if (url.includes("/post/"))     return handlePOST(request, response, url);
    if (url.includes("/download/")) return handleDownload(request, response);

    if (url.includes("/content/"))  return handleContent(request, response, url);
    if (url.includes("/user/") || url == "/home") url = "/user.html";

    if (url == "/upload" || url == "/upload/map" || url == "/upload/config" || url == "/upload/model" || url == "/upload/other")
     url = "/upload.html";
    if (url == "/login") url = "/login.html";
    if (url == "/logout") return handleMain(request, response);
    if (url == "/admin") url = "/admin.html";
    if (url == "/createaccount") url = "/create_account.html";

    let ok = await checkPath(url);
    if (! ok) return fail(response, NotFound, "URL not found.");
    let type = findType(url);
    if (type == null) return fail(response, BadType, "File type not supported");
    let file = root + url;
    let content = await fs.readFile(file);
    deliver(response, type, content);
}

// Parses the request data and sends it to the callback function deliverPOST where it is handled and returned.
async function handlePOST(request, response, url) {
  await getRequestData(request, response, deliverPOST, url);
};

// The callback from getRequestData() where the POSTData parameter contains the parsed request data.
async function deliverPOST(request, response, POSTData, url) {
  if (url == "/post") {
    return fail(response, Error, "Invalid request");
  }
  else if (url == "/post/newuser") {
    let status = await tryAddNewAccount(POSTData);
    return deliver(response, "text/plain", String(status));
  }
  else if (url == "/post/login") {
    let status = await tryLogin(POSTData)
    return deliver(response, "text/plain", String(status));
  }
  else if (url == "/post/userpage") {
    return handleUser(request, response, "/user/" + POSTData.userid);
  }
  else if (url == "/post/admin/page") {
    return handleAdminPage(request, response, POSTData.userid, POSTData.sessionkey);
  }
  else if (url == "/post/admin/update") {
    return handleAdminUpdate(request, response, POSTData);
  }
  else if (url == "/post/newdesc") {
    return handleProfileUpdate(request, response, POSTData);
  }
  else if (url == "/post/comment") {
    return handleComment(request, response, POSTData);
  }
  else if (url == "/post/navbar") {
    return handleNavbar(request, response, POSTData.userid, POSTData.sessionkey);
  }
  else if (url == "/post/getfav" || url == "/post/setfav") {
    return handleFavouriting(request, response, POSTData.contentid, POSTData.userid, POSTData.sessionkey);
  }
  else if (url == "/post/content/form") {
    let key_res = await tryFileUpload_Form(POSTData, url);
    if (key_res == -1) console.log("Invalid attempt to submit upload denied.");
    return deliver(response, "text/plain", String(key_res));
  }
  else if (request.url == "/post/content/data") {
    let status = await tryFileUpload_Data(POSTData, url);
    return deliver(response, "text/plain", String(status));
  };

  deliver(response, "text/plain", "POST url not recognised.");
};

// Tries to add a new account to the according POSTData.
// Returns integer statuscodes based on the result.
// If successful, also returns the new user's ID to take them to their new homepage.
async function tryAddNewAccount(POSTData) {
  if (isEmpty(POSTData.name)) return 2;
  if (isEmpty(POSTData.pass)) return 3;

  let ps = await db.prepare("select * from users where username=?;");
  let as = await ps.all(POSTData.name);
  if (as.length != 0) return 5;

  try {
    let ps_keycheck = await db.prepare("select * from users where sessionkey=?;");
    let sessionkey = await generateNewKey(ps_keycheck);

    let ps_add = await db.prepare("insert into users values (?, ?, ?, false, ?, '', ?, '', '');");
    let res = await ps_add.run(undefined, POSTData.name, POSTData.pass, getToday(), sessionkey);

    return "1&id=" + res.lastID + "&sessionkey=" + sessionkey;
  } catch (e) { console.log(e); }

  return 0;
}

// Tries to login to an existing account to the according POSTData.
// Returns -1 on failure.
// If successful, returns the user's ID and the sessionkey that verifies them for that session.
async function tryLogin(POSTData) {
  try {
    if (isEmpty(POSTData.name)) return -1;
    if (isEmpty(POSTData.pass)) return -1;

    let ps = await db.prepare("select * from users where username=?;");
    let as = await ps.all(POSTData.name);
    if (as.length == 0) return -1;
    if (as[0].password != POSTData.pass) return -1;

    let ps_keycheck = await db.prepare("select * from uploads where key=?;");
    let key = await generateNewKey(ps_keycheck);

    let ps_updateSessionKey = await db.prepare("update users set sessionkey=? where user_id=?;");
    await ps_updateSessionKey.run(key, as[0].user_id);
    return "id=" + as[0].user_id + "&sessionkey=" + key;
  }
  catch(err) {
    console.log(err);
    return "id=" + -1 + "&sessionkey=" + -1;
  };
};

// Requests to upload a piece of content.
// Validates the request, then adds it to the database with a generated key.
// The key is used to validate the upload of data in tryFileUpload_Data()
async function tryFileUpload_Form(POSTData, url) {
  console.log(POSTData);
  if (isEmpty(POSTData.cate)) return -1;
  if (isEmpty(POSTData.name)) return -1;
  if (isEmpty(POSTData.file)) return -1;
  if (POSTData.cate == "o_other" && isEmpty(POSTData.cats)) return -1;
  if (POSTData.desc.length >= 1024) return -1;
  //if (isEmpty(POSTData.tags)) return -1;

  let ps = await db.prepare("select * from users where user_id=? and sessionkey=?;");
  let as = await ps.all(POSTData.user_id, POSTData.sessionkey);
  if (as.length == 0) return -1;

  ps = await db.prepare("select * from uploads where name=?;");
  as = await ps.all(POSTData.name);
  if (as.length != 0) return -1;

  let screenshots = POSTData.scsh.split("|");
  if (screenshots.length > 8) return -1;

  let ps_keycheck = await db.prepare("select * from uploads where key=?;");
  let key = await generateNewKey(ps_keycheck);

  console.log(POSTData);

  let ps_add = await db.prepare("insert into uploads values (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?);");
  let res = await ps_add.run(undefined, POSTData.user_id, POSTData.name, POSTData.file, POSTData.scsh, POSTData.cate, POSTData.cats, getToday(), POSTData.desc, key);
  let newUpload = res.lastID + "|";

  let ps_newsub = await db.prepare("update users set submissions = submissions || ? where user_id =?;")
  ps_newsub.run(newUpload, POSTData.user_id);

  return key;
};

// Requests to upload the files corresponding to a form request.
// Validates the request using the key from tryFileUpload_Form()
// The associated files are saved in /public/uploadstemp/
// then transferred to /public/uploads/{upload_id}/ and renamed.
async function tryFileUpload_Data(files, content_id) {
  if (content_id == -1) {
    console.log("Attempted to upload files to a folder with an invalid key.");
    rimraf.sync(uploadstmp);
    return content_id;
  };

  let uploadsDir  = process.cwd() + "\\public\\uploads\\" + content_id + "\\";
  mkdirp.sync(uploadsDir);

  let counter = 0;
  await Object.keys(files).forEach(async function(name) {
    path = files[name][0].path;
    filename = files[name][0].originalFilename;
    await fs.rename(path, uploadsDir + filename);
    counter++;
  });
  if (counter == files.length) rimraf.sync(uploadstmp);

  console.log('Upload completed!');
  return content_id;
};

// Handles a request for viewing an upload.
// Gets the page template of /content.html, then splits it on the special character $
// And fills in the data loaded from the database.
// Iterable elements like the images and comments are looped through in respective functions.
async function handleContent(request, response, url) {
  let content_id = parseInt(url.split("/").pop());

  let ps_content = await db.prepare("select * from uploads where upload_id=?");
  let content = await ps_content.get(content_id);
  if (isEmpty(content)) return fail(response, NotFound, "No such upload with that id");

  let ps_user = await db.prepare("select * from users where user_id=?");
  let user = await ps_user.get(content.user_id);
  if (isEmpty(user)) return fail(response, Error, "Database error; uploaded content has no associated user.");

  let template = await fs.readFile(root + "/content.html","utf8");
  if (isEmpty(template)) return fail(response, Error, "Content file not found.");
  let ts = template.split("$");

  let commentData = await loopContentComments(content);
  let i = 0;
  let page = ts[i] + content.name + ts[++i] + content.name + ts[++i] + parseCategory(content) + ts[++i] + content.upload_id + ts[++i];
  page += user.user_id + ts[++i] + user.username + ts[++i];
  page += loopContentImages(content) + ts[++i];
  page += content.no_downloads + ts[++i] + content.no_favourites + ts[++i] + content.upload_id + ts[++i];
  page += content.description + ts[++i] + content.upload_date + ts[++i];
  page += commentData[1] + ts[++i] + commentData[0] + ts[++i];

  deliver(response, "application/xhtml+xml", page);
};

// Handles a request for viewing the index page.
// Gets the page template of /index.html, then formats it with looped content.
async function handleMain(request, response) {
  let file = root + "/index.html";
  let template = await fs.readFile(root + "/index.html","utf8");
  if (isEmpty(template)) return fail(response, Error, "Content file not found.");
  let ts = template.split("$");

  let i = 0;
  let page = ts[i];
  switch (request.url) {
    default:         {
      page += "Home" + ts[++i] + "class='active'" + ts[++i] + ts[++i] + ts[++i] + ts[++i];
      page += "This section contains user-created maps." + ts[++i];
      page += await loopMainContent("o_map") + ts[++i];
      break;
    }
    case "/configs": {
      page += "Configs" + ts[++i] +ts[++i] + "class='active'" + ts[++i] + ts[++i] + ts[++i];
      page += "This section contains custom command configs." + ts[++i];
      page += await loopMainContent("o_config") + ts[++i];
      break;
    }
    case "/models":  {
      page += "Models" + ts[++i] +ts[++i] + ts[++i] + "class='active'" + ts[++i] + ts[++i];
      page += "This section contains custom models for use in-game." + ts[++i];
      page += await loopMainContent("o_model") + ts[++i];
      break;
    }
    case "/other":   {
      page += "Other" + ts[++i] + ts[++i] + ts[++i] + ts[++i] + "class='active'" + ts[++i];
      page += "This section contains other user-created content with specified custom categories." + ts[++i];
      page += await loopMainContent("o_other") + ts[++i];
      break;
    }
  };

  deliver(response, "application/xhtml+xml", page);
};

// Handles a request for viewing a user's page
// Gets the page template of /user.html, then formats it.
async function handleUser(request, response, url) {
  let user_id = parseInt(url.split("/").pop());
  if (user_id == -1) return deliver(response, "application/xhtml+xml", "You must log in before you can access your homepage");

  let ps_user = await db.prepare("select * from users where user_id=?;");
  let user = await ps_user.get(user_id);

  if (isEmpty(user)) return deliver(response, "application/xhtml+xml", "No such user with that id");

  let template = await fs.readFile("./HTML_templates/user_page.html","utf8");
  if (isEmpty(template)) return deliver(response, "application/xhtml+xml", "Content file not found.");
  let ts = template.split("$");

  let contents = user.submissions.split("|");

  let user_stats = await getUserStats(contents);
  let submissions_html = await loopUserSubmissions(contents);

  let i = 0;

  let page = ts[i] + user.username + ts[++i];
  page += submissions_html + ts[++i];
  page += user.join_date + ts[++i] + user_stats.downloads + ts[++i];
  page += user_stats.favourites + ts[++i] + user_stats.submissions + ts[++i];
  page += user.about + ts[++i];

  deliver(response, "application/xhtml+xml", page);
};

// Loads the navbar html and returns it to be inserted into each page.
// The navbar is dynamic on the current user being logged in or not, or if they are an admin.
async function handleNavbar(request, response, user_id, sessionkey) {
  let ps_users = await db.prepare("select * from users where user_id=? and sessionkey=?");
  let as_users = await ps_users.get(user_id, sessionkey);

  let adminStr = "";
  if (!isEmpty(as_users)) {
    if (as_users.is_moderator) adminStr = "<a href='/admin' style='float:right'>Admin</a>\n"
  }

  let template = await fs.readFile("./HTML_templates/navbar.html","utf8");
  console.log("user_id=" + user_id);
  if (user_id == "-1") {
    template += "<a href='/login' style='float:right'>Login or Create Account</a>"
  }
  else {
    template += "<a href='/logout' id='logout' style='float:right'>Logout</a>\n"
    template += "<a href='/home' style='float:right'>My Profile</a>\n"
    template += "<a href='/upload' style='float:right'>Upload</a>\n"
    template += adminStr;
  };

  deliver(response, "application/xhtml+xml", template);
};

// Admins can visit a page where they can view and delete users and uploaded content.
// This function loads, parses, and returns that page.
async function handleAdminPage(request, response, userid, sessionkey) {
  console.log("userid=" + userid);
  console.log("sessionkey=" + sessionkey);

  let ps_admin = await db.prepare("select is_moderator from users where user_id=? and sessionkey=?;");
  let is_admin = await ps_admin.get(userid, sessionkey);

  let deniedHTML = "You do not have permission to view this page.";
  if (isEmpty(is_admin)) return deliver(response, "application/xhtml+xml", deniedHTML);
  if (!is_admin.is_moderator) return deliver(response, "application/xhtml+xml", deniedHTML);

  let ps_users = await db.prepare("select * from users;");
  let ps_uploads = await db.prepare("select * from uploads;");
  let users = await ps_users.all();
  let uploads = await ps_uploads.all();

  let file = "./HTML_templates/admin_form.html";
  let template = await fs.readFile(file, "utf8");
  let page = loopAdminForm(template.split("$"), users, uploads);

  return deliver(response, "application/xhtml+xml", page);
};

// This function handles an admin's request to delete something, or to change a user's admin status.
async function handleAdminUpdate(request, response, POSTData) {
  let ps_admin = await db.prepare("select is_moderator from users where user_id=? and sessionkey=?;");
  let is_admin = await ps_admin.get(POSTData.userid, POSTData.sessionkey);

  let deniedHTML = "You do not have permission to edit this form.";
  if (isEmpty(is_admin)) return deliver(response, "application/xhtml+xml", deniedHTML);
  if (!is_admin.is_moderator) return deliver(response, "application/xhtml+xml", deniedHTML);

  try {
    let updatedMods = [''], deleteUsers = [''], deleteUploads = [''];
    if (!isEmpty(POSTData.modus)) updatedMods   = POSTData.modus.split("|");
    if (!isEmpty(POSTData.delus)) deleteUsers   = POSTData.delus.split("|");
    if (!isEmpty(POSTData.delup)) deleteUploads = POSTData.delup.split("|");

    let ps_mod = await db.prepare("update users set is_moderator=? where user_id=?;");
    let ps_del_us = await db.prepare("delete from users where user_id=?;");
    let users = await db.all("select * from users");
    for (user of users) {
      if (isEmpty(user)) break;
      let is_user_mod = updatedMods.includes((user.user_id - 1).toString());
      await ps_mod.run(is_user_mod, user.user_id);

      let is_delete_user = deleteUsers.includes((user.user_id - 1).toString());
      if (is_delete_user) {
        console.log("deleting user_id=" + user.user_id);
        await ps_del_us.run(user.user_id);
      };
    };

    let ps_del_up = await db.prepare("delete from uploads where upload_id=?;");
    for (delupid of deleteUploads) {
      if (delupid == '') break;
      let upload_id = parseInt(delupid) + 1;
      console.log("deleting upload_id=" + upload_id);
      await ps_del_up.run(upload_id);
      rimraf.sync( process.cwd() + "\\public\\uploads\\" + upload_id);
    }
  }
  catch(err) { console.log(err); return deliver(response, "application/xhtml+xml", "failure"); };

  return deliver(response, "application/xhtml+xml", "success");
};

// This function handles getting and setting favourites of a user on some content.
// This could be improved MASSIVELY by using a favourites database similar to the comments database.
async function handleFavouriting(request, response, contentid, userid, sessionkey) {
  let url = request.url;
  if (userid == "-1") return deliver(response, "application/xhtml+xml", "false|get");

  try {
    let ps_get_fav = await db.prepare("select favourites from users where user_id=? and sessionkey=?;");
    let user_favourites = await ps_get_fav.get(parseInt(userid),parseInt(sessionkey));
    if (isEmpty(user_favourites)) return deliver(response, "application/xhtml+xml", "false|get");

    if (url == "/post/getfav") {
      if (user_favourites.favourites != "") {
        let favourites = user_favourites.favourites.split("|");
        if (favourites.includes(contentid)) return deliver(response, "application/xhtml+xml", "true|get");
      };

      return deliver(response, "application/xhtml+xml", "false|get");
    }
    else {
      let new_favourites = "";
      let foundfav = false;

      if (user_favourites.favourites != "") {
        let favourites = user_favourites.favourites.split("|");
        for (let fav of favourites) {
          if (fav != '') {
            if (fav == contentid) foundfav = true;
            else new_favourites += (fav + "|");
          };
        };
        if (!foundfav) new_favourites += contentid + "|";
      }
      else {
        new_favourites = contentid + "|";
      };

      let ps_upd_favours = await db.prepare("update users set favourites=? where user_id=?;");
      let ps_upd_content = await db.prepare("update uploads set no_favourites=? where upload_id=?;");
      let ps_get_ctn_fav = await db.prepare("select no_favourites from uploads where upload_id=?")

      await ps_upd_favours.run(new_favourites, parseInt(userid));
      let cur_no_favourites = await ps_get_ctn_fav.get(parseInt(contentid));
      await ps_upd_content.run((foundfav ? (cur_no_favourites.no_favourites - 1) : (cur_no_favourites.no_favourites + 1)), parseInt(contentid));

      return deliver(response, "application/xhtml+xml", (!foundfav).toString() + "|set");
    };
  }
  catch(err) {
    console.log(err);
    return deliver(response, "application/xhtml+xml", "false");
  };
};

// This function handles a user updating their profile's "about" section.
// It returns "success" or "fail" to indicate to the browser the result for UX
async function handleProfileUpdate(request, response, POSTData) {
  if (POSTData.userid == "-1") return deliver(response, "application/xhtml+xml", "fail");
  let user_id = parseInt(POSTData.userid);
  let sessionkey = parseInt(POSTData.sessionkey);
  let newdesc = POSTData.newdesc;
  console.log("new description submitted by user_id=" + user_id + ": " + newdesc);

  let ps_update = await db.prepare("update users set about=? where user_id=? and sessionkey=?;");
  let res = await ps_update.run(newdesc, user_id, sessionkey);
  if (res.changes != 1) return deliver(response, "application/xhtml+xml", "fail");
  deliver(response, "application/xhtml+xml", "success");
};

// This function handles a user submitting a comment on an upload.
// It could be improved with comment validation, aside from rejecting empty/too long comments.
async function handleComment(request, response, POSTData) {
  console.log(POSTData);
  let ps_finduser = await db.prepare("select * from users where user_id=? and sessionkey=?;");
  let user = await ps_finduser.get(POSTData.userid, POSTData.sessionkey);
  if (isEmpty(user) || POSTData.comment == '' || POSTData.comment.length > 1024) return deliver(response, "application/xhtml+xml", "failure");

  let ps_addcomment = await db.prepare("insert into comments values (?, ?, ?, ?, ?);");
  await ps_addcomment.run(undefined, POSTData.upload_id, POSTData.userid, POSTData.comment, getToday());
  return deliver(response, "application/xhtml+xml", "success");
};

// This function handles a user's request to download a piece of content.
// I used a piped synchronous filestream because I could get it to work.
async function handleDownload(request, response) {
  let content_id = parseInt(request.url.split("/").pop());
  console.log("Attempting to download content with id=" + content_id);

  let ps = await db.prepare("select * from uploads where upload_id=?;");
  let content = await ps.get(content_id);
  if (isEmpty(content)) return fail(response, Error, "No such upload found with that id");

  let filepath  = process.cwd() + "\\public\\uploads\\" + content.upload_id + "\\"  + content.filename;
  if (!fs_sync.existsSync(filepath)) {
    console.log("Error: the associated file for id=" + content_id + " was not found.");
    return;
  }

  await db.run("update uploads set no_downloads = no_downloads + 1 where upload_id = " + content_id);

  let filestream = fs_sync.createReadStream(filepath);
  response.writeHead(200, { "Content-disposition": "attachment;filename=" + content.filename });

  filestream.pipe(response);
};

// This key function parses the data sent in POST requests, and sends it to the callback function.
// written with help from:
// https://itnext.io/how-to-handle-the-post-request-body-in-node-js-without-using-a-framework-cd2038b93190?gi=d6a8f3e99295
// multipart parsing was done using the multiparty npm package.
function getRequestData(request, response, callback, url) {
  const FORM_URLENCODED = 'application/x-www-form-urlencoded';
  const FORM_MULTIPARTY = "multipart/form-data"

  if(request.headers['content-type'] === FORM_URLENCODED) {
    // this section handles application/x-www-form-urlencoded post requests.
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      callback(request, response, parse(body), url);
    });
  }
  else if (request.headers['content-type'].includes(FORM_MULTIPARTY)) {
    // this section handles multipart/form-data post requests.

    console.log("form found");
    let form = new multiparty.Form();

    mkdirp.sync(uploadstmp);
    form.uploadDir = uploadstmp;

    form.parse(request, async function(err, fields, files) {
      let valid_id = await validateKeys(request, fields);
      callback(request, response, files, valid_id);
    });
  }
  else {
    callback(null);
  };
};

// These functions relate to iterating through data to generate HTML.
// --------------------------------

// This function loops through main page uploads and generates the HTML for them.
async function loopMainContent(category) {
  let ps_subs = await db.prepare("select * from uploads where category=?;");
  let ps_user = await db.prepare("select * from users where user_id=?;");
  let content = await ps_subs.all(category);

  if (content.length == 0) {
    let file = "./HTML_templates/empty_category.html";
    let template = await fs.readFile(file, "utf8");
    let page = template.replace("$", category.split("_").pop());

    return page;
  };

  let loop_html = "";

  let file = "./HTML_templates/main_content.html";
  let template = await fs.readFile(file, "utf8");
  let ts = template.split("$");

  for (let sm of content) {
    //console.log(sm);
    let row = "";
    try {
      let user = await ps_user.get(sm.user_id);
      let i = 0;
      row += ts[0] + "/content/" + sm.upload_id + ts[++i];
      row += parseContentThumbnail(sm) + ts[++i] + "/content/" + sm.upload_id + ts[++i] + sm.name + ts[++i];
      row += "/user/" + sm.user_id + ts[++i] + user.username + ts[++i];
      if (category != "o_other") row += "" + ts[++i];
      else row += "<h3>Custom category: " + sm.other_spec + "</h3>" + ts[++i];
      row += sm.no_downloads + ts[++i] + sm.no_favourites + ts[++i] + sm.upload_date + ts[++i];
      row += sm.description + ts[++i];
    }
    catch(err) {
      console.log(err);
    };

    loop_html += row;
  };

  return loop_html;
};

// This function loops through a user's uploads and generates the HTML for them.
async function loopUserSubmissions(contents) {
  if (contents[0] == '') return "<em>This user has not submitted anything yet!</em>";

  let loop_html = "";

  let file = "./HTML_templates/user_submission.html";
  let template = await fs.readFile(file, "utf8");
  let ts = template.split("$");

  let ps = await db.prepare("select * from uploads where upload_id=?;");

  for (let sm of contents) {
    try {
      //console.log(sm);
      if (sm != '') {
        let content_id = parseInt(sm);
        let content = await ps.get(content_id);
        if (isEmpty(content)) continue;
        let i = 0;
        let row = ts[0];

        switch (content.category) {
          case "o_map":    row += "bsp_svg.svg" + ts[++i]; break;
          case "o_config": row += "cfg_svg.svg" + ts[++i]; break;
          case "o_model":  row += "mod_svg.svg" + ts[++i]; break;
          case "o_other":  row += "oth_svg.svg" + ts[++i]; break;
          default: row += "blank.svg" + ts[++i]; break;
        };

        row += "/content/" + content.upload_id + ts[++i] + content.name + ts[++i];
        row += content.upload_date + ts[++i];
        row += content.no_downloads + ts[++i] + content.no_favourites + ts[++i];
        loop_html += row;

      };
    }
    catch(err) {
      console.log(err);
    };
  };

  return loop_html;
}

// This function loops through a content and generates the HTML for the images.
function loopContentImages(content) {
  let screenshots = content.screenshots.split("|");
  let scsh_str = "";
  for (scsh of screenshots) {
    let ext = scsh.split(".")[1];
    if (scsh != '' && (ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "gif")) {
      scsh_str += "<img src='/uploads/" + content.upload_id + "/" + scsh + "' class='slide fade' type='image' height='500px'></img>\n";
    };
  };

  return scsh_str;
};

// This function loops through a content and generates the HTML for the comments.
async function loopContentComments(content) {
  let ps_get_comments = await db.prepare("select * from comments where upload_id=?;");
  let comments = await ps_get_comments.all(content.upload_id);

  if (comments.length == 0) return ["", 0];

  let commentStr = "";
  let commentCount = 0;
  for (comment of comments) {
    let ps_username = await db.prepare("select username from users where user_id=?;");
    let user = await ps_username.get(comment.user_id);

    commentStr += "<p id='username'><a href='/user/" + comment.user_id + "'>" + user.username + "</a> &#160;&#160;";
    commentStr += comment.comment_date + "</p>\n";
    commentStr += "<p id='comment'>" + comment.comment_text + "</p>\n";
    commentCount++;
  };

  return [commentStr, commentCount];
};

// This function loops through all the content and users and generates the HTML for a pair of tables.
// The user with user_id = 1 is designated as the site admin and cannot be deleted or removed as a moderator.
// (TODO: add validation when updating admin content to ensure this!)
function loopAdminForm(ts, users, uploads) {
  let loop_html = ts[0];
  let maxuserid = 0, maxuploadid = 0;

  let user_rows = "";
  for (user of users) {
    user_rows += "<tr class='user'>\n<td>" + user.user_id + "</td>\n";
    user_rows += "<td>" + user.username + "</td>\n";
    user_rows += "<td>" + user.join_date + "</td>\n";
    let tags_mod =  "id='modid_" + user.user_id + "'";
    if (user.is_moderator) tags_mod += " checked='checked' ";
    if (user.user_id == 1) tags_mod += " disabled='diasbled' ";
    user_rows += "<td><input type='checkbox' " + tags_mod + "></input></td>\n";

    let tags_del =  "id='delusid_" + user.user_id + "'";
    if (user.user_id == 1) tags_del += " disabled='diasbled' ";
    user_rows += "<td><input type='checkbox' " + tags_del + "></input></td>\n</tr>\n";

    if (user.user_id > maxuserid) maxuserid = user.user_id;
  };

  loop_html += user_rows + ts[1];

  let upload_rows = "";
  for (upload of uploads) {
    upload_rows += "<tr class='upload'>\n<td>" + upload.upload_id + "</td>\n";
    upload_rows += "<td>" + upload.name + "</td>\n";
    upload_rows += "<td>" + upload.upload_date + "</td>\n";
    upload_rows += "<td><a href='/download/" + upload.upload_id + "'>Download</a></td>\n";
    upload_rows += "<td><input type='checkbox' id='delupid_" + upload.upload_id + "'></input></td>\n</tr>\n";

    if (upload.upload_id > maxuploadid) maxuploadid = upload.upload_id;
  };

  loop_html += upload_rows + ts[2];
  loop_html += maxuserid   + ts[3];
  loop_html += maxuploadid + ts[4];
  return loop_html;
};

// These functions serve as auxiliary functions to support execution.
// --------------------------------

// This function parses the Category of a piece of content into a readable string.
// Could be made a two-line function by splitting and capitalising the first letter!
function parseCategory(content) {
  switch (content.category) {
    default: return "";
    case "o_map": return "Map";
    case "o_config": return "Config";
    case "o_model": return "Model";
    case "o_other": return content.other_spec;
  };
};

// This function parses the uploaded screenshots to an upload and returns the path to the first image.
// If no images were uploaded, a default .png is used.
function parseContentThumbnail(content) {
  if (content.screenshots == '') {
    switch (content.category) {
      default:         return "/resources/img/blank.png";
      case "o_map":    return "/resources/img/bsp_png.png";
      case "o_config": return "/resources/img/cfg_png.png";
      case "o_model":  return "/resources/img/mod_png.png";
      case "o_other":  return "/resources/img/oth_png.png";
    };
  };
  return "/uploads/" + content.upload_id + "/" + content.screenshots.split("|")[0];
};

// This function generates a url corresponding to a random upload.
// It returns the index page if no content has been uplaoded.
async function getRandomUrl() {
  console.log("Generating a random page id...");
  let ps = await db.prepare("select * from uploads;");
  let as = await ps.all();
  if (as.length == 0) return "//";
  if (as.length == 1) return "/content/" + as[0].upload_id;

  let maxuploadid = 1;
  for (upload of as) if (upload.upload_id > maxuploadid) maxuploadid = upload.upload_id;

  let isValidPage = false;
  let content_id;
  while (!isValidPage) {
    content_id = Math.floor(Math.random() * maxuploadid) + 1;
    let content = await db.all("select * from uploads where upload_id=" + content_id + ";");
    if (!isEmpty(content)) isValidPage = true;
  };

  return "/content/" + content_id;
};

// This function validates the upload key for tryFileUpload_Data()
// Validation is done when parsing the mutliparty form, as fields are not sent through to the callback.
async function validateKeys(request, fields) {
  let ps_uploads, as_uploads;

  ps_uploads = await db.prepare("select * from uploads where name=? and key=?");
  as_uploads = await ps_uploads.all(fields.uploadName[0], fields.key[0]);
  if (as_uploads.length != 1) return -1;

  let ps_users = await db.prepare("select * from users where user_id=? and sessionkey=?");
  let as_users = await ps_users.all(fields.user_id[0], fields.sessionkey[0]);
  if (as_users.length != 1) return -1;

  return as_uploads[0].upload_id;
};

// This function browses all the content uplaoded by a user.
// It sums their downloads and favourites, and the number of submissions, and returns them.
async function getUserStats(contents) {
  if (contents[0] == '') return {favourites:0, submissions:0, downloads:0};

  let no_dnls = 0, no_favs = 0, no_subs = 0;
  let ps = await db.prepare("select * from uploads where upload_id=?;");

  for (let sm of contents) {
    try {
      if (sm != '') {
        let content_id = parseInt(sm);
        let content = await ps.get(content_id);
        if (!isEmpty(content)) {
          no_dnls += content.no_downloads;
          no_favs += content.no_favourites;
          no_subs += 1;
        };
      };
    }
    catch(err) {
      console.log(err);
    };
  };

  //console.log("no_dnls= " + no_dnls + ", no_favs= " + no_favs + ", no_subs= " + no_subs);
  return { downloads: no_dnls, favourites: no_favs, submissions: no_subs };
};

// Returns true if the value is null or empty.
function isEmpty(value){
  return (value == null || value.length === 0);
};

// Returns a string containing today's date in YYYY.M.DD format.
// Could be parsed into a more readable string for better UX.
function getToday() {
  let today = new Date;
  let todayStr = today.getFullYear() + "." + (today.getMonth() + 1) + "." + today.getDate();
  return todayStr;
};

// Generates a key using the prepared statement parameter.
// This is done to ensure two keys do not overlap, should this be required to be avoided.
async function generateNewKey(ps) {
  let key = Math.floor(Math.random() * 65536);

  // ensures the key is not already in use by another upload
  let unused_key = false;
  while (!unused_key) {
    let as = await ps.all(key);
    if (as.length == 0) {
      unused_key = true;
    }
    else {
      key = Math.floor(Math.random() * 65536);
    };
  };
  return key;
};

// These functions have been changed little/none from the original server.js file, and help serve pages.
// --------------------------------

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
async function fail(response, code, text) {
  if (text == "URL not found.") {
    let notfound = await fs.readFile("./HTML_templates/notfound.html","utf8");
    return deliver(response, types.html, notfound);
  };

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
