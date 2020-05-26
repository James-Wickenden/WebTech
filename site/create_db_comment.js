"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
  try {
    db = await sqlite.open("./db.sqlite");

    await db.run("create table if not exists comments (comment_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, upload_id INTEGER NOT NULL, user_id INTEGER NOT NULL, comment_text TEXT NOT NULL, comment_date DATE, FOREIGN KEY(user_id) REFERENCES users(user_id), FOREIGN KEY(upload_id) REFERENCES uploads(upload_id));");

    await db.run("insert into comments values (1, 1, 1, 'This is a test comment made by the admin account on the upload Maptest.', '2020.5.25');");
    await db.run("insert into comments values (2, 1, 2, 'This is a test comment made by the testuser account on the upload Maptest.', '2020.5.24');");
    await db.run("insert into comments values (3, 2, 1, 'This is a test comment made by the admin account on the upload OtherTest.', '2020.5.26');");
    await db.run("insert into comments values (4, 1, 4, 'The upload at /content/2 has 1 comment...', '2020.5.26');");
    await db.run("insert into comments values (5, 3, 6, 'I can comment emojis! 😜😀😊😃', '2020.5.26');");
    await db.run("insert into comments values (6, 4, 5, 'The same user can comment multiple times on one upload!', '2020.5.25');");
    await db.run("insert into comments values (7, 4, 5, 'The same user can comment multiple times on the same upload!', '2020.5.26');");

  } catch (e) { console.log(e); }
};

/*
comment_id
upload_id
user_id
comment_text
comment_date
*/
