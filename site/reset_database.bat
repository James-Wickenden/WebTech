@echo off

del db.sqlite
node create_db_user.js
node create_db_upload.js

rd /s/q uploads 2>nul
rd /s/q upload_temp 2>nul

mkdir uploads\
mkdir uploads\Maptest\
mkdir uploads\Othertest\

copy default_DB_data\map.bsp uploads\Maptest\map.bsp
copy default_DB_data\screenshot1.png uploads\Maptest\screenshot1.png
copy default_DB_data\screenshot2.png uploads\Maptest\screenshot2.png
copy default_DB_data\screenshot3.png uploads\Maptest\screenshot3.png
copy default_DB_data\other.cfg uploads\Othertest\other.cfg

echo Deleted database db.sqlite and recreated with test objects
