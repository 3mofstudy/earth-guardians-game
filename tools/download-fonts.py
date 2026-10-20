"""從作者／Google Fonts 官方儲存庫下載免費圓體與授權。"""
from pathlib import Path
from urllib.request import urlopen, Request
from concurrent.futures import ThreadPoolExecutor

root = Path(__file__).resolve().parent.parent
sources = root / 'tools' / 'font-sources'
fonts = root / 'assets' / 'fonts'
sources.mkdir(exist_ok=True)
fonts.mkdir(exist_ok=True)
files = [
    ('https://raw.githubusercontent.com/google/fonts/main/ofl/huninn/Huninn-Regular.ttf', sources / 'Huninn-Regular.ttf'),
    ('https://raw.githubusercontent.com/google/fonts/main/ofl/huninn/OFL.txt', fonts / 'Huninn-OFL.txt'),
    ('https://raw.githubusercontent.com/ButTaiwan/gensen-font/master/otf/TW/GenSenRounded2TW-B.otf', sources / 'GenSenRounded2TW-B.otf'),
    ('https://raw.githubusercontent.com/ButTaiwan/gensen-font/master/otf/TW/GenSenRounded2TW-H.otf', sources / 'GenSenRounded2TW-H.otf'),
    ('https://raw.githubusercontent.com/ButTaiwan/gensen-font/master/SIL_Open_Font_License_1.1.txt', fonts / 'GenSen-OFL.txt'),
]
def download(file):
    url, path = file
    data = urlopen(Request(url, headers={'User-Agent': 'EarthGuardians-font-setup'}), timeout=90).read()
    path.write_bytes(data)
    print(f'{path.name}: {len(data)} bytes')
with ThreadPoolExecutor(max_workers=5) as pool:
    list(pool.map(download, files))
