Add-Type -AssemblyName System.Drawing
$workspacePath = Split-Path -Parent $PSScriptRoot
$posterPath = (Get-ChildItem -LiteralPath $workspacePath -Filter '*.jpg' | Select-Object -First 1).FullName
$posterImage = [System.Drawing.Image]::FromFile($posterPath)
Write-Output ($posterImage.Width.ToString() + 'x' + $posterImage.Height.ToString())
New-Item -ItemType Directory -Path (Join-Path $workspacePath 'assets') -Force | Out-Null
$scaleX = $posterImage.Width / 1792
$scaleY = $posterImage.Height / 2400
$qrImage = New-Object System.Drawing.Bitmap 206,206
$qrGraphics = [System.Drawing.Graphics]::FromImage($qrImage)
$qrGraphics.DrawImage($posterImage,(New-Object System.Drawing.Rectangle 0,0,206,206),[float](1550*$scaleX),[float](2178*$scaleY),[float](206*$scaleX),[float](206*$scaleY),[System.Drawing.GraphicsUnit]::Pixel)
$qrImage.Save((Join-Path $workspacePath 'assets\poster-qr.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$qrGraphics.Dispose()
$qrImage.Dispose()
$posterImage.Dispose()
