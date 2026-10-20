"""建立可上傳至靜態網站空間的遊戲 ZIP。"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
files = [root / name for name in ('index.html', 'style.css', 'landscape.css', 'mission.css', 'typography.css', 'art.js', 'game.js', 'README.md')]
files.extend((root / 'assets').rglob('*'))
files.extend(root / 'tools' / name for name in ('test-game.cjs', 'package.py', 'download-fonts.py', 'build-fonts.py'))
with ZipFile(root / 'earth-guardians-game.zip', 'w', ZIP_DEFLATED) as bundle:
    for file in files:
        if file.is_file():
            bundle.write(file, file.relative_to(root))
print('Created earth-guardians-game.zip')
