"""產生不含遊戲腳本的結局版型預覽，僅供本機視覺檢查。"""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
source = (root / 'index.html').read_text(encoding='utf-8')
source = source.replace('<head>', '<head><base href="/">')
source = source.replace('class="at-home"', '')
source = source.replace('<section id="landing"', '<section id="landing" hidden')
source = source.replace('<script src="art.js"></script><script src="game.js"></script>', '')
source = source.replace('id="result" class="screen result" hidden', 'id="result" class="screen result"')
for win, score in [(True, 380), (False, 250)]:
    html = source.replace('id="final-score">0', f'id="final-score">{score}')
    html = html.replace('id="result-title" class="ending-title"></h2>', f'id="result-title" class="ending-title">{"超級氣候小專家" if win else "再接再厲"}</h2>')
    html = html.replace('<p id="result-message"></p>', f'<p id="result-message">{"積分達 300 分以上，現場送精美小禮物！" if win else "一起挑戰 300 分！下次一定更厲害！"}</p>')
    if win:
        html = html.replace('id="result" class="screen result"', 'id="result" class="screen result is-win"')
        html = html.replace('assets/ending-encourage.png', 'assets/ending-win.png').replace('再試一次！', '恭喜你！')
    else:
        html = html.replace('id="result-medal" class="ending-medal" aria-hidden="true">🏅', 'id="result-medal" class="ending-medal" aria-hidden="true">🌱')
        html = html.replace('id="reward" class="reward"', 'id="reward" class="reward" hidden')
    name = 'win' if win else 'encourage'
    (root / 'tools' / f'ending-{name}-preview.html').write_text(html, encoding='utf-8')
print('Created two script-free layout previews')
