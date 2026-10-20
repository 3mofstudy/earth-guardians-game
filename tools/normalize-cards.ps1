$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath = Split-Path -Parent $PSScriptRoot
$cardsPath = Join-Path $workspacePath 'assets\cards'
function Find-InkBounds($image,$x,$y,$width,$height,$darkOnly) {
    $left=$x+$width; $right=$x; $top=$y+$height; $bottom=$y
    for ($py=$y; $py -lt ($y+$height); $py++) {
        for ($px=$x; $px -lt ($x+$width); $px++) {
            $p=$image.GetPixel($px,$py)
            $isInk=if ($darkOnly) { $p.R -lt 110 -and $p.G -lt 110 -and $p.B -lt 110 } else { [Math]::Min($p.R,[Math]::Min($p.G,$p.B)) -lt 215 }
            if ($isInk) { $left=[Math]::Min($left,$px);$right=[Math]::Max($right,$px);$top=[Math]::Min($top,$py);$bottom=[Math]::Max($bottom,$py) }
        }
    }
    if ($left -gt $right) { return New-Object System.Drawing.Rectangle $x,$y,$width,$height }
    return New-Object System.Drawing.Rectangle $left,$top,($right-$left+1),($bottom-$top+1)
}
function Draw-Fit($graphics,$source,$sourceRect,$targetRect) {
    $scale=[Math]::Min($targetRect.Width/$sourceRect.Width,$targetRect.Height/$sourceRect.Height)
    $width=$sourceRect.Width*$scale; $height=$sourceRect.Height*$scale
    $dest=New-Object System.Drawing.RectangleF ([float]($targetRect.X+($targetRect.Width-$width)/2)),([float]($targetRect.Y+($targetRect.Height-$height)/2)),([float]$width),([float]$height)
    $graphics.DrawImage($source,$dest,$sourceRect,[System.Drawing.GraphicsUnit]::Pixel)
}
foreach ($file in (Get-ChildItem -LiteralPath $cardsPath -Filter '*.png')) {
    if ($file.Name -notlike 'boss-*') { continue }
    $source = New-Object System.Drawing.Bitmap $file.FullName
    if ($source.Width -eq 119 -and $source.Height -eq 96) { $source.Dispose(); continue }
    $isBoss=$file.Name -like 'boss-*'
    if ($isBoss) {
        # Keep the original topic illustration, excluding the corner number.
        $artBounds=Find-InkBounds $source 33 4 70 ($source.Height-8) $false
        $textBounds=Find-InkBounds $source 110 15 135 ($source.Height-25) $true
    } else {
        $artBounds=Find-InkBounds $source 36 5 170 72 $false
        $textBounds=Find-InkBounds $source 15 78 190 23 $true
    }
    $card=New-Object System.Drawing.Bitmap 238,192
    $g=[System.Drawing.Graphics]::FromImage($card)
    $g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.ScaleTransform(2,2)
    $path=New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(1.5,1.5,18,18,180,90); $path.AddArc(99.5,1.5,18,18,270,90)
    $path.AddArc(99.5,76.5,18,18,0,90); $path.AddArc(1.5,76.5,18,18,90,90); $path.CloseFigure()
    $g.FillPath([System.Drawing.Brushes]::White,$path)
    $pen=New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#23844a')),2
    $g.DrawPath($pen,$path)
    Draw-Fit $g $source $artBounds (New-Object System.Drawing.RectangleF 22,7,91,63)
    Draw-Fit $g $source $textBounds (New-Object System.Drawing.RectangleF 7,75,105,17)
    $badge=New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#23844a'))
    $g.FillEllipse($badge,0,0,23,23)
    $font=New-Object System.Drawing.Font 'Arial',13,([System.Drawing.FontStyle]::Bold),([System.Drawing.GraphicsUnit]::Pixel)
    $format=New-Object System.Drawing.StringFormat
    $format.Alignment=[System.Drawing.StringAlignment]::Center; $format.LineAlignment=[System.Drawing.StringAlignment]::Center
    $number=[regex]::Match($file.BaseName,'\d+').Value
    $g.DrawString($number,$font,[System.Drawing.Brushes]::White,(New-Object System.Drawing.RectangleF 0,0,23,23),$format)
    $source.Dispose()
    # Match the original low-carbon cards' exact pixel dimensions.
    $final=New-Object System.Drawing.Bitmap 119,96
    $fg=[System.Drawing.Graphics]::FromImage($final)
    $fg.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $fg.DrawImage($card,0,0,119,96)
    $final.Save($file.FullName,[System.Drawing.Imaging.ImageFormat]::Png)
    $fg.Dispose();$final.Dispose();$g.Dispose();$card.Dispose();$path.Dispose();$pen.Dispose();$badge.Dispose();$font.Dispose();$format.Dispose()
}
Write-Output 'Boss cards use 119 x 96 dimensions; item cards are left unchanged.'
