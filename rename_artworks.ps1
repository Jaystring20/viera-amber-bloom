# Rename artworks based on PDF mappings (Batches 10-21)
# This script will rename artwork_XXXX.webp to match PDF numbering

$artworksPath = "C:\Users\DELL\projects\viera-amber\public\artworks"

# Mapping: old_artwork_number => new_pdf_number
$mappings = @{
    "0046" = "0016"
    "0047" = "0017"
    "0048" = "0018"
    "0049" = "0020"
    "0050" = "0019"
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
    "0062" = "0061"
    "0063" = "0060"
    "0064" = "0031"
    "0065" = "0033"
    "0066" = "0034"
    "0067" = "0032"
    "0068" = "0003"
    "0069" = "0001"
    "0070" = "0073"
    "0071" = "0095"
    "0072" = "0106"
    "0073" = "0002"
    "0074" = "0051"
    "0075" = "0052"
    "0076" = "0053"
    "0077" = "0054"
    "0078" = "0007"
    "0079" = "0007"  # Note: Both 0078 & 0079 map to same PDF 0007 - handle manually
    "0080" = "0087"
    "0081" = "0090"
    "0082" = "0006"
    "0083" = "0086"
    "0084" = "0089"
    "0085" = "0081"
    "0086" = "0091"
    "0087" = "0092"
    "0088" = "0094"
    "0089" = "0096"
    "0090" = "0100"
    "0091" = "0098"
    "0092" = "0103"
    "0093" = "0104"
    "0094" = "0099"
    "0095" = "0097"
    "0096" = "0101"
    "0097" = "0102"
    "0098" = "0105"
    "0099" = "0067"
    "0100" = "0066"
    "0101" = "0107"
    "0102" = "0108"
    "0103" = "0109"
    "0104" = "0110"
    "0105" = "0111"
}

Write-Host "⚠️  WARNING: This will rename all artwork files!"
Write-Host "Current structure: artwork_XXXX.webp → artwork_PDF#.webp"
Write-Host ""
Write-Host "SPECIAL NOTE: artwork_0079 and artwork_0078 both map to PDF 0007"
Write-Host "You'll need to handle this collision manually - pick one to rename"
Write-Host ""
Read-Host "Press Enter to continue, or Ctrl+C to cancel"

$renamedCount = 0
$skippedCount = 0

foreach ($oldNum in $mappings.Keys) {
    $newNum = $mappings[$oldNum]
    $oldFile = Join-Path $artworksPath "artwork_$oldNum.webp"
    $newFile = Join-Path $artworksPath "artwork_$newNum.webp"

    if (Test-Path $oldFile) {
        # Check for collision (PDF 0007 case)
        if ($newNum -eq "0007" -and (Test-Path $newFile)) {
            Write-Host "SKIP: artwork_$oldNum.webp >> would overwrite artwork_$newNum.webp (PDF collision)" -ForegroundColor Yellow
            $skippedCount++
        }
        else {
            try {
                Rename-Item -Path $oldFile -NewName "artwork_$newNum.webp" -Force
                Write-Host "OK: artwork_$oldNum.webp >> artwork_$newNum.webp" -ForegroundColor Green
                $renamedCount++
            }
            catch {
                Write-Host "FAILED: artwork_$oldNum.webp - $_" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "✗ NOT FOUND: artwork_$oldNum.webp" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Renamed: $renamedCount files" -ForegroundColor Green
Write-Host "Skipped: $skippedCount files (collisions)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
