"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
    try {
        db = await sqlite.open("./db.sqlite");

        await db.run("create table if not exists comments (comment_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, upload_id INTEGER NOT NULL, user_id INTEGER NOT NULL, comment_text TEXT NOT NULL, comment_date DATE, FOREIGN KEY(user_id) REFERENCES users(user_id), FOREIGN KEY(upload_id) REFERENCES uploads(upload_id));");
        var as;

        as = await db.all("select * from comments where comment_id=1;");
        if (as.length==0) {
          await db.run("insert into comments values (1, 1, 1, 'This is a test comment made by the admin account on the upload Maptest.', '2020.5.25');");
        }

        as = await db.all("select * from comments where comment_id=2;");
        if (as.length==0) {
          await db.run("insert into comments values (2, 1, 2, 'This is a test comment made by the user1 account on the upload Maptest.', '2020.5.24');");
        }

        as = await db.all("select * from comments where comment_id=3;");
        if (as.length==0) {
          await db.run("insert into comments values (3, 2, 1, 'This is a test comment made by the admin account on the upload OtherTest.', '2020.5.23');");
        }

        as = await db.all("select * from comments;");
        //console.log(as);
    } catch (e) { console.log(e); }
}

/*
comment_id
upload_id
user_id
comment_text
comment_date
*/
