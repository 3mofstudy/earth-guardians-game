$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath = Split-Path -Parent $PSScriptRoot
$posterPath = (Get-ChildItem -LiteralPath $workspacePath -Filter '*2.jpg' | Select-Object -First 1).FullName
if (-not $posterPath) { throw 'Missing poster 2 JPG.' }
$posterImage = [System.Drawing.Image]::FromFile($posterPath)
$outputPath = Join-Path $workspacePath 'assets\cards'
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
$cards = @()
foreach ($row in 0..2) {
    foreach ($col in 0..2) {
        $cards += ,@(('good-' + ($row*3+$col+1)), @(49,171,294)[$col], @(247,342,436)[$row], 119, 96)
    }
}
foreach ($row in 0..2) {
    foreach ($col in 0..2) {
        $cards += ,@(('bad-' + ($row*3+$col+1)), @(53,275,495)[$col], @(586,693,799)[$row], 218, 106)
    }
}
$cards += ,@('boss-1',461,282,254,72)
$cards += ,@('boss-2',461,358,254,81)
$cards += ,@('boss-3',461,444,254,88)
foreach ($card in $cards) {
    $image = New-Object System.Drawing.Bitmap ([int]$card[3]),([int]$card[4])
    $graphics = [System.Drawing.Graphics]::FromImage($image)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = 20
    $path.AddArc(0,0,$radius,$radius,180,90)
    $path.AddArc(($card[3]-$radius),0,$radius,$radius,270,90)
    $path.AddArc(($card[3]-$radius),($card[4]-$radius),$radius,$radius,0,90)
    $path.AddArc(0,($card[4]-$radius),$radius,$radius,90,90)
    $path.CloseFigure()
    $graphics.SetClip($path)
    $graphics.DrawImage($posterImage,(New-Object System.Drawing.Rectangle 0,0,$card[3],$card[4]),[int]$card[1],[int]$card[2],[int]$card[3],[int]$card[4],[System.Drawing.GraphicsUnit]::Pixel)
    $image.Save((Join-Path $outputPath ($card[0]+'.png')),[System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $image.Dispose()
    $path.Dispose()
}
$posterImage.Dispose()
Write-Output 'Extracted 18 item cards and 3 boss topic cards from poster 2.'
& (Join-Path $PSScriptRoot 'normalize-cards.ps1')
& (Join-Path $PSScriptRoot 'extract-pollution.ps1')
