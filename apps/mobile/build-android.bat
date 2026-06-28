@echo off
D:
cd \GithubProjects\SwissFarm\apps\mobile
echo ============================================
echo  Building Android APK for SDK 55
echo ============================================
echo.
echo Bu islem ilk seferde 5-10 dk surebilir...
echo.
npx expo run:android
pause
