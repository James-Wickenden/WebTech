"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
    try {
        db = await sqlite.open("./db.sqlite");

        await db.run("create table if not exists users (user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, is_moderator BOOLEAN, join_date DATE, about TEXT, submissions TEXT);");
        var as;

        as = await db.all("select * from users where user_id=1;");
        if (as.length==0) {
          await db.run("insert into users values (1, 'admin', 'password', true, '18/04/2020', 'Dev admin', '');");
        }

        as = await db.all("select * from users where user_id=2;");
        if (as.length==0) {
          await db.run("insert into users values (2, 'user1', 'password', false, '19/04/2020', 'Test user', '');");
        }

        as = await db.all("select * from users;");
        //console.log(as);
    } catch (e) { console.log(e); }
}

/*
user ID
username
password
is moderator
date joined
about
submissions
*/
