Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path -Parent $PSScriptRoot
$sheet=New-Object System.Drawing.Bitmap 389,320
$g=[System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#edf5e7'))
foreach($number in 1..9){
    $image=[System.Drawing.Image]::FromFile((Join-Path $workspacePath ('assets\cards\bad-'+$number+'.png')))
    $x=8+(($number-1)%3)*127;$y=8+[Math]::Floor(($number-1)/3)*104
    $g.DrawImageUnscaled($image,[int]$x,[int]$y)
    $image.Dispose()
}
$sheet.Save((Join-Path $PSScriptRoot 'card-grid-preview.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose();$sheet.Dispose()
