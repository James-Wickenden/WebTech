@echo off

del db.sqlite
node create_db_user.js
node create_db_upload.js
node create_db_comment.js

rd /s/q public\uploads 2>nul
rd /s/q public\uploadstmp 2>nul

xcopy /s/q default_DB_data\1 public\uploads\1\
xcopy /s/q default_DB_data\2 public\uploads\2\
xcopy /s/q default_DB_data\3 public\uploads\3\
xcopy /s/q default_DB_data\4 public\uploads\4\

echo Ensure /public/uploads folder exists and contains necessary files.
echo Script will not work if any of the folders are open due to access errors.
