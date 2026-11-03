$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$source = [Drawing.Image]::FromFile((Join-Path $PSScriptRoot 'bear-source.png'))
$height = 540
$width = [int][Math]::Round($source.Width * $height / $source.Height)
$sprite = New-Object Drawing.Bitmap($width, $height, ([Drawing.Imaging.PixelFormat]::Format32bppArgb))
$graphics = [Drawing.Graphics]::FromImage($sprite)
$graphics.Clear([Drawing.Color]::Transparent)
$graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
$graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.DrawImage($source, 0, 0, $width, $height)
$graphics.Dispose()
$source.Dispose()
$path = Join-Path $root 'assets\player-bear.png'
$sprite.Save($path, [Drawing.Imaging.ImageFormat]::Png)
$sprite.Dispose()
Write-Output "$path ($width x $height)"
