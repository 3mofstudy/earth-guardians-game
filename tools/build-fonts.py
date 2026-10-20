"""產生涵蓋目前遊戲文案的 WOFF2 圓體，保留原授權及來源說明。"""
from pathlib import Path
import sys
root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / 'tools' / 'font-deps'))
from fontTools.ttLib import TTFont
from fontTools import subset

text = ''.join((root / name).read_text(encoding='utf-8') for name in ('index.html', 'game.js', 'art.js'))
codepoints = {ord(char) for char in text} | set(range(0x20, 0x100)) | {0x3000, 0xFF0C, 0x3002, 0xFF01, 0xFF1F, 0x2212, 0x2190, 0x2192, 0x25CB, 0xD7}
cjk = {point for point in codepoints if 0x3400 <= point <= 0x9FFF}
families = [
    ('Huninn-Regular.ttf', 'guardian-text.woff2', 'Guardian Text'),
    ('GenSenRounded2TW-B.otf', 'guardian-round-bold.woff2', 'Guardian Round'),
    ('GenSenRounded2TW-H.otf', 'guardian-round-heavy.woff2', 'Guardian Round'),
]
for source, output, family in families:
    font = TTFont(root / 'tools' / 'font-sources' / source)
    missing = cjk - set(font.getBestCmap())
    if missing:
        raise ValueError(f'{source}: missing Chinese characters {"".join(chr(c) for c in sorted(missing))}')
    options = subset.Options()
    options.flavor = 'woff2'
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    # Project-specific names identify these derived/subset files.
    style = 'Regular' if source.endswith('.ttf') else ('Bold' if '-B.otf' in source else 'Heavy')
    for record in font['name'].names:
        if record.nameID in (1, 4, 6, 16):
            value = family
            if record.nameID == 4:
                value = family + ' ' + style
            elif record.nameID == 6:
                value = family.replace(' ', '') + '-' + style
            record.string = value.encode(record.getEncoding(), errors='replace')
    font.flavor = 'woff2'
    path = root / 'assets' / 'fonts' / output
    font.save(path)
    loaded = TTFont(path)
    assert cjk <= set(loaded.getBestCmap())
    print(f'{output}: {path.stat().st_size} bytes, all {len(cjk)} required Chinese characters covered')
