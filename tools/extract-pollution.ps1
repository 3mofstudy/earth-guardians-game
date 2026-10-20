$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath = Split-Path -Parent $PSScriptRoot
$posterPath = (Get-ChildItem -LiteralPath $workspacePath -Filter '*2.jpg' | Select-Object -First 1).FullName
if (-not $posterPath) { throw 'Missing poster 2 JPG.' }
$poster=[System.Drawing.Image]::FromFile($posterPath)
$cardsPath=Join-Path $workspacePath 'assets\cards'
foreach ($row in 0..2) {
    foreach ($col in 0..2) {
        $number=$row*3+$col+1
        # Keep illustration and original label together in one crop. Remove
        # only empty side margins, the old border and the old corner badge.
        $cell=New-Object System.Drawing.Bitmap 218,106
        $cellGraphics=[System.Drawing.Graphics]::FromImage($cell)
        $cellGraphics.DrawImage($poster,(New-Object System.Drawing.Rectangle 0,0,218,106),@(53,275,495)[$col],@(586,693,799)[$row],218,106,[System.Drawing.GraphicsUnit]::Pixel)
        $cellGraphics.Dispose()
        # Remove only remnants of the original green frame at the cell edge.
        # Preserve all dark text and the artwork inside the frame.
        for($y=0;$y -lt 106;$y++){
            for($x=0;$x -lt 218;$x++){
                if($y -lt 9 -or $y -gt 98 -or $x -lt 36 -or $x -gt 201){
                    $p=$cell.GetPixel($x,$y)
                    if($p.G -gt ($p.R+5) -and $p.G -gt ($p.B+3)){$cell.SetPixel($x,$y,[System.Drawing.Color]::White)}
                }
            }
        }
        $left=207;$right=36;$top=100;$bottom=5
        for($y=5;$y -lt 100;$y++){
            for($x=36;$x -lt 207;$x++){
                $pixel=$cell.GetPixel($x,$y)
                if([Math]::Min($pixel.R,[Math]::Min($pixel.G,$pixel.B)) -lt 215){
                    $left=[Math]::Min($left,$x);$right=[Math]::Max($right,$x)
                    $top=[Math]::Min($top,$y);$bottom=[Math]::Max($bottom,$y)
                }
            }
        }
        $sourceRect=New-Object System.Drawing.Rectangle $left,$top,($right-$left+1),($bottom-$top+1)
        $content=$cell.Clone($sourceRect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $card=New-Object System.Drawing.Bitmap 238,192
        $g=[System.Drawing.Graphics]::FromImage($card)
        $g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.ScaleTransform(2,2)
        $path=New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddArc(1.5,1.5,18,18,180,90);$path.AddArc(99.5,1.5,18,18,270,90)
        $path.AddArc(99.5,76.5,18,18,0,90);$path.AddArc(1.5,76.5,18,18,90,90);$path.CloseFigure()
        $green=New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#23844a'))
        $pen=New-Object System.Drawing.Pen $green.Color,2
        $g.FillPath([System.Drawing.Brushes]::White,$path);$g.DrawPath($pen,$path)
        $scale=[Math]::Min(104/$sourceRect.Width,79/$sourceRect.Height)
        $width=$sourceRect.Width*$scale;$height=$sourceRect.Height*$scale
        $dest=New-Object System.Drawing.RectangleF ([float](59.5-$width/2)),([float](50.5-$height/2)),([float]$width),([float]$height)
        $g.DrawImage($content,$dest,(New-Object System.Drawing.Rectangle 0,0,$content.Width,$content.Height),[System.Drawing.GraphicsUnit]::Pixel)
        $g.FillEllipse($green,0,0,23,23)
        $font=New-Object System.Drawing.Font 'Arial',13,([System.Drawing.FontStyle]::Bold),([System.Drawing.GraphicsUnit]::Pixel)
        $format=New-Object System.Drawing.StringFormat
        $format.Alignment=[System.Drawing.StringAlignment]::Center;$format.LineAlignment=[System.Drawing.StringAlignment]::Center
        $g.DrawString([string]$number,$font,[System.Drawing.Brushes]::White,(New-Object System.Drawing.RectangleF 0,0,23,23),$format)
        $final=New-Object System.Drawing.Bitmap 119,96
        $fg=[System.Drawing.Graphics]::FromImage($final)
        $fg.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $fg.DrawImage($card,0,0,119,96)
        $final.Save((Join-Path $cardsPath ('bad-'+$number+'.png')),[System.Drawing.Imaging.ImageFormat]::Png)
        $fg.Dispose();$final.Dispose();$g.Dispose();$card.Dispose();$cell.Dispose();$content.Dispose();$path.Dispose();$pen.Dispose();$green.Dispose();$font.Dispose();$format.Dispose()
    }
}
$poster.Dispose()
Write-Output 'Re-extracted 9 original pollution cards at 119 x 96, matching boss cards with trimmed side margins.'
