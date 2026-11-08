'use strict';
(() => {
  const details = {
    hazard: ['危害度：看「事件本身」', '雨下得多大、豪雨多久發生一次，是危害度的重點。同樣的想法，也能用在颱風、熱浪或乾旱。'],
    exposure: ['暴露度：看「人和東西的位置」', '河邊低窪處有居民、學校和馬路，這是在說哪些人與東西可能受到淹水影響。它們「位在哪裡」，就是暴露度的重點。'],
    vulnerability: ['脆弱度：看「容易受傷害的程度與應付能力」', '如果排水不良、建築不堅固，或缺少避難資訊與準備，遇到大雨時就可能受到更嚴重的影響。改善設施、學習防災，都能幫助降低脆弱度。']
  };
  const cards = document.querySelectorAll('[data-factor]');
  const scene = document.querySelector('.rain-scene');
  scene.dataset.active = 'exposure';
  cards.forEach(card => card.addEventListener('click', () => {
    const key = card.dataset.factor;
    cards.forEach(item => item.setAttribute('aria-pressed', String(item === card)));
    scene.dataset.active = key;
    document.getElementById('factor-detail-title').textContent = details[key][0];
    document.getElementById('factor-detail-text').textContent = details[key][1];
  }));
  const options = document.querySelectorAll('[data-answer]');
  options.forEach(button => button.addEventListener('click', () => {
    const correct = button.dataset.answer === 'exposure';
    options.forEach(option => { delete option.dataset.correct; option.setAttribute('aria-pressed', String(option === button)); });
    button.dataset.correct = String(correct);
    const feedback = document.getElementById('quiz-feedback');
    feedback.classList.toggle('is-correct', correct);
    feedback.textContent = correct
      ? '答對了！這是在說「暴露度」：哪些人與東西，位在可能受影響的地方。回到遊戲遇到相似的敘述，就知道怎麼判斷了！'
      : button.dataset.answer === 'hazard'
        ? '再想一想：「雨有多大、多久一次」才是危害度。這題在說居民、學校和馬路的位置，試試看「暴露度」！'
        : '再想一想：「容易受傷害、應變準備不足」才是脆弱度。這題在說哪些人與東西位在容易淹水的地方，試試看「暴露度」！';
  }));
})();
