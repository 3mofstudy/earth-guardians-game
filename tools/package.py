"""建立可上傳至靜態網站空間的遊戲 ZIP。"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from importlib.util import spec_from_file_location, module_from_spec

root = Path(__file__).resolve().parent.parent
version_spec = spec_from_file_location('version_assets', root / 'tools' / 'version-assets.py')
version_module = module_from_spec(version_spec)
version_spec.loader.exec_module(version_module)
version_module.generate()
files = [root / name for name in ('index.html', 'biodiversity.html', 'biodiversity.css', 'biodiversity.js', 'building-energy.html', 'building-energy.css', 'building-energy.js', 'climate-risk.html', 'climate-risk.css', 'climate-risk.js', 'style.css', 'landscape.css', 'mission.css', 'typography.css', 'responsive.css', 'endings.css', 'art.js', 'game.js', 'README.md')]
files.extend((root / 'assets').rglob('*'))
files.extend((root / 'video').rglob('*.mp4'))
files.extend(root / name for name in ('cache-refresh.js', 'site-version.json'))
files.extend(root / 'tools' / name for name in ('version-assets.py', 'test-cache-refresh.cjs'))
files.extend(root / 'tools' / name for name in ('test-game.cjs', 'package.py', 'download-fonts.py', 'build-fonts.py'))
with ZipFile(root / 'earth-guardians-game.zip', 'w', ZIP_DEFLATED) as bundle:
    for file in files:
        if file.is_file():
            bundle.write(file, file.relative_to(root))
print('Created earth-guardians-game.zip')
