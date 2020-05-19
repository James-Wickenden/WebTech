@echo off

del db.sqlite
node create_db_user.js
node create_db_upload.js

rd /s/q public\uploads 2>nul
rd /s/q public\uploadstmp 2>nul

mkdir public\uploads\
mkdir public\uploads\1\
mkdir public\uploads\2\

copy default_DB_data\map.bsp public\uploads\1\map.bsp
copy default_DB_data\screenshot1.png public\uploads\1\screenshot1.png
copy default_DB_data\screenshot2.png public\uploads\1\screenshot2.png
copy default_DB_data\screenshot3.png public\uploads\1\screenshot3.png
copy default_DB_data\other.cfg public\uploads\2\other.cfg

echo Ensure /public/uploads folder exists and contains necessary files;
echo     known to fail due to permission errors.
