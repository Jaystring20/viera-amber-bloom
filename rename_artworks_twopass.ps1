# Two-Pass Artwork Rename Script
# Pass 1: Rename artwork_XXXX.webp -> temp_XXXX.webp
# Pass 2: Rename temp_XXXX.webp -> artwork_PDF#.webp
# This avoids circular dependency collisions

$artworksPath = "C:\Users\DELL\projects\viera-amber\public\artworks"

# Mapping: old_artwork_number => new_pdf_number
$mappings = @{
    "0046" = "0016"; "0047" = "0017"; "0048" = "0018"; "0049" = "0020"; "0050" = "0019"
    "0051" = "0014"; "0052" = "0026"; "0053" = "0030"; "0054" = "0028"; "0055" = "0027"
    "0056" = "0029"; "0057" = "0059"; "0058" = "0055"; "0059" = "0056"; "0060" = "0057"
    "0061" = "0058"; "0062" = "0061"; "0063" = "0060"; "0064" = "0031"; "0065" = "0033"
    "0066" = "0034"; "0067" = "0032"; "0068" = "0003"; "0069" = "0001"; "0070" = "0073"
    "0071" = "0095"; "0072" = "0106"; "0073" = "0002"; "0074" = "0051"; "0075" = "0052"
    "0076" = "0053"; "0077" = "0054"; "0078" = "0007"; "0079" = "0007"; "0080" = "0087"
    "0081" = "0090"; "0082" = "0006"; "0083" = "0086"; "0084" = "0089"; "0085" = "0081"
    "0086" = "0091"; "0087" = "0092"; "0088" = "0094"; "0089" = "0096"; "0090" = "0100"
    "0091" = "0098"; "0092" = "0103"; "0093" = "0104"; "0094" = "0099"; "0095" = "0097"
    "0096" = "0101"; "0097" = "0102"; "0098" = "0105"; "0099" = "0067"; "0100" = "0066"
    "0101" = "0107"; "0102" = "0108"; "0103" = "0109"; "0104" = "0110"; "0105" = "0111"
}

Write-Host "================== TWO-PASS RENAME SCRIPT ==================" -ForegroundColor Cyan
Write-Host "Pass 1: artwork_XXXX.webp >> temp_XXXX.webp (60 files)" -ForegroundColor Yellow
Write-Host "Pass 2: temp_XXXX.webp >> artwork_PDF#.webp" -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: artwork_0078 and artwork_0079 both map to PDF 0007" -ForegroundColor Yellow
Write-Host "      0079 will be renamed, 0078 will stay as temp_0078.webp" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue (this will rename 60 files)"

# PASS 1: Rename all artwork_XXXX.webp to temp_XXXX.webp
Write-Host ""
Write-Host "=== PASS 1: Rename to temporary names ===" -ForegroundColor Cyan

$pass1Success = 0
foreach ($oldNum in $mappings.Keys) {
    $oldFile = Join-Path $artworksPath "artwork_$oldNum.webp"
    $tempFile = Join-Path $artworksPath "temp_$oldNum.webp"

    if (Test-Path $oldFile) {
        try {
            Rename-Item -Path $oldFile -NewName "temp_$oldNum.webp"
            Write-Host "PASS 1: artwork_$oldNum.webp >> temp_$oldNum.webp" -ForegroundColor Green
            $pass1Success++
        }
        catch {
            Write-Host "PASS 1 FAILED: artwork_$oldNum.webp - $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Pass 1 Complete: $pass1Success files renamed to temp names" -ForegroundColor Green
Write-Host ""

# PASS 2: Rename temp_XXXX.webp to artwork_PDF#.webp
Write-Host "=== PASS 2: Rename from temporary to final names ===" -ForegroundColor Cyan

$pass2Success = 0
$pass2Skipped = 0

foreach ($oldNum in $mappings.Keys) {
    $newNum = $mappings[$oldNum]
    $tempFile = Join-Path $artworksPath "temp_$oldNum.webp"
    $finalFile = Join-Path $artworksPath "artwork_$newNum.webp"

    if (Test-Path $tempFile) {
        # Check for collision (PDF 0007 case with both 0078 and 0079)
        if ($newNum -eq "0007" -and (Test-Path $finalFile)) {
            Write-Host "PASS 2 SKIP: temp_$oldNum.webp (would overwrite artwork_$newNum.webp)" -ForegroundColor Yellow
            $pass2Skipped++
        }
        else {
            try {
                Rename-Item -Path $tempFile -NewName "artwork_$newNum.webp"
                Write-Host "PASS 2: temp_$oldNum.webp >> artwork_$newNum.webp" -ForegroundColor Green
                $pass2Success++
            }
            catch {
                Write-Host "PASS 2 FAILED: temp_$oldNum.webp - $_" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "PASS 2: temp_$oldNum.webp NOT FOUND (may have been renamed in Pass 1)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL RESULTS:" -ForegroundColor Cyan
Write-Host "Pass 1 Success: $pass1Success files" -ForegroundColor Green
Write-Host "Pass 2 Success: $pass2Success files" -ForegroundColor Green
Write-Host "Pass 2 Skipped: $pass2Skipped files (collisions)" -ForegroundColor Yellow
Write-Host "Total Renamed: $($pass1Success + $pass2Success) files" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# List any remaining temp files
Write-Host ""
Write-Host "Checking for leftover temp files..." -ForegroundColor Yellow
$tempFiles = Get-ChildItem -Path $artworksPath -Filter "temp_*.webp" -ErrorAction SilentlyContinue
if ($tempFiles.Count -gt 0) {
    Write-Host "Remaining temp files (need manual handling):" -ForegroundColor Yellow
    foreach ($file in $tempFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "No leftover temp files - all clean!" -ForegroundColor Green
}
