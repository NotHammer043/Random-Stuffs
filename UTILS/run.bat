@echo off

rem Checking if node.js is installed
where node.exe >nul 2>&1 && set message=true || set message=false
if exist node.msi del node.msi
if %message% == false (
    curl -o node.msi https://nodejs.org/dist/v18.12.0/node-v18.12.0-x64.msi
    if exist node.msi (
        cls
        start node.msi
        echo Install Node.js then run this file again
        pause
        exit
    ) else (
        echo fail
    )
)
echo verifying modules...
node js/fix.js
@REM node ./js/updater.js

:ui
cls
title pls donate utils v2.1 by tzechco
echo option select
echo.
echo [1] transfer
echo [2] get robux amount
echo [3] setup gamepasses
echo [4] avatar changer
echo [5] account generator
echo [6] block all
echo [7] join group
echo [8] start discord bot
echo [9] account management
echo [10] settings
echo.
set /p o=
if %o% == 1 goto transfer
if %o% == 2 goto amount
if %o% == 3 goto gamepass
if %o% == 4 goto avatar
if %o% == 5 goto gen
if %o% == 6 goto block
if %o% == 7 goto group
if %o% == 8 goto bot
if %o% == 9 goto account
if %o% == 10 goto config
pause
goto ui

:transfer
cls
node ./js/transfer.js
pause
goto ui

:amount
cls
node ./js/robuxAmount.js
pause
goto ui

:gamepass
cls
echo setup gamepasses
echo.
echo enter the username or "all"
echo.
set /p name=
echo.
if %name% == all (
    node ./js/all.js gamepass
) else (
    node ./js/gamepass.js %name%
)
pause
goto ui

:avatar
cls
echo avatar changer
echo.
echo enter the username or "all"
echo.
set /p name=
cls
echo enter user to copy
echo.
set /p copy=
cls
if %name% == all (
    node ./js/all.js avatar %copy%
) else (
    node ./js/avatar.js %name% %copy%
)
pause
goto ui

:gen
cls
echo account generator
echo.
echo how many accounts?
set /p number=
cls
echo what gender?
echo.
echo [M]ale [F]emale [R]andom
set /p gender=
cls
echo enter a nopecha key if you have one
echo.
set /p nopecha=
cls
node ./js/gen.js %number% %gender% %nopecha%
pause
goto ui

:block
cls
echo block all
echo.
echo enter username to block on or "all"
set /p name=
cls
if %name% == all (
    node ./js/all.js block
) else (
    node ./js/block.js %name%
)
pause
goto ui

:group
cls
echo join group
echo.
echo enter username to join on or "all"
set /p name=
cls
if %name% == all (
    node ./js/all.js group
) else (
    node ./js/group.js %name%
)
pause
goto ui

:bot
cls
node js/bot.js
pause
goto ui

:account
cls
node ./js/account.js
pause
goto ui

:config
cls
node js/settings.js
goto ui
