# Rename the remaining 27 unrenamed artwork files
$artworksPath = "C:\Users\DELL\projects\viera-amber\public\artworks"

# Mapping of the 27 remaining files
$mappings = @{
    "0051" = "0014"
    "0052" = "0026"
    "0053" = "0030"
    "0054" = "0028"
    "0055" = "0027"
    "0056" = "0029"
    "0057" = "0059"
    "0058" = "0055"
    "0059" = "0056"
    "0060" = "0057"
    "0061" = "0058"
    "0066" = "0034"
    "0067" = "0032"
    "0073" = "0002"
    "0081" = "0090"
    "0086" = "0091"
    "0087" = "0092"
    "0089" = "0096"
    "0090" = "0100"
    "0091" = "0098"
    "0092" = "0103"
    "0094" = "0099"
    "0095" = "0097"
    "0096" = "0101"
    "0097" = "0102"
    "0098" = "0105"
    "0099" = "0067"
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Renaming 27 remaining artwork files" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$skipCount = 0
$failCount = 0

foreach ($oldNum in $mappings.Keys) {
    $newNum = $mappings[$oldNum]
    $oldFile = Join-Path $artworksPath "artwork_$oldNum.webp"
    $newFile = Join-Path $artworksPath "artwork_$newNum.webp"

    if (Test-Path $oldFile) {
        # Check if target already exists
        if (Test-Path $newFile) {
            Write-Host "SKIP: artwork_$oldNum.webp (artwork_$newNum.webp already exists)" -ForegroundColor Yellow
            $skipCount++
        }
        else {
            try {
                Rename-Item -Path $oldFile -NewName "artwork_$newNum.webp"
                Write-Host "OK: artwork_$oldNum.webp >> artwork_$newNum.webp" -ForegroundColor Green
                $successCount++
            }
            catch {
                Write-Host "FAIL: artwork_$oldNum.webp - $_" -ForegroundColor Red
                $failCount++
            }
        }
    }
    else {
        Write-Host "NOT FOUND: artwork_$oldNum.webp" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "RESULTS:" -ForegroundColor Cyan
Write-Host "Renamed: $successCount" -ForegroundColor Green
Write-Host "Skipped (collision): $skipCount" -ForegroundColor Yellow
Write-Host "Failed/Not Found: $failCount" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Cyan
