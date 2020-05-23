"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
  try {
    db = await sqlite.open("./db.sqlite");

    await db.run("create table if not exists users (user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, is_moderator BOOLEAN, join_date TEXT, about TEXT, sessionkey INTEGER, submissions TEXT, favourites TEXT);");
    var as;

    as = await db.all("select * from users where user_id=1;");
    if (as.length==0) {
      await db.run("insert into users values (1, 'admin', 'password', true, '2020.4.20', 'Dev admin', -1, '1|2|', '');");
    };

    as = await db.all("select * from users where user_id=2;");
    if (as.length==0) {
      await db.run("insert into users values (2, 'user1', 'password', false, '2020.4.21', 'Test user', -1, '', '1|2|');");
    };

    as = await db.all("select * from users;");
    //console.log(as);
  } catch (e) { console.log(e); }
};

/*
user ID
username
password
is moderator
date joined
about
sessionkey
submissions
favourites
*/
