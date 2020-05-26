"use strict";

var sqlite = require("sqlite");
var db;

create();

async function create() {
  try {
    db = await sqlite.open("./db.sqlite");

    await db.run("create table if not exists uploads (upload_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, filename TEXT NOT NULL, screenshots TEXT, category TEXT NOT NULL, other_spec TEXT, upload_date DATE, description TEXT, no_downloads INTEGER, no_favourites INTEGER, key INTEGER, FOREIGN KEY(user_id) REFERENCES users(user_id));");

    await db.run("insert into uploads values (1, 1, 'Maptest', 'map.bsp', 'scsh1.png|scsh2.png|scsh3.png', 'o_map', null, '2020.5.16', 'Test Map Description', 10, 5, 100);");
    await db.run("insert into uploads values (2, 1, 'Othertest', 'other.txt', '', 'o_other', 'Demo', '2020.5.17', 'Uploads can be done with no screenshots!', 8, 4, 101);");
    await db.run("insert into uploads values (3, 1, 'Modeltest', 'numbers.zip', 'cm.jpg', 'o_model', null, '2020.5.25', 'With just one screenshot, the slide navigation arrows are hidden.', 6, 4, 102);");
    await db.run("insert into uploads values (4, 1, 'Many images!', 'map2.bsp', 'ts.jpg|botw.png|ril.jpg|ag.jpg', 'o_map', null, '2020.5.26', 'I can put emojis in a description!😜😀😊😃', 4, 3, 103);");

  } catch (e) { console.log(e); }
};

/*
upload ID
user ID
name
filename
screenshots
category
other_spec
date uploaded
Description
no. downloads
no.favourites
key
*/
