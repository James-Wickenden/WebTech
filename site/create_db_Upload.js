"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
    try {
        db = await sqlite.open("./db.sqlite");

        await db.run("create table if not exists uploads (upload_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, filename TEXT NOT NULL, category TEXT NOT NULL, other_spec TEXT, upload_date DATE, description TEXT, no_downloads INT, no_favourites INT, comments TEXT, FOREIGN KEY(user_id) REFERENCES users(user_id));");
        var as;

        as = await db.all("select * from uploads where upload_id=1;");
        if (as.length==0) {
          await db.run("insert into uploads values (1, 1, 'Maptest', 'map.bsp', 'o_map', null, '2020.5.16', 'Test Map Description', 10, 5, '');");
        }

        as = await db.all("select * from uploads where upload_id=2;");
        if (as.length==0) {
          await db.run("insert into uploads values (2, 1, 'Othertest', 'other.cfg', 'o_other', 'Demo', '2020.5.17', 'Test Demo Description', 20, 10, '');");
        }

        as = await db.all("select * from uploads;");
        //console.log(as);
    } catch (e) { console.log(e); }
}

/*
upload ID
user ID
name
filename
category
other_spec
date uploaded
Description
no. downloads
no.favourites
comments
*/
