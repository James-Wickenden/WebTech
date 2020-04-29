"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
    try {
        db = await sqlite.open("./db.sqlite");

        await db.run("create table if not exists uploads (upload_id INT PRIMARY KEY, user_id INT, category TEXT, other_spec TEXT, upload_date DATE, description TEXT, no_downloads INT, no_favourites INT, comments TEXT);");
        var as;

        as = await db.all("select * from uploads where upload_id=1;");
        if (as.length==0) {
          await db.run("insert into uploads values (1, 1, 'Map', '', '28/04/2020', 'Test Map Description', 10, 5, '');");
        }

        as = await db.all("select * from uploads where upload_id=2;");
        if (as.length==0) {
          await db.run("insert into uploads values (2, 1, 'Other', 'Demo', '29/04/2020', 'Test Demo Description', 20, 10, '');");
        }

        as = await db.all("select * from uploads;");
        console.log(as);
    } catch (e) { console.log(e); }
}

/*
upload ID
user ID
category
other_spec
date uploaded
Description
no. downloads
no.favourites
comments
*/
