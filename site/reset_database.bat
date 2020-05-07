@echo off

del db.sqlite
node create_db_user.js
node create_db_upload.js
del uploads 2>nul

echo(
echo(Deleted database db.sqlite and recreated with test objects)
