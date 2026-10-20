$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath = Split-Path -Parent $PSScriptRoot
$posterPath = (Get-ChildItem -LiteralPath $workspacePath -Filter '*2.jpg' | Select-Object -First 1).FullName
$poster = [System.Drawing.Image]::FromFile($posterPath)
$preview = New-Object System.Drawing.Bitmap 624,900
$graphics = [System.Drawing.Graphics]::FromImage($preview)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.DrawImage($poster,(New-Object System.Drawing.Rectangle 0,0,624,900),510,50,104,150,[System.Drawing.GraphicsUnit]::Pixel)
$preview.Save((Join-Path $PSScriptRoot 'boy-reference.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$preview.Dispose()
$outline = New-Object System.Drawing.Drawing2D.GraphicsPath
$points = @(
 @(207,54),@(254,38),@(309,29),@(354,30),@(398,47),@(416,30),@(437,37),@(450,65),@(477,63),@(502,74),@(505,86),@(482,104),@(511,142),@(532,193),@(539,234),@(536,279),@(546,285),@(557,299),@(562,322),@(560,347),@(548,370),@(526,382),@(492,388),@(468,421),@(422,456),@(426,477),@(452,489),@(473,516),@(474,538),@(491,557),@(509,587),@(530,613),@(534,639),@(521,654),@(497,660),@(478,649),@(468,636),@(466,621),@(450,595),@(448,741),@(422,754),@(421,805),@(444,819),@(446,839),@(439,848),@(374,850),@(362,839),@(354,758),@(345,752),@(340,714),@(334,701),@(327,749),@(314,755),@(303,825),@(294,845),@(273,852),@(228,849),@(222,839),@(232,818),@(244,809),@(245,752),@(232,748),@(226,737),@(170,746),@(102,735),@(66,716),@(55,700),@(45,644),@(38,633),@(40,603),@(54,593),@(67,568),@(80,544),@(99,527),@(134,513),@(172,514),@(191,494),@(217,477),@(220,458),@(177,438),@(151,416),@(143,404),@(108,400),@(83,389),@(68,367),@(67,337),@(81,318),@(92,310),@(84,289),@(83,258),@(84,230),@(92,190),@(111,148),@(140,106),@(178,72)
)
$outline.AddPolygon([System.Drawing.PointF[]]@($points | ForEach-Object { New-Object System.Drawing.PointF ([float]($_[0]/2)),([float]($_[1]/2)) }))
$sprite = New-Object System.Drawing.Bitmap 312,450
$spriteGraphics = [System.Drawing.Graphics]::FromImage($sprite)
$spriteGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$spriteGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$spriteGraphics.SetClip($outline)
$spriteGraphics.DrawImage($poster,(New-Object System.Drawing.Rectangle 0,0,312,450),510,50,104,150,[System.Drawing.GraphicsUnit]::Pixel)
$sprite.Save((Join-Path $workspacePath 'assets\player-boy.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$spriteGraphics.Dispose()
$sprite.Dispose()
$outline.Dispose()
$poster.Dispose()
Write-Output 'Extracted original poster boy to assets/player-boy.png.'
