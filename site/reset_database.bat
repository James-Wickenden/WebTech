@echo off

del db.sqlite
node createDB_User.js
node createDB_Upload.js

echo(
echo(Deleted database db.sqlite and recreated with test objects)
