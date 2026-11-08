"""依內容產生網站版本，替本機資源網址加上版本，供 GitHub Pages 更新快取。"""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent.parent
PAGES = ('index.html', 'building-energy.html', 'biodiversity.html', 'climate-risk.html')
VERSION_QUERY = re.compile(r'([?&])v=[^\s\"\'<>`)#&]+')
META = re.compile(r'^[ \t]*<meta name="site-version" content="[^"]*">\r?\n?', re.M)
LOADER = re.compile(r'^[ \t]*<script src="cache-refresh\.js(?:\?[^"]*)?"(?: defer)?></script>\r?\n?', re.M)

def clean_url(url):
    return VERSION_QUERY.sub('', url).rstrip('?&')

def normalize(text, page=False):
    if page:
        text = LOADER.sub('', META.sub('', text))
    return VERSION_QUERY.sub('', text)

def generate():
    paths = sorted([*ROOT.glob('*.html'), *ROOT.glob('*.css'), *ROOT.glob('*.js'),
                    *(ROOT / 'assets').rglob('*'), *(ROOT / 'video').rglob('*.mp4')])
    digest = hashlib.sha256()
    for path in paths:
        if not path.is_file():
            continue
        digest.update(path.relative_to(ROOT).as_posix().encode('utf-8'))
        if path.suffix in ('.html', '.css', '.js'):
            digest.update(normalize(path.read_text(encoding='utf-8'), path.suffix == '.html').encode('utf-8'))
        else:
            with path.open('rb') as source:
                for block in iter(lambda: source.read(1024 * 1024), b''):
                    digest.update(block)
    version = digest.hexdigest()[:16]

    def versioned(url):
        if url.startswith(('https:', 'http:', '//', '#', 'data:', 'mailto:')):
            return url
        url = clean_url(url)
        path, separator, fragment = url.partition('#')
        path += ('&' if '?' in path else '?') + 'v=' + version
        return path + (separator + fragment if separator else '')

    for name in PAGES:
        path = ROOT / name
        text = LOADER.sub('', META.sub('', path.read_text(encoding='utf-8')))
        text = re.sub(r'\b(src|href)="([^"\n]+)"',
                      lambda m: f'{m[1]}="{versioned(m[2])}"' if re.search(r'\.(?:html|css|js|png|jpe?g|webp|woff2|mp3|mp4)(?:[?#]|$)', m[2], re.I) else m[0], text)
        # 先建立圖片版本工具；版本檢查等 DOM 完成後才執行。
        text = text.replace('</head>', f'  <meta name="site-version" content="{version}">\n  <script src="cache-refresh.js?v={version}"></script>\n</head>')
        path.write_text(text, encoding='utf-8')
    for path in ROOT.glob('*.css'):
        text = path.read_text(encoding='utf-8')
        text = re.sub(r'url\(([\"\']?)([^)\"\']+)\1\)',
                      lambda m: f'url({m[1]}{versioned(m[2])}{m[1]})', text)
        path.write_text(text, encoding='utf-8')
    (ROOT / 'site-version.json').write_text(json.dumps({'version': version}) + '\n', encoding='utf-8')
    print('Site version:', version)
    return version

if __name__ == '__main__':
    generate()
