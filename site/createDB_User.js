"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
    try {
        db = await sqlite.open("./db.sqlite");
        await db.run("create table if not exists users (id INTEGER, is_moderator BOOLEAN, join_date DATE, about TEXT, submissions TEXT);");
        var as;

        as = await db.all("select * from users where id=1;");
        if (as.length==0) {
          await db.run("insert into users values (1, true, '18/04/2020', 'Dev admin', '');");
        }

        as = await db.all("select * from users where id=2;");
        if (as.length==0) {
          await db.run("insert into users values (2, false, '19/04/2020', 'Test user', '');");
        }

        as = await db.all("select * from users;");
        console.log(as);
    } catch (e) { console.log(e); }
}

/*
user ID
is moderator
username
date joined
about
submissions
*/
