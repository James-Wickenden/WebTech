"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
  try {
    db = await sqlite.open("./db.sqlite");

    await db.run("create table if not exists users (user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, is_moderator BOOLEAN, join_date TEXT, about TEXT, sessionkey INTEGER, submissions TEXT, favourites TEXT);");

    await db.run("insert into users values (1, 'admin', 'password', true, '2020.4.20', 'Dev admin', -1, '1|2|', '');");
    await db.run("insert into users values (2, 'testuser', 'password', false, '2020.4.21', 'Test user', -1, '3|', '1|');");
    await db.run("insert into users values (3, 'tim', 'password', false, '2020.5.25', '😜😀😊😃', -1, '4|', '1|2|3|');");
    await db.run("insert into users values (4, 'bob', 'password', false, '2020.5.25', 'My name is bob', -1, '', '1|2|3|4|');");
    await db.run("insert into users values (5, 'alfie', 'password', false, '2020.5.25', 'I can comment on uploads!', -1, '', '1|2|3|4|');");
    await db.run("insert into users values (6, 'dean', 'password', false, '2020.5.25', 'I hope our passwords arent stored in plaintext.', -1, '', '1|2|3|4|');");

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
