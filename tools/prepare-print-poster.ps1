param([string]$EnhancedSource = '')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$project = Split-Path $PSScriptRoot -Parent
$sourcePath = Join-Path $project '綠能接接樂.jpg'
$printDir = Join-Path $project 'print'
[IO.Directory]::CreateDirectory($printDir) | Out-Null
$backup = Join-Path $printDir 'original-before-qr.jpg'
if (!(Test-Path -LiteralPath $backup)) { Copy-Item -LiteralPath $sourcePath -Destination $backup }
$inputPath = if ($EnhancedSource) { $EnhancedSource } else { $backup }
$source = [Drawing.Image]::FromFile($inputPath)
$qr = [Drawing.Image]::FromFile((Join-Path $project 'assets\poster-qr.png'))
$width = 7087
$height = [int][Math]::Round($width * 1024 / 765)
$bitmap = New-Object Drawing.Bitmap($width, $height)
$bitmap.SetResolution(300, 300)
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([Drawing.Color]::White)
$graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.DrawImage($source, 0, 0, $width, $height)
# Original poster coordinates: replace the old QR including its white border.
$scale = $width / 765.0
$left = [int][Math]::Round(649 * $scale)
$top = [int][Math]::Round(925 * $scale)
$size = [int][Math]::Round(91 * $scale)
$graphics.FillRectangle([Drawing.Brushes]::White, $left, $top, $size, $size)
# Use an integer module size to avoid grey/blurred QR edges. Source has 41 modules.
$moduleSize = [int][Math]::Floor($size / 41)
$qrSize = $moduleSize * 41
$inset = [int][Math]::Floor(($size - $qrSize) / 2)
$graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
$graphics.DrawImage($qr, $left + $inset, $top + $inset, $qrSize, $qrSize)
$graphics.Dispose()
$qr.Dispose()
$source.Dispose()
$pngPath = Join-Path $printDir 'earth-guardians-poster-60cm-300dpi.png'
$bitmap.Save($pngPath, [Drawing.Imaging.ImageFormat]::Png)
$encoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = New-Object Drawing.Imaging.EncoderParameters(1)
$parameters.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, [long]98)
$bitmap.Save($sourcePath, $encoder, $parameters)
$parameters.Dispose()
$preview = New-Object Drawing.Bitmap(765, 1024)
$previewGraphics = [Drawing.Graphics]::FromImage($preview)
$previewGraphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$previewGraphics.DrawImage($bitmap, 0, 0, 765, 1024)
$previewGraphics.Dispose()
$preview.Save((Join-Path $printDir 'poster-preview.png'), [Drawing.Imaging.ImageFormat]::Png)
$preview.Dispose()
$bitmap.Dispose()
Write-Output "Print PNG: $pngPath"
Write-Output "Size: $width x $height px, 300 dpi"
