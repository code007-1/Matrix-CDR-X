@echo off
echo Installing dependencies...
call npm install
call npm install node-windows --save
call npm install webpack webpack-cli webpack-node-externals --save-dev

echo.
echo Building project...
call npx webpack

echo.
echo Initializing Database...
node modules/initialize_db.js

echo.
echo Generating License...
node "modules/License Generator/generateLicense.js"

echo.
echo Installing Windows Service...
node install_service.js

echo.
echo Setup Complete!
pause
