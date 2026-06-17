# fix-dns.ps1 — Đổi DNS sang Google DNS để kết nối MongoDB Atlas
# Chạy với quyền Administrator: Right-click PowerShell -> Run as Administrator
# Sau đó: .\fix-dns.ps1

Write-Host "=== Fix DNS for MongoDB Atlas ===" -ForegroundColor Cyan

# Tìm network adapter đang active
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }

if (-not $adapters) {
    Write-Host "Khong tim thay network adapter nao dang hoat dong!" -ForegroundColor Red
    exit 1
}

foreach ($adapter in $adapters) {
    Write-Host "`nDang doi DNS cho: $($adapter.Name) ($($adapter.InterfaceDescription))" -ForegroundColor Yellow
    
    # Đổi sang Google DNS
    Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
    
    Write-Host "  -> Da dat DNS: 8.8.8.8, 8.8.4.4" -ForegroundColor Green
}

# Flush DNS cache
Write-Host "`nDang flush DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "Da flush DNS cache!" -ForegroundColor Green

# Test
Write-Host "`nDang test ket noi MongoDB Atlas..." -ForegroundColor Yellow
$result = nslookup devcopet-bkute.jad3gzj.mongodb.net 8.8.8.8 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Ket noi DNS OK!" -ForegroundColor Green
} else {
    Write-Host "Van chua resolve duoc. Kiem tra lai internet." -ForegroundColor Red
}

Write-Host "`n=== Done! Chay lai 'npm run start:dev' ===" -ForegroundColor Cyan
