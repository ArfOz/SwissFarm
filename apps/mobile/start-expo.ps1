Write-Host "Starting Expo Dev Server for SDK 55..." -ForegroundColor Green
Write-Host ""
Write-Host "Telefonda gormek icin:" -ForegroundColor Yellow
Write-Host "  1. QR kodu Expo Go ile tara" -ForegroundColor Cyan
Write-Host "  2. Veya 'a' tusuna bas (Android USB)" -ForegroundColor Cyan
Write-Host ""

$expopath = "D:\GithubProjects\SwissFarm\apps\mobile"

# Kill any existing node processes using Expo ports
Get-NetTCPConnection -LocalPort 8081,19000,19001,19002 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force
}

Start-Sleep -Seconds 1

# Start Expo server
Set-Location $expopath
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx expo start --clear" -WindowStyle Normal -NoNewWindow:$false

Write-Host ""
Write-Host "Server baslatiliyor... Port 8081 kontrol ediliyor..." -ForegroundColor Green

for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $port = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
    if ($port) {
        Write-Host "Expo server calisiyor! (Port 8081)" -ForegroundColor Green
        Write-Host "Telefonundaki Expo Go uygulamasindan QR kodu tara." -ForegroundColor Cyan
        break
    }
    Write-Host "." -NoNewline
}
