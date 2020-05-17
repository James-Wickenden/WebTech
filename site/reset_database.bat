@echo off

del db.sqlite
node create_db_user.js
node create_db_upload.js
rd /s/q uploads 2>nul
rd /s/q upload_temp 2>nul

echo(
echo(Deleted database db.sqlite and recreated with test objects)
